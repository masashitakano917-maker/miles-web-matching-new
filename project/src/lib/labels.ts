// project/src/lib/labels.ts
export const LABEL_OPTIONS = [
  'real_estate',
  'food',
  'portrait',
  'wedding',
  'event',
  'product',
  'interior',
  'fashion',
  'sports',
  'drone',
  'video',
  'cleaning',
  'retouch',
] as const;

export type LabelTag = typeof LABEL_OPTIONS[number];
