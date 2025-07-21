import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from 'recharts';
import './App.css';

// 型定義
interface WalletData {
  address: string;
  balance: string;
  balanceInEth: string;
  transactions: Transaction[];
  totalValueUSD: number;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  valueInEth: string;
  timeStamp: string;
  gasUsed?: string;
  gasPrice?: string;
}

interface TokenBalance {
  name: string;
  symbol: string;
  balance: string;
  value: number;
  change24h: number;
  color: string;
}

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'transactions' | 'analytics'>('overview');

  const API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY;
  
  // モックデータ - 実際のプロジェクトでは別のAPIから取得
  const mockTokens: TokenBalance[] = [
    { name: 'Ethereum', symbol: 'ETH', balance: '4.7792', value: 74305.37, change24h: 2.5, color: '#627EEA' },
    { name: 'USD Coin', symbol: 'USDC', balance: '54,950', value: 54950.28, change24h: 0.1, color: '#2775CA' },
    { name: 'Tether USD', symbol: 'USDT', balance: '19,317', value: 19317.10, change24h: -0.2, color: '#26A17B' },
    { name: 'Arbitrum', symbol: 'ARB', balance: '14,750', value: 14750.75, change24h: 5.2, color: '#28A0F0' },
    { name: 'Fantom', symbol: 'FTM', balance: '13,452', value: 13452.70, change24h: -3.1, color: '#13B5EC' },
    { name: 'Chainlink', symbol: 'LINK', balance: '6,478', value: 6478.32, change24h: 1.8, color: '#375BD2' },
  ];

  // Wei を ETH に変換
  const weiToEth = (wei: string): string => {
    return (parseInt(wei) / Math.pow(10, 18)).toFixed(6);
  };

  // 数値フォーマット
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(2);
  };

  // 時刻フォーマット（必要に応じて使用）
  // const formatTime = (timestamp: string): string => {
  //   return new Date(parseInt(timestamp) * 1000).toLocaleString('ja-JP');
  // };

  // 相対時間フォーマット
  const formatRelativeTime = (timestamp: string): string => {
    const now = new Date().getTime();
    const txTime = parseInt(timestamp) * 1000;
    const diff = now - txTime;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}日前`;
    if (hours > 0) return `${hours}時間前`;
    return `${minutes}分前`;
  };

  // ウォレット分析実行
  const analyzeWallet = async () => {
    if (!walletAddress.trim()) {
      setError('ウォレットアドレスを入力してください');
      return;
    }

    if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      setError('有効なEthereumアドレスを入力してください（0x...）');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 残高取得
      const balanceResponse = await fetch(
        `https://api.etherscan.io/api?module=account&action=balance&address=${walletAddress}&tag=latest&apikey=${API_KEY}`
      );
      const balanceData = await balanceResponse.json();

      // 取引履歴取得
      const txResponse = await fetch(
        `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=latest&page=1&offset=50&sort=desc&apikey=${API_KEY}`
      );
      const txData = await txResponse.json();

      if (balanceData.status === '0') {
        throw new Error('残高の取得に失敗しました');
      }

      if (txData.status === '0') {
        throw new Error('取引履歴の取得に失敗しました');
      }

      // データ整形
      const transactions: Transaction[] = txData.result.map((tx: any) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        valueInEth: weiToEth(tx.value),
        timeStamp: tx.timeStamp,
        gasUsed: tx.gasUsed,
        gasPrice: tx.gasPrice,
      }));

      const ethBalance = weiToEth(balanceData.result);
      const totalValueUSD = parseFloat(ethBalance) * 3500; // ETH価格をモック

      setWalletData({
        address: walletAddress,
        balance: balanceData.result,
        balanceInEth: ethBalance,
        transactions,
        totalValueUSD,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // サンプルアドレス
  const setSampleAddress = () => {
    setWalletAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
  };

  // チャートデータ
  const getPortfolioChartData = () => {
    return mockTokens.slice(0, 6).map(token => ({
      name: token.symbol,
      value: token.value,
      fill: token.color,
    }));
  };

  const getPriceHistoryData = () => {
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
      value: 180000 + Math.random() * 40000 - 20000,
    }));
  };

  const totalPortfolioValue = mockTokens.reduce((sum, token) => sum + token.value, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* トップバー */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                💰 WalletAnalyze
              </h1>
              <nav className="hidden md:flex space-x-8">
                <button className="text-gray-600 hover:text-gray-900 font-medium">Portfolio</button>
                <button className="text-gray-600 hover:text-gray-900 font-medium">Swap</button>
                <button className="text-gray-600 hover:text-gray-900 font-medium">Analytics</button>
              </nav>
            </div>
            <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* 検索バー */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="ウォレットアドレスまたはENSを入力..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={analyzeWallet}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center min-w-[120px]"
            >
              {loading ? '🔄 分析中...' : '🔍 分析'}
            </button>
            <button
              onClick={setSampleAddress}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium"
            >
              サンプル
            </button>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8">
            ⚠️ {error}
          </div>
        )}

        {/* メインコンテンツ */}
        {walletData && (
          <div className="space-y-8">
            {/* ユーザーヘッダー */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {walletData.address.substring(2, 4).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {walletData.address.substring(0, 8)}...{walletData.address.substring(-6)}
                    </h2>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Verified
                    </span>
                  </div>
                  <p className="text-gray-500 font-mono text-sm">{walletData.address}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    ${formatNumber(totalPortfolioValue)}
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-green-500">+2.45%</span>
                    <span className="text-gray-500">24h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* タブナビゲーション */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <div className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview', icon: '📊' },
                    { id: 'portfolio', label: 'Portfolio', icon: '💰' },
                    { id: 'transactions', label: 'Transactions', icon: '📝' },
                    { id: 'analytics', label: 'Analytics', icon: '📈' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* Overview タブ */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* 統計カード */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-600">Total Value</p>
                            <p className="text-2xl font-bold text-blue-900">
                              ${formatNumber(totalPortfolioValue)}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xl">💰</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-600">24h Change</p>
                            <p className="text-2xl font-bold text-green-900">+2.45%</p>
                          </div>
                          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xl">📈</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-purple-600">Transactions</p>
                            <p className="text-2xl font-bold text-purple-900">
                              {walletData.transactions.length}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xl">📊</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-orange-600">NFTs</p>
                            <p className="text-2xl font-bold text-orange-900">12</p>
                          </div>
                          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xl">🎨</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ポートフォリオ概要チャート */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={getPortfolioChartData()}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={120}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {getPortfolioChartData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => [`$${formatNumber(value)}`, '']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Value</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={getPriceHistoryData()}>
                            <defs>
                              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="date" fontSize={12} />
                            <YAxis fontSize={12} />
                            <Tooltip 
                              formatter={(value: any) => [`$${formatNumber(value)}`, 'Value']}
                              contentStyle={{ 
                                backgroundColor: 'white', 
                                border: 'none', 
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#3b82f6" 
                              fillOpacity={1} 
                              fill="url(#colorValue)"
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* Portfolio タブ */}
                {activeTab === 'portfolio' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-gray-900">Token Holdings</h3>
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                          All Chains
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                          Hide Small
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {mockTokens.map((token, index) => (
                        <div key={token.symbol} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">#{index + 1}</span>
                              <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                                style={{ backgroundColor: token.color }}
                              >
                                {token.symbol.substring(0, 2)}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-900">{token.name}</span>
                                <span className="text-gray-500">{token.symbol}</span>
                              </div>
                              <div className="text-sm text-gray-500">{token.balance} {token.symbol}</div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              ${formatNumber(token.value)}
                            </div>
                            <div className={`text-sm font-medium ${
                              token.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transactions タブ */}
                {activeTab === 'transactions' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-gray-900">Recent Transactions</h3>
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                          All
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                          Send
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                          Receive
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {walletData.transactions.slice(0, 20).map((tx) => (
                        <div key={tx.hash} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                              tx.from.toLowerCase() === walletData.address.toLowerCase() 
                                ? 'bg-red-500' 
                                : 'bg-green-500'
                            }`}>
                              {tx.from.toLowerCase() === walletData.address.toLowerCase() ? '↗️' : '↙️'}
                            </div>
                            
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-900">
                                  {tx.from.toLowerCase() === walletData.address.toLowerCase() ? 'Send' : 'Receive'}
                                </span>
                                <span className="text-sm text-gray-500">ETH</span>
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatRelativeTime(tx.timeStamp)} • Hash: {tx.hash.substring(0, 10)}...
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className={`font-semibold ${
                              tx.from.toLowerCase() === walletData.address.toLowerCase() 
                                ? 'text-red-600' 
                                : 'text-green-600'
                            }`}>
                              {tx.from.toLowerCase() === walletData.address.toLowerCase() ? '-' : '+'}
                              {tx.valueInEth} ETH
                            </div>
                            <div className="text-sm text-gray-500">
                              ${(parseFloat(tx.valueInEth) * 3500).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analytics タブ */}
                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900">Portfolio Analytics</h3>
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Transaction Volume</h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={walletData.transactions.slice(0, 10).reverse().map((tx, index) => ({
                            name: `Tx ${index + 1}`,
                            value: parseFloat(tx.valueInEth),
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="name" fontSize={12} />
                            <YAxis fontSize={12} />
                            <Tooltip formatter={(value: any) => [`${value} ETH`, 'Volume']} />
                            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={walletData.transactions.slice(0, 20).reverse().map((tx) => ({
                            name: new Date(parseInt(tx.timeStamp) * 1000).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
                            value: parseFloat(tx.valueInEth),
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="name" fontSize={12} />
                            <YAxis fontSize={12} />
                            <Tooltip formatter={(value: any) => [`${value} ETH`, 'Value']} />
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#8b5cf6" 
                              strokeWidth={3}
                              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;