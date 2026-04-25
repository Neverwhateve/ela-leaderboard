import React, { useState, useEffect, useCallback } from 'react';
import { Time, Cursor, Modal, Footer, Divider, Button, Typewriter as AnimalTypewriter } from 'animal-island-ui';
import 'animal-island-ui/style';
import { announcementConfig } from './announcementConfig';

import usersData from './data.json';

const calculateLevel = (xp) => {
  if (xp >= 300) return 'Lv3';
  if (xp >= 100) return 'Lv2';
  return 'Lv1';
};

const getDateRange = (type) => {
  const now = new Date();
  let startDate;
  
  if (type === 'week') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (type === 'month') {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else {
    return { start: null, end: null };
  }
  
  return { start: startDate, end: now };
};

function App() {
  const [users, setUsers] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [leaderboardType, setLeaderboardType] = useState('total'); // total, month, week
  const [expandedUsers, setExpandedUsers] = useState({}); // 追踪展开的用户

  // 处理折叠面板展开/收起
  const toggleUserExpand = (userId) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  useEffect(() => {
    setUsers(usersData);
    setLoading(false);
  }, []);

  // 计算时间段经验值
  const calculatePeriodXP = (user, type) => {
    if (type === 'total') return user.xp;
    
    const { start } = getDateRange(type);
    if (!start) return 0;
    
    let periodXP = 0;
    if (user.xpHistory) {
      user.xpHistory.forEach(record => {
        const recordDate = new Date(record.date);
        if (recordDate >= start) {
          periodXP += record.amount;
        }
      });
    }
    return periodXP;
  };

  const handleSearch = () => {
    const result = users.find(user => 
      user.displayName === searchName
    );
    setSearchResult(result);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <div className="text-2xl font-semibold text-primary animate-bounce">加载中...</div>
      </div>
    );
  }

  return (
    <Cursor>
      <div className="min-h-screen p-4 md:p-8 bg-bg font-acnh text-text">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2 animate-float">ELA 积分榜</h1>
          <div className="flex justify-center mb-4">
            <Time />
          </div>
          <div className="mb-6">
            <AnimalTypewriter speed={100}>
              <div className="text-lg text-textSecondary font-medium">你好，欢迎来到丰富人生学院！</div>
              <div className="text-lg text-textSecondary font-medium">今天的天气真不错呢～</div>
            </AnimalTypewriter>
          </div>
        </div>

        {/* 按钮区域 */}
        <div className="max-w-4xl mx-auto mb-4 flex justify-center gap-4">
          <button
            onClick={() => setShowAnnouncement(true)}
            className="px-6 py-3 bg-primary text-white rounded-acnh hover:bg-primaryHover transition-colors font-medium shadow-acnh animate-bounce-slow"
          >
            📢 公告栏
          </button>
          <button
            onClick={() => {
              const phoneNumber = '18626053382';
              const today = new Date();
              const date = today.toISOString().split('T')[0];
              const message = `提交积分！\n日期：${date}\n我是：`;
              const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
              window.location.href = smsUrl;
            }}
            className="px-6 py-3 bg-primary text-white rounded-acnh hover:bg-primaryHover transition-colors font-medium shadow-acnh animate-bounce-slow"
          >
            📝 提交积分
          </button>
        </div>

        <Divider type="wave-yellow" className="my-6" />

        {/* 个人查询 */}
        <div className="max-w-2xl mx-auto mb-8 bg-white rounded-acnh p-6 shadow-acnh">
          <h2 className="text-2xl font-semibold text-primary mb-4">个人查询</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="输入玩家名字"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="flex-1 px-4 py-3 rounded-acnh border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-bgSecondary"
            />
            <Button type="primary" onClick={handleSearch}>
              🔍 查询
            </Button>
          </div>

          {searchResult && (
            <div className="mt-6 bg-primaryBg rounded-acnh p-4 border-2 border-primary">
              <h3 className="text-xl font-semibold mb-3 text-primary">{searchResult.displayName}</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-4 rounded-acnh shadow-acnh-sm">
                  <p className="text-textSecondary">经验值 (XP)</p>
                  <p className="text-2xl font-bold text-primary">{searchResult.xp}</p>
                  <p className="text-sm text-textSecondary">{searchResult.title || '无称号'}</p>
                </div>
                <div className="bg-white p-4 rounded-acnh shadow-acnh-sm">
                  <p className="text-textSecondary">可用积分</p>
                  <p className="text-2xl font-bold text-warning">{searchResult.xp - (searchResult.points || 0)}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-lg font-semibold mb-2 text-primary">经验值记录</h4>
                <div className="bg-white rounded-acnh p-4 max-h-40 overflow-y-auto shadow-acnh-sm">
                  {searchResult.xpHistory && searchResult.xpHistory.length > 0 ? (
                    searchResult.xpHistory.map((record, index) => (
                      <div key={index} className="flex justify-between text-sm py-1">
                        <span>{record.date} - {record.reason}</span>
                        <span className="text-success font-bold">+{record.amount}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-textDisabled text-sm">暂无记录</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2 text-primary">积分兑换记录</h4>
                <div className="bg-white rounded-acnh p-4 max-h-40 overflow-y-auto shadow-acnh-sm">
                  {searchResult.redeemHistory && searchResult.redeemHistory.length > 0 ? (
                    searchResult.redeemHistory.map((record, index) => (
                      <div key={index} className="flex justify-between text-sm py-1">
                        <span>{record.date} - {record.item}</span>
                        <span className="text-error font-bold">-{record.points}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-textDisabled text-sm">暂无兑换记录</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 排行榜 */}
        <div className="max-w-4xl mx-auto bg-white rounded-acnh p-6 shadow-acnh mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-primary mb-4 md:mb-0">排行榜</h2>
            <div className="flex gap-2">
              <Button 
                type={leaderboardType === 'total' ? 'primary' : 'default'} 
                onClick={() => setLeaderboardType('total')}
              >
                总榜单
              </Button>
              <Button 
                type={leaderboardType === 'month' ? 'primary' : 'default'} 
                onClick={() => setLeaderboardType('month')}
              >
                月榜单
              </Button>
              <Button 
                type={leaderboardType === 'week' ? 'primary' : 'default'} 
                onClick={() => setLeaderboardType('week')}
              >
                周榜单
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse">
              <thead>
                <tr className="bg-primaryBg">
                  <th className={`py-3 px-4 text-left font-semibold border-b-2 w-16 ${leaderboardType === 'total' ? 'text-primary border-primary' : leaderboardType === 'month' ? 'text-success border-success' : 'text-warning border-warning'}`}>排名</th>
                  <th className={`py-3 px-4 text-left font-semibold border-b-2 ${leaderboardType === 'total' ? 'text-primary border-primary' : leaderboardType === 'month' ? 'text-success border-success' : 'text-warning border-warning'}`}>玩家名</th>
                  <th className={`py-3 px-4 text-left font-semibold border-b-2 w-32 ${leaderboardType === 'total' ? 'text-primary border-primary' : leaderboardType === 'month' ? 'text-success border-success' : 'text-warning border-warning'}`}>
                    {leaderboardType === 'total' ? '总经验值' : leaderboardType === 'month' ? '月经验值' : '周经验值'}
                  </th>
                  <th className={`py-3 px-4 text-left font-semibold border-b-2 ${leaderboardType === 'total' ? 'text-primary border-primary' : leaderboardType === 'month' ? 'text-success border-success' : 'text-warning border-warning'}`}>称号</th>
                </tr>
              </thead>
              <tbody>
                {[...users]
                  .sort((a, b) => calculatePeriodXP(b, leaderboardType) - calculatePeriodXP(a, leaderboardType))
                  .slice(0, 20)
                  .map((user, index) => (
                    <React.Fragment key={user.id}>
                      <tr 
                        className={`hover:bg-primaryBg transition-colors cursor-pointer ${index + 1 <= 3 ? 'font-bold' : ''}`}
                        onClick={() => index + 1 <= 3 && toggleUserExpand(user.id)}
                      >
                        <td className="py-3 px-4 font-medium w-16">
                          <div className="flex items-center h-8">
                            {index + 1 === 1 && <span className="text-warning text-2xl">🥇</span>}
                            {index + 1 === 2 && <span className="text-textSecondary text-2xl">🥈</span>}
                            {index + 1 === 3 && <span className="text-acnhBrown text-2xl">🥉</span>}
                            {index + 1 > 3 && <span className="w-8"></span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {index + 1 <= 3 ? (
                            <span className="flex items-center gap-2">
                              {user.displayName}
                              <span className="text-primary">icon-miles</span>
                              {expandedUsers[user.id] && <span className="text-xs">🌟</span>}
                            </span>
                          ) : (
                            user.displayName
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-primary w-32">{calculatePeriodXP(user, leaderboardType)}</td>
                        <td className="py-3 px-4">
                          <span className="text-textSecondary font-medium">
                            {user.title || '无称号'}
                          </span>
                        </td>
                      </tr>
                      {index + 1 <= 3 && expandedUsers[user.id] && (
                        <tr key={`${user.id}-expanded`}>
                          <td colSpan="4" className="p-2 bg-primaryBg">
                            <div className="bg-white rounded-acnh overflow-hidden">
                              <div 
                                className="p-3 cursor-pointer flex justify-between items-center"
                                onClick={() => toggleUserExpand(user.id)}
                              >
                                <span className="font-semibold text-primary">{user.displayName}</span>
                                <span>🌟</span>
                              </div>
                              <div className="px-3 pb-3">
                                <div className="border-t-2 border-primaryBg pt-2">
                                  <h4 className="text-sm font-semibold text-primary mb-2">
                                    {leaderboardType === 'total' ? '总' : leaderboardType === 'month' ? '月' : '周'}经验值记录
                                  </h4>
                                  {user.xpHistory && user.xpHistory.length > 0 ? (
                                    <div className="space-y-1">
                                      {user.xpHistory
                                        .filter(record => {
                                          if (leaderboardType === 'total') return true;
                                          const { start } = getDateRange(leaderboardType);
                                          return new Date(record.date) >= start;
                                        })
                                        .slice(0, 5)
                                        .map((record, idx) => (
                                          <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-textSecondary">{record.date} - {record.reason}</span>
                                            <span className="text-primary font-semibold">+{record.amount}</span>
                                          </div>
                                        ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-textSecondary">暂无记录</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 公告栏弹窗 */}
        <Modal
          open={showAnnouncement}
          onClose={() => setShowAnnouncement(false)}
          title={announcementConfig.title}
          width={600}
          maskClosable={true}
          footer={null}
          className="max-h-[80vh] overflow-y-auto sm:max-w-[90vw] sm:max-h-[90vh]"
        >
          <div className="space-y-4" style={{ fontFamily: "'M PLUS Rounded 1c', sans-serif" }}>
            {announcementConfig.sections.map((section, index) => (
              <div key={index} className="bg-primaryBg p-4 rounded-acnh">
                <h4 className="text-lg font-semibold text-primary mb-2">{section.title}</h4>
                
                {section.content && (
                  <ul className="list-disc pl-5 space-y-2 text-text">
                    {section.content.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
                
                {section.events && (
                  <div className="space-y-3">
                    {section.events.map((event, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-acnh shadow-acnh-sm">
                        <h5 className="font-medium text-primary">{event.name}</h5>
                        {event.deadline && <p className="text-sm text-textSecondary">截止日期：{event.deadline}</p>}
                        {event.time && <p className="text-sm text-textSecondary">时间：{event.time}</p>}
                        <p className="text-sm text-textSecondary">奖励：{event.reward}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {section.updates && (
                  <div className="space-y-1">
                    {section.updates.map((update, idx) => (
                      <p key={idx} className="text-sm text-text">{update}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Modal>

        {/* 底部 */}
        <div className="mt-12">
          <Footer type="tree" />
          <div className="text-center text-textSecondary text-sm mt-4">
            <a 
              href="mailto:neverwhateve@me.com?subject=意见与反馈" 
              className="text-textSecondary hover:text-primary transition-colors underline"
            >
              感谢 xxx、xx、xxxx 还有 xxxxx 的反馈和建议！
            </a>
          </div>
        </div>
      </div>
    </Cursor>
  );
}

export default App;