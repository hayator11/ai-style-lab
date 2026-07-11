import { boneTypes } from '@/data/boneTypes';
import { colorSeasons } from '@/data/colorSeasons';
import { requiredPhotos } from '@/data/requiredPhotos';
import { boneRecommendations, colorRecommendations, faceRecommendations } from '@/data/styleRecommendations';
import { checkRequiredPhotos } from './checkPhotos';
import { calculateFaceMajority, faceAnswersFromSupportAnswers } from './faceMajority';
import type {
  AxisResult,
  BoneType,
  ColorSeason,
  DiagnosisAxis,
  DiagnosisInput,
  DiagnosisResult,
  FeatureSource,
  LabelTypeKey,
  ResultAxis,
  ResultCandidate,
  SourceReasonGroup,
  StyleRecommendation,
  UploadedPhoto,
} from './types';

type ScoredCandidate<T extends LabelTypeKey> = {
  key: T;
  displayName: string;
  copy: string;
  score: number;
  reasons: string[];
};

const axisLabels: Record<ResultAxis, string> = {
  bone: '骨格傾向',
  face: '顔立ち傾向',
  color: 'カラー傾向',
};

const colorBase: Record<ColorSeason, 'warm' | 'cool'> = {
  sunrise: 'warm',
  amber: 'warm',
  mist: 'cool',
  midnight: 'cool',
};

export function estimateDiagnosis(input: DiagnosisInput): DiagnosisResult {
  const photoCheck = checkRequiredPhotos(input.photos);
  const boneAxis = createBoneAxisResult(input.supportAnswers, input.photos);
  const faceAxis = createFaceAxisResult(input.supportAnswers, input.photos);
  const colorAxis = createColorAxisResult(input.supportAnswers, input.photos);
  const axisResults: AxisResult[] = [boneAxis, faceAxis, colorAxis];
  const recommendations = createRecommendations(
    getTopKey<BoneType>(boneAxis),
    getTopKey(faceAxis),
    getTopKey<ColorSeason>(colorAxis),
  );
  const topCandidates = axisResults
    .filter((axis) => axis.status === 'estimated')
    .flatMap((axis) => axis.candidates.slice(0, 1));

  return {
    title: 'AIスタイル傾向チェック',
    summary:
      '写真とご回答から、今見えている傾向を整理します。情報が足りない項目は無理に決めず、次に追加するとよい写真や回答をご案内します。',
    confidences: topCandidates.map((candidate) => ({
      label: candidate.displayName,
      score: candidate.percent,
      reason: candidate.reasons[0] ?? '写真とご回答から候補に入りました。',
    })),
    reasons: axisResults.flatMap((axis) => axis.reasons),
    axisResults,
    recommendations,
    cautionNotes: [
      '照明・撮影条件・画像の加工により、色の見え方は変わります。',
      '候補が近い場合は、どちらかに決めきらず両方の活かし方をご紹介します。',
      photoCheck.isReady
        ? '必須写真は揃っています。'
        : '写真が足りない項目は、追加写真がそろうと傾向を確認できます。',
    ],
  };
}

function createBoneAxisResult(answers: Record<string, string>, photos: UploadedPhoto[]): AxisResult {
  const scoredCandidates = boneTypes.map((type) => ({
    key: type.key,
    displayName: type.displayName,
    copy: type.copy,
    score: 0,
    reasons: [] as string[],
  }));
  const sourceGroups: SourceReasonGroup[] = [
    { source: 'photo', label: '写真から見た点', reasons: [] },
    { source: 'selfReport', label: 'ご回答から見た点', reasons: [] },
  ];
  const add = (key: BoneType, score: number, reason: string, source: FeatureSource) => {
    addScore(scoredCandidates, key, score, reason);
    sourceGroups.find((group) => group.source === source)?.reasons.push(reason);
  };

  const observed = [
    addBoneAnswer(answers['bone-neck'], 1, '首の長さ・太さの回答を確認しています。', add, 'photo'),
    addBoneAnswer(answers['bone-gravity'], 1, '重心はLine/Curveの比較にのみ使っています。', add, 'photo'),
    addBoneAnswer(answers['bone-knee'], 1, '膝のお皿の大きさと形の回答を確認しています。', add, 'photo'),
    addBoneAnswer(answers['bone-clavicle'], 2, '鎖骨の出方はご回答由来で補っています。', add, 'selfReport'),
    addBoneAnswer(answers['bone-wristShape'], 2, '手首の断面形状はご回答由来で補っています。', add, 'selfReport'),
    addBoneAnswer(answers['bone-joints'], 2, '指の関節の目立ち方はご回答由来で補っています。', add, 'selfReport'),
    addBoneAnswer(answers['bone-skinTexture'], 2, '肌質・弾力はご回答由来で補っています。', add, 'selfReport'),
  ].filter(Boolean).length;

  const hasRequiredPhoto = hasRequiredAxisPhotos('boneStructure', photos);

  if (observed < 3 || !hasRequiredPhoto) {
    return createInsufficientAxisResult({
      axis: 'bone',
      confidence: 0,
      reasons: sourceGroups.flatMap((group) => group.reasons),
      sourceGroups,
      guidance:
        '全身の正面・横向き写真と、鎖骨・手首・関節・肌質についてのご回答がそろうと、全身バランスの傾向を確認できます。',
    });
  }

  const candidates = toPercentCandidates(sortCandidates(scoredCandidates));
  const topTwo = candidates.slice(0, 2);

  return {
    axis: 'bone',
    title: axisLabels.bone,
    status: 'estimated',
    confidence: Math.min(70, 46 + observed * 4),
    candidates,
    reasons: sourceGroups.flatMap((group) => group.reasons),
    note: '写真だけでは分かりにくい項目をご回答で補っているため、控えめな推定度で表示しています。',
    isMixed: topTwo.length === 2 && Math.abs(topTwo[0].percent - topTwo[1].percent) <= 8,
    featureSources: ['photo', 'selfReport'],
    sourceReasonGroups: sourceGroups,
  };
}

function createFaceAxisResult(answers: Record<string, string>, photos: UploadedPhoto[]): AxisResult {
  const majority = calculateFaceMajority(faceAnswersFromSupportAnswers(answers));
  const hasFacePhoto = hasRequiredAxisPhotos('faceType', photos);
  const sourceGroups: SourceReasonGroup[] = [
    {
      source: 'photo',
      label: '写真から見た点',
      reasons: hasFacePhoto ? ['正面の顔写真が揃っている状態です。'] : [],
    },
    {
      source: 'selfReport',
      label: 'ご回答から見た点',
      reasons: majority.reasons,
    },
  ];

  if (majority.status === 'insufficient' || !hasFacePhoto) {
    return createInsufficientAxisResult({
      axis: 'face',
      confidence: 0,
      reasons: majority.reasons,
      sourceGroups,
      guidance:
        '自然光で撮った正面のお顔の写真と、印象に関するご回答がそろうと、顔立ちの傾向を確認できます。',
    });
  }

  return {
    axis: 'face',
    title: axisLabels.face,
    status: 'estimated',
    confidence: majority.isMixed ? 62 : 78,
    candidates: majority.candidates,
    reasons: majority.reasons,
    note: majority.isMixed
      ? 'どちらかに決めきらず、両方の活かし方をご紹介します。'
      : 'お顔の印象を複数の観点から整理しています。',
    isMixed: majority.isMixed,
    featureSources: ['photo', 'selfReport'],
    sourceReasonGroups: sourceGroups,
  };
}

function createColorAxisResult(answers: Record<string, string>, photos: UploadedPhoto[]): AxisResult {
  const scoredCandidates = colorSeasons.map((type) => ({
    key: type.key,
    displayName: type.displayName,
    copy: type.copy,
    score: 0,
    reasons: [] as string[],
  }));
  const sourceGroups: SourceReasonGroup[] = [
    { source: 'photo', label: '写真から見た点', reasons: [] },
    { source: 'selfReport', label: 'ご回答から見た点', reasons: [] },
  ];
  const add = (key: ColorSeason, score: number, reason: string, source: FeatureSource) => {
    addScore(scoredCandidates, key, score, reason);
    sourceGroups.find((group) => group.source === source)?.reasons.push(reason);
  };

  let observed = 0;
  const base = answers['color-base'];
  if (base === 'warm') {
    observed += 1;
    add('sunrise', 2, '黄みを感じる回答から、Sunrise/Amberの方向を確認しています。', 'selfReport');
    add('amber', 2, '黄みを感じる回答から、Sunrise/Amberの方向を確認しています。', 'selfReport');
  }
  if (base === 'cool') {
    observed += 1;
    add('mist', 2, '青みを感じる回答から、Mist/Midnightの方向を確認しています。', 'selfReport');
    add('midnight', 2, '青みを感じる回答から、Mist/Midnightの方向を確認しています。', 'selfReport');
  }

  observed += addColorAnswer(answers['color-value'], add, {
    light: ['sunrise', 'mist'],
    deep: ['amber', 'midnight'],
  }, '明度の回答を確認しています。');
  observed += addColorAnswer(answers['color-chroma'], add, {
    clear: ['sunrise', 'midnight'],
    soft: ['mist', 'amber'],
  }, '彩度・清濁の回答を確認しています。');
  observed += addColorAnswer(answers['color-contrast'], add, {
    soft: ['mist', 'amber'],
    high: ['midnight'],
  }, '瞳や髪と肌のコントラストの回答を確認しています。');

  const hasColorPhoto = hasRequiredAxisPhotos('personalColor', photos);
  if (hasColorPhoto) {
    sourceGroups[0].reasons.push('自然光のカラー確認用写真が揃っている状態です。');
  }

  if (observed < 3 || !hasColorPhoto) {
    return createInsufficientAxisResult({
      axis: 'color',
      confidence: 0,
      reasons: sourceGroups.flatMap((group) => group.reasons),
      sourceGroups,
      guidance:
        '自然光・加工なしの色を見るための写真と、色の好みに関するご回答がそろうと、カラー傾向を確認できます。',
    });
  }

  const candidates = toPercentCandidates(sortCandidates(scoredCandidates));
  const topTwo = candidates.slice(0, 2);
  const isNeutral = topTwo.length === 2 && colorBase[topTwo[0].key as ColorSeason] !== colorBase[topTwo[1].key as ColorSeason];

  return {
    axis: 'color',
    title: axisLabels.color,
    status: 'estimated',
    confidence: Math.min(55, 39 + observed * 4),
    candidates,
    reasons: sourceGroups.flatMap((group) => group.reasons),
    note: isNeutral
      ? 'どちらのベースにも寄りきらない傾向として、両方の活かし方をご紹介します。'
      : '写真条件による変化を前提に、低めの推定度で表示しています。',
    isNeutral,
    featureSources: ['photo', 'selfReport'],
    sourceReasonGroups: sourceGroups,
  };
}

function createInsufficientAxisResult({
  axis,
  confidence,
  reasons,
  sourceGroups,
  guidance,
}: {
  axis: ResultAxis;
  confidence: number;
  reasons: string[];
  sourceGroups: SourceReasonGroup[];
  guidance: string;
}): AxisResult {
  return {
    axis,
    title: axisLabels[axis],
    status: 'insufficient',
    confidence,
    candidates: [],
    reasons,
    note: '情報が足りないため、候補%はまだ表示しません。',
    featureSources: sourceGroups.filter((group) => group.reasons.length > 0).map((group) => group.source),
    sourceReasonGroups: sourceGroups,
    insufficientGuidance: guidance,
  };
}

function hasRequiredAxisPhotos(axis: DiagnosisAxis, photos: UploadedPhoto[]): boolean {
  const uploadedTypes = new Set(photos.map((photo) => photo.type));
  return requiredPhotos
    .filter((photo) => photo.required && photo.axes.includes(axis))
    .every((photo) => uploadedTypes.has(photo.type));
}

function addBoneAnswer(
  value: string | undefined,
  score: number,
  reason: string,
  add: (key: BoneType, score: number, reason: string, source: FeatureSource) => void,
  source: FeatureSource,
) {
  if (value !== 'line' && value !== 'curve' && value !== 'frame') {
    return false;
  }

  add(value, score, reason, source);
  return true;
}

function addColorAnswer(
  value: string | undefined,
  add: (key: ColorSeason, score: number, reason: string, source: FeatureSource) => void,
  mapping: Record<string, ColorSeason[]>,
  reason: string,
) {
  const keys = value ? mapping[value] : undefined;
  if (!keys) {
    return 0;
  }

  keys.forEach((key) => add(key, 1, reason, 'selfReport'));
  return 1;
}

function getTopKey<T extends LabelTypeKey>(axis: AxisResult): T | undefined {
  return axis.status === 'estimated' ? (axis.candidates[0]?.key as T | undefined) : undefined;
}

function createRecommendations(
  boneKey: BoneType | undefined,
  faceKey: LabelTypeKey | undefined,
  colorKey: ColorSeason | undefined,
): StyleRecommendation[] {
  return [
    boneKey ? boneRecommendations[boneKey] : null,
    faceKey && faceKey in faceRecommendations ? faceRecommendations[faceKey as keyof typeof faceRecommendations] : null,
    colorKey ? colorRecommendations[colorKey] : null,
  ].filter((item): item is StyleRecommendation => item !== null);
}

function addScore<T extends LabelTypeKey>(
  candidates: ScoredCandidate<T>[],
  key: T,
  score: number,
  reason: string,
) {
  const target = candidates.find((candidate) => candidate.key === key);
  if (!target) {
    return;
  }

  target.score += score;
  target.reasons.push(reason);
}

function sortCandidates<T extends LabelTypeKey>(candidates: ScoredCandidate<T>[]) {
  return [...candidates].sort((a, b) => b.score - a.score);
}

function toPercentCandidates<T extends LabelTypeKey>(candidates: ScoredCandidate<T>[]): ResultCandidate[] {
  const total = candidates.reduce((sum, candidate) => sum + candidate.score, 0);

  if (total === 0) {
    return [];
  }

  return candidates.map((candidate) => ({
    key: candidate.key,
    displayName: candidate.displayName,
    percent: Math.round((candidate.score / total) * 100),
    copy: candidate.copy,
    reasons: candidate.reasons.slice(0, 3),
  }));
}
