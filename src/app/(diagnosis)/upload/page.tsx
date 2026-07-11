'use client';

import { photoConditionLabels, requiredPhotos } from '@/data/requiredPhotos';
import { checkRequiredPhotos } from '@/lib/diagnosis/checkPhotos';
import {
  getSavedPhotoConditionFlags,
  getSavedPhotoTypes,
  PHOTO_CONDITIONS_STORAGE_KEY,
  PHOTO_SESSION_STORAGE_KEY,
} from '@/lib/diagnosis/photoSession';
import type { PhotoCondition, RequiredPhotoType, UploadedPhoto } from '@/lib/diagnosis/types';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export default function UploadPage() {
  const [selectedTypes, setSelectedTypes] = useState<RequiredPhotoType[]>(getSavedPhotoTypes);
  const [conditionFlags, setConditionFlags] = useState(getSavedPhotoConditionFlags);
  const [previewUrls, setPreviewUrls] = useState<Partial<Record<RequiredPhotoType, string>>>({});
  const uploadedPhotos = useMemo<UploadedPhoto[]>(
    () => selectedTypes.map((type) => ({ type, conditionFlags: conditionFlags[type] })),
    [conditionFlags, selectedTypes],
  );
  const photoCheck = checkRequiredPhotos(uploadedPhotos);
  const requiredMissing = photoCheck.missingPhotos.filter((photo) => photo.priority === 'required');

  useEffect(() => {
    window.localStorage.setItem(PHOTO_SESSION_STORAGE_KEY, JSON.stringify(selectedTypes));
  }, [selectedTypes]);

  useEffect(() => {
    window.localStorage.setItem(PHOTO_CONDITIONS_STORAGE_KEY, JSON.stringify(conditionFlags));
  }, [conditionFlags]);

  function togglePhoto(type: RequiredPhotoType) {
    setSelectedTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type],
    );
  }

  function updateCondition(type: RequiredPhotoType, condition: PhotoCondition, checked: boolean) {
    setConditionFlags((current) => ({
      ...current,
      [type]: {
        ...current[type],
        [condition]: checked,
      },
    }));
  }

  function handleFileChange(type: RequiredPhotoType, file: File | undefined) {
    if (!file) {
      return;
    }

    setSelectedTypes((current) => (current.includes(type) ? current : [...current, type]));
    setPreviewUrls((current) => {
      if (current[type]) {
        URL.revokeObjectURL(current[type]);
      }

      return {
        ...current,
        [type]: URL.createObjectURL(file),
      };
    });
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-sm font-semibold text-rose-700">写真を追加</p>
          <h1 className="mt-2 text-3xl font-bold text-stone-950">スタイル傾向を見るための写真</h1>
          <p className="mt-3 text-sm leading-7 text-stone-700">
            写真は、顔立ち・全身バランス・色の見え方を確認するために使います。まずは「まず必要」の写真から追加してください。
          </p>
        </div>

        <div className="rounded-lg border border-rose-200 bg-rose-50 p-5">
          <p className="text-sm font-semibold text-rose-800">先に追加したい写真</p>
          {requiredMissing.length > 0 ? (
            <div className="mt-3 space-y-2">
              {requiredMissing.map((photo) => (
                <p key={photo.type} className="text-sm leading-6 text-rose-900">
                  {photo.label}: {photo.reason}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-rose-900">
              必要な写真はそろっています。写真の条件を確認して、結果へ進めます。
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {requiredPhotos.map((photo) => {
            const isSelected = selectedTypes.includes(photo.type);

            return (
            <div key={photo.type} className="flex min-h-56 flex-col justify-between rounded-lg border border-dashed border-stone-300 bg-white p-4 shadow-sm">
              <div>
                {photo.imageSrc && (
                  <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-md bg-stone-100">
                    <Image
                      fill
                      alt={photo.imageAlt ?? `${photo.label}のイメージ`}
                      className="object-cover"
                      sizes="(min-width: 768px) 33vw, 100vw"
                      src={photo.imageSrc}
                    />
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-stone-950">{photo.label}</h2>
                  <span className="rounded-full bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-600">
                    {photo.required ? 'まず必要' : 'あると安心'}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-700">{photo.purpose}</p>
              </div>
              <label className="mt-4 flex min-h-32 cursor-pointer items-center justify-center rounded-md border border-stone-200 bg-stone-50 text-center text-sm font-semibold text-stone-600">
                {previewUrls[photo.type] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={`${photo.label}のプレビュー`}
                    className="max-h-40 w-full rounded-md object-cover"
                    src={previewUrls[photo.type]}
                  />
                ) : (
                  <span>写真を選ぶ</span>
                )}
                <input
                  accept="image/*"
                  className="sr-only"
                  type="file"
                  onChange={(event) => handleFileChange(photo.type, event.target.files?.[0])}
                />
              </label>
              <div className="mt-4 flex flex-wrap gap-2">
                {photo.conditions.map((condition) => (
                  <label key={condition} className="flex items-center gap-1 rounded-full border border-stone-200 px-2 py-1 text-xs text-stone-600">
                    <input
                      checked={conditionFlags[photo.type]?.[condition] ?? false}
                      type="checkbox"
                      onChange={(event) => updateCondition(photo.type, condition, event.target.checked)}
                    />
                    {photoConditionLabels[condition]}
                  </label>
                ))}
              </div>
              <button
                className={`mt-4 rounded-md px-3 py-2 text-sm font-semibold ${
                  isSelected ? 'bg-stone-950 text-white' : 'border border-stone-300 text-stone-800'
                }`}
                type="button"
                onClick={() => togglePhoto(photo.type)}
              >
                {isSelected ? '使う写真に追加済み' : 'この写真を使う'}
              </button>
            </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link className="rounded-md bg-stone-950 px-5 py-3 text-sm font-semibold text-white" href="/result">
            結果を見る
          </Link>
          <Link className="rounded-md border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-900" href="/questionnaire">
            好みを入力する
          </Link>
        </div>
      </section>
    </main>
  );
}
