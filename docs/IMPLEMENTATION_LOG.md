# IMPLEMENTATION LOG

## Phase1: 診断タイプ体系の型・元データ追加

- やったこと: `src/lib/diagnosis/types.ts` に `BoneType` / `FaceType` / `ColorSeason` と、画像単位の `Label` 型を追記。`src/data/boneTypes.ts` / `src/data/faceTypes.ts` / `src/data/colorSeasons.ts` を新規作成し、docs のタイプ体系案 §6/§7 とベースデータ判定基準の表を元データ化。
- 決めたこと: 表示名は Line / Pop / Sunrise などの独自名に統一し、標準名は `standardEquivalent` に保持。顔タイプの2軸メタは `axis.childAdult` と `axis.curveStraight` に保持。表示用 `copy` は「傾向が見られます」「寄りに見えます」の非断定表現に限定。
- 次: Phase2 で候補スコアと `DiagnosisResult.confidences` への接続、写真条件によるカラー Confidence 低め運用、スタイリストラベル保存先との接続を行う。

## Phase2: 保存の器＝ラベル収集

- やったこと: `src/lib/diagnosis/types.ts` に `AgreementLog` / `ImageMeta` / `TrainingConsent` を追加し、`Label` に `labelId`、任意のひもづけ情報、`createdAt` / `updatedAt` を追加。`src/services/storage/labelStore.ts` を新規作成し、Labelの作成・取得・一覧・削除をメモリとブラウザlocalStorageで扱えるようにした。`docs/data-model.md` に Images拡張、Label、AgreementLog を追記。
- 決めたこと: MVPの保存層は `LabelStore` インターフェース越しに扱い、DBやSupabase Storageには接続しない。`create` 時に `labelId` と日時が未指定の場合はストア側で補完する。`trainingConsent` は画像保存同意とは別の状態として持つ。
- 次: スタイリスト・ラベリング画面から `source='stylist'` / `isGroundTruth=true` のLabelを生成し、画像単位で `hasGroundTruth` と `primaryLabelIds` を更新できる入口を作る。

## Phase3: スタイリスト・ラベリング画面

- やったこと: `src/app/admin` をスタイリスト向けラベリングMVPに差し替え、左に仮画像キューと撮影条件、右に骨格・顔・カラーのタブ式クイック入力を実装。観測特徴を選ぶと既存の `boneTypes` / `faceTypes` / `colorSeasons` の `cues` と特徴重みから候補をスコア順に表示し、プロがタイプ・確信度・メモを確定できるようにした。保存時は3軸それぞれで `labelStore.create` を呼び、`source='stylist'` / `isGroundTruth=true` / `observedFeatures` 付きのLabelを生成して次の画像へ進める。
- 決めたこと: MVPではDBと実画像ストレージへ接続せず、`labelStore` のメモリ/localStorage保存と仮キューで「1枚に3軸ラベルを付けて保存→次へ」の操作確認を優先。顔タイプは2軸スライダーを基本特徴として保存し、詳細特徴は任意の根拠として追加する。
- 次: 実画像キューと `ImageMeta.hasGroundTruth` / `primaryLabelIds` の更新口を接続する。カラーの写真条件による判定保留フロー、ラベラーID入力、ショートカット操作、軸別・ラベラー別集計を追加する。

## Phase4: 利用者向け結果表示

- やったこと: `estimateDiagnosis` を、写真チェックと補助質問を入力にしたルールベース推定へ更新。`boneTypes` / `faceTypes` / `colorSeasons` のベース特徴を候補の初期根拠に使い、補助質問の回答でタイプ候補へ重み付けする構造にした。`src/data/styleRecommendations.ts` を追加し、タイプ体系案 §9 の「活かしやすい方向」を利用者向け提案データ化。`src/app/(diagnosis)/result` では、独自名、候補%、推定度、根拠、前向きな提案、注意書きを表示するように更新。
- 決めたこと: 写真が不足している場合は候補を表示しない。表示は非断定にし、写真条件により変わる可能性を明記する。Supabase、OpenAI Vision、DB、認証には接続しない。提案は「試しやすい方向」として扱い、禁止語を使わない。
- 次: 候補差が近い場合の追加写真・追加質問提案、写真条件が弱い軸の表示抑制、利用者フィードバック導線を追加する。

## Phase4 v2: 利用者向け結果表示の判定基準更新

- やったこと: `docs/AIスタイルLab_ベースデータ_判定基準_v2.md` に合わせ、`AxisResult` に `status` / `isMixed` / `isNeutral` / `featureSources` / 根拠グループ / 不足案内を追加。顔立ち傾向は `src/lib/diagnosis/faceMajority.ts` を新設し、縦軸7項目・横軸8項目の多数決で集計する形に変更。`unknown` は分母から外し、各軸の有効回答が3件未満なら `insufficient` として候補%を出さない。
- やったこと: 骨格傾向は `boneTypes.cues` を `{ text, observability }` に構造化し、写真由来と触れて分かる項目を分離。触れて分かる項目はご回答由来として補い、推定度の上限を70に設定。Frameの判定に重心を使わず、腰まわりの横方向の見え方も判定材料にしない構成へ変更。
- やったこと: カラー傾向は推定度の上限を55に設定し、上位2候補のベースがまたがる場合に `isNeutral` を立てるようにした。金属の見え方を判定材料や説明データから外し、注意書きに「照明・撮影条件・画像の加工により、色の見え方は変わります。」を入れた。
- やったこと: `src/app/(diagnosis)/result/page.tsx` は軸ごとの `estimated` / `insufficient` を表示し、候補%は `estimated` のみ表示。根拠は「写真から見た点」「ご回答から見た点」に分け、提案は推定できた軸だけから前向きに出すように変更。
- 確認: `npx tsc --noEmit`、`npm run lint`、`npm run build` は通過。指定された `src/` 文言検索もヒットなし。
