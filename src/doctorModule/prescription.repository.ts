import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrescriptionEntity } from './prescription.entity';

@Injectable()
export class PrescriptionRepository {
  constructor(
    @InjectRepository(PrescriptionEntity)
    private readonly repository: Repository<PrescriptionEntity>,
  ) {}

  async create(data: Partial<PrescriptionEntity>): Promise<PrescriptionEntity> {
    const prescription = this.repository.create(data);
    return this.repository.save(prescription);
  }

  async findByConsultationId(consultationId: number): Promise<PrescriptionEntity[]> {
    return this.repository.find({
      where: { consultationId },
      order: { dateInfo: { createdAt: 'DESC' } },
    });
  }

  async update(id: number, data: Partial<PrescriptionEntity>): Promise<void> {
    await this.repository.update(id, data);
  }
}
