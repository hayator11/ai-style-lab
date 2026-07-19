import type { ColorSeason } from '@/lib/diagnosis/types';

export type ColorSeasonDefinition = {
  key: ColorSeason;
  displayName: string;
  standardEquivalent: string;
  imageSrc?: string;
  imageAlt?: string;
  imageGallery?: {
    src: string;
    alt: string;
  }[];
  axis: string;
  cues: string[];
  copy: string;
};

export const colorSeasons: ColorSeasonDefinition[] = [
  {
    key: 'sunrise',
    displayName: 'Sunrise',
    standardEquivalent: 'スプリング',
    imageSrc: '/images/color-seasons/sunrise.jpg',
    imageAlt: 'Sunriseタイプのカラーイメージ',
    imageGallery: [
      { src: '/images/color-seasons/gallery/sunrise-outfit.jpg', alt: 'Sunriseタイプの着こなしイメージ' },
      { src: '/images/color-seasons/gallery/sunrise-materials.jpg', alt: 'Sunriseタイプの配色と素材イメージ' },
      { src: '/images/color-seasons/gallery/sunrise-variation-clear.jpg', alt: 'Sunriseタイプの明るい色バリエーション' },
      { src: '/images/color-seasons/gallery/sunrise-variation-wearable.jpg', alt: 'Sunriseタイプの日常に取り入れやすい色バリエーション' },
    ],
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
    imageSrc: '/images/color-seasons/mist.jpg',
    imageAlt: 'Mistタイプのカラーイメージ',
    imageGallery: [
      { src: '/images/color-seasons/gallery/mist-outfit.jpg', alt: 'Mistタイプの着こなしイメージ' },
      { src: '/images/color-seasons/gallery/mist-materials.jpg', alt: 'Mistタイプの配色と素材イメージ' },
      { src: '/images/color-seasons/gallery/mist-variation-soft.jpg', alt: 'Mistタイプのやわらかな色バリエーション' },
      { src: '/images/color-seasons/gallery/mist-variation-wearable.jpg', alt: 'Mistタイプの日常に取り入れやすい色バリエーション' },
    ],
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
    imageSrc: '/images/color-seasons/amber.jpg',
    imageAlt: 'Amberタイプのカラーイメージ',
    imageGallery: [
      { src: '/images/color-seasons/gallery/amber-outfit.jpg', alt: 'Amberタイプの着こなしイメージ' },
      { src: '/images/color-seasons/gallery/amber-materials.jpg', alt: 'Amberタイプの配色と素材イメージ' },
      { src: '/images/color-seasons/gallery/amber-variation-deep.jpg', alt: 'Amberタイプの深みのある色バリエーション' },
      { src: '/images/color-seasons/gallery/amber-variation-wearable.jpg', alt: 'Amberタイプの日常に取り入れやすい色バリエーション' },
    ],
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
    imageSrc: '/images/color-seasons/midnight.jpg',
    imageAlt: 'Midnightタイプのカラーイメージ',
    imageGallery: [
      { src: '/images/color-seasons/gallery/midnight-outfit.jpg', alt: 'Midnightタイプの着こなしイメージ' },
      { src: '/images/color-seasons/gallery/midnight-materials.jpg', alt: 'Midnightタイプの配色と素材イメージ' },
      { src: '/images/color-seasons/gallery/midnight-variation-vivid.jpg', alt: 'Midnightタイプの鮮やかな色バリエーション' },
      { src: '/images/color-seasons/gallery/midnight-variation-wearable.jpg', alt: 'Midnightタイプの日常に取り入れやすい色バリエーション' },
    ],
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
