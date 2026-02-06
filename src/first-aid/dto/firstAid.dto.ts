import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class FirstAidDTO {
  @Expose()
  code: string;

  @Expose()
  description: any;
}
