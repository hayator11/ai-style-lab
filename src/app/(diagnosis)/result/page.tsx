'use client';

import { boneTypes } from '@/data/boneTypes';
import { colorSeasons } from '@/data/colorSeasons';
import { faceTypes } from '@/data/faceTypes';
import { supportQuestions } from '@/data/supportQuestions';
import { checkRequiredPhotos } from '@/lib/diagnosis/checkPhotos';
import { estimateDiagnosis } from '@/lib/diagnosis/estimateDiagnosis';
import {
  clearSavedStyleSession,
  getSavedPhotoConditionFlags,
  getSavedPhotoTypes,
  getSavedSupportAnswers,
} from '@/lib/diagnosis/photoSession';
import type { RequiredPhotoType, UploadedPhoto } from '@/lib/diagnosis/types';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

function getCandidateImage(axis: string, candidateKey: string) {
  if (axis === 'bone') {
    const boneType = boneTypes.find((type) => type.key === candidateKey);

    if (!boneType?.imageSrc) {
      return null;
    }

    return {
      src: boneType.imageSrc,
      alt: boneType.imageAlt ?? `${boneType.displayName}の全身バランスのイメージ`,
      gallery: [],
    };
  }

  if (axis === 'color') {
    const colorSeason = colorSeasons.find((season) => season.key === candidateKey);

    if (!colorSeason?.imageSrc) {
      return null;
    }

    return {
      src: colorSeason.imageSrc,
      alt: colorSeason.imageAlt ?? `${colorSeason.displayName}のカラーイメージ`,
      gallery: colorSeason.imageGallery ?? [],
    };
  }

  if (axis === 'face') {
    const faceType = faceTypes.find((type) => type.key === candidateKey);

    if (!faceType?.imageSrc) {
      return null;
    }

    return {
      src: faceType.imageSrc,
      alt: faceType.imageAlt ?? `${faceType.displayName}の顔立ち印象イメージ`,
      gallery: faceType.imageGallery ?? [],
    };
  }

  return null;
}

export default function ResultPage() {
  const router = useRouter();
  const [selectedTypes] = useState<RequiredPhotoType[]>(getSavedPhotoTypes);
  const [conditionFlags] = useState(getSavedPhotoConditionFlags);
  const [supportAnswers] = useState(getSavedSupportAnswers);
  const uploadedPhotos = useMemo<UploadedPhoto[]>(
    () => selectedTypes.map((type) => ({ type, conditionFlags: conditionFlags[type] })),
    [conditionFlags, selectedTypes],
  );
  const photoCheck = checkRequiredPhotos(uploadedPhotos);
  const requiredMissing = photoCheck.missingPhotos.filter((photo) => photo.priority === 'required');
  const recommendedMissing = photoCheck.missingPhotos.filter((photo) => photo.priority === 'recommended');
  const isConditionReady = photoCheck.conditionWarnings.length === 0;
  const canProceed = photoCheck.isReady && isConditionReady;
  const answeredSupportCount = Object.keys(supportAnswers).length;
  const diagnosisResult = useMemo(
    () => estimateDiagnosis({ photos: uploadedPhotos, supportAnswers }),
    [supportAnswers, uploadedPhotos],
  );
  const supportAnswerSummaries = supportQuestions
    .map((question) => {
      const value = supportAnswers[question.id];
      const option = question.options.find((item) => item.value === value);

      if (!option) {
        return null;
      }

      return {
        question: question.label,
        answer: option.label,
      };
    })
    .filter((item): item is { question: string; answer: string } => item !== null);

  function resetSession() {
    clearSavedStyleSession();
    router.push('/upload');
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto max-w-3xl space-y-6">
        <p className="text-xs font-medium text-stone-500">これは検証用の仮公開版です。</p>

        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-rose-700">スタイル傾向</p>
          <h1 className="mt-2 text-3xl font-bold text-stone-950">
            {canProceed
              ? '写真チェックは完了です'
              : photoCheck.isReady
                ? '写真条件を確認すると精度が上がります'
                : '追加したい写真があります'}
          </h1>
          <p className="mt-4 leading-8 text-stone-700">
            写真とご回答をもとに、今見えているスタイルの傾向を整理します。写真の明るさや角度によって見え方が変わるため、足りない写真がある場合は先に追加をご案内します。
          </p>
        </div>

        {canProceed && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
            <h2 className="text-base font-semibold text-emerald-950">写真の準備ができました</h2>
            <div className="mt-3 space-y-2 text-sm leading-6 text-emerald-900">
              <p>まず必要な写真と確認条件がそろっています。</p>
              <p>この内容をもとに、候補の傾向と試しやすいスタイル提案を表示します。</p>
            </div>
          </div>
        )}

        <>
            <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-rose-700">傾向チェック</p>
              <h2 className="mt-2 text-2xl font-bold text-stone-950">{diagnosisResult.title}</h2>
              <p className="mt-3 text-sm leading-7 text-stone-700">{diagnosisResult.summary}</p>
              <div className="mt-5 grid gap-4">
                {diagnosisResult.axisResults?.map((axis) => (
                  <section key={axis.axis} className="rounded-md bg-stone-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-stone-950">{axis.title}</h3>
                      {axis.status === 'estimated' ? (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-600">
                          推定度 {axis.confidence}%
                        </span>
                      ) : (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-600">
                          追加確認が必要
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-stone-500">{axis.note}</p>
                    {(axis.isMixed || axis.isNeutral) && (
                      <p className="mt-3 rounded-md bg-white p-3 text-sm leading-6 text-stone-700">
                        どちらかに決めきらず、両方の活かし方をご紹介します。
                      </p>
                    )}
                    {axis.status === 'insufficient' && axis.insufficientGuidance && (
                      <p className="mt-3 rounded-md bg-white p-3 text-sm leading-6 text-stone-700">
                        {axis.insufficientGuidance}
                      </p>
                    )}
                    {axis.sourceReasonGroups && (
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {axis.sourceReasonGroups.map((group) => (
                          <div key={`${axis.axis}-${group.source}`} className="rounded-md bg-white p-3">
                            <p className="text-xs font-semibold text-stone-500">{group.label}</p>
                            {group.reasons.length > 0 ? (
                              <div className="mt-2 space-y-1">
                                {group.reasons.map((reason) => (
                                  <p key={reason} className="text-xs leading-5 text-stone-600">
                                    {reason}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-2 text-xs leading-5 text-stone-500">まだ根拠として使える情報が揃っていません。</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 space-y-3">
                      {axis.status === 'estimated' &&
                        axis.candidates.slice(0, 3).map((candidate) => {
                          const candidateImage = getCandidateImage(axis.axis, candidate.key);

                          return (
                            <div key={candidate.key} className="rounded-md bg-white p-3">
                              {candidateImage && (
                                <>
                                  <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-md bg-stone-100">
                                    <Image
                                      fill
                                      alt={candidateImage.alt}
                                      className="object-cover"
                                      sizes="(min-width: 768px) 640px, 100vw"
                                      src={candidateImage.src}
                                    />
                                  </div>
                                  {candidateImage.gallery.length > 0 && (
                                    <div className="mb-3">
                                      <p className="mb-2 text-xs font-semibold text-stone-500">イメージ例</p>
                                      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
                                        {candidateImage.gallery.map((image) => (
                                          <div key={image.src} className="relative aspect-square w-32 shrink-0 overflow-hidden rounded-md bg-stone-100 md:w-36">
                                            <Image
                                              fill
                                              alt={image.alt}
                                              className="object-cover"
                                              sizes="144px"
                                              src={image.src}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-stone-950">{candidate.displayName}</p>
                                <p className="text-sm font-bold text-rose-700">{candidate.percent}%</p>
                              </div>
                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                                <div className="h-full rounded-full bg-rose-700" style={{ width: `${candidate.percent}%` }} />
                              </div>
                              <p className="mt-3 text-sm leading-6 text-stone-700">{candidate.copy}</p>
                              <div className="mt-3 space-y-1">
                                {candidate.reasons.map((reason) => (
                                  <p key={reason} className="text-xs leading-5 text-stone-500">
                                    {reason}
                                  </p>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            {diagnosisResult.recommendations && diagnosisResult.recommendations.length > 0 && (
              <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-stone-950">試しやすいスタイル提案</h2>
                <p className="mt-2 text-sm leading-6 text-stone-700">
                  今見えている傾向をもとに、次に取り入れやすい方向を整理しています。
                </p>
                <div className="mt-4 grid gap-3">
                  {diagnosisResult.recommendations.map((recommendation) => (
                    <article key={`${recommendation.category}-${recommendation.relatedType}`} className="rounded-md bg-stone-50 p-4">
                      <p className="text-xs font-semibold text-rose-700">{recommendation.category}</p>
                      <h3 className="mt-1 text-sm font-semibold text-stone-950">{recommendation.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-stone-700">{recommendation.body}</p>
                      <p className="mt-2 text-xs leading-5 text-stone-500">{recommendation.reason}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-stone-950">表示について</h2>
              <div className="mt-3 space-y-2">
                <p className="text-xs leading-5 text-stone-500">
                  画像はタイプを断定する正解例ではなく、傾向や取り入れ方をイメージするための補助です。
                </p>
                {diagnosisResult.cautionNotes?.map((note) => (
                  <p key={note} className="text-xs leading-5 text-stone-500">
                    {note}
                  </p>
                ))}
              </div>
            </div>
          </>

        {!photoCheck.isReady && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-5">
            <h2 className="text-base font-semibold text-rose-900">先に追加したい写真</h2>
            <div className="mt-3 space-y-2">
              {requiredMissing.map((photo) => (
                <p key={photo.type} className="text-sm leading-6 text-rose-900">
                  {photo.label}: {photo.reason}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-stone-950">あると精度が上がる写真</h2>
          {recommendedMissing.length > 0 ? (
            <div className="mt-3 space-y-2">
              {recommendedMissing.map((photo) => (
                <p key={photo.type} className="text-sm leading-6 text-stone-700">
                  {photo.label}: {photo.reason}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-stone-700">より詳しく見るための写真もそろっています。</p>
          )}
        </div>

        {photoCheck.conditionWarnings.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-base font-semibold text-amber-900">写真条件の確認</h2>
            <div className="mt-3 space-y-2">
              {photoCheck.conditionWarnings.map((warning) => (
                <p key={`${warning.type}-${warning.condition}`} className="text-sm leading-6 text-amber-900">
                  {warning.message}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-stone-950">次のアクション</h2>
          <div className="mt-3 space-y-2 text-sm leading-6 text-stone-700">
            {canProceed ? (
              <>
                <p>1. 気になる候補の理由を確認する</p>
                <p>2. 好みや体感を追加して、提案に反映する</p>
                <p>3. 試しやすい色・形・雰囲気から取り入れてみる</p>
              </>
            ) : (
              <>
                <p>1. 先に必要な写真を追加する</p>
                <p>2. 写真条件を確認する</p>
                <p>3. 好みや体感を入力して、提案に反映する</p>
              </>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-stone-950">好み・体感の入力</h2>
          <p className="mt-3 text-sm leading-6 text-stone-700">
            回答済み: {answeredSupportCount} / {supportQuestions.length}
          </p>
          {answeredSupportCount > 0 ? (
            <div className="mt-3 grid gap-2">
              {supportAnswerSummaries.map((summary) => (
                <div key={summary.question} className="rounded-md bg-stone-50 p-3 text-sm text-stone-700">
                  <p className="font-semibold text-stone-900">{summary.question}</p>
                  <p className="mt-1">{summary.answer}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-stone-700">
              好みや体感を入力すると、写真だけでは分からない希望を提案に反映できます。
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link className="rounded-md bg-stone-950 px-5 py-3 text-sm font-semibold text-white" href="/upload">
            写真を見直す
          </Link>
          <Link className="rounded-md border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-900" href="/questionnaire">
            好みを入力する
          </Link>
          <button className="rounded-md border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-900" type="button" onClick={resetSession}>
            最初からやり直す
          </button>
        </div>
      </section>
    </main>
  );
}
