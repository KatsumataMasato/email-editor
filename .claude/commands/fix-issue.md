---
name: fix-issue
description: Analyze & fix a GitHub issue by number, with testing and commit.
---

Please analyze and fix GitHub issue: $ARGUMENTS

Steps:

1. `gh issue view $ARGUMENTS` で詳細チェック
2. 問題把握して、修正対象ファイル調査
3. コード修正してユニットテスト追加 or 修正
4. `npm test` 実行して全部クリアになったか確認
5. `git add`, `git commit -m` で説明コメントつけてコミット
6. PR を作成 or push して完了！

Remember: TypeScript スタイルと Lint ルールきっちり守ってね ✨
