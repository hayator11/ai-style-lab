import type { ColorSeason } from '@/lib/diagnosis/types';

export type ColorSeasonDefinition = {
  key: ColorSeason;
  displayName: string;
  standardEquivalent: string;
  axis: string;
  cues: string[];
  copy: string;
};

export const colorSeasons: ColorSeasonDefinition[] = [
  {
    key: 'sunrise',
    displayName: 'Sunrise',
    standardEquivalent: 'スプリング',
    axis: 'イエベ・明るい/澄んだ',
    cues: [
      '明るく黄みの血色',
      '瞳は明るい茶',
      '髪も明るめ',
      '軸: 高明度×高彩度×清',
      '肌: 明るく黄み・ツヤ',
      '瞳: 明るく透明感',
      '髪: 明るいブラウン',
      '似合う色: コーラル/ピーチ/明るい黄/若草',
    ],
    copy: '明るく澄んだ Sunrise の傾向が見られます',
  },
  {
    key: 'mist',
    displayName: 'Mist',
    standardEquivalent: 'サマー',
    axis: 'ブルベ・明るい/ソフト',
    cues: [
      '青みでソフトな肌',
      '瞳はやわらかい黒茶',
      '軸: 高明度×低彩度×濁',
      '肌: 青み・マットで繊細',
      '瞳: 柔らかく繊細',
      '髪: アッシュ系',
      '似合う色: ローズ/ラベンダー/スモーキーブルー/グレージュ',
    ],
    copy: 'やわらかく涼やかな Mist 寄りに見えます',
  },
  {
    key: 'amber',
    displayName: 'Amber',
    standardEquivalent: 'オータム',
    axis: 'イエベ・深い/落ち着き',
    cues: [
      '黄みでマットな肌',
      '瞳・髪は深い茶',
      '軸: 低明度×低彩度×濁',
      '肌: 黄み・深みしっとり',
      '瞳: 深みがある',
      '髪: チョコ/マロン',
      '似合う色: テラコッタ/マスタード/カーキ/ボルドー',
    ],
    copy: '深く落ち着いた Amber の傾向が見られます',
  },
  {
    key: 'midnight',
    displayName: 'Midnight',
    standardEquivalent: 'ウィンター',
    axis: 'ブルベ・濃い/くっきり',
    cues: [
      '青みでくっきり',
      '瞳と白目のコントラスト強',
      '軸: 低明度×高彩度×清',
      '肌: 青み・クリア',
      '瞳: コントラスト強い',
      '髪: ブルーブラック',
      '似合う色: ピュアレッド/フューシャ/ロイヤルブルー/純白',
    ],
    copy: 'くっきり鮮やかな Midnight 寄りに見えます',
  },
];
