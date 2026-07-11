# AI Company 🏢 — ai-style-lab（codex体制）

AIスタイル診断（ai-style-lab）を、**役割分担された AIチーム**で回すための会社フォルダ。
実行は **Cursor 内の codex**。codex はルートの `AGENTS.md` からこのフォルダを読む。

> 🧭 Obsidian で開くなら [入口ノート `index.md`](index.md) から。

## 指揮系統
```
hayato（最終判断）
  └─ AI部長（一次判断・はやとの指示を記憶）… ai-bucho/
       └─ 🕊️ つばさ（窓口・整理・振り分け・報告）
            └─ 📊 codex（実行・Cursor内）
```

## フォルダ
| 場所 | 中身 |
|------|------|
| `ai-bucho/` | **AI部長**。`hayato-directives.md` にはやとの指示を貯めて覚える |
| `skills/` | **決まった作業の手順書**。増やすほど精度が上がる |
| `company/ai-style-lab.md` | この会社（社長＋部署）の定義 |
| `docs/` | 共通ルール・ガバナンス・司令塔・組織図・作業ログ |
| `templates/` | codex用の作業指示書テンプレ |

## 使い方（はやと）
1. つばさに「◯◯やって」と言う
2. AI部長が一次判断 → codex が該当スキルで実行
3. つばさが結果を「件名・結果・変更点」で報告
4. 新しい方針は `ai-bucho/hayato-directives.md` に追記して育てる

## 大原則
- ネガティブ表現を使わない
- ai-style-lab の外を触らない
- 外部公開・お金・不可逆・最終決定は必ず hayato
