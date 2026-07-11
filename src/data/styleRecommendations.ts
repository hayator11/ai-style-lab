import type { BoneType, ColorSeason, FaceType, StyleRecommendation } from '@/lib/diagnosis/types';

export const boneRecommendations: Record<BoneType, StyleRecommendation> = {
  line: {
    category: '素材・シルエット',
    title: '上質な直線ライン',
    body: 'ハリのある素材、Iライン、Vネック、シンプルで質の良い一枚が力を貸してくれます。',
    reason: 'Line は直線・ジャスト・上質を活かしやすい方向として扱います。',
    relatedType: 'Line',
  },
  curve: {
    category: '素材・シルエット',
    title: '軽やかな曲線ライン',
    body: '薄手でやわらかな素材、ハイウエスト、コンパクトトップス、ふわっと動く形が挑戦の入口になります。',
    reason: 'Curve は曲線・上重心・やわらかさを活かしやすい方向として扱います。',
    relatedType: 'Curve',
  },
  frame: {
    category: '素材・シルエット',
    title: '抜け感のあるフレーム',
    body: 'リネン、デニム、ざっくりニット、ロング丈、レイヤードが自然なこなれ感を引き出します。',
    reason: 'Frame はラフさ・素材感・フレーム感を活かしやすい方向として扱います。',
    relatedType: 'Frame',
  },
};

export const faceRecommendations: Record<FaceType, StyleRecommendation> = {
  pop: {
    category: '髪型・小物',
    title: '丸みで親しみを広げる',
    body: '丸襟、小さめの柄、ふんわりした髪の動きが親しみやすさを後押しします。',
    reason: 'Pop は丸み・カジュアル・親しみを活かしやすい方向として扱います。',
    relatedType: 'Pop',
  },
  clear: {
    category: '髪型・小物',
    title: 'すっきり軽やかな清潔感',
    body: 'シャツ、ボーダー、直線的で軽い髪のまとまりが、さわやかな印象を支えます。',
    reason: 'Clear はさわやか・シンプル・軽やかを活かしやすい方向として扱います。',
    relatedType: 'Clear',
  },
  bloom: {
    category: '髪型・小物',
    title: '華やかな曲線アクセント',
    body: 'フレア、花柄、とろみ素材、揺れる髪や小物が華やかさを引き出します。',
    reason: 'Bloom は華やか・曲線・やわらかな存在感を活かしやすい方向として扱います。',
    relatedType: 'Bloom',
  },
  mode: {
    category: '髪型・小物',
    title: '都会的な直線アクセント',
    body: '直線シルエット、モノトーン、大ぶりの幾何アクセがすっきりした存在感を支えます。',
    reason: 'Mode はシャープ・都会的・モードな方向を活かしやすい候補として扱います。',
    relatedType: 'Mode',
  },
};

export const colorRecommendations: Record<ColorSeason, StyleRecommendation> = {
  sunrise: {
    category: '色',
    title: '明るく澄んだ黄み',
    body: 'コーラル、ピーチ、明るいイエロー、アイボリーが元気な印象を支えます。',
    reason: 'Sunrise は明るく澄んだ黄みの色を楽しみやすい方向として扱います。',
    relatedType: 'Sunrise',
  },
  mist: {
    category: '色',
    title: 'ソフトで涼やかな青み',
    body: 'ラベンダー、ローズ、スカイブルー、グレイッシュな淡色がやわらかな印象を支えます。',
    reason: 'Mist はソフトで涼やかな青みの色を楽しみやすい方向として扱います。',
    relatedType: 'Mist',
  },
  amber: {
    category: '色',
    title: '深く落ち着いた黄み',
    body: 'テラコッタ、マスタード、カーキ、ブラウンが上品な深みを支えます。',
    reason: 'Amber は深く落ち着いた黄みの色を楽しみやすい方向として扱います。',
    relatedType: 'Amber',
  },
  midnight: {
    category: '色',
    title: 'くっきり鮮やかな青み',
    body: 'ロイヤルブルー、真紅、白と黒の高いコントラストが存在感を支えます。',
    reason: 'Midnight はくっきり鮮やかな青みの色を楽しみやすい方向として扱います。',
    relatedType: 'Midnight',
  },
};
