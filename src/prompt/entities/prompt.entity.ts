import { CommonDateEntity } from '../../../src/common/entities/date.entity';
import { UserEntity } from '../../../src/userModule/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PromptEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.prompts)
  user: UserEntity;

  @Column({ type: 'text', nullable: false })
  text: string;

  @Column(() => CommonDateEntity, { prefix: false })
  dateInfo: CommonDateEntity;
}
