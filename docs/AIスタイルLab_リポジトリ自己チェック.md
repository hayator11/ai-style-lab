# AIスタイルLab リポジトリ自己チェック（Codexの作業に効く層 / 2026-07-08）

> 狙い：**誰が書いても（Codex/Claude/人）コミット時に自動で走る**チェックを ai-style-lab リポジトリに入れる。
> これが「Codexの実作業をチェックしながらゴールへ」の決定的な層。秘書は仕様まで、設置はLab側で。
> 依存：`確定定義集`（禁止呼称の基準）。

## 1. チェックスクリプト `scripts/check.sh`
```bash
#!/usr/bin/env bash
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
fail=0

# (1) 禁止呼称チェック（src配下。docsは説明目的で許容）
#     正式：レボリスト診断＝「11の特性の双方向の診断」。src で「性格診断」を使わない。
for w in "性格診断"; do
  if git grep -nF "$w" -- 'src' 2>/dev/null; then
    echo "❌ 禁止呼称「$w」が src にあります（正式：11の特性の双方向の診断）"; fail=1
  fi
done

# (2) 型チェック（誤り検出）
npx tsc --noEmit || fail=1

# (3) lint（あれば・失敗は警告扱い）
npm run -s lint 2>/dev/null || true

if [ "$fail" = 0 ]; then echo "✅ check passed"; else echo "❌ check failed"; exit 1; fi
```
- `package.json` に `"scripts": { "check": "bash scripts/check.sh" }` を追加。
- 禁止語は将来ここの配列に足す（`確定定義集` と同期）。

## 2. コミット時に自動で走らせる（pre-commitフック）
どちらか：
- **簡易**：`.git/hooks/pre-commit` を作成して実行権限付与
  ```bash
  #!/usr/bin/env bash
  npm run -s check
  ```
  `chmod +x .git/hooks/pre-commit`
- **チーム共有**：husky等を使い `.husky/pre-commit` で `npm run check`（リポジトリにコミットされ全員に効く）。

→ これで **Codexがコミットしようとした瞬間にチェックが走り、落ちたらコミットが止まる**（＝Codexの作業に効く）。

## 3. Codexへの指示に組み込む（自己チェックの徹底）
- AGENTS.md に：「**コミット前に必ず `npm run check` を通す。落ちたら直す。** 禁止呼称は `docs/確定定義集` に従う（レボリスト診断は性格診断と書かない）。」
- 各タスクの最後に「`npm run check` が通ったことを IMPLEMENTATION_LOG に記録」。

## 4. 秘書によるレビュー層（ゴール整合・事実性）
機械チェックで拾えない「ゴールに向かっているか／事実性／DoD」は秘書が担当：
- Codexが `docs/IMPLEMENTATION_LOG.md` に完了を記録＋コミット。
- 秘書はリポジトリを **read-only** で読み、`.claude/skills/検証.md` のC(ゴール整合)/A(事実性)/D(DoD)を照合 → PASS/要修正を報告 → 次タスク or 修正指示。

## 5. まとめ（2層＋人間）
1. **決定的**：リポジトリ pre-commit（禁止呼称・型）＝Codexのコミットで自動。
2. **意味的**：秘書レビュー（ゴール整合・事実性・DoD）＝別の目。
3. **最終**：人間（hayato）。
