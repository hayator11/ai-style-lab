# AIスタイルLab Codex指示書（そのまま貼って運用 / 2026-07-08）

> 使い方：**上から1つずつ**。①「場所」でその作業をどこで行うか ②「貼る文」をコピペ ③「成功の合図」を確認 → 次へ。
> 原則：前のcommitが終わってから次へ。各指示は `docs/` を正として動き、完了を `docs/IMPLEMENTATION_LOG.md` に残す（＝秘書が後で読んで同期）。
> レボリスト診断は「11特性の双方向診断＝人と人の組み合わせOS」。ai-style-labは別の**スタイル診断**。混同しない。

---

## STEP 0：設計をリポジトリに着地させる（1回だけ・ターミナル）
**場所**：ターミナルで Lab フォルダへ。
```
cd /Users/hayatoshinjo/dev/revolist-diagnosis/ai-style-lab
mkdir -p docs
cp /Users/hayatoshinjo/ai-secretary/data/AIスタイルLab_*.md docs/
# AGENTS.md を設置（原稿の先頭2行の注記は手で削る）／CLAUDE.md に @AGENTS.md
cp /Users/hayatoshinjo/ai-secretary/data/ai-style-lab_AGENTS原稿.md docs/_AGENTS原稿.md
printf '@AGENTS.md\n' > CLAUDE.md
```
→ その後、`docs/_AGENTS原稿.md` の**本文だけ**を `AGENTS.md` として保存（先頭2行の注記は削除）。最後に：
```
git add -A && git commit -m "docs: AIスタイルLab 設計一式とAGENTS.mdを共有（Codex/Claude共通の正）"
```
**成功の合図**：`ls docs/` に設計7本＋`IMPLEMENTATION_LOG`（無ければ次で作る）、`AGENTS.md` と `CLAUDE.md` が存在、`git log` に上のコミット。

---

## STEP 0.5：自己チェックを仕込む（Codexに貼る・1回）
**貼る文**：
```
docs/AIスタイルLab_リポジトリ自己チェック.md に沿って、コミット時の自動チェックを入れて。
1) scripts/check.sh を作成（禁止呼称「性格診断」をsrcでgrep＋npx tsc --noEmit＋lint）。
2) package.json に "check": "bash scripts/check.sh" を追加。
3) .git/hooks/pre-commit で npm run check を実行するようにし chmod +x。
4) AGENTS.md に「コミット前に必ず npm run check を通す。禁止呼称は docs/確定定義集 に従う」を追記。
動作確認（src に一時的に「性格診断」を入れてcheckが落ちる→戻すと通る）をして、IMPLEMENTATION_LOG に記録＆コミット。
```
**成功の合図**：`npm run check` が動く。禁止呼称や型エラーがあるとコミットが止まる。

---

## STEP 1：型とタイプデータ（Codexに貼る）
**場所**：Labフォルダで Codex を開く。
**貼る文**：
```
このリポジトリの AGENTS.md と docs/ を読んで。docs/ の設計が正。
Phase1をやって：
1) src/lib/diagnosis/types.ts に BoneType='line'|'curve'|'frame'、
   FaceType='pop'|'clear'|'bloom'|'mode'（childAdult/curveStraightのメタ付き）、
   ColorSeason='sunrise'|'mist'|'amber'|'midnight' を追加。
2) src/data/ に boneTypes.ts / faceTypes.ts / colorSeasons.ts を新規作成。
   各要素は {key, displayName, standardEquivalent, axis?, cues:string[], copy:string}。
   中身は docs/AIスタイルLab_タイプ体系案.md §6 と docs/AIスタイルLab_ベースデータ_判定基準.md をそのまま元データに。
ガード：表現は非断定、独自名を表示・標準名は内部のみ、key/対応表はタイプ体系案§7/§8に厳密一致。
このNext.jsは通常と異なる場合があるので node_modules/next/dist/docs/ の該当ガイドを読んでから書く。
完了したら docs/IMPLEMENTATION_LOG.md に「Phase1: やったこと/決めたこと/次」を1件追記してコミットして。
```
**成功の合図**：3つの型と3データファイルが追加され、`IMPLEMENTATION_LOG.md` にPhase1の記録＋コミットがある。

---

## STEP 2：保存の器（ラベル収集）
**貼る文**：
```
docs/AIスタイルLab_datamodel拡張_ラベル収集.md に沿ってPhase2を。
1) types.ts に Label / LabelSource / AgreementLog を定義。Images型に
   shootingConditions / hasGroundTruth / trainingConsent / primaryLabelIds を追加。
2) DBなしのローカル/仮ストア（メモリ＋localStorage等）で Label をCRUDできる薄い層を用意。
3) docs/data-model.md の Images 節を追記し、Label / AgreementLog を追加。
ガードは前回同様。完了したら IMPLEMENTATION_LOG.md に追記してコミット。
```
**成功の合図**：Labelを1件保存・取得できる。data-model.md更新。ログ＋コミット。

---

## STEP 3：スタイリスト・ラベリング画面（★データが貯まり始める）
**貼る文**：
```
docs/AIスタイルLab_スタイリストラベリング画面_仕様.md に沿ってPhase3を。
src/app/admin に、左＝未ラベル画像キュー、右＝骨格/顔/カラーのタブ式クイック入力
（項目は docs/AIスタイルLab_ベースデータ_判定基準.md）。入力→タイプ自動サジェスト→
確定→確信度→保存で、軸ごとに Label(source:'stylist', isGroundTruth:true, observedFeatures) を生成し
Images.hasGroundTruth=true。次の画像へ。MVPはDBなし・ローカルストアでよい。
「1枚に3軸ラベルを付けて保存→次へ」が回ることを最優先。
完了したら IMPLEMENTATION_LOG.md に追記してコミット。
```
**成功の合図**：admin画面で1枚に3軸ラベルを付けて保存でき、Labelが増える。

---

## STEP 4：利用者側の結果表示
**貼る文**：
```
Phase4を。estimateDiagnosis をまずルールベース（docs/ベースデータの特徴量→タイプ重み付け）に置換 or 併存。
結果画面 (diagnosis)/result を、独自名＋非断定コピー＋候補%＋根拠＋「似合う提案（タイプ体系案§9）」で表示。
禁止語（あなたは〇〇です／似合いません 等）は使わない。写真が揃うまでは傾向を出さず追加写真を案内。
完了したら IMPLEMENTATION_LOG.md に追記してコミット。
```
**成功の合図**：写真が揃うと非断定の傾向チェック＋提案が表示される。

---

## チェックしながら進む運用ループ（毎回）
> 「Codexが書く → 機械チェック → 秘書がゴール整合レビュー → 次へ」。チェックはCodexの作業に効く。
1. hayato：STEPを1つCodexに貼る（各STEPは**コミット前に `npm run check`**＝STEP0.5で仕込んだ自動チェックが走り、禁止呼称・型エラーで止まる）。
2. Codex：実装 → `npm run check` 通過 → `docs/IMPLEMENTATION_LOG.md` に記録 → コミット。
3. hayato：`IMPLEMENTATION_LOG.md`（または「Labの実装ログ見て」）を秘書に渡す。
4. **秘書レビュー**：リポジトリを read-only で読み、`検証.md` の C(ゴール整合)/A(事実性)/D(DoD) を照合 → PASS/要修正を報告。要修正なら修正指示（＝次のCodex指示）に変換。
5. 秘書：`作業ログ.md`／`ダッシュボード.md` に逆同期 → 次のSTEPへ。
6. 節目（Phase完了・大きな設計変更）は hayato が最終確認。Phase5（Vision/自前解析・照合・本番DB）は必要時に指示化。

## チェックが効く範囲（正直に）
- **決定的（禁止呼称・型）**：リポジトリの pre-commit で **Codexのコミットに自動で効く**（`リポジトリ自己チェック.md`）。
- **意味的（ゴール整合・事実性）**：秘書がCodex出力を read-only レビュー（上の手順4）。
- ai-secretary側の Claude Code Hook は"秘書自身の出力"用。**Codexの作業を守るのはリポジトリ側チェック＋秘書レビュー**。
