export type StyleQuestion = {
  id: string;
  label: string;
  axis: 'personalColor' | 'boneStructure' | 'faceType' | 'preference';
  options: Array<{ label: string; value: string }>;
};

export const styleQuestions: StyleQuestion[] = [
  {
    id: 'favorite-impression',
    label: 'どんな印象に近づきたいですか？',
    axis: 'preference',
    options: [
      { label: 'やわらかく親しみやすい', value: 'soft' },
      { label: 'すっきり大人っぽい', value: 'mature' },
      { label: '自然体で軽やか', value: 'natural' },
    ],
  },
  {
    id: 'color-comfort',
    label: '身につけると気分が上がる色は？',
    axis: 'personalColor',
    options: [
      { label: '明るく澄んだ色', value: 'clear' },
      { label: '深みのある色', value: 'deep' },
      { label: 'やさしく落ち着いた色', value: 'muted' },
    ],
  },
  {
    id: 'clothes-fit',
    label: '服を選ぶときにしっくりきやすい形は？',
    axis: 'boneStructure',
    options: [
      { label: 'ほどよく体に沿う形', value: 'structured' },
      { label: '軽く動きのある形', value: 'flow' },
      { label: 'ゆったり自然な形', value: 'relaxed' },
    ],
  },
];
