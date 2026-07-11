import { checkRequiredPhotos } from './checkPhotos';
import type { StylePreview, UploadedPhoto } from './types';

type CreateStylePreviewInput = {
  photos: UploadedPhoto[];
  supportAnswers: Record<string, string>;
};

const impressionLabels: Record<string, string> = {
  soft: 'やわらかく親しみやすい印象',
  mature: 'すっきり大人っぽい印象',
  natural: '自然体で軽やかな印象',
};

const colorLabels: Record<string, string> = {
  clear: '明るく澄んだ色を楽しみやすい傾向',
  deep: '深みのある色を楽しみやすい傾向',
  muted: 'やさしく落ち着いた色を楽しみやすい傾向',
};

const colorDiscomfortLabels: Record<string, string> = {
  yellowish: '黄みの強い色は写真条件と合わせて慎重に確認',
  bluish: '青みの強い色は写真条件と合わせて慎重に確認',
  vivid: '鮮やかすぎる色は面積や素材で調整すると試しやすい傾向',
};

const fitLabels: Record<string, string> = {
  structured: 'ほどよく形のある服がしっくりきやすい傾向',
  flow: '軽く動きのある服がしっくりきやすい傾向',
  relaxed: 'ゆったり自然な服がしっくりきやすい傾向',
};

const outsideImpressionLabels: Record<string, string> = {
  friendly: '親しみやすさを活かしたスタイル提案が合いやすい傾向',
  calm: '落ち着きや上品さを活かしたスタイル提案が合いやすい傾向',
  bright: '華やかさを活かしたスタイル提案が合いやすい傾向',
};

export function createStylePreview({ photos, supportAnswers }: CreateStylePreviewInput): StylePreview {
  const photoCheck = checkRequiredPhotos(photos);
  const answeredCount = Object.keys(supportAnswers).length;
  const photoReady = photoCheck.isReady && photoCheck.conditionWarnings.length === 0;

  if (!photoReady) {
    return {
      status: 'notReady',
      title: '先に写真を整える段階です',
      summary: '必要な写真や写真条件がそろうまで、スタイル傾向は表示せず、追加するとよい写真をご案内します。',
      items: [],
      notes: ['写真条件により見え方が変わる可能性があります。', '写真とご回答を合わせて傾向を見ます。'],
    };
  }

  const items = [
    supportAnswers['favorite-impression']
      ? {
          title: '目指したい印象',
          summary: impressionLabels[supportAnswers['favorite-impression']] ?? '希望する印象を確認済みです',
          reason: '好みの入力で近づきたい印象が選ばれているため',
        }
      : null,
    supportAnswers['color-comfort']
      ? {
          title: '色の体感',
          summary: colorLabels[supportAnswers['color-comfort']] ?? '色の好みを確認済みです',
          reason: '写真では分からない、本人の色への体感を補助情報として扱うため',
        }
      : null,
    supportAnswers['clothes-fit']
      ? {
          title: '服の形の体感',
          summary: fitLabels[supportAnswers['clothes-fit']] ?? '服の形の好みを確認済みです',
          reason: '骨格傾向は写真中心で見つつ、着用時の体感を補助するため',
        }
      : null,
    supportAnswers['color-discomfort']
      ? {
          title: '色の確認ポイント',
          summary: colorDiscomfortLabels[supportAnswers['color-discomfort']] ?? '色の苦手感を確認済みです',
          reason: '苦手に感じやすい色は、写真条件や面積で見え方が変わるため',
        }
      : null,
    supportAnswers['outside-impression']
      ? {
          title: '周囲からの印象',
          summary:
            outsideImpressionLabels[supportAnswers['outside-impression']] ?? '周囲からの印象を確認済みです',
          reason: '顔タイプ傾向は写真中心で見つつ、周囲からの印象を補助情報として扱うため',
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return {
    status: answeredCount > 0 ? 'supportReady' : 'photoReady',
    title: answeredCount > 0 ? 'スタイル傾向サマリー' : '写真チェックは完了です',
    summary:
      answeredCount > 0
        ? '写真とご回答から、次に確認したい傾向を整理しています。'
        : '必要な写真と写真条件がそろっています。好みや体感を追加すると、希望も反映できます。',
    items,
    notes: [
      '今ある写真とご回答をもとにしたサマリーです。',
      '写真条件により見え方が変わる可能性があります。',
      '最終結果ではなく、次に確認するための入口として扱います。',
    ],
  };
}
