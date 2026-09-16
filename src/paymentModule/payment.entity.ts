import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { CommonDateEntity } from 'src/common/entities/date.entity';
import { ConsultationEntity } from 'src/doctorModule/consultation.entity';

export enum TPaymentStatusEnum {
  INIT = 'INIT',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

@Entity('payments')
export class PaymentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  tran_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'BDT' })
  currency: string;

  @Column({ type: 'enum', enum: TPaymentStatusEnum, default: TPaymentStatusEnum.INIT })
  status: TPaymentStatusEnum;

  @Column({ type: 'int', nullable: true })
  user_id?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  val_id?: string;

  @Column({ type: 'json', nullable: true })
  raw_response?: any;

  @OneToOne(() => ConsultationEntity, consultation => consultation.payment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'consultationId' })
  consultation: ConsultationEntity;

  @Column({ type: 'int', nullable: true })
  consultationId?: number;

  @Column(() => CommonDateEntity, { prefix: false })
  dateInfo: CommonDateEntity;
}
