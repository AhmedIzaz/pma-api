import { CommonDateEntity } from "src/common/entities/date.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ConsultationEntity } from "./consultation.entity";

@Entity('prescription')
export class PrescriptionEntity {
    @PrimaryGeneratedColumn()
    prescriptionId: number;

    @ManyToOne(() => ConsultationEntity, undefined, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'consultationId' })
    consultation: ConsultationEntity;

    @Column()
    consultationId: number;

    // google drive file ref or url where we can get the file
    @Column({ type: 'text', nullable: false })
    fileRef: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    fileName: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    fileHash: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    blockchainTxHash: string;

    @Column({ type: 'int', nullable: true })
    blockchainId: number;

    @Column(() => CommonDateEntity, { prefix: false })
    dateInfo: CommonDateEntity;


}