import { CommonDateEntity } from 'src/common/entities/date.entity';
import { PromptEntity } from 'src/prompt/entities/prompt.entity';
// import { PromptEntity } from '../../../src/prompt/entities/prompt.entity';
// import { CommonDateEntity } from '../../../src/common/entities/date.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class FirstAidEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  code: string;

  @Column({ type: 'json', nullable: false })
  description: any;


  @OneToMany(() => PromptEntity, (prompt) => prompt.firstAid)
  prompts?: PromptEntity[]

  @Column(() => CommonDateEntity, { prefix: false })
  dateInfo: CommonDateEntity;
}
