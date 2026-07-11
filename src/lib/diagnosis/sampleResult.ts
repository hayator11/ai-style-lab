import type { DiagnosisResult } from './types';

export const sampleDiagnosisResult: DiagnosisResult = {
  title: '写真が揃うと傾向チェックに進めます',
  summary: '写真とご回答を合わせて、スタイル傾向を確認します。まずは必要な写真と写真条件を整えます。',
  confidences: [
    { label: '写真の準備', score: 0, reason: '必要な写真をそろえる段階のため' },
  ],
  reasons: [
    '顔写真、全身写真、カラー確認用写真が揃ってから傾向を確認します。',
    '写真が不足している場合は、追加するとよい写真をご案内します。',
    '写真条件により見え方が変わる可能性があります。',
  ],
};
