import { Exclude, Expose, Type } from 'class-transformer';


@Exclude()
class FirstAidDescriptionDTO {
  @Expose()
  title: string;

  @Expose()
  steps: string[];
}


@Exclude()
export class FirstAidDTO {
  @Expose()
  code: string;

  @Expose()
  @Type(() => FirstAidDescriptionDTO)
  description: FirstAidDescriptionDTO;
}


