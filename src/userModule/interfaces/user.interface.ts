import { TActorTypeEnum } from 'src/common/enums/database.enum';

export interface TUserInterface {
  userId: number;
  userName: string;
  userEmail: string;
  actorType?: TActorTypeEnum;
}