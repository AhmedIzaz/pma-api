import { FirstAidEntity } from '../../../src/first-aid/entities/first-aid.entity';
import { CommonDateEntity } from '../../../src/common/entities/date.entity';
import { UserEntity } from '../../../src/userModule/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PromptEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'enum', enum: ['USER', 'SYSTEM'], nullable: false })
  generatedBy: 'USER' | 'SYSTEM';

  @ManyToOne(() => UserEntity, (user) => user.prompts)
  user: UserEntity;

  @Column({ type: 'text', nullable: true })
  text?: string; // only for user

  @Column({ type: 'enum', enum: ['HIGH', 'MEDIUM', 'LOW'], nullable: true })
  triageLevel?: 'HIGH' | 'MEDIUM' | 'LOW';

  @ManyToOne(() => FirstAidEntity, (fAid) => fAid.prompts)
  firstAid?: FirstAidEntity;

  @Column({ type: 'boolean', nullable: true })
  hospitalLookupNeeded?: boolean;

  @Column(() => CommonDateEntity, { prefix: false })
  dateInfo: CommonDateEntity;
}
