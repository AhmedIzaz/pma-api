import { TFirstAid } from "src/first-aid/interfaces/firstAid.interface";

export interface TCreatePromptInterface {
  userId: number;
  text?: string;
  generatedBy?: 'USER' | 'SYSTEM';
  triageLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
  firstAid?: TFirstAid;
  hospitalLookupNeeded?: boolean;
}
