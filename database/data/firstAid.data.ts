import { TFirstAidSeedData } from 'src/first-aid/interfaces/firstAid.interface';

export const FIRST_AID_DATA: TFirstAidSeedData[] = [
  {
    code: 'ASPIRIN',
    description: {
      title: 'Suspected Heart Attack',
      steps: [
        'Call emergency medical services immediately',
        'Help the person sit down and stay calm',
        'Give one aspirin to chew if not allergic',
        'Loosen tight clothing',
        'Monitor breathing until help arrives',
      ],
    },
  },
  {
    code: 'STROKE_PROTOCOL',
    description: {
      title: 'Suspected Stroke',
      steps: [
        'Call emergency medical services immediately',
        'Note the time when symptoms started',
        'Keep the person calm and lying on their side',
        'Do not give food or drink',
        'Monitor breathing until medical help arrives',
      ],
    },
  },
  {
    code: 'PROTECT_HEAD',
    description: {
      title: 'Seizure First Aid',
      steps: [
        'Move dangerous objects away from the person',
        'Place something soft under the head',
        'Turn the person gently onto their side',
        'Do not restrain the person',
        'Call emergency services if seizure lasts more than 5 minutes',
      ],
    },
  },
  {
    code: 'BLEEDING_CONTROL',
    description: {
      title: 'Severe Bleeding',
      steps: [
        'Apply firm pressure to the wound with clean cloth or bandage',
        'Keep the injured area elevated if possible',
        'Do not remove objects stuck in the wound',
        'Add more dressing if blood soaks through',
        'Seek immediate medical help',
      ],
    },
  },
  {
    code: 'COOL_BURN',
    description: {
      title: 'Burn Treatment',
      steps: [
        'Cool the burn under running water for at least 20 minutes',
        'Remove tight items like rings or clothing near the burn',
        'Cover the burn with sterile non-stick dressing',
        'Do not apply ice or butter',
        'Seek medical attention if the burn is severe',
      ],
    },
  },
  {
    code: 'EPIPEN',
    description: {
      title: 'Severe Allergic Reaction (Anaphylaxis)',
      steps: [
        'Use an epinephrine auto-injector (EpiPen) if available',
        'Call emergency medical services immediately',
        'Lay the person flat and raise their legs',
        'Loosen tight clothing',
        'Monitor breathing until help arrives',
      ],
    },
  },
  {
    code: 'COOL_BODY',
    description: {
      title: 'Heatstroke',
      steps: [
        'Move the person to a cool shaded area',
        'Remove excess clothing',
        'Apply cool wet cloths or sponge with cool water',
        'Give small sips of water if conscious',
        'Seek emergency medical help',
      ],
    },
  },
  {
    code: 'SPLINT',
    description: {
      title: 'Possible Fracture',
      steps: [
        'Keep the injured limb still',
        'Immobilize the area using a splint or support',
        'Apply ice wrapped in cloth to reduce swelling',
        'Elevate the injured limb if possible',
        'Seek medical evaluation',
      ],
    },
  },
  {
    code: 'ORAL_REHYDRATION',
    description: {
      title: 'Dehydration or Food Poisoning',
      steps: [
        'Drink oral rehydration solution (ORS)',
        'Take small frequent sips of water',
        'Rest and avoid solid food temporarily',
        'Gradually resume light food',
        'Seek medical help if symptoms worsen',
      ],
    },
  },
  {
    code: 'PARACETAMOL',
    description: {
      title: 'Fever or Infection',
      steps: [
        'Take paracetamol according to recommended dose',
        'Drink plenty of fluids',
        'Rest adequately',
        'Monitor body temperature',
        'Consult a doctor if fever persists more than 2–3 days',
      ],
    },
  },
  {
    code: 'REST',
    description: {
      title: 'Common Cold or Flu',
      steps: [
        'Get plenty of rest',
        'Drink warm fluids',
        'Use steam inhalation for congestion',
        'Take over-the-counter medicines if needed',
        'Consult a doctor if symptoms worsen',
      ],
    },
  },
  {
    code: 'ANTI_HISTAMINE',
    description: {
      title: 'Mild Allergy',
      steps: [
        'Take an antihistamine medication',
        'Avoid exposure to the allergen if known',
        'Apply soothing lotion if rash or itching occurs',
        'Drink plenty of water',
        'Seek medical advice if symptoms worsen',
      ],
    },
  },
  {
    code: 'BANDAGE',
    description: {
      title: 'Minor Cut or Wound',
      steps: [
        'Wash hands before touching the wound',
        'Clean the wound with clean water',
        'Apply antiseptic if available',
        'Cover with a sterile bandage',
        'Change dressing daily until healed',
      ],
    },
  },
];
