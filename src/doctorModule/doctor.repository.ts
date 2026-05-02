import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { DoctorEntity } from './doctor.entity';

@Injectable()
export class DoctorRepository {
  constructor(private dataSource: DataSource) {}

  private repository(manager?: EntityManager) {
    return (manager ?? this.dataSource.manager)?.getRepository(DoctorEntity);
  }

  async findByEmail(email: string, manager?: EntityManager) {
    return this.repository(manager)?.findOne({
      where: { doctorEmail: email },
    });
  }

  async findById(doctorId: number, manager?: EntityManager) {
    return this.repository(manager)?.findOneBy({ doctorId });
  }

  async create(data: Partial<DoctorEntity>, manager?: EntityManager) {
    const repo = this.repository(manager);
    const instance = repo.create(data);
    return repo.save(instance);
  }

  async findAllDoctorsWithServices(manager?: EntityManager) {
    return this.repository(manager)?.find({
      relations: ['services'],
      select: {
        doctorId: true,
        doctorName: true,
        specialization: true,
        qualifications: true,
        bio: true,
        // Exclude password and sensitive info
      }
    });
  }
}
