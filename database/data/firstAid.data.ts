import { TFirstAidSeedData } from 'src/first-aid/interfaces/firstAid.interface';

export const FIRST_AID_DATA: TFirstAidSeedData[] = [
  {
    code: 'BURN_MINOR',
    description: {
      title: 'Minor Burn',
      steps: [
        'Cool the burn under running water for 20 minutes',
        'Remove tight items like rings',
        'Cover with sterile dressing',
      ],
    },
  },
  {
    code: 'CUT_BLEEDING',
    description: {
      title: 'Bleeding',
      steps: ['Apply pressure', 'Clean the wound', 'Bandage firmly'],
    },
  },
  {
    code: 'NOSE_BLEEDING',
    description: {
      title: 'Bleeding',
      steps: ['Apply pressure', 'Clean the wound', 'Bandage firmly'],
    },
  },
];
