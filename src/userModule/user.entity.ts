import { CommonDateEntity } from 'src/common/entities/date.entity';
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ type: 'varchar', length: 100 })
  userName: string;

  @Column(() => CommonDateEntity, { prefix: false })
  dateInfo: CommonDateEntity;
}
