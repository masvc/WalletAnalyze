# WalletAnalyze

🚀 **30 分ライブコーディング** で作る Ethereum ウォレット分析ツール

## 🎯 今回作るもの

ウォレットアドレスを入力 → ETH 残高と取引履歴を表示する超シンプルな Web アプリ

## ⚡ 実装する機能

- **ETH 残高表示** (Wei → ETH 変換)
- **最近の取引履歴** (送金・受金の一覧)
- **ローディング & エラー表示**

## 🛠️ 使用技術

- React (create-react-app)
- Etherscan API
- Tailwind CSS (スタイリング)

## 🚀 クイックスタート

```bash
# プロジェクト作成
npx create-react-app wallet-analyze
cd wallet-analyze

# 環境変数設定
echo "REACT_APP_ETHERSCAN_API_KEY=3ZPGJV98NW3GZHTD2G31R13U428IZTAJPY" > .env.local

# 起動
npm start
```

## 🧪 テスト用アドレス

- **Vitalik のウォレット**: `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`
- **ENS Treasury**: `0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7`

## 📡 API エンドポイント

```javascript
// 残高取得
`https://api.etherscan.io/api?module=account&action=balance&address=${address}&apikey=${apiKey}` // 取引履歴
`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&page=1&offset=10&apikey=${apiKey}`;
```
