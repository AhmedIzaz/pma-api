import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ConsultationEntity } from './consultation.entity';
import { TConsultationStatusEnum } from 'src/common/enums/database.enum';

@Injectable()
export class ConsultationRepository {
  constructor(private dataSource: DataSource) {}

  private repository(manager?: EntityManager) {
    return (manager ?? this.dataSource.manager)?.getRepository(
      ConsultationEntity,
    );
  }

  async findByUserId(userId: number, manager?: EntityManager) {
    return this.repository(manager)?.find({
      where: { userId },
      relations: ['doctor', 'service'],
      order: { consultationId: 'DESC' },
    });
  }

  async findByDoctorId(doctorId: number, manager?: EntityManager) {
    return this.repository(manager)?.find({
      where: { doctorId },
      relations: ['user', 'service'],
      order: { consultationId: 'DESC' },
    });
  }

  async findById(consultationId: number, manager?: EntityManager) {
    return this.repository(manager)?.findOneBy({ consultationId });
  }

  async create(
    data: Partial<ConsultationEntity>,
    manager?: EntityManager,
  ) {
    const repo = this.repository(manager);
    const instance = repo.create(data);
    return repo.save(instance);
  }

  async update(
    consultationId: number,
    data: Partial<ConsultationEntity>,
    manager?: EntityManager,
  ) {
    const repo = this.repository(manager);
    await repo.update(consultationId, data);
    return this.findById(consultationId, manager);
  }

  async getDashboardStats(doctorId: number, manager?: EntityManager) {
    const repo = this.repository(manager);

    const result = await repo
      .createQueryBuilder('c')
      .select('SUM(c.amountEarned)', 'totalEarnings')
      .addSelect('SUM(c.durationMinutes)', 'totalConsultationMinutes')
      .addSelect('COUNT(c.consultationId)', 'totalConsultations')
      .addSelect(
        `SUM(CASE WHEN c.status = '${TConsultationStatusEnum.COMPLETED}' THEN 1 ELSE 0 END)`,
        'completedConsultations',
      )
      .where('c.doctorId = :doctorId', { doctorId })
      .getRawOne();

    return {
      totalEarnings: Number(result?.totalEarnings ?? 0),
      totalConsultationMinutes: Number(
        result?.totalConsultationMinutes ?? 0,
      ),
      totalConsultations: Number(result?.totalConsultations ?? 0),
      completedConsultations: Number(result?.completedConsultations ?? 0),
    };
  }
}
