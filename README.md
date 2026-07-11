# AIスタイルLab

「似合う」を入口に、自分らしく挑戦できる自信を育てるAIスタイルコンシェルジュです。

## 初期方針

- 既存の `revolist-diagnosis` とは分離した新規プロジェクト
- Next.js / TypeScript / Tailwind CSS / Supabase 前提
- AI画像解析は未実装。将来拡張しやすい抽象層のみ用意
- 診断結果は断定せず「可能性が高い」と理由を表示

## 主なディレクトリ

- `src/app` - MVPページ
- `src/prompts` - AIプロンプト管理
- `src/services` - AI、保存、診断処理の外部サービス層
- `src/lib/diagnosis` - UIから独立した診断ロジック
- `src/data` - 質問や診断タイプの初期データ
- `docs` - 設計書
