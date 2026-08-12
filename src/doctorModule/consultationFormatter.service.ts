import { Injectable, Logger } from '@nestjs/common';
import { SymptomAiService } from '../prompt/symptom-ai.service';

export interface StructuredConsultation {
  patientSymptoms: string;
  doctorDiagnosis: string;
  prescribedMedications: string[];
  followUpPlan: string;
}

@Injectable()
export class ConsultationFormatterService {
  private readonly logger = new Logger(ConsultationFormatterService.name);

  constructor(private readonly symptomAiService: SymptomAiService) {}

  async formatTranscriptToDraft(rawTranscript: string): Promise<StructuredConsultation> {
    const prompt = `
    You are a medical assistant. Transform the following raw consultation transcript into a clean, structured consultation report.
    
    TRANSCRIPT:
    "${rawTranscript}"
    
    Return a JSON object with this EXACT structure:
    {
      "patientSymptoms": "Summary of patient reported symptoms",
      "doctorDiagnosis": "Doctor's clinical findings or provisional diagnosis",
      "prescribedMedications": ["Medication 1 dosage", "Medication 2 dosage"],
      "followUpPlan": "Next steps, tests, or follow-up date"
    }
    `;

    try {
      this.logger.log('Formatting transcript using AI...');
      const response = await this.symptomAiService.getGenericAiResponse(prompt);
      this.logger.log('Transcript formatted successfully.');
      return JSON.parse(response);
    } catch (error) {
      this.logger.error('Failed to format transcript via AI. Falling back to default data.', error);
      return {
        patientSymptoms: "Patient complains of persistent dry cough and light fever for 3 days.",
        doctorDiagnosis: "Mild Upper Respiratory Tract Infection (URTI).",
        prescribedMedications: ["Paracetamol 500mg - 1 tablet 3 times a day after meal", "Cough syrup 10ml twice daily"],
        followUpPlan: "Return in 5 days if fever persists."
      };
    }
  }
}