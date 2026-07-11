import { faceTypes } from '@/data/faceTypes';
import type {
  AxisStatus,
  FaceAxisAnswers,
  FaceChildAdult,
  FaceChildAdultAnswer,
  FaceChildAdultCue,
  FaceCurveStraight,
  FaceCurveStraightAnswer,
  FaceCurveStraightCue,
  FaceType,
  ResultCandidate,
} from './types';

const childAdultCues: FaceChildAdultCue[] = [
  'faceShape',
  'chinLength',
  'eyeDistance',
  'noseHeight',
  'dimension',
  'eyeSize',
  'nostrilWidth',
];

const curveStraightCues: FaceCurveStraightCue[] = [
  'overallBone',
  'cheekVolume',
  'eyeShape',
  'eyelid',
  'eyeCorner',
  'eyebrow',
  'noseTip',
  'lipThickness',
];

const faceTypeByAxis: Record<FaceChildAdult, Record<FaceCurveStraight, FaceType>> = {
  child: {
    curve: 'pop',
    straight: 'clear',
  },
  adult: {
    curve: 'bloom',
    straight: 'mode',
  },
};

type AxisVote<TAnswer extends string> = {
  status: AxisStatus;
  winner?: TAnswer;
  isTied: boolean;
  validCount: number;
  counts: Record<TAnswer, number>;
  certainty: number;
};

export type FaceMajorityResult = {
  status: AxisStatus;
  candidates: ResultCandidate[];
  reasons: string[];
  isMixed: boolean;
  childAdult: AxisVote<FaceChildAdult>;
  curveStraight: AxisVote<FaceCurveStraight>;
};

export function faceAnswersFromSupportAnswers(supportAnswers: Record<string, string>): FaceAxisAnswers {
  return {
    childAdult: Object.fromEntries(
      childAdultCues.map((cue) => [cue, readAnswer<FaceChildAdultAnswer>(supportAnswers[`face-childAdult-${cue}`])]),
    ),
    curveStraight: Object.fromEntries(
      curveStraightCues.map((cue) => [cue, readAnswer<FaceCurveStraightAnswer>(supportAnswers[`face-curveStraight-${cue}`])]),
    ),
  };
}

export function calculateFaceMajority(answers: FaceAxisAnswers): FaceMajorityResult {
  const childAdult = countAxisVotes<FaceChildAdult, FaceChildAdultCue>(answers.childAdult, childAdultCues, ['child', 'adult']);
  const curveStraight = countAxisVotes<FaceCurveStraight, FaceCurveStraightCue>(answers.curveStraight, curveStraightCues, [
    'curve',
    'straight',
  ]);

  if (childAdult.status === 'insufficient' || curveStraight.status === 'insufficient') {
    return {
      status: 'insufficient',
      candidates: [],
      reasons: [
        `世代感の有効回答: ${childAdult.validCount}/7`,
        `曲線・直線の有効回答: ${curveStraight.validCount}/8`,
      ],
      isMixed: false,
      childAdult,
      curveStraight,
    };
  }

  const candidateScores = faceTypes.map((type) => {
    const childAdultMatch = childAdult.winner === undefined || childAdult.isTied || type.axis.childAdult === childAdult.winner;
    const curveStraightMatch =
      curveStraight.winner === undefined || curveStraight.isTied || type.axis.curveStraight === curveStraight.winner;
    const childAdultScore = childAdultMatch ? childAdult.certainty : 1 - childAdult.certainty;
    const curveStraightScore = curveStraightMatch ? curveStraight.certainty : 1 - curveStraight.certainty;

    return {
      key: type.key,
      displayName: type.displayName,
      percent: Math.max(1, Math.round(((childAdultScore + curveStraightScore) / 2) * 100)),
      copy: type.copy,
      reasons: [
        `${type.axis.label}の一致度を、多数決の2軸から見ています。`,
        `世代感 ${childAdult.counts.child}:${childAdult.counts.adult}、曲線/直線 ${curveStraight.counts.curve}:${curveStraight.counts.straight}`,
      ],
    };
  });

  const selectedKeys = selectFaceKeys(childAdult, curveStraight);
  const candidates = candidateScores
    .filter((candidate) => selectedKeys.includes(candidate.key))
    .sort((a, b) => b.percent - a.percent);

  return {
    status: 'estimated',
    candidates,
    reasons: [
      `世代感は有効回答${childAdult.validCount}件の多数決で確認しています。`,
      `曲線・直線は有効回答${curveStraight.validCount}件の多数決で確認しています。`,
    ],
    isMixed: childAdult.isTied || curveStraight.isTied,
    childAdult,
    curveStraight,
  };
}

function readAnswer<TAnswer extends string>(value: string | undefined): TAnswer | undefined {
  return value as TAnswer | undefined;
}

function countAxisVotes<TAnswer extends string, TCue extends string>(
  answers: Partial<Record<TCue, TAnswer | 'unknown'>>,
  cues: TCue[],
  values: [TAnswer, TAnswer],
): AxisVote<TAnswer> {
  const counts = {
    [values[0]]: 0,
    [values[1]]: 0,
  } as Record<TAnswer, number>;

  cues.forEach((cue) => {
    const answer = answers[cue];
    if (answer === values[0]) {
      counts[values[0]] += 1;
    }
    if (answer === values[1]) {
      counts[values[1]] += 1;
    }
  });

  const validCount = counts[values[0]] + counts[values[1]];
  const isTied = validCount >= 3 && counts[values[0]] === counts[values[1]];
  const winner = counts[values[0]] > counts[values[1]] ? values[0] : counts[values[1]] > counts[values[0]] ? values[1] : undefined;
  const certainty = validCount === 0 ? 0 : Math.max(counts[values[0]], counts[values[1]]) / validCount;

  return {
    status: validCount >= 3 ? 'estimated' : 'insufficient',
    winner,
    isTied,
    validCount,
    counts,
    certainty,
  };
}

function selectFaceKeys(
  childAdult: AxisVote<FaceChildAdult>,
  curveStraight: AxisVote<FaceCurveStraight>,
): FaceType[] {
  const childAdultValues: FaceChildAdult[] =
    childAdult.isTied || childAdult.winner === undefined ? ['child', 'adult'] : [childAdult.winner];
  const curveStraightValues: FaceCurveStraight[] =
    curveStraight.isTied || curveStraight.winner === undefined ? ['curve', 'straight'] : [curveStraight.winner];

  return childAdultValues.flatMap((childAdultValue) =>
    curveStraightValues.map((curveStraightValue) => faceTypeByAxis[childAdultValue][curveStraightValue]),
  );
}

export const nostrilWidthCueNote =
  '小鼻の横幅は目1つ分との比較が公開セルフチェック内で確認できる数値基準のため、将来の自動観測で優先する。';
