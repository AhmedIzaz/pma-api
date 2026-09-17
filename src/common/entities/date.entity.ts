import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class CommonDateEntity {
  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
