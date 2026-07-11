import type { PhotoCondition, RequiredPhotoType } from './types';

export const PHOTO_SESSION_STORAGE_KEY = 'ai-style-lab:uploaded-photo-types';
export const PHOTO_CONDITIONS_STORAGE_KEY = 'ai-style-lab:photo-condition-flags';
export const SUPPORT_ANSWERS_STORAGE_KEY = 'ai-style-lab:support-answers';

export type SavedPhotoConditionFlags = Partial<
  Record<RequiredPhotoType, Partial<Record<PhotoCondition, boolean>>>
>;

export type SavedSupportAnswers = Record<string, string>;

export function getSavedPhotoTypes(): RequiredPhotoType[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const saved = window.localStorage.getItem(PHOTO_SESSION_STORAGE_KEY);

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved) as RequiredPhotoType[];
  } catch {
    window.localStorage.removeItem(PHOTO_SESSION_STORAGE_KEY);
    return [];
  }
}

export function getSavedPhotoConditionFlags(): SavedPhotoConditionFlags {
  if (typeof window === 'undefined') {
    return {};
  }

  const saved = window.localStorage.getItem(PHOTO_CONDITIONS_STORAGE_KEY);

  if (!saved) {
    return {};
  }

  try {
    return JSON.parse(saved) as SavedPhotoConditionFlags;
  } catch {
    window.localStorage.removeItem(PHOTO_CONDITIONS_STORAGE_KEY);
    return {};
  }
}

export function getSavedSupportAnswers(): SavedSupportAnswers {
  if (typeof window === 'undefined') {
    return {};
  }

  const saved = window.localStorage.getItem(SUPPORT_ANSWERS_STORAGE_KEY);

  if (!saved) {
    return {};
  }

  try {
    return JSON.parse(saved) as SavedSupportAnswers;
  } catch {
    window.localStorage.removeItem(SUPPORT_ANSWERS_STORAGE_KEY);
    return {};
  }
}

export function clearSavedStyleSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(PHOTO_SESSION_STORAGE_KEY);
  window.localStorage.removeItem(PHOTO_CONDITIONS_STORAGE_KEY);
  window.localStorage.removeItem(SUPPORT_ANSWERS_STORAGE_KEY);
}
