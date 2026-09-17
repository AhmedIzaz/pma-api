import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { DoctorServiceEntity } from './doctor-service.entity';

@Injectable()
export class DoctorServiceRepository {
  constructor(private dataSource: DataSource) {}

  private repository(manager?: EntityManager) {
    return (manager ?? this.dataSource.manager)?.getRepository(
      DoctorServiceEntity,
    );
  }

  async findByDoctorId(doctorId: number, manager?: EntityManager) {
    return this.repository(manager)?.find({
      where: { doctorId },
      order: { serviceId: 'DESC' },
    });
  }

  async findById(serviceId: number, manager?: EntityManager) {
    return this.repository(manager)?.findOneBy({ serviceId });
  }

  async create(
    data: Partial<DoctorServiceEntity>,
    manager?: EntityManager,
  ) {
    const repo = this.repository(manager);
    const instance = repo.create(data);
    return repo.save(instance);
  }

  async update(
    serviceId: number,
    data: Partial<DoctorServiceEntity>,
    manager?: EntityManager,
  ) {
    const repo = this.repository(manager);
    await repo.update(serviceId, data);
    return this.findById(serviceId, manager);
  }

  async delete(serviceId: number, manager?: EntityManager) {
    return this.repository(manager)?.delete(serviceId);
  }
}
