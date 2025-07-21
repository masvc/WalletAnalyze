# WalletAnalyze - 30 分 Live Coding TODO

## 🎯 30 分で作る MVP

### ✅ 事前準備 (完了)

- [x] プロジェクト構成決定
- [x] Etherscan API キー取得
- [x] README/TODO 作成

### ⏱️ Live Coding タスク (30 分)

**🏗️ セットアップ (5 分)**

- [ ] `npx create-react-app wallet-analyze`
- [ ] 必要なライブラリインストール (`recharts`)
- [ ] API キー環境変数設定

**⚡ 基本機能実装 (20 分)**

- [ ] UI レイアウト作成 (ヘッダー + 入力欄 + 結果エリア)
- [ ] ウォレットアドレス入力フォーム
- [ ] Etherscan API 接続 (残高取得)
- [ ] ETH 残高表示
- [ ] 取引履歴取得・一覧表示

**🎨 仕上げ (5 分)**

- [ ] ローディング状態表示
- [ ] 基本的なエラーハンドリング
- [ ] 見た目調整 (Tailwind CSS)

## 📝 実装メモ

- **API エンドポイント**: 残高 `&action=balance`, 取引履歴 `&action=txlist&startblock=0&endblock=latest&page=1&offset=10`
- **サンプルアドレス**: `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045` (Vitalik)
- **最小限のスタイル**: 動作優先、見た目は後回し
