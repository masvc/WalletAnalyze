import React, { useState, useMemo } from 'react';
import './App.css';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Etherscan API設定
const ETHERSCAN_API_KEY = '3ZPGJV98NW3GZHTD2G31R13U428IZTAJPY';
const ETHERSCAN_API_BASE = 'https://api.etherscan.io/api';

function App() {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // WeiをETHに変換
  const weiToEth = (wei) => {
    return (parseInt(wei) / Math.pow(10, 18)).toFixed(4);
  };

  // 残高取得
  const fetchBalance = async (walletAddress) => {
    try {
      const response = await fetch(
        `${ETHERSCAN_API_BASE}?module=account&action=balance&address=${walletAddress}&apikey=${ETHERSCAN_API_KEY}`
      );
      const data = await response.json();
      
      if (data.status === '1') {
        return data.result;
      } else {
        throw new Error(data.message || '残高の取得に失敗しました');
      }
    } catch (error) {
      throw error;
    }
  };

  // 取引履歴取得
  const fetchTransactions = async (walletAddress) => {
    try {
      const response = await fetch(
        `${ETHERSCAN_API_BASE}?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=latest&page=1&offset=10&apikey=${ETHERSCAN_API_KEY}`
      );
      const data = await response.json();
      
      if (data.status === '1') {
        return data.result;
      } else {
        throw new Error(data.message || '取引履歴の取得に失敗しました');
      }
    } catch (error) {
      throw error;
    }
  };

  // 取引データをチャート用に整形
  const chartData = useMemo(() => {
    if (!transactions.length) return [];
    
    // 最新の10件の取引を取得し、日付でソート
    const sortedTxs = [...transactions]
      .sort((a, b) => a.timeStamp - b.timeStamp)
      .slice(-10);
    
    return sortedTxs.map(tx => ({
      timestamp: new Date(tx.timeStamp * 1000).toLocaleDateString(),
      value: weiToEth(tx.value),
      type: tx.from.toLowerCase() === address.toLowerCase() ? '送金' : '受金',
      hash: tx.hash
    }));
  }, [transactions, address]);

  // 取引タイプの集計
  const transactionTypeData = useMemo(() => {
    if (!transactions.length) return [];
    
    const sentCount = transactions.filter(
      tx => tx.from.toLowerCase() === address.toLowerCase()
    ).length;
    const receivedCount = transactions.length - sentCount;
    
    return [
      { name: '送金', value: sentCount },
      { name: '受金', value: receivedCount }
    ];
  }, [transactions, address]);

  // チャートの色設定
  const COLORS = ['#0088FE', '#00C49F'];

  // ウォレット分析実行
  const analyzeWallet = async () => {
    if (!address.trim()) {
      setError('ウォレットアドレスを入力してください');
      return;
    }

    setLoading(true);
    setError('');
    setBalance(null);
    setTransactions([]);

    try {
      const [balanceData, txData] = await Promise.all([
        fetchBalance(address),
        fetchTransactions(address)
      ]);

      setBalance(balanceData);
      setTransactions(txData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔍 WalletAnalyze</h1>
        <p>Ethereum ウォレット分析ツール</p>
      </header>

      <main className="App-main">
        {/* 入力セクション */}
        <div className="input-section">
          <input
            type="text"
            placeholder="ウォレットアドレスを入力 (例: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="address-input"
          />
          <button 
            onClick={analyzeWallet}
            disabled={loading}
            className="analyze-button"
          >
            {loading ? '分析中...' : '分析開始'}
          </button>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {/* 結果表示 */}
        {balance !== null && (
          <div className="results-section">
            <div className="balance-card">
              <h3>💰 ETH 残高</h3>
              <div className="balance-amount">
                {weiToEth(balance)} ETH
              </div>
            </div>

            <div className="charts-container">
              <div className="chart-card">
                <h3>📈 取引金額の推移</h3>
                <div className="chart-wrapper">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} ETH`, '金額']} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          name="金額 (ETH)" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p>取引データがありません</p>
                  )}
                </div>
              </div>

              <div className="chart-card">
                <h3>🔄 取引タイプの割合</h3>
                <div className="chart-wrapper">
                  {transactionTypeData.some(d => d.value > 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={transactionTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => 
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {transactionTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}件`, '取引数']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p>取引データがありません</p>
                  )}
                </div>
              </div>
            </div>

            <div className="transactions-card">
              <h3>📋 最近の取引履歴</h3>
              {transactions.length > 0 ? (
                <div className="transactions-list">
                  {transactions.slice(0, 5).map((tx, index) => (
                    <div key={index} className="transaction-item">
                      <div className="tx-hash" title={tx.hash}>
                        {tx.hash.substring(0, 10)}...
                      </div>
                      <div className={`tx-amount ${tx.from.toLowerCase() === address.toLowerCase() ? 'sent' : 'received'}`}>
                        {tx.from.toLowerCase() === address.toLowerCase() ? '-' : '+'} {weiToEth(tx.value)} ETH
                      </div>
                      <div className="tx-type">
                        {tx.from.toLowerCase() === address.toLowerCase() ? '送金' : '受金'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>取引履歴がありません</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
