import type { BoneCueObservability, BoneType } from '@/lib/diagnosis/types';

export type BoneCue = {
  text: string;
  observability: BoneCueObservability;
};

export type BoneTypeDefinition = {
  key: BoneType;
  displayName: string;
  standardEquivalent: string;
  cues: BoneCue[];
  copy: string;
};

export const boneTypes: BoneTypeDefinition[] = [
  {
    key: 'line',
    displayName: 'Line',
    standardEquivalent: 'ストレート',
    cues: [
      { text: '上半身に立体感・厚み', observability: 'photo' },
      { text: '重心: 上重心', observability: 'photo' },
      { text: '首: 短め・太め', observability: 'photo' },
      { text: '膝のお皿: 小さめで目立ちにくい', observability: 'photo' },
      { text: '全身シルエット: メリハリ・立体的', observability: 'photo' },
      { text: '鎖骨: 目立ちにくい・平ら', observability: 'touch' },
      { text: '手首の断面: 丸に近い・細い', observability: 'touch' },
      { text: '指の関節: 目立ちにくい・滑らか', observability: 'touch' },
      { text: '肌質: ハリ・弾力を感じる', observability: 'touch' },
      { text: '骨の硬さ: なめらかな厚みを感じる', observability: 'touch' },
      { text: '提案: ハリ・上質素材', observability: 'photo' },
      { text: '提案: Iライン・ジャスト・Vネック・シンプル', observability: 'photo' },
    ],
    copy: '上半身にメリハリが出やすい Line の傾向が見られます',
  },
  {
    key: 'curve',
    displayName: 'Curve',
    standardEquivalent: 'ウェーブ',
    cues: [
      { text: '上半身が薄く見える', observability: 'photo' },
      { text: '重心: 下重心', observability: 'photo' },
      { text: '首: 長め・細め', observability: 'photo' },
      { text: '膝のお皿: 小さく丸い', observability: 'photo' },
      { text: '全身シルエット: 華奢・柔らかい曲線', observability: 'photo' },
      { text: '鎖骨: 細く繊細に浮き出る', observability: 'touch' },
      { text: '手首の断面: 平べったい楕円・幅広で薄い', observability: 'touch' },
      { text: '指の関節: 細く小さい', observability: 'touch' },
      { text: '肌質: なめらか・柔らかい', observability: 'touch' },
      { text: '骨の硬さ: 骨自体は細く繊細に感じる', observability: 'touch' },
      { text: '提案: やわらか・薄手素材', observability: 'photo' },
      { text: '提案: ハイウエスト・コンパクト・フレア', observability: 'photo' },
    ],
    copy: 'やわらかく曲線的な Curve 寄りに見えます',
  },
  {
    key: 'frame',
    displayName: 'Frame',
    standardEquivalent: 'ナチュラル',
    cues: [
      { text: '首: 標準から長めで筋や骨が見えやすい', observability: 'photo' },
      { text: '膝のお皿: 大きく四角く見える', observability: 'photo' },
      { text: '全身シルエット: 骨・関節のフレーム感', observability: 'photo' },
      { text: '鎖骨: 大きくしっかり出る', observability: 'touch' },
      { text: '手首の断面: 長方形に近く骨がしっかり', observability: 'touch' },
      { text: '指の関節: 節が目立つ', observability: 'touch' },
      { text: '肌質: マットで硬さを感じる', observability: 'touch' },
      { text: '骨の硬さ: 骨自体の存在感がある', observability: 'touch' },
      { text: '提案: 天然素材・厚手素材', observability: 'photo' },
      { text: '提案: オーバーサイズ・ロング丈・レイヤード', observability: 'photo' },
    ],
    copy: '骨格フレームがしっかりした Frame の傾向が見られます',
  },
];
