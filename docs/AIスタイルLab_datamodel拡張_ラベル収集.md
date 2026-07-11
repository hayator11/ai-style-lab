# AIスタイルLab data-model拡張：正解ラベル・収集構造の設計（手渡し仕様 / 2026-07-07）

> 目的：`Images` を「教師データ／検証データが貯まる器」にする。既存 `docs/data-model.md` への追記案。
> 立場：秘書は設計まで。実装は `dev/revolist-diagnosis/ai-style-lab` 側 Claude Code で。
> 設計思想：**1枚の画像に複数ラベルがぶら下がる**（プロ＝正解ラベル／本人・AI＝弱ラベル）。推定と正解を突き合わせて精度を検証（R-105）。

---

## 1. `Images` に足すフィールド
既存（画像種別・Storageパス・品質メタ・撮影条件メモ・解析結果要約・保存同意…）に加えて：
- **shootingConditions（撮影条件・構造化）**：`naturalLight / noFilter / noHeavyMakeup / whiteBackground / fullBodyVisible / standingNaturally` などのフラグ（既存 `PhotoCondition` 型を流用）＋品質スコア（明るさ/ピント/顔占有率）。
- **hasGroundTruth（正解ラベル有無）**：boolean。プロラベルが1つでも付けば true。
- **trainingConsent（学習利用への同意）**：`granted / denied / unknown`。※保存同意とは別に、AI学習に使ってよいかを明示管理。
- **primaryLabelIds**：この画像を代表する確定ラベルへの参照（軸ごと最大1）。

## 2. 新エンティティ **Label（ラベル）** ＝収集の核
1枚の画像に対する「ある軸の見立て」を1レコードで表す。プロ・本人・AIが別々に付けられる。

| フィールド | 内容 |
|---|---|
| labelId | ラベルID |
| imageId | 対象画像（必須） |
| userId / diagnosisId | ひもづけ（任意） |
| **axis** | `bone` \| `face` \| `color`（どの診断軸か） |
| **typeKey** | 独自名key（例：`line` `pop` `sunrise`）＝タイプ体系案と一致 |
| standardEquivalent | 標準名（内部・自動導出可） |
| **source** | `stylist`（プロ）\| `self`（本人）\| `ai`（推定）\| `feedback`（事後の本人納得） |
| labelerId | 付与者ID（プロの場合は誰か。教師データの品質管理に使う） |
| **confidence** | 0.0–1.0（付与者の確信度／AIは推定スコア） |
| **isGroundTruth** | boolean（source=stylist を基本 true。正解データの印） |
| observedFeatures | 判断根拠＝ベースデータの特徴量キー配列（例：`['clavicle_visible','low_center_of_gravity']`）→ 説明生成と学習の材料 |
| note | 自由記述（迷い・補足） |
| createdAt / updatedAt | 日時 |

- **1画像×3軸×複数source** が並ぶ（例：同じ写真に stylistのbone正解＋aiのbone推定＋selfのbone自己申告）。
- 独自名⇔標準の対応は §タイプ体系案 §8 の表で相互変換。

## 3. 検証ログ（R-105：精度と「相性の実証」を後から振り返る）
- **AgreementLog（照合ログ）**：同一 image×axis で `ai推定 vs stylist正解 vs self申告/feedback` を突き合わせ、一致/不一致・確信度差を記録。
- 集計で「軸ごとの正解率」「Confidenceが高い時の的中率」を出せる → 精度改善の根拠＆診断の妥当性の実証データに。
- スタイル診断の相性検証だけでなく、レボリスト診断R-105の「データで精度を上げる」思想と同じ器を使う。

## 4. 同意・プライバシー（顔/全身は要配慮）
- `保存同意`（既存）と `trainingConsent`（新）を分離。学習利用は別途オプトイン。
- 署名URL・アクセス制御で保存（公開URL不可）。削除リクエストで Image と紐づく Label も削除/匿名化。
- 未同意画像は表示・チェックのみで、学習・再利用しない。

## 5. 実装メモ（型・手渡し）
- `types.ts`：`Label` 型、`LabelSource`、`DiagnosisAxis`（既存）に加え軸別 typeKey（`BoneType`/`FaceType`/`ColorSeason`＝タイプ体系案 §7）。
- `Images` 型に §1 のフィールド追加。
- MVP：DB接続なしでも「ローカル/仮ストアにLabelを積める」インターフェースを用意（将来Supabaseへ差し替え）。
- 収集の入口は **スタイリスト・ラベリング画面**（次の設計対象）。そこが `source=stylist, isGroundTruth=true` のLabelを生む。

## 6. 手渡し文（Lab側 Claude Codeへ）
「`docs/data-model.md` の Images 節に上記フィールドを追記し、新エンティティ `Label` と `AgreementLog` を追加。型は `src/lib/diagnosis/types.ts` に `Label`/`LabelSource` を定義。MVPはDBなしのインメモリ/ローカル実装でよい。独自名key は `AIスタイルLab_タイプ体系案.md §7/§8` に従う。」
