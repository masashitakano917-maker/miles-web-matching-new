// project/src/data/services.ts
export type Plan = { key: string; name: string; price: number; note?: string };
export type Service = {
  key: 'photo' | 'clean' | 'staff' | string;
  title: string;
  short?: string;
  plans: Plan[];
};

export const SERVICES: Service[] = [
  {
    key: 'photo',
    title: 'プロフェッショナル写真撮影',
    short: '撮影日の翌々日に納品。',
    plans: [
      { key: 'photo-20', name: '20枚撮影', price: 20000 },
      { key: 'photo-30', name: '30枚撮影', price: 29000 },
      { key: 'photo-40', name: '40枚撮影', price: 38000 },
    ],
  },
  {
    key: 'clean',
    title: '清掃サービス',
    plans: [
      { key: 'clean-1ldk', name: '1LDK', price: 20000 },
      { key: 'clean-2ldk', name: '2LDK', price: 39000 },
      { key: 'clean-3ldk', name: '3LDK', price: 58000 },
    ],
  },
  {
    key: 'staff',
    title: '人材派遣ソリューション',
    plans: [
      { key: 'staff-translate', name: '翻訳/通訳（1時間）', price: 3000, note: '1時間あたり' },
      { key: 'staff-companion', name: 'イベントコンパニオン（1時間）', price: 4000, note: '1時間あたり' },
      { key: 'staff-other', name: 'その他ご相談', price: 0, note: 'メールまたはお電話より' },
    ],
  },
];

export const getService = (key: string) => SERVICES.find((s) => s.key === key);
