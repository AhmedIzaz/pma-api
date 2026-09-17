import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { StructuredConsultation } from './consultationFormatter.service';

@Injectable()
export class PdfService {
    async generateConsultationPdf(
        data: StructuredConsultation,
        consultationId: string,
    ): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50, autoFirstPage: true });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // --- Header ---
            doc.fontSize(20)
                .text('Medical Consultation Summary', { align: 'center' })
                .moveDown();
            doc.fontSize(10).text(`Consultation ID: ${consultationId}`, {
                align: 'right',
            });
            doc.text(`Date: ${new Date().toLocaleDateString()}`, {
                align: 'right',
            }).moveDown(2);

            // --- Section 1: Symptoms ---
            doc.fontSize(14)
                .fillColor('navy')
                .text('Patient Symptoms / Complaints:');
            doc.fontSize(11)
                .fillColor('black')
                .text(data.patientSymptoms)
                .moveDown();

            // --- Section 2: Diagnosis ---
            doc.fontSize(14)
                .fillColor('navy')
                .text('Doctor Assessment & Diagnosis:');
            doc.fontSize(11)
                .fillColor('black')
                .text(data.doctorDiagnosis)
                .moveDown();

            // --- Section 3: Prescriptions ---
            doc.fontSize(14).fillColor('navy').text('Prescribed Medications:');
            data.prescribedMedications.forEach((med, index) => {
                doc.fontSize(11)
                    .fillColor('black')
                    .text(`${index + 1}. ${med}`);
            });
            doc.moveDown();

            // --- Section 4: Follow-up ---
            doc.fontSize(14).fillColor('navy').text('Follow-up Plan:');
            doc.fontSize(11).fillColor('black').text(data.followUpPlan);

            // End PDF generation (PDFKit manages multi-page breaks automatically)
            doc.end();
        });
    }
}
