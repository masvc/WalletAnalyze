# WalletAnalyze - 30 分 Live Coding TODO

## 🎯 30 分で作る MVP

### ✅ 事前準備 (完了)

- [x] プロジェクト構成決定
- [x] Etherscan API キー取得
- [x] README/TODO 作成

### ⏱️ Live Coding タスク (30 分)

**🏗️ セットアップ (5 分)**

- [x] `npx create-react-app wallet-analyze`
- [x] 必要なライブラリインストール (`recharts`)
- [x] API キー環境変数設定

**⚡ 基本機能実装 (20 分)**

- [x] UI レイアウト作成 (ヘッダー + 入力欄 + 結果エリア)
- [x] ウォレットアドレス入力フォーム
- [x] Etherscan API 接続 (残高取得)
- [x] ETH 残高表示
- [x] 取引履歴取得・一覧表示

**🎨 仕上げ (5 分)**

- [x] ローディング状態表示
- [x] 基本的なエラーハンドリング
- [x] 見た目調整 (モダンなデザイン)

## 📝 実装メモ

- **API エンドポイント**: 残高 `&action=balance`, 取引履歴 `&action=txlist&startblock=0&endblock=latest&page=1&offset=10`
- **サンプルアドレス**: `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045` (Vitalik)
- **最小限のスタイル**: 動作優先、見た目は後回し

## 🚀 完成！

✅ **30 分で完成した機能:**

- ウォレットアドレス入力フォーム
- ETH 残高表示 (Wei → ETH 変換)
- 最近の取引履歴表示 (最大 5 件)
- ローディング状態表示
- エラーハンドリング
- レスポンシブデザイン

**テスト用アドレス**: `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`
