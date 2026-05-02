import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CommonDateEntity } from 'src/common/entities/date.entity';
import { DoctorServiceEntity } from './doctor-service.entity';
import { ConsultationEntity } from './consultation.entity';


@Entity('doctors')
export class DoctorEntity {
  @PrimaryGeneratedColumn()
  doctorId: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  doctorName: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  doctorEmail: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  doctorPassword: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  specialization?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  qualifications?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column(() => CommonDateEntity, { prefix: false })
  dateInfo: CommonDateEntity;

  @OneToMany(() => DoctorServiceEntity, (service) => service.doctor)
  services: DoctorServiceEntity[];

  @OneToMany(() => ConsultationEntity, (consultation) => consultation.doctor)
  consultations: ConsultationEntity[];
}
