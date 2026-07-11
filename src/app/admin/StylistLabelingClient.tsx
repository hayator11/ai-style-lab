'use client';

import { useEffect, useMemo, useState } from 'react';
import { boneTypes } from '@/data/boneTypes';
import { colorSeasons } from '@/data/colorSeasons';
import { faceTypes } from '@/data/faceTypes';
import type { BoneCueObservability, BoneType, ColorSeason, FaceType, LabelAxis, PhotoCondition } from '@/lib/diagnosis/types';
import { labelStore } from '@/services/storage/labelStore';

type AxisTab = LabelAxis;

type LabelingImage = {
  imageId: string;
  title: string;
  subjectLabel: string;
  shootingConditions: PhotoCondition[];
  qualityNote: string;
};

type FeatureOption<TTypeKey extends string> = {
  key: string;
  label: string;
  axisLabel: string;
  weight: Partial<Record<TTypeKey, number>>;
};

type AxisState<TTypeKey extends string> = {
  selectedFeatureKeys: string[];
  confirmedType: TTypeKey;
  confidence: number;
  note: string;
};

type Suggestion<TTypeKey extends string> = {
  key: TTypeKey;
  displayName: string;
  standardEquivalent: string;
  score: number;
};

const dummyImages: LabelingImage[] = [
  {
    imageId: 'sample_style_001',
    title: 'Sample 001',
    subjectLabel: '全身・顔・カラー確認用',
    shootingConditions: ['naturalLight', 'noFilter', 'faceVisible', 'fullBodyVisible'],
    qualityNote: '自然光。全身と顔の輪郭が確認しやすい想定です。',
  },
  {
    imageId: 'sample_style_002',
    title: 'Sample 002',
    subjectLabel: '骨格と顔タイプ確認用',
    shootingConditions: ['whiteBackground', 'faceVisible', 'fullBodyVisible', 'standingNaturally'],
    qualityNote: '背景が明るく、姿勢が自然な想定です。',
  },
  {
    imageId: 'sample_style_003',
    title: 'Sample 003',
    subjectLabel: 'カラー補助確認用',
    shootingConditions: ['naturalLight', 'noHeavyMakeup', 'noFilter', 'faceVisible'],
    qualityNote: '肌・瞳・髪の色みを補助的に見られる想定です。',
  },
  {
    imageId: 'sample_style_004',
    title: 'Sample 004',
    subjectLabel: '3軸ラベリング練習用',
    shootingConditions: ['faceVisible', 'fullBodyVisible', 'neutralClothing'],
    qualityNote: 'MVP用の仮キューです。実画像接続前の操作確認に使います。',
  },
];

const conditionLabels: Record<PhotoCondition, string> = {
  naturalLight: '自然光',
  noHeavyMakeup: 'メイク控えめ',
  noFilter: '加工なし',
  whiteBackground: '白背景',
  faceVisible: '顔が確認できる',
  fullBodyVisible: '全身が確認できる',
  neutralClothing: '装飾が少ない服',
  standingNaturally: '自然な立ち姿',
};

const boneFeatureGroups: Array<{ title: string; options: FeatureOption<BoneType>[] }> = [
  {
    title: '重心',
    options: [
      { key: 'bone_balance_upper', label: '上重心に見える', axisLabel: '重心: 上', weight: { line: 3 } },
      { key: 'bone_balance_lower', label: '下重心に見える', axisLabel: '重心: 下', weight: { curve: 3 } },
    ],
  },
  {
    title: '鎖骨・上半身',
    options: [
      { key: 'bone_clavicle_subtle', label: '鎖骨は目立ちにくい', axisLabel: '鎖骨: 目立ちにくい', weight: { line: 3 } },
      { key: 'bone_clavicle_clear', label: '鎖骨がくっきり見える', axisLabel: '鎖骨: くっきり', weight: { curve: 3 } },
      { key: 'bone_clavicle_frame', label: '鎖骨が太く目立つ', axisLabel: '鎖骨: 太く目立つ', weight: { frame: 3 } },
      { key: 'bone_upper_thick', label: '上半身に厚みがある', axisLabel: '上半身: 厚み', weight: { line: 2 } },
      { key: 'bone_upper_thin', label: '上半身が薄く見える', axisLabel: '上半身: 薄い', weight: { curve: 2 } },
    ],
  },
  {
    title: '関節・肌質',
    options: [
      { key: 'bone_joint_soft', label: '関節は目立ちにくい', axisLabel: '関節: 控えめ', weight: { line: 1, curve: 1 } },
      { key: 'bone_joint_small', label: '手首や関節が細く小さい', axisLabel: '関節: 小さい', weight: { curve: 2 } },
      { key: 'bone_joint_large', label: '関節や骨の存在感がある', axisLabel: '関節: 大きい', weight: { frame: 3 } },
      { key: 'bone_skin_firm', label: '肌にハリを感じる', axisLabel: '肌質: ハリ', weight: { line: 2 } },
      { key: 'bone_skin_soft', label: '肌がやわらかく見える', axisLabel: '肌質: やわらかい', weight: { curve: 2 } },
      { key: 'bone_skin_dry', label: '肉感が控えめでさらっと見える', axisLabel: '肌質: さらっと', weight: { frame: 2 } },
    ],
  },
];

const faceDetailFeatures: FeatureOption<FaceType>[] = [
  { key: 'face_round_outline', label: '輪郭や頬に丸み', axisLabel: '輪郭: 丸み', weight: { pop: 2, bloom: 2 } },
  { key: 'face_straight_outline', label: '輪郭に直線感', axisLabel: '輪郭: 直線感', weight: { clear: 2, mode: 2 } },
  { key: 'face_short_chin', label: 'あごが短めに見える', axisLabel: 'あご: 短め', weight: { pop: 2, clear: 2 } },
  { key: 'face_long_chin', label: 'あごや縦感が出ている', axisLabel: 'あご: 縦感', weight: { bloom: 2, mode: 2 } },
  { key: 'face_round_eyes', label: '目に丸み・縦幅', axisLabel: '目: 丸み', weight: { pop: 2, bloom: 2 } },
  { key: 'face_sharp_eyes', label: '目元がすっきり直線的', axisLabel: '目: 直線感', weight: { clear: 2, mode: 2 } },
  { key: 'face_soft_cheek', label: '頬にふっくら感', axisLabel: '頬: ふっくら', weight: { pop: 1, bloom: 1 } },
  { key: 'face_clear_bone', label: '骨感や立体感がある', axisLabel: '立体感: あり', weight: { bloom: 1, mode: 2 } },
];

const colorFeatureGroups: Array<{ title: string; options: FeatureOption<ColorSeason>[] }> = [
  {
    title: 'ベース',
    options: [
      { key: 'color_base_yellow', label: '黄みを感じる', axisLabel: 'ベース: イエベ', weight: { sunrise: 2, amber: 2 } },
      { key: 'color_base_blue', label: '青みを感じる', axisLabel: 'ベース: ブルベ', weight: { mist: 2, midnight: 2 } },
    ],
  },
  {
    title: '明度・彩度・清濁',
    options: [
      { key: 'color_value_light', label: '明るさがある', axisLabel: '明度: 高', weight: { sunrise: 2, mist: 2 } },
      { key: 'color_value_deep', label: '深さがある', axisLabel: '明度: 低', weight: { amber: 2, midnight: 2 } },
      { key: 'color_chroma_clear', label: '鮮やかさがある', axisLabel: '彩度: 高', weight: { sunrise: 2, midnight: 2 } },
      { key: 'color_chroma_soft', label: '穏やかさがある', axisLabel: '彩度: 低', weight: { mist: 2, amber: 2 } },
      { key: 'color_clarity_clean', label: '澄んだ印象', axisLabel: '清濁: 清', weight: { sunrise: 2, midnight: 2 } },
      { key: 'color_clarity_muted', label: 'やわらかく落ち着く印象', axisLabel: '清濁: 濁', weight: { mist: 2, amber: 2 } },
    ],
  },
  {
    title: '補助',
    options: [
      { key: 'color_eye_light', label: '瞳が明るく見える', axisLabel: '瞳: 明るい', weight: { sunrise: 1, mist: 1 } },
      { key: 'color_eye_deep', label: '瞳に深みがある', axisLabel: '瞳: 深い', weight: { amber: 1, midnight: 1 } },
      { key: 'color_contrast_high', label: '白目と黒目のコントラストが強い', axisLabel: 'コントラスト: 強い', weight: { midnight: 2 } },
      { key: 'color_hair_ash', label: '髪にアッシュ感', axisLabel: '髪: アッシュ', weight: { mist: 1 } },
    ],
  },
];

const axisLabels: Record<AxisTab, string> = {
  bone: '骨格',
  face: '顔',
  color: 'カラー',
};

const initialBoneState: AxisState<BoneType> = {
  selectedFeatureKeys: [],
  confirmedType: 'line',
  confidence: 0.7,
  note: '',
};

const initialFaceState: AxisState<FaceType> = {
  selectedFeatureKeys: [],
  confirmedType: 'pop',
  confidence: 0.7,
  note: '',
};

const initialColorState: AxisState<ColorSeason> = {
  selectedFeatureKeys: [],
  confirmedType: 'sunrise',
  confidence: 0.65,
  note: '',
};

function scoreSuggestions<TTypeKey extends string>(
  typeDefinitions: Array<{
    key: TTypeKey;
    displayName: string;
    standardEquivalent: string;
    cues: Array<string | { text: string; observability: BoneCueObservability }>;
  }>,
  selectedFeatures: FeatureOption<TTypeKey>[],
): Suggestion<TTypeKey>[] {
  return typeDefinitions
    .map((definition) => {
      const score = selectedFeatures.reduce((sum, feature) => sum + (feature.weight[definition.key] ?? 0), 0);
      const cueBonus = selectedFeatures.reduce((sum, feature) => {
        const matched = definition.cues.some((cue) => {
          const cueText = typeof cue === 'string' ? cue : cue.text;
          return cueText.includes(feature.label) || cueText.includes(feature.axisLabel.split(':')[0]);
        });
        return matched ? sum + 0.5 : sum;
      }, 0);
      return {
        key: definition.key,
        displayName: definition.displayName,
        standardEquivalent: definition.standardEquivalent,
        score: score + cueBonus,
      };
    })
    .sort((a, b) => b.score - a.score);
}

function getSelectedFeatures<TTypeKey extends string>(
  groups: Array<{ options: FeatureOption<TTypeKey>[] }>,
  keys: string[],
): FeatureOption<TTypeKey>[] {
  const allOptions = groups.flatMap((group) => group.options);
  return allOptions.filter((option) => keys.includes(option.key));
}

function formatObservedFeatures<TTypeKey extends string>(features: FeatureOption<TTypeKey>[]): string[] {
  return features.map((feature) => `${feature.key}:${feature.axisLabel}:${feature.label}`);
}

function updateSelectedKeys(keys: string[], key: string): string[] {
  return keys.includes(key) ? keys.filter((item) => item !== key) : [...keys, key];
}

export default function StylistLabelingClient() {
  const [activeTab, setActiveTab] = useState<AxisTab>('bone');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedImageIds, setSavedImageIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [boneState, setBoneState] = useState<AxisState<BoneType>>(initialBoneState);
  const [faceState, setFaceState] = useState<AxisState<FaceType>>(initialFaceState);
  const [colorState, setColorState] = useState<AxisState<ColorSeason>>(initialColorState);
  const [faceChildAdult, setFaceChildAdult] = useState(35);
  const [faceCurveStraight, setFaceCurveStraight] = useState(35);

  const currentImage = dummyImages[currentIndex] ?? dummyImages[0];

  const boneSelectedFeatures = useMemo(
    () => getSelectedFeatures(boneFeatureGroups, boneState.selectedFeatureKeys),
    [boneState.selectedFeatureKeys],
  );

  const faceAxisFeature = useMemo<FeatureOption<FaceType>>(() => {
    const isAdult = faceChildAdult >= 50;
    const isStraight = faceCurveStraight >= 50;
    if (!isAdult && !isStraight) {
      return { key: 'face_axis_child_curve', label: '子ども顔×曲線の象限', axisLabel: '位置: 子ども×曲線', weight: { pop: 4 } };
    }
    if (!isAdult && isStraight) {
      return { key: 'face_axis_child_straight', label: '子ども顔×直線の象限', axisLabel: '位置: 子ども×直線', weight: { clear: 4 } };
    }
    if (isAdult && !isStraight) {
      return { key: 'face_axis_adult_curve', label: '大人顔×曲線の象限', axisLabel: '位置: 大人×曲線', weight: { bloom: 4 } };
    }
    return { key: 'face_axis_adult_straight', label: '大人顔×直線の象限', axisLabel: '位置: 大人×直線', weight: { mode: 4 } };
  }, [faceChildAdult, faceCurveStraight]);

  const faceSelectedFeatures = useMemo(
    () => [faceAxisFeature, ...faceDetailFeatures.filter((feature) => faceState.selectedFeatureKeys.includes(feature.key))],
    [faceAxisFeature, faceState.selectedFeatureKeys],
  );

  const colorSelectedFeatures = useMemo(
    () => getSelectedFeatures(colorFeatureGroups, colorState.selectedFeatureKeys),
    [colorState.selectedFeatureKeys],
  );

  const boneSuggestions = useMemo(() => scoreSuggestions(boneTypes, boneSelectedFeatures), [boneSelectedFeatures]);
  const faceSuggestions = useMemo(() => scoreSuggestions(faceTypes, faceSelectedFeatures), [faceSelectedFeatures]);
  const colorSuggestions = useMemo(() => scoreSuggestions(colorSeasons, colorSelectedFeatures), [colorSelectedFeatures]);

  useEffect(() => {
    void labelStore.list({ source: 'stylist', isGroundTruth: true }).then((labels) => {
      const completeIds = dummyImages
        .filter((image) => {
          const imageLabels = labels.filter((label) => label.imageId === image.imageId);
          return ['bone', 'face', 'color'].every((axis) => imageLabels.some((label) => label.axis === axis));
        })
        .map((image) => image.imageId);
      setSavedImageIds(completeIds);
    });
  }, []);

  const progressText = `${savedImageIds.length} / ${dummyImages.length}`;
  const unsavedCount = dummyImages.length - savedImageIds.length;

  function resetInputs() {
    setActiveTab('bone');
    setBoneState(initialBoneState);
    setFaceState(initialFaceState);
    setColorState(initialColorState);
    setFaceChildAdult(35);
    setFaceCurveStraight(35);
  }

  function moveToNextImage(nextSavedIds: string[]) {
    const nextIndex = dummyImages.findIndex((image, index) => index > currentIndex && !nextSavedIds.includes(image.imageId));
    if (nextIndex >= 0) {
      setCurrentIndex(nextIndex);
      resetInputs();
      return;
    }

    const firstUnsavedIndex = dummyImages.findIndex((image) => !nextSavedIds.includes(image.imageId));
    if (firstUnsavedIndex >= 0) {
      setCurrentIndex(firstUnsavedIndex);
      resetInputs();
      return;
    }

    setCurrentIndex(Math.min(currentIndex, dummyImages.length - 1));
  }

  async function handleSaveAll() {
    if (!currentImage || isSaving) {
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    const boneType = boneTypes.find((type) => type.key === boneState.confirmedType);
    const faceType = faceTypes.find((type) => type.key === faceState.confirmedType);
    const colorType = colorSeasons.find((type) => type.key === colorState.confirmedType);

    if (!boneType || !faceType || !colorType) {
      setIsSaving(false);
      setSaveMessage('確定タイプを確認してください。');
      return;
    }

    await Promise.all([
      labelStore.create({
        imageId: currentImage.imageId,
        axis: 'bone',
        typeKey: boneState.confirmedType,
        standardEquivalent: boneType.standardEquivalent,
        source: 'stylist',
        labelerId: 'stylist-mvp',
        confidence: boneState.confidence,
        isGroundTruth: true,
        observedFeatures: formatObservedFeatures(boneSelectedFeatures),
        note: boneState.note,
      }),
      labelStore.create({
        imageId: currentImage.imageId,
        axis: 'face',
        typeKey: faceState.confirmedType,
        standardEquivalent: faceType.standardEquivalent,
        source: 'stylist',
        labelerId: 'stylist-mvp',
        confidence: faceState.confidence,
        isGroundTruth: true,
        observedFeatures: formatObservedFeatures(faceSelectedFeatures),
        note: faceState.note,
      }),
      labelStore.create({
        imageId: currentImage.imageId,
        axis: 'color',
        typeKey: colorState.confirmedType,
        standardEquivalent: colorType.standardEquivalent,
        source: 'stylist',
        labelerId: 'stylist-mvp',
        confidence: colorState.confidence,
        isGroundTruth: true,
        observedFeatures: formatObservedFeatures(colorSelectedFeatures),
        note: colorState.note,
      }),
    ]);

    const nextSavedIds = Array.from(new Set([...savedImageIds, currentImage.imageId]));
    setSavedImageIds(nextSavedIds);
    setSaveMessage(`${currentImage.title} の3軸ラベルを保存しました。`);
    moveToNextImage(nextSavedIds);
    setIsSaving(false);
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-6 text-stone-950 md:px-8">
      <section className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="flex flex-col gap-3 border-b border-stone-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-rose-700">Stylist Labeling MVP</p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">スタイリスト・ラベリング</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-700">
              画像1枚に骨格・顔・カラーの観測特徴を付け、プロ確定ラベルとして保存します。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm md:min-w-64">
            <div className="rounded-md border border-stone-200 bg-white p-3">
              <p className="text-xs text-stone-500">ラベル済み</p>
              <p className="mt-1 text-xl font-bold">{progressText}</p>
            </div>
            <div className="rounded-md border border-stone-200 bg-white p-3">
              <p className="text-xs text-stone-500">未ラベル</p>
              <p className="mt-1 text-xl font-bold">{unsavedCount}</p>
            </div>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
          <aside className="space-y-4">
            <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold">未ラベル画像キュー</h2>
                <span className="text-xs font-semibold text-stone-500">MVP仮データ</span>
              </div>
              <div className="mt-4 space-y-2">
                {dummyImages.map((image, index) => {
                  const isSaved = savedImageIds.includes(image.imageId);
                  const isCurrent = image.imageId === currentImage.imageId;
                  return (
                    <button
                      key={image.imageId}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={`w-full rounded-md border p-3 text-left transition ${
                        isCurrent ? 'border-stone-950 bg-stone-100' : 'border-stone-200 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-bold">{image.title}</span>
                        <span className={`text-xs font-semibold ${isSaved ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isSaved ? '保存済み' : '未保存'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-stone-600">{image.subjectLabel}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <div className="aspect-[4/5] rounded-md border border-stone-200 bg-[linear-gradient(135deg,#f5f5f4,#e7e5e4_45%,#fff7ed)] p-4">
                <div className="flex h-full flex-col justify-between rounded-md border border-dashed border-stone-300 bg-white/60 p-4">
                  <div>
                    <p className="text-xs font-semibold text-stone-500">Preview</p>
                    <h2 className="mt-1 text-xl font-bold">{currentImage.title}</h2>
                    <p className="mt-2 text-sm text-stone-700">{currentImage.subjectLabel}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold text-stone-600">
                    <div className="rounded-md bg-white/80 py-3">顔</div>
                    <div className="rounded-md bg-white/80 py-3">全身</div>
                    <div className="rounded-md bg-white/80 py-3">色</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {currentImage.shootingConditions.map((condition) => (
                  <span key={condition} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                    {conditionLabels[condition]}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-sm leading-6 text-stone-700">{currentImage.qualityNote}</p>
            </section>
          </aside>

          <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
            <div className="flex border-b border-stone-200">
              {(Object.keys(axisLabels) as AxisTab[]).map((axis) => (
                <button
                  key={axis}
                  type="button"
                  onClick={() => setActiveTab(axis)}
                  className={`min-h-12 flex-1 px-4 text-sm font-bold ${
                    activeTab === axis ? 'border-b-2 border-stone-950 text-stone-950' : 'text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  {axisLabels[axis]}
                </button>
              ))}
            </div>

            <div className="grid gap-5 p-4 md:p-6 xl:grid-cols-[1fr_300px]">
              <div>
                {activeTab === 'bone' && (
                  <AxisFeaturePanel
                    groups={boneFeatureGroups}
                    selectedKeys={boneState.selectedFeatureKeys}
                    onToggle={(key) => setBoneState((current) => ({ ...current, selectedFeatureKeys: updateSelectedKeys(current.selectedFeatureKeys, key) }))}
                  />
                )}

                {activeTab === 'face' && (
                  <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <SliderField
                        label="世代感"
                        leftLabel="子ども顔"
                        rightLabel="大人顔"
                        value={faceChildAdult}
                        onChange={setFaceChildAdult}
                      />
                      <SliderField
                        label="曲線 / 直線"
                        leftLabel="曲線"
                        rightLabel="直線"
                        value={faceCurveStraight}
                        onChange={setFaceCurveStraight}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">詳細特徴</h3>
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {faceDetailFeatures.map((feature) => (
                          <FeatureToggle
                            key={feature.key}
                            option={feature}
                            selected={faceState.selectedFeatureKeys.includes(feature.key)}
                            onToggle={() =>
                              setFaceState((current) => ({ ...current, selectedFeatureKeys: updateSelectedKeys(current.selectedFeatureKeys, feature.key) }))
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'color' && (
                  <AxisFeaturePanel
                    groups={colorFeatureGroups}
                    selectedKeys={colorState.selectedFeatureKeys}
                    onToggle={(key) => setColorState((current) => ({ ...current, selectedFeatureKeys: updateSelectedKeys(current.selectedFeatureKeys, key) }))}
                  />
                )}
              </div>

              <div className="space-y-4">
                {activeTab === 'bone' && (
                  <ConfirmPanel
                    title="骨格候補"
                    suggestions={boneSuggestions}
                    confirmedType={boneState.confirmedType}
                    confidence={boneState.confidence}
                    note={boneState.note}
                    onConfirm={(typeKey) => setBoneState((current) => ({ ...current, confirmedType: typeKey }))}
                    onConfidence={(confidence) => setBoneState((current) => ({ ...current, confidence }))}
                    onNote={(note) => setBoneState((current) => ({ ...current, note }))}
                  />
                )}

                {activeTab === 'face' && (
                  <ConfirmPanel
                    title="顔タイプ候補"
                    suggestions={faceSuggestions}
                    confirmedType={faceState.confirmedType}
                    confidence={faceState.confidence}
                    note={faceState.note}
                    onConfirm={(typeKey) => setFaceState((current) => ({ ...current, confirmedType: typeKey }))}
                    onConfidence={(confidence) => setFaceState((current) => ({ ...current, confidence }))}
                    onNote={(note) => setFaceState((current) => ({ ...current, note }))}
                  />
                )}

                {activeTab === 'color' && (
                  <ConfirmPanel
                    title="カラー候補"
                    suggestions={colorSuggestions}
                    confirmedType={colorState.confirmedType}
                    confidence={colorState.confidence}
                    note={colorState.note}
                    onConfirm={(typeKey) => setColorState((current) => ({ ...current, confirmedType: typeKey }))}
                    onConfidence={(confidence) => setColorState((current) => ({ ...current, confidence }))}
                    onNote={(note) => setColorState((current) => ({ ...current, note }))}
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-stone-200 bg-stone-50 p-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-stone-700">
                3軸を保存すると、`source: stylist` / `isGroundTruth: true` のLabelを生成します。
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {saveMessage && <span className="text-sm font-semibold text-emerald-700">{saveMessage}</span>}
                <button
                  type="button"
                  onClick={handleSaveAll}
                  disabled={isSaving}
                  className="min-h-11 rounded-md bg-stone-950 px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-stone-400"
                >
                  {isSaving ? '保存中' : '3軸ラベルを保存して次へ'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function AxisFeaturePanel<TTypeKey extends string>({
  groups,
  selectedKeys,
  onToggle,
}: {
  groups: Array<{ title: string; options: FeatureOption<TTypeKey>[] }>;
  selectedKeys: string[];
  onToggle: (key: string) => void;
}) {
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.title}>
          <h3 className="text-sm font-bold">{group.title}</h3>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {group.options.map((option) => (
              <FeatureToggle key={option.key} option={option} selected={selectedKeys.includes(option.key)} onToggle={() => onToggle(option.key)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FeatureToggle<TTypeKey extends string>({
  option,
  selected,
  onToggle,
}: {
  option: FeatureOption<TTypeKey>;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`min-h-12 rounded-md border px-3 py-2 text-left text-sm transition ${
        selected ? 'border-stone-950 bg-stone-950 text-white' : 'border-stone-200 bg-white text-stone-800 hover:bg-stone-50'
      }`}
    >
      <span className="block font-semibold">{option.label}</span>
      <span className={`mt-1 block text-xs ${selected ? 'text-stone-200' : 'text-stone-500'}`}>{option.axisLabel}</span>
    </button>
  );
}

function SliderField({
  label,
  leftLabel,
  rightLabel,
  value,
  onChange,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block rounded-md border border-stone-200 bg-stone-50 p-4">
      <span className="text-sm font-bold">{label}</span>
      <input
        className="mt-4 w-full accent-stone-950"
        type="range"
        min="0"
        max="100"
        step="1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="mt-2 flex justify-between text-xs font-semibold text-stone-600">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </span>
    </label>
  );
}

function ConfirmPanel<TTypeKey extends string>({
  title,
  suggestions,
  confirmedType,
  confidence,
  note,
  onConfirm,
  onConfidence,
  onNote,
}: {
  title: string;
  suggestions: Suggestion<TTypeKey>[];
  confirmedType: TTypeKey;
  confidence: number;
  note: string;
  onConfirm: (typeKey: TTypeKey) => void;
  onConfidence: (confidence: number) => void;
  onNote: (note: string) => void;
}) {
  const maxScore = Math.max(...suggestions.map((suggestion) => suggestion.score), 1);

  return (
    <aside className="rounded-md border border-stone-200 bg-stone-50 p-4">
      <h3 className="text-sm font-bold">{title}</h3>
      <div className="mt-3 space-y-2">
        {suggestions.map((suggestion) => {
          const scorePercent = Math.round((suggestion.score / maxScore) * 100);
          return (
            <button
              key={suggestion.key}
              type="button"
              onClick={() => onConfirm(suggestion.key)}
              className={`w-full rounded-md border p-3 text-left ${
                confirmedType === suggestion.key ? 'border-stone-950 bg-white' : 'border-stone-200 bg-white/70 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold">{suggestion.displayName}</span>
                <span className="text-xs font-semibold text-stone-500">{scorePercent}%</span>
              </div>
              <p className="mt-1 text-xs text-stone-600">{suggestion.standardEquivalent}</p>
              <div className="mt-2 h-1.5 rounded-full bg-stone-200">
                <div className="h-1.5 rounded-full bg-stone-950" style={{ width: `${scorePercent}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      <label className="mt-5 block">
        <span className="flex items-center justify-between text-sm font-bold">
          <span>確信度</span>
          <span>{confidence.toFixed(2)}</span>
        </span>
        <input
          className="mt-3 w-full accent-stone-950"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={confidence}
          onChange={(event) => onConfidence(Number(event.target.value))}
        />
      </label>

      <label className="mt-4 block">
        <span className="text-sm font-bold">メモ</span>
        <textarea
          className="mt-2 min-h-24 w-full resize-y rounded-md border border-stone-200 bg-white p-3 text-sm outline-none focus:border-stone-950"
          value={note}
          onChange={(event) => onNote(event.target.value)}
          placeholder="判断の根拠や撮影条件の補足"
        />
      </label>
    </aside>
  );
}
