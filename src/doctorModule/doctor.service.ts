import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DoctorRepository } from './doctor.repository';
import { DoctorServiceRepository } from './doctor-service.repository';
import { ConsultationRepository } from './consultation.repository';
import { PrescriptionRepository } from './prescription.repository';
import { GoogleDriveService } from './google-drive.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { TranscriptionService } from './transcribe.service';
import { ConsultationFormatterService } from './consultationFormatter.service';
import { PdfService } from './pdf.service';
import * as crypto from 'crypto';
import {
  CompleteConsultationDTO,
  CreateConsultationDTO,
  CreateDoctorServiceDTO,
  DashboardResponseDTO,
  DoctorLoginDTO,
  DoctorLoginResponseDTO,
  DoctorRegistrationDTO,
  UpdateDoctorServiceDTO,
  UpdateConsultationDurationDTO,
} from './doctor.dto';
import { comparePassword, generateHashPassword } from 'src/common/utility';
import {
  TActorTypeEnum,
  TConsultationStatusEnum,
} from 'src/common/enums/database.enum';
import { DoctorEntity } from './doctor.entity';

@Injectable()
export class DoctorService {
  constructor(
    private readonly doctorRepository: DoctorRepository,
    private readonly doctorServiceRepository: DoctorServiceRepository,
    private readonly consultationRepository: ConsultationRepository,
    private readonly prescriptionRepository: PrescriptionRepository,
    private readonly googleDriveService: GoogleDriveService,
    private readonly blockchainService: BlockchainService,
    private readonly jwtService: JwtService,
    private readonly transcriptionService: TranscriptionService,
    private readonly consultationFormatterService: ConsultationFormatterService,
    private readonly pdfService: PdfService,
  ) { }

  // ─── Auth ───────────────────────────────────────────────

  async doctorRegistration(data: DoctorRegistrationDTO) {
    try {
      const { doctorEmail, doctorPassword, ...rest } = data;

      const existingDoctor =
        await this.doctorRepository.findByEmail(doctorEmail);
      if (existingDoctor?.doctorId) {
        throw new ConflictException(
          'Doctor with this email already exists',
        );
      }

      const hashedPassword = await generateHashPassword(doctorPassword);

      const { doctorPassword: _, ...createdDoctor } =
        await this.doctorRepository.create({
          ...rest,
          doctorEmail,
          doctorPassword: hashedPassword,
        });

      if (!createdDoctor?.doctorId) {
        throw new ConflictException('Doctor registration failed');
      }

      return createdDoctor;
    } catch (error) {
      console.log('Error during doctorRegistration: ', error);
      throw error;
    }
  }

  async doctorLogin(data: DoctorLoginDTO): Promise<DoctorLoginResponseDTO> {
    try {
      const { doctorEmail, doctorPassword } = data;

      const existingDoctor =
        await this.doctorRepository.findByEmail(doctorEmail);
      if (!existingDoctor?.doctorId) {
        throw new ConflictException('Invalid email or password');
      }

      const passwordMatched = await comparePassword(
        doctorPassword,
        existingDoctor.doctorPassword,
      );
      if (!passwordMatched) {
        throw new ConflictException('Invalid email or password');
      }

      const jwtPayload = {
        userId: existingDoctor.doctorId,
        userName: existingDoctor.doctorName,
        userEmail: existingDoctor.doctorEmail,
        actorType: TActorTypeEnum.DOCTOR,
      };

      const accessToken = await this.jwtService.signAsync(jwtPayload);
      return {
        accessToken,
        doctor: existingDoctor,
      };
    } catch (error) {
      console.log('Error during doctorLogin: ', error);
      throw error;
    }
  }

  // ─── Profile ──────────────────────────────────────────

  async getProfile(doctorId: number) {
    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    const { doctorPassword, ...profile } = doctor;
    return profile;
  }

  async updateProfile(doctorId: number, data: Partial<DoctorEntity>, file?: Express.Multer.File) {
    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    let doctorImageUrl = doctor.doctorImageUrl;
    if (file) {
      doctorImageUrl = await this.googleDriveService.uploadFile(file);
    }

    const updated = await this.doctorRepository.update(doctorId, {
      ...data,
      doctorImageUrl,
    });

    if (updated) {
      const { doctorPassword, ...profile } = updated;
      return profile;
    }
    return null;
  }

  // ─── Services (pricing) ────────────────────────────────

  async getServices(doctorId: number) {
    return this.doctorServiceRepository.findByDoctorId(doctorId);
  }

  async createService(doctorId: number, data: CreateDoctorServiceDTO) {
    const totalCost = data.costPerHour * data.durationHours;
    return this.doctorServiceRepository.create({
      ...data,
      totalCost,
      doctorId,
    });
  }

  async updateService(
    doctorId: number,
    serviceId: number,
    data: UpdateDoctorServiceDTO,
  ) {
    const existing = await this.doctorServiceRepository.findById(serviceId);
    if (!existing) {
      throw new NotFoundException('Service not found');
    }
    if (existing.doctorId !== doctorId) {
      throw new ForbiddenException(
        'You do not own this service',
      );
    }

    // Recompute totalCost if cost or duration changed
    const costPerHour = data.costPerHour ?? existing.costPerHour;
    const durationHours = data.durationHours ?? existing.durationHours;
    const totalCost = costPerHour * durationHours;

    return this.doctorServiceRepository.update(serviceId, {
      ...data,
      totalCost,
    });
  }

  async deleteService(doctorId: number, serviceId: number) {
    const existing = await this.doctorServiceRepository.findById(serviceId);
    if (!existing) {
      throw new NotFoundException('Service not found');
    }
    if (existing.doctorId !== doctorId) {
      throw new ForbiddenException(
        'You do not own this service',
      );
    }

    await this.doctorServiceRepository.delete(serviceId);
    return { message: 'Service deleted successfully' };
  }

  // ─── Consultations ─────────────────────────────────────

  async getConsultations(doctorId: number) {
    return this.consultationRepository.findByDoctorId(doctorId);
  }

  async getAllDoctorsWithServices() {
    return this.doctorRepository.findAllDoctorsWithServices();
  }

  async createConsultation(doctorId: number, data: CreateConsultationDTO) {
    let endTime:any = null;
    if (data?.requestedDurationHours && data?.startTime) {
      endTime = new Date(data.startTime);
      endTime.setHours(endTime.getHours() + data?.requestedDurationHours);
    }
    return this.consultationRepository.create({
      doctorId,
      serviceId: data.serviceId,
      userId: data.userId,
      startTime: new Date(data.startTime),
      endTime: endTime,
      requestedDurationHours: data.requestedDurationHours,
      status: TConsultationStatusEnum.SCHEDULED,
    });
  }

  async getUserConsultations(userId: number) {
    return this.consultationRepository.findByUserId(userId);
  }

  async getConsultationById(consultationId: number) {
    return this.consultationRepository.findById(consultationId);
  }

  async updateConsultationSchedule(
    doctorId: number,
    consultationId: number,
    data: { startTime: string },
  ) {
    const consultation = await this.consultationRepository.findById(consultationId);
    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }
    if (consultation.doctorId !== doctorId) {
      throw new ForbiddenException('You do not own this consultation');
    }

    return this.consultationRepository.update(consultationId, {
      startTime: new Date(data.startTime),
    });
  }

  async updateConsultationDuration(
    doctorId: number,
    consultationId: number,
    data: UpdateConsultationDurationDTO,
  ) {
    const consultation = await this.consultationRepository.findById(consultationId);
    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }
    if (consultation.doctorId !== doctorId) {
      throw new ForbiddenException('You do not own this consultation');
    }

    const durationMinutes = (consultation.durationMinutes || 0) + data.spentMinutes;



    return this.consultationRepository.update(consultationId, {
      durationMinutes,

    });
  }

  async completeConsultation(
    doctorId: number,
    consultationId: number,
    data: CompleteConsultationDTO,
  ) {
    const consultation =
      await this.consultationRepository.findById(consultationId);
    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }
    if (consultation.doctorId !== doctorId) {
      throw new ForbiddenException(
        'You do not own this consultation',
      );
    }

    const endTime = new Date(data.endTime);
    const startTime = new Date(consultation.startTime);
    const calculatedDuration = Math.round(
      (endTime.getTime() - startTime.getTime()) / (1000 * 60),
    );
    const durationMinutes = Math.max(calculatedDuration, consultation.durationMinutes || 0);

    // Calculate earnings based on linked service, if any
    let amountEarned = 0;
    if (consultation.serviceId) {
      const service = await this.doctorServiceRepository.findById(
        consultation.serviceId,
      );
      if (service) {
        // Pro-rate: (durationMinutes / 60) * costPerHour
        amountEarned = Number(
          ((durationMinutes / 60) * Number(service.costPerHour)).toFixed(2),
        );
      }
    }

    return this.consultationRepository.update(consultationId, {
      endTime,
      durationMinutes: Math.max(durationMinutes, 0),
      amountEarned,
      status: TConsultationStatusEnum.COMPLETED,
    });
  }

  async getPrescriptionsByConsultationId(doctorId: number, consultationId: number) {
    const consultation = await this.consultationRepository.findById(consultationId);
    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }
    if (consultation.doctorId !== doctorId) {
      throw new ForbiddenException('You do not own this consultation');
    }

    return this.prescriptionRepository.findByConsultationId(consultationId);
  }

  async getConsultationPrescriptions(consultationId: number, userId: number) {
    const consultation = await this.consultationRepository.findById(consultationId);
    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }
    if (consultation.userId !== userId) {
      throw new ForbiddenException('You do not have access to this consultation');
    }

    return this.prescriptionRepository.findByConsultationId(consultationId);
  }

  async uploadPrescription(
    doctorId: number,
    consultationId: number,
    file: Express.Multer.File,
  ) {
    const consultation = await this.consultationRepository.findById(consultationId);
    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }
    if (consultation.doctorId !== doctorId) {
      throw new ForbiddenException('You do not own this consultation');
    }


    // Upload to Google Drive
    const fileRef = await this.googleDriveService.uploadFile(file);

    // Create a unique hash identical to only that file content
    const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // Save to DB initially
    const prescription = await this.prescriptionRepository.create({
      consultationId,
      fileRef,
      fileName: file.originalname,
      fileHash,
    });
    console.log("The file hash =>", { fileHash })

    // Run blockchain store in background
    setImmediate(async () => {
      try {
        const { txHash, blockchainId } = await this.blockchainService.storeDataOnChain(fileHash);
        console.log('Blockchain store result:', { txHash, blockchainId });
        await this.prescriptionRepository.update(prescription.prescriptionId, {
          blockchainTxHash: txHash,
          blockchainId,
        });
      } catch (error) {
        console.error('Failed to store prescription hash on blockchain:', error);
      }
    });

    return prescription;
  }

  async uploadConsultationAudio(
    doctorId: number,
    consultationId: number,
    file: Express.Multer.File,
  ) {
    const consultation = await this.consultationRepository.findById(consultationId);
    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }
    if (consultation.doctorId !== doctorId) {
      throw new ForbiddenException('You do not own this consultation');
    }

    // Run audio processing in the background asynchronously
    setImmediate(async () => {
      try {
        console.log(`[Audio Processing] Started for consultation ${consultationId}. File size: ${file.size} bytes`);
        
        // 1. Transcribe audio
        console.log(`[Audio Processing] Step 1: Transcribing audio...`);
        const transcript = await this.transcriptionService.transcribe(file.buffer);
        console.log(`[Audio Processing] Step 1 completed. Transcript length: ${transcript?.length || 0}`);

        // 2. Format transcript using AI
        console.log(`[Audio Processing] Step 2: Formatting transcript with AI...`);
        const formattedData = await this.consultationFormatterService.formatTranscriptToDraft(transcript);
        console.log(`[Audio Processing] Step 2 completed.`);

        // 3. Generate PDF
        console.log(`[Audio Processing] Step 3: Generating PDF...`);
        const pdfBuffer = await this.pdfService.generateConsultationPdf(formattedData, consultationId.toString());
        console.log(`[Audio Processing] Step 3 completed. PDF size: ${pdfBuffer.length} bytes`);

        // 4. Upload PDF to Google Drive
        console.log(`[Audio Processing] Step 4: Uploading PDF to Google Drive...`);
        const pdfFile = {
          originalname: `consultation_${consultationId}.pdf`,
          mimetype: 'application/pdf',
          buffer: pdfBuffer,
          size: pdfBuffer.length,
        } as Express.Multer.File;
        
        const pdfDriveUrl = await this.googleDriveService.uploadFile(pdfFile);
        console.log(`[Audio Processing] Step 4 completed. Drive URL: ${pdfDriveUrl}`);

        console.log(`[Audio Processing] Completed successfully for consultation ${consultationId}.`);
      } catch (error) {
        console.error(`[Audio Processing] Failed for consultation ${consultationId}:`, error);
      }
    });

    return { 
      statusCode: 200, 
      message: 'Audio uploaded successfully. Processing started asynchronously in the background.' 
    };
  }

  async verifyPrescription(prescriptionId: number, file: Express.Multer.File) {
    const prescription = await this.prescriptionRepository.findById(prescriptionId);
    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }



    const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    const isDbMatch = fileHash === prescription.fileHash;
    let isBlockchainMatch = false;

    if (prescription.blockchainId) {
      try {
        const record = await this.blockchainService.getRecordFromChain(prescription.blockchainId);
        isBlockchainMatch = this.blockchainService.verifyDataHash(fileHash, record.dataHash);
      } catch (error) {
        console.error('Error verifying blockchain record:', error);
      }
    }

    return {
      isDbMatch,
      isBlockchainMatch,
      fileHash,
      storedHash: prescription.fileHash,
      blockchainTxHash: prescription.blockchainTxHash,
      blockchainId: prescription.blockchainId,
    };
  }
  // ─── Dashboard ─────────────────────────────────────────

  async getDashboard(doctorId: number): Promise<DashboardResponseDTO> {
    const stats =
      await this.consultationRepository.getDashboardStats(doctorId);

    const totalMinutes = stats.totalConsultationMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return {
      ...stats,
      formattedTime: `${hours}h ${minutes}m`,
    };
  }
}
