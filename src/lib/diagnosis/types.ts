export type DiagnosisAxis = 'personalColor' | 'boneStructure' | 'faceType' | 'preference';

export type BoneType = 'line' | 'curve' | 'frame';

export type FaceChildAdult = 'child' | 'adult';

export type FaceCurveStraight = 'curve' | 'straight';

export type FaceType = 'pop' | 'clear' | 'bloom' | 'mode';

export type FeatureSource = 'photo' | 'selfReport' | 'stylist';

export type FaceChildAdultAnswer = FaceChildAdult | 'unknown';

export type FaceCurveStraightAnswer = FaceCurveStraight | 'unknown';

export type FaceChildAdultCue =
  | 'faceShape'
  | 'chinLength'
  | 'eyeDistance'
  | 'noseHeight'
  | 'dimension'
  | 'eyeSize'
  | 'nostrilWidth';

export type FaceCurveStraightCue =
  | 'overallBone'
  | 'cheekVolume'
  | 'eyeShape'
  | 'eyelid'
  | 'eyeCorner'
  | 'eyebrow'
  | 'noseTip'
  | 'lipThickness';

export type FaceAxisAnswers = {
  childAdult: Partial<Record<FaceChildAdultCue, FaceChildAdultAnswer>>;
  curveStraight: Partial<Record<FaceCurveStraightCue, FaceCurveStraightAnswer>>;
};

export type BoneCueObservability = 'photo' | 'touch';

export type AxisStatus = 'estimated' | 'insufficient';

export type FaceTypeMeta = {
  childAdult: FaceChildAdult;
  curveStraight: FaceCurveStraight;
};

export type ColorSeason = 'sunrise' | 'mist' | 'amber' | 'midnight';

export type LabelAxis = 'bone' | 'face' | 'color';

export type LabelSource = 'stylist' | 'self' | 'ai' | 'feedback';

export type LabelTypeKey = BoneType | FaceType | ColorSeason;

type LabelBase<TAxis extends LabelAxis, TTypeKey extends LabelTypeKey> = {
  labelId: string;
  imageId: string;
  userId?: string;
  diagnosisId?: string;
  axis: TAxis;
  typeKey: TTypeKey;
  standardEquivalent?: string;
  source: LabelSource;
  labelerId?: string;
  confidence: number;
  isGroundTruth: boolean;
  observedFeatures: string[];
  note?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Label =
  | LabelBase<'bone', BoneType>
  | LabelBase<'face', FaceType>
  | LabelBase<'color', ColorSeason>;

export type AgreementLog = {
  imageId: string;
  axis: LabelAxis;
  aiTypeKey?: LabelTypeKey;
  aiConfidence?: number;
  groundTruthTypeKey?: LabelTypeKey;
  selfTypeKey?: LabelTypeKey;
  agree?: boolean;
  note?: string;
  createdAt: string;
};

export type RequiredPhotoType =
  | 'faceFront'
  | 'faceSmile'
  | 'faceNeutral'
  | 'faceLeft'
  | 'faceRight'
  | 'fullBodyFront'
  | 'fullBodySide'
  | 'fullBodyNatural'
  | 'colorNaturalLight';

export type PhotoCondition =
  | 'naturalLight'
  | 'noHeavyMakeup'
  | 'noFilter'
  | 'whiteBackground'
  | 'faceVisible'
  | 'fullBodyVisible'
  | 'neutralClothing'
  | 'standingNaturally';

export type TrainingConsent = 'granted' | 'denied' | 'unknown';

export type ImageMeta = {
  imageId: string;
  userId?: string;
  diagnosisId?: string;
  photoType: RequiredPhotoType;
  storagePath?: string;
  shootingConditions: PhotoCondition[];
  qualityNote?: string;
  hasGroundTruth: boolean;
  trainingConsent: TrainingConsent;
  primaryLabelIds?: string[];
  createdAt: string;
};

export type PhotoRequirement = {
  type: RequiredPhotoType;
  label: string;
  purpose: string;
  imageSrc?: string;
  imageAlt?: string;
  required: boolean;
  conditions: PhotoCondition[];
  axes: DiagnosisAxis[];
};

export type UploadedPhoto = {
  type: RequiredPhotoType;
  conditionFlags?: Partial<Record<PhotoCondition, boolean>>;
};

export type MissingPhoto = {
  type: RequiredPhotoType;
  label: string;
  reason: string;
  priority: 'required' | 'recommended';
};

export type PhotoConditionWarning = {
  type: RequiredPhotoType;
  condition: PhotoCondition;
  message: string;
};

export type PhotoCheckResult = {
  isReady: boolean;
  uploadedTypes: RequiredPhotoType[];
  missingPhotos: MissingPhoto[];
  conditionWarnings: PhotoConditionWarning[];
};

export type SupportQuestion = {
  id: string;
  label: string;
  axis: DiagnosisAxis;
  helpsWith: DiagnosisAxis[];
  options: Array<{ label: string; value: string }>;
};

export type DiagnosisConfidence = {
  label: string;
  score: number;
  reason: string;
};

export type ResultAxis = 'bone' | 'face' | 'color';

export type ResultCandidate = {
  key: LabelTypeKey;
  displayName: string;
  percent: number;
  copy: string;
  reasons: string[];
};

export type SourceReasonGroup = {
  source: FeatureSource;
  label: string;
  reasons: string[];
};

export type AxisResult = {
  axis: ResultAxis;
  title: string;
  status: AxisStatus;
  confidence: number;
  candidates: ResultCandidate[];
  reasons: string[];
  note: string;
  isMixed?: boolean;
  isNeutral?: boolean;
  featureSources?: FeatureSource[];
  sourceReasonGroups?: SourceReasonGroup[];
  insufficientGuidance?: string;
};

export type StyleRecommendation = {
  category: string;
  title: string;
  body: string;
  reason: string;
  relatedType: string;
};

export type DiagnosisResult = {
  title: string;
  summary: string;
  confidences: DiagnosisConfidence[];
  reasons: string[];
  axisResults?: AxisResult[];
  recommendations?: StyleRecommendation[];
  cautionNotes?: string[];
};

export type DiagnosisInput = {
  supportAnswers: Record<string, string>;
  photos: UploadedPhoto[];
  preferenceText?: string;
};

export type StylePreviewItem = {
  title: string;
  summary: string;
  reason: string;
};

export type StylePreview = {
  status: 'notReady' | 'photoReady' | 'supportReady';
  title: string;
  summary: string;
  items: StylePreviewItem[];
  notes: string[];
};
