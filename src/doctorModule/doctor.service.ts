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

@Injectable()
export class DoctorService {
  constructor(
    private readonly doctorRepository: DoctorRepository,
    private readonly doctorServiceRepository: DoctorServiceRepository,
    private readonly consultationRepository: ConsultationRepository,
    private readonly jwtService: JwtService,
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
    return this.consultationRepository.create({
      doctorId,
      serviceId: data.serviceId,
      userId: data.userId,
      startTime: new Date(data.startTime),
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
