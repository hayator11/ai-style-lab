import { requiredPhotos } from '@/data/requiredPhotos';
import type {
  MissingPhoto,
  PhotoCheckResult,
  PhotoConditionWarning,
  PhotoRequirement,
  UploadedPhoto,
} from './types';

export function checkRequiredPhotos(
  uploadedPhotos: UploadedPhoto[],
  requirements: PhotoRequirement[] = requiredPhotos,
): PhotoCheckResult {
  const uploadedTypes = uploadedPhotos.map((photo) => photo.type);
  const uploadedTypeSet = new Set(uploadedTypes);

  const missingPhotos: MissingPhoto[] = requirements
    .filter((requirement) => !uploadedTypeSet.has(requirement.type))
    .map((requirement) => ({
      type: requirement.type,
      label: requirement.label,
      reason: `${requirement.purpose}、${requirement.label}が必要です。`,
      priority: requirement.required ? 'required' : 'recommended',
    }));

  const conditionWarnings: PhotoConditionWarning[] = uploadedPhotos.flatMap((photo) => {
    const requirement = requirements.find((item) => item.type === photo.type);

    if (!requirement) {
      return [];
    }

    return requirement.conditions
      .filter((condition) => photo.conditionFlags?.[condition] !== true)
      .map((condition) => ({
        type: photo.type,
        condition,
        message: `${requirement.label}は写真条件を追加で確認すると精度が上がります。`,
      }));
  });

  return {
    isReady: missingPhotos.every((photo) => photo.priority !== 'required'),
    uploadedTypes,
    missingPhotos,
    conditionWarnings,
  };
}
