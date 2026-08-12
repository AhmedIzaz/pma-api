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
        const apiKey = this.configService.get<string>('GEMINI_AI_KEY');
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


    /**
     * Sends user prompt to AI to get triage response.
     */
    async getAiResponse(userPrompt: string): Promise<string> {
        const prompt = `
        Medical Triage. Output JSON ONLY. No markdown.Do not use Markdown formatting or code blocks like \`\`\`json. Input can be unclear, but try your best to match is input is critical or not, sometimes user cannot give proper proper medical terms or grammatical correct.
        Medical input schema: {"triageLevel":"HIGH|MEDIUM|LOW","firstAid":"str","hospitalLookupNeeded":bool,"code":"CODE"}
        Non-medical/Unclear schema: {"message":"str"}
        Levels: HIGH(Critical), MEDIUM(Fever/Pain), LOW(Mild).
        Input: "${userPrompt}"
        `;
        
        const apiKey = this.configService.get<string>('HCNSEC_API_KEY');
        const baseUrl = this.configService.get<string>('HCNSEC_BASE_URL') || 'https://api.hcnsec.cn/v1';
        const modelName = this.configService.get<string>('HCNSEC_MODEL') || 'auto';

        try {
            const response = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: modelName,
                    messages: [{ role: 'user', content: prompt }],
                    response_format: { type: 'json_object' },
                    temperature: 0.2, // Lower temperature keeps output structure consistent
                }),
            });

            console.log("Response from AI: ", response);

            if (!response.ok) {
                const body = await response.text();
                this.logger.error(`AI returned ${response.status}: ${body}`);
                throw new BadGatewayException('Failed to get response from AI');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            this.logger.error('Error fetching from AI', error);
            throw new BadGatewayException('Failed to get response from AI');
        }
    }
}
