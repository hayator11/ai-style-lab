import type { FaceChildAdult, FaceCurveStraight, FaceType } from '@/lib/diagnosis/types';

export type FaceTypeDefinition = {
  key: FaceType;
  displayName: string;
  standardEquivalent: string;
  imageSrc?: string;
  imageAlt?: string;
  imageGallery?: {
    src: string;
    alt: string;
  }[];
  axis: {
    childAdult: FaceChildAdult;
    curveStraight: FaceCurveStraight;
    label: string;
  };
  cues: string[];
  copy: string;
};

export const faceTypes: FaceTypeDefinition[] = [
  {
    key: 'pop',
    displayName: 'Pop',
    standardEquivalent: 'キュート',
    imageSrc: '/images/face-types/pop-diagram.jpg',
    imageAlt: 'Popタイプの顔立ち診断イメージ',
    imageGallery: [
      { src: '/images/face-types/pop.jpg', alt: 'Popタイプの雰囲気イメージ' },
      { src: '/images/face-types/gallery/pop-styling.jpg', alt: 'Popタイプのスタイリングイメージ' },
      { src: '/images/face-types/gallery/pop-hair.jpg', alt: 'Popタイプのヘアと小物イメージ' },
    ],
    axis: {
      childAdult: 'child',
      curveStraight: 'curve',
      label: '子ども顔×曲線',
    },
    cues: [
      '丸い輪郭',
      '目が丸く大きい',
      '全体に丸み',
      '位置: 子ども×曲線',
      '印象: 優しくかわいい・守ってあげたくなる',
    ],
    copy: 'あどけなく親しみやすい Pop 寄りに見えます',
  },
  {
    key: 'clear',
    displayName: 'Clear',
    standardEquivalent: 'フレッシュ',
    imageSrc: '/images/face-types/clear-diagram.jpg',
    imageAlt: 'Clearタイプの顔立ち診断イメージ',
    imageGallery: [
      { src: '/images/face-types/clear.jpg', alt: 'Clearタイプの雰囲気イメージ' },
      { src: '/images/face-types/gallery/clear-styling.jpg', alt: 'Clearタイプのスタイリングイメージ' },
      { src: '/images/face-types/gallery/clear-hair.jpg', alt: 'Clearタイプのヘアと小物イメージ' },
    ],
    axis: {
      childAdult: 'child',
      curveStraight: 'straight',
      label: '子ども顔×直線',
    },
    cues: [
      '子ども顔だが直線的',
      'すっきり・平面的',
      '位置: 子ども×直線',
      '印象: 爽やか・親しみ・若見え',
    ],
    copy: 'さわやかで直線的な Clear の傾向が見られます',
  },
  {
    key: 'bloom',
    displayName: 'Bloom',
    standardEquivalent: 'フェミニン',
    imageSrc: '/images/face-types/bloom-diagram.jpg',
    imageAlt: 'Bloomタイプの顔立ち診断イメージ',
    imageGallery: [
      { src: '/images/face-types/bloom.jpg', alt: 'Bloomタイプの雰囲気イメージ' },
      { src: '/images/face-types/gallery/bloom-styling.jpg', alt: 'Bloomタイプのスタイリングイメージ' },
      { src: '/images/face-types/gallery/bloom-hair.jpg', alt: 'Bloomタイプのヘアと小物イメージ' },
    ],
    axis: {
      childAdult: 'adult',
      curveStraight: 'curve',
      label: '大人顔×曲線',
    },
    cues: [
      '大人顔＋曲線',
      '華やか・立体的',
      '位置: 大人×曲線',
      '印象: 女性らしく華やか',
    ],
    copy: '華やかで曲線的な Bloom 寄りに見えます',
  },
  {
    key: 'mode',
    displayName: 'Mode',
    standardEquivalent: 'クール',
    imageSrc: '/images/face-types/mode-diagram.jpg',
    imageAlt: 'Modeタイプの顔立ち診断イメージ',
    imageGallery: [
      { src: '/images/face-types/mode.jpg', alt: 'Modeタイプの雰囲気イメージ' },
      { src: '/images/face-types/gallery/mode-styling.jpg', alt: 'Modeタイプのスタイリングイメージ' },
      { src: '/images/face-types/gallery/mode-hair.jpg', alt: 'Modeタイプのヘアと小物イメージ' },
    ],
    axis: {
      childAdult: 'adult',
      curveStraight: 'straight',
      label: '大人顔×直線',
    },
    cues: [
      '大人顔＋直線',
      'シャープ・都会的',
      '位置: 大人×直線',
      '印象: 大人っぽくかっこいい・都会的',
    ],
    copy: 'シャープで大人っぽい Mode の傾向が見られます',
  },
];
