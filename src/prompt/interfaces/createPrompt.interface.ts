export interface TCreatePromptInterface {
  userId: number;
  text: string;
  generatedBy?: 'USER' | 'SYSTEM'
}
