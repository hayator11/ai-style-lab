# 組織図・指揮系統（ai-style-lab）

```
        hayato（人間・最終判断）
           └─ AI部長（hayato代理・一次判断） ← ai-bucho/
                └─ 🕊️ つばさ（AI秘書・窓口/整理/報告）
                     └─ 📊 codex（実行部隊・Cursor内）
                          ├─ ❓ 質問設計担当
                          ├─ 🧮 ロジック担当
                          ├─ 💬 結果コピー担当
                          └─ 🖥️ UI/表示担当
```

- **最終判断は必ず hayato**
- AI部長は `hayato-directives.md` を記憶して一次判断
- つばさは概念不変（窓口・整理・振り分け・報告）
- 実行は Cursor 内の codex
