# AIスタイルLab 実装 手渡しパッケージ（着手順つき / 2026-07-07）

> これを持って **`dev/revolist-diagnosis/ai-style-lab` 側で Claude Code を開いて実装**する。
> 秘書（ai-secretary）は設計まで。ここからはLab側のフォルダで手を動かす。

## 0. まず現状（Lab側の前提）
- 動く Next.js 雛形あり。ページ＝トップ/質問/写真アップロード/結果/admin（24行の土台）。
- 診断ロジックは**スタブ**（`estimateDiagnosis()` が固定サンプルを返すだけ）。
- 型は `src/lib/diagnosis/types.ts` に写真チェック系のみ。タイプ体系・ラベル・タイプデータは**未整備**。
- MVPは意図的にVision未接続・DBなし。今回もその範囲で「データが貯まる土台」を作る。

## 1. 設計ドキュメント一式（この4本が仕様の正）
ai-secretary/data/ にある。**まずLabの `docs/` にコピー**して参照する。
1. `AIスタイルLab_タイプ体系案.md` … 骨格3/顔4/カラー4、独自名(Line〜Midnight)、型・データ定義(§7)、標準対応(§8)、似合う提案(§9)
2. `AIスタイルLab_ベースデータ_判定基準.md` … 各タイプの「画像で見る特徴量」＝データ/UIの元
3. `AIスタイルLab_datamodel拡張_ラベル収集.md` … Images拡張・新Label・AgreementLog・同意
4. `AIスタイルLab_スタイリストラベリング画面_仕様.md` … 収集装置（admin画面）の最小仕様

## 2. 実装の着手順（依存順・上から）

### Phase 1：型とタイプデータ（基盤）
- `src/lib/diagnosis/types.ts` に追加：`BoneType='line'|'curve'|'frame'` ／ `FaceType='pop'|'clear'|'bloom'|'mode'`（+メタ childAdult/curveStraight）／ `ColorSeason='sunrise'|'mist'|'amber'|'midnight'`。
- `src/data/` に新設：`boneTypes.ts` `faceTypes.ts` `colorSeasons.ts`。各要素＝`{ key, displayName, standardEquivalent, axis?, cues:string[], copy:string }`（元データ＝タイプ体系案§6＋ベースデータ）。
- **Done**：3診断のタイプ一覧＋特徴＋非断定コピーがコードから取得できる。

### Phase 2：保存の器（ラベル収集の受け皿）
- `types.ts` に `Label` `LabelSource` `AgreementLog` を定義（datamodel拡張doc §2/§3）。
- `Images` 型に `shootingConditions / hasGroundTruth / trainingConsent / primaryLabelIds` を追加。
- **DBなしのローカル/仮ストア**（例：メモリ＋localStorage）で `Label` をCRUDできる薄いインターフェースを用意（後でSupabaseに差し替え可能に）。
- `docs/data-model.md` の Images 節に追記＋ Label/AgreementLog を追加。
- **Done**：`Label` を1件保存・取得できる。

### Phase 3：収集装置＝スタイリスト・ラベリング画面 ★最重要マイルストーン
- `src/app/admin` を拡張。左＝未ラベル画像キュー、右＝骨格/顔/カラーのタブ式クイック入力（項目はベースデータ）。
- 入力→タイプ自動サジェスト→プロが確定→確信度→**保存で軸ごとに `Label(source:'stylist', isGroundTruth:true, observedFeatures)` 生成**、`Images.hasGroundTruth=true`。次の画像へ。
- **Done**：「1枚に3軸ラベルを付けて保存→次へ」が回り、Labelが貯まっていく（＝データ収集が動く）。

### Phase 4：利用者側の結果表示に反映
- `estimateDiagnosis` を、まず**ルールベース**（特徴→タイプの重み付け、ベースデータ由来）に置換 or 併存。
- 結果画面 `(diagnosis)/result` を、独自名＋非断定コピー＋候補%＋根拠＋「似合う提案(§9)」で表示。
- **Done**：写真が揃うと傾向チェック結果と提案が非断定で出る。

### Phase 5：将来（今回スコープ外・設計だけ済）
- OpenAI Vision もしくは自前解析の接続 → `Label(source:'ai')` 生成 → `AgreementLog` で プロ vs AI 自動照合（精度検証＝R-105）。
- 本番認証・Supabase/Storage・学習利用同意フローの本実装。

## 3. 全体を通すガード（必ず守る）
- 表現は**非断定**（「傾向が見られます／寄りに見えます」）。禁止語＝「あなたは〇〇です／似合いません／太って見える／老けて見える」。
- 顔・全身画像は要配慮：署名URL・公開しない・削除連動・学習利用は別同意。
- 顔タイプの**独自名を表示**、標準名は内部のみ（IP配慮）。
- タイプkey・対応表は必ず `タイプ体系案 §7/§8` に合わせる（表記ブレ禁止）。

## 4. コピペ用・Lab側 Claude Code への最初の指示
```
このリポジトリ（ai-style-lab）に、docs/ にある4つの設計書
（タイプ体系案／ベースデータ判定基準／datamodel拡張ラベル収集／スタイリストラベリング画面仕様）
に沿って実装を進めて。着手順は「実装手渡しパッケージ」のPhase1→2→3→4。
まずPhase1（types.tsにBoneType/FaceType/ColorSeasonとLabel型を追加、src/dataに
boneTypes/faceTypes/colorSeasonsを作成）から。MVPはDBなし・ローカルストアでよい。
表現は非断定、独自名を表示、標準名は内部のみ。node_modules/next/dist/docs/ の該当ガイドを
読んでから書いて（このNext.jsは通常と異なる）。
```
※ 手順4の前に、この ai-secretary/data の4ファイル＋本パッケージを Lab の `docs/` にコピーしておくこと。
```
cp "/Users/hayatoshinjo/ai-secretary/data/AIスタイルLab_"*.md \
   /Users/hayatoshinjo/dev/revolist-diagnosis/ai-style-lab/docs/
```
