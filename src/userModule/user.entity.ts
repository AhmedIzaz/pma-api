import { CommonDateEntity } from 'src/common/entities/date.entity';
import { TRegistrationTypeEnum } from 'src/common/enums/database.enum';
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  userName: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  userEmail: string;

  @Column({ type: 'varchar', length: 255, nullable: true }) // nullable true because there will be some oauth authenticated user
  userPassword?: string;

  @Column({ type: 'enum', enum: TRegistrationTypeEnum, nullable: true })
  userRegistrationType?: TRegistrationTypeEnum;

  @Column(() => CommonDateEntity, { prefix: false })
  dateInfo: CommonDateEntity;
}
