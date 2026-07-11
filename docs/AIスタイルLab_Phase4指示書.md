# Phase4 実装指示書（利用者向け結果表示 / 2026-07-09）

> 対象：Codex CLI。作業ディレクトリは `ai-style-lab` の中だけ。
> **必読**：`docs/AIスタイルLab_ベースデータ_判定基準_v2.md`（本指示の根拠。v1ではなくv2を正とする）
> 参考：`docs/AIスタイルLab_タイプ体系案.md` §9（似合う提案）、`docs/data-model.md`

---

## 0. 絶対に守る制約（違反したら作業をやり直す）

- 作業は `ai-style-lab/` の中だけ。**親リポジトリ `revolist-diagnosis` の `src/`（revo111Roles.ts, TypeCard.tsx 等）には一切触れない。**
- **`git commit` しない。** `git add` もしない。
- **禁止語をコード・コメント・UI文言・docsに一切書かない**：`性格診断` / `似合いません` / `太って見え` / `老けて見え` / `あなたは〇〇です`（断定）
- **「顔タイプ診断」という語句を製品コード・UI文言・型名・コメントに使わない**（登録商標。協会公式が「有資格者のみ使用可」と明記）。内部の標準名対応が必要な場合も `standardEquivalent` の既存フィールドに留め、UIには出さない。
- 表現は必ず非断定：「傾向が見られます」「寄りに見えます」。
- 完了前に `npx tsc --noEmit`（typecheck）・`npm run lint`・`npm run build` を通す。
- `docs/IMPLEMENTATION_LOG.md` に Phase4 のログを追記する。

---

## 1. このPhaseの背景（なぜ設計を変えるか）

徹底調査の結果、**「写真から観測できる特徴量」だけでは3診断は成立しない**ことが判明した（根拠はすべて v2 ベースデータに出典付きで記載）。要点：

1. **骨格**：プロの決め手である「肌質・弾力」「骨の硬さ」は**触診情報**で写真に写らない。「鎖骨の出方」「関節の目立ち」「筋肉と脂肪のつき方」も姿勢推定モデルの出力対象外。
2. **カラー**：写真からの自動判定は同一人物・同一環境でも結果がブレる（実測あり）。単独で結論を出してはいけない。
3. **顔**：協会公式がセルフチェック項目（縦軸7・横軸8）を公開しており、**集計方式は「多数決」**。独自の重み付けスコアには根拠がない。

→ よって Phase4 は「重み付けスコアへの単純置換」ではなく、**観測の確からしさに応じて出力を切り替えるエンジン**にする。

---

## 2. 実装内容

### 2-1. 型の追加（`src/lib/diagnosis/types.ts`）

既存型は壊さず追加する。

```ts
// 特徴の観測元。写真で機械的に取れるか、本人の申告か、スタイリストの目視か。
export type FeatureSource = 'photo' | 'selfReport' | 'stylist';

// 顔の2軸チェック（協会公式のセルフチェック項目に対応。多数決で集計する）
export type FaceChildAdultAnswer = 'child' | 'adult' | 'unknown';
export type FaceCurveStraightAnswer = 'curve' | 'straight' | 'unknown';

export type FaceAxisAnswers = {
  // 縦軸7項目: faceShape, chinLength, eyeDistance, noseHeight, dimension, eyeSize, nostrilWidth
  childAdult: Partial<Record<FaceChildAdultCue, FaceChildAdultAnswer>>;
  // 横軸8項目: overallBone, cheekVolume, eyeShape, eyelid, eyeCorner, eyebrow, noseTip, lipThickness
  curveStraight: Partial<Record<FaceCurveStraightCue, FaceCurveStraightAnswer>>;
};

export type FaceChildAdultCue =
  | 'faceShape' | 'chinLength' | 'eyeDistance' | 'noseHeight'
  | 'dimension' | 'eyeSize' | 'nostrilWidth';

export type FaceCurveStraightCue =
  | 'overallBone' | 'cheekVolume' | 'eyeShape' | 'eyelid'
  | 'eyeCorner' | 'eyebrow' | 'noseTip' | 'lipThickness';

// 骨格の観測項目。touch=触診由来（写真では取れない→自己申告で補う）
export type BoneCueObservability = 'photo' | 'touch';

// 軸ごとの出力状態
export type AxisStatus = 'estimated' | 'insufficient';
```

`AxisResult` に以下を追加（既存フィールドは維持）：
```ts
status: AxisStatus;          // insufficient なら候補%を出さない
isMixed?: boolean;           // 上位2候補が僅差＝ミックス傾向
isNeutral?: boolean;         // color軸のみ。ベースがまたがる＝ニュートラル傾向
featureSources?: FeatureSource[];
```

### 2-2. 顔タイプ＝**多数決エンジン**（`src/lib/diagnosis/faceMajority.ts` 新規）

- 縦軸7項目・横軸8項目それぞれについて、`child`/`adult`（`curve`/`straight`）の**回答数を数え、多い方を採用**する。重み付けはしない（公式が多数決方式のため）。
- `unknown` は集計から除外し、**有効回答数を分母にする**。
- **有効回答が各軸で3件未満の場合、その軸は判定不能** → `status: 'insufficient'`。
- 2軸が決まったら4象限で `FaceType` を決定：
  - child × curve → `pop` / child × straight → `clear`
  - adult × curve → `bloom` / adult × straight → `mode`
- **候補%の出し方**：各軸の「多数派の票数 ÷ 有効回答数」を軸の確からしさとし、4タイプそれぞれのスコアを2軸の一致度から算出する（例：両軸一致=高、1軸一致=中、不一致=低）。断定させない。
- **僅差の扱い**：どちらかの軸が同数（例：4対4、3対3）の場合、**その軸は決めきらず `isMixed: true`** とし、隣接2タイプを両方提示する。

> 実装メモ：`nostrilWidth`（小鼻の横幅が目1つ分より大きいか）は、v2で確認できた**唯一の公式な数値基準**。将来の自動観測で最初に実装すべき項目としてコメントを残すこと。

### 2-3. 骨格＝**幾何比率 ＋ 自己申告のハイブリッド**（`src/data/boneTypes.ts` 拡張＋エンジン改修）

- `boneTypes.ts` の各タイプの `cues` を、**観測可能性つきの構造**に拡張する：
  ```ts
  cues: Array<{ text: string; observability: BoneCueObservability }>
  ```
  （既存の `cues: string[]` を参照している箇所はすべて追随修正すること）
- **`photo` に分類する項目**（v2の★★★のうち視覚可能なもの）：首の長さ・太さ／膝のお皿の大きさと形／全体の重心（※**Line と Curve の判別にのみ使う**）／全身シルエット
- **`touch` に分類する項目**（写真では取れない＝自己申告で補う）：肌質・弾力／骨の硬さ／手首の断面形状／指の関節の目立ち／鎖骨の出方
- ⚠️ **`frame`（ナチュラル）の判定に「重心」を使ってはならない。** ソースが「偏りなし」説と「上重心寄り」説で割れており、根拠がない（v2 §2-3）。
- ⚠️ 「腰の張り出し」は判定に使わない（同上）。
- 現時点では写真の自動計測は未接続のため、**骨格の判定は自己申告（補助質問）を主因子とし、confidence の上限を 70 に制限する**（触診項目を写真で代替できていないため）。

### 2-4. カラー＝**単独で結論を出さない**

- `color` 軸の confidence に**上限 55 のキャップ**をかける（写真判定が実測でブレるため）。
- 上位2候補の**ベースがまたがる場合**（sunrise/amber＝イエベ と mist/midnight＝ブルベ が上位に混在）は `isNeutral: true` を立て、「どちらのベースにも寄りきらない傾向」として両方の活かし方を提示する。
- **削除**：補助質問や説明文から「手首の血管の色」「日焼けの反応」「ゴールド/シルバー映え」を判定材料として使っている箇所があれば**すべて取り除く**（プロが信頼性を明確に否定している。v2 §4-3）。
- `cautionNotes` に必ず入れる：「照明・撮影条件・画像の加工により、色の見え方は変わります。」

### 2-5. 「観測が足りない軸はスコアを出さない」

`AxisResult.status === 'insufficient'` のとき：
- **候補%を一切表示しない**（`candidates` は空配列にするか、UI側で非表示にする）。
- 代わりに「何が揃うと傾向をチェックできるか」を具体的に案内する（例：「自然光で撮った正面のお顔の写真が揃うと、顔立ちの傾向をチェックできます」）。
- 判定条件：必須写真が不足、または該当軸の有効回答が閾値未満。

### 2-6. 結果画面（`src/app/(diagnosis)/result/page.tsx`）

各軸について以下を表示する。

1. **独自名＋非断定コピー**（Line/Curve/Frame、Pop/Clear/Bloom/Mode、Sunrise/Mist/Amber/Midnight）
2. **候補%（Confidence）** — ただし `insufficient` の軸では出さない
3. **根拠** — 「写真から見た点」「ご回答から見た点」を `FeatureSource` で**明示的に分けて**表示する（利用者が何を根拠にされたか分かるように）
4. **ミックス／ニュートラル傾向** — 該当時は「どちらかに決めきらず、両方の活かし方をご紹介します」
5. **似合う提案** — `タイプ体系案.md` §9 に沿って前向きに（「〜が力を貸してくれます」「挑戦の入口に」）。似合わないものを挙げない。
6. **写真が不足している場合** — 断定せず、追加写真の案内を出す。

---

## 3. 完了条件（DoD）

- [ ] `npx tsc --noEmit` がエラーなしで通る
- [ ] `npm run lint` が通る
- [ ] `npm run build` が通る
- [ ] `grep -rnE "性格診断|似合いません|太って見え|老けて見え|顔タイプ診断" src/` が**ヒット0**
- [ ] 親リポジトリの `src/` に変更がない
- [ ] `docs/IMPLEMENTATION_LOG.md` に Phase4 のログを追記した
- [ ] `git commit` していない
