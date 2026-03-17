import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    BadGatewayException,
    Injectable,
    Logger,
    UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** Shape of the successful Django response */
export interface SymptomAiResult {
    triage_level: 'RED' | 'YELLOW' | 'GREEN';
    first_aid_code: string;
    hospital_lookup_needed: boolean;
    detected_symptoms: string[];
}

/** Maps Django triage labels → NestJS PromptEntity enum values */
export const TRIAGE_MAP: Record<SymptomAiResult['triage_level'], 'HIGH' | 'MEDIUM' | 'LOW'> = {
    RED: 'HIGH',
    YELLOW: 'MEDIUM',
    GREEN: 'LOW',
};

@Injectable()
export class SymptomAiService {
    private readonly logger = new Logger(SymptomAiService.name);
    private readonly baseUrl: string;

    private genAI: GoogleGenerativeAI;

    constructor(private readonly configService: ConfigService) {
        // Falls back to localhost if SYMPTOM_AI_URL is not set
        this.baseUrl = this.configService.get<string>('SYMPTOM_AI_URL') ?? 'http://localhost:8080';
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
        }
    }

    /**
     * Sends free-form symptom text to the Django ML endpoint and returns
     * the structured prediction.
     *
     * @throws UnprocessableEntityException if Django returns 422 (no symptoms found)
     * @throws BadGatewayException          if Django is unreachable or returns any other error
     */
    async analyzeText(text: string): Promise<SymptomAiResult> {
        const url = `${this.baseUrl}/api/symptom/analyze/`;

        let response: Response;
        try {
            response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });
        } catch (networkError) {
            this.logger.error(`Failed to reach Django symptom AI at ${url}`, networkError);
            throw new BadGatewayException(
                'Symptom analysis service is currently unavailable. Please try again later.',
            );
        }

        // 422 = Django could not detect any symptoms in the text
        if (response.status === 422) {
            const body = await response.json().catch(() => ({}));
            this.logger.warn('Django returned 422 - no symptoms detected', body);
            throw new UnprocessableEntityException(
                (body as any)?.error ??
                'No recognisable symptoms found. Please describe your symptoms more specifically.',
            );
        }

        if (!response.ok) {
            const body = await response.text().catch(() => '');
            this.logger.error(`Django symptom AI returned ${response.status}: ${body}`);
            throw new BadGatewayException(
                'Symptom analysis service returned an unexpected error. Please try again.',
            );
        }

        return response.json() as Promise<SymptomAiResult>;
    }


    async getAiResponse(userPrompt: string): Promise<string> {
        const prompt = `
        You are a medical triage AI.

        Your job:
        - Analyze the user's text.
        - Detect if it is a medical emergency or symptom.
        - Respond ONLY in valid JSON (no explanation, no extra text).

        Rules:

        1. If input is a clear medical symptom/emergency:
        Return:
        {
        "triageLevel": "HIGH" | "MEDIUM" | "LOW",
        "firstAid": "string (max 255 chars) or null",
        "hospitalLookupNeeded": true | false
        }

        2. If input is NOT medical:
        Return:
        {
        "message": "Please ask a medical-related question."
        }

        3. If input is unclear or insufficient:
        Return:
        {
        "message": "Please provide more clear medical symptoms."
        }

        Triage rules:
        - HIGH → life-threatening (can't breathe, chest pain, dying, unconscious etc type high level symptoms)
        - MEDIUM → moderate symptoms (fever, vomiting, pain etc type medium level symptoms)
        - LOW → mild symptoms (headache, cold etc type low level symptoms)

        Important:
        - Output MUST be valid JSON
        - NO markdown
        - NO explanation
        - NO extra text

        User input:
        "${userPrompt}"
        `;
        // Access the model (e.g., gemini-1.5-flash for speed or gemini-1.5-pro for complex tasks)
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }
}
