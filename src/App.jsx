import React, { useState, useEffect } from 'react';

import usersData from './data.json';

const calculateLevel = (xp) => {
  if (xp >= 300) return 'Lv3';
  if (xp >= 100) return 'Lv2';
  return 'Lv1';
};

function App() {
  const [users, setUsers] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUsers(usersData);
    setLoading(false);
  }, []);

  const handleSearch = () => {
    const result = users.find(user => 
      user.displayName === searchName
    );
    setSearchResult(result);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-semibold text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">ELA 排行榜</h1>
      </div>

      <div className="max-w-2xl mx-auto mb-8 glassmorphism rounded-2xl p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">个人查询</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="输入玩家名字"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            查询
          </button>
        </div>

        {searchResult && (
          <div className="mt-6 glassmorphism-dark rounded-xl p-4 text-white">
            <h3 className="text-xl font-semibold mb-3">{searchResult.displayName}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-300">经验值 (XP)</p>
                <p className="text-2xl font-bold text-primary">{searchResult.xp}</p>
                <p className="text-sm text-gray-400">{searchResult.title || '无称号'}</p>
              </div>
              <div>
                <p className="text-gray-300">可用积分</p>
                <p className="text-2xl font-bold text-yellow-400">{searchResult.xp - (searchResult.points || 0)}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">经验值记录</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {searchResult.xpHistory && searchResult.xpHistory.length > 0 ? (
                  searchResult.xpHistory.map((record, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{record.date} - {record.reason}</span>
                      <span className="text-green-400">+{record.amount}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">暂无记录</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-2">积分兑换记录</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {searchResult.redeemHistory && searchResult.redeemHistory.length > 0 ? (
                  searchResult.redeemHistory.map((record, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{record.date} - {record.item}</span>
                      <span className="text-red-400">-{record.points}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">暂无兑换记录</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto glassmorphism rounded-2xl p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">排行榜</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">排名</th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">玩家名</th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">经验值</th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">称号</th>
              </tr>
            </thead>
            <tbody>
              {[...users].sort((a, b) => b.xp - a.xp).slice(0, 20).map((user, index) => (
                <tr key={user.id} className="border-b border-gray-200 hover:bg-white/50 transition-colors">
                  <td className="py-3 px-4 font-medium">
                    {index + 1 === 1 && <span className="text-yellow-500">🥇</span>}
                    {index + 1 === 2 && <span className="text-gray-400">🥈</span>}
                    {index + 1 === 3 && <span className="text-amber-700">🥉</span>}
                    {index + 1 > 3 && index + 1}
                  </td>
                  <td className="py-3 px-4 font-medium">{user.displayName}</td>
                  <td className="py-3 px-4">{user.xp}</td>
                  <td className="py-3 px-4">
                    <span className="text-gray-600">
                      {user.title || ''}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>© 2026 TLL XP 系统 | 部署在 Netlify</p>
      </div>
    </div>
  );
}

export default App;