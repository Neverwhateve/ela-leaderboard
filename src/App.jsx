import React, { useState, useEffect } from 'react';
import { Time, Cursor, Modal, Footer, Divider, Button, Typewriter as AnimalTypewriter, Collapse } from 'animal-island-ui';
import 'animal-island-ui/style';
import { announcementConfig, getPointOptions } from './announcementConfig';
import LaborDayEvent from './LaborDayEvent';
import Danmaku from './components/Danmaku';
import Guestbook from './components/Guestbook';

import data from './data.json';

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
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitName, setSubmitName] = useState('');
  const [submitReason, setSubmitReason] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [leaderboardType, setLeaderboardType] = useState('total');
  const [expandedUsers, setExpandedUsers] = useState({});
  const [latestRecords, setLatestRecords] = useState([]);
  const [playDanmaku, setPlayDanmaku] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerEnglishName, setRegisterEnglishName] = useState('');
  const [registerNickname, setRegisterNickname] = useState('');
  const [registerReferrer, setRegisterReferrer] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handlePlayDanmaku = () => {
    setPlayDanmaku(false);
    setTimeout(() => setPlayDanmaku(true), 100);
  };

  // 处理折叠面板展开/收起
  const toggleUserExpand = (userId) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  useEffect(() => {
    setUsers(data.users || []);
    setLatestRecords(data.latestRecords || []);
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
    if (!searchName.trim()) {
      setSearchResult(null);
      return;
    }
    const searchLower = searchName.toLowerCase();
    const results = users.filter(user =>
      user.displayName.toLowerCase().includes(searchLower)
    );
    if (results.length === 1) {
      setSearchResult(results[0]);
    } else if (results.length > 1) {
      setSearchResult({ isMultiple: true, matches: results });
    } else {
      setSearchResult(null);
    }
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
      {currentPage === 'laborDay' ? (
        <LaborDayEvent onBack={() => setCurrentPage('home')} />
      ) : (
      <div className="min-h-screen p-4 md:p-8 font-acnh text-text relative">
        <Danmaku records={latestRecords} play={playDanmaku} />
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1
            className="mb-2 animate-float"
            style={{
              fontFamily: "Nunito, 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
              fontSize: 'clamp(2.5rem, 5vw, 60px)',
              fontWeight: 800,
              lineHeight: 1.1,
              color: '#FFF9E6',
              textShadow: '0px 4px 1px rgba(0, 0, 0, 0.4)',
            }}
          >
            ELA 积分榜
          </h1>
          <div className="flex justify-center mb-4">
            <Time />
          </div>
          <div className="mb-6">
            <AnimalTypewriter speed={100}>
              <div style={{
                fontFamily: "Nunito, 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                fontSize: '17px',
                fontWeight: 500,
                color: '#7c5734',
                lineHeight: 1.7,
                margin: 0,
              }}>你好，欢迎来到丰富人生学院！</div>
              <div style={{
                fontFamily: "Nunito, 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                fontSize: '17px',
                fontWeight: 500,
                color: '#7c5734',
                lineHeight: 1.7,
                margin: 0,
              }}>今天的天气真不错呢～</div>
            </AnimalTypewriter>
          </div>

          {/* 公告栏折叠面板 */}
          <div className="max-w-4xl mx-auto mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 style={{
                fontFamily: "Nunito, 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                fontSize: '24px',
                fontWeight: 700,
                color: '#725d42',
                margin: 0,
                marginBottom: '8px',
                textAlign: 'center',
              }}>{announcementConfig.title}</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="px-6 py-3 bg-primary text-white rounded-acnh hover:bg-primaryHover transition-colors font-medium shadow-acnh"
                >
                  📋 注册
                </button>
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-6 py-3 bg-primary text-white rounded-acnh hover:bg-primaryHover transition-colors font-medium shadow-acnh animate-bounce-slow"
                >
                  📝 提交积分
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {announcementConfig.sections.map((section, index) => (
                <Collapse
                  key={index}
                  question={section.title}
                  answer={
                    <div className="text-text text-left">
                      {section.content && (
                        <div className="space-y-2 text-left">
                          {section.content.map((item, idx) => {
                            // 判断是否是标题行（以 emoji 开头或空行）
                            const isTitle = item.startsWith('🎉') || item.startsWith('🎊') || item.startsWith('📢') || item.startsWith('📈') || item.trim() === '';
                            const isNumbered = /^\d+\./.test(item.trim());
                            const isDivider = item.trim() === '---';
                            
                            if (item.trim() === '') {
                              return <div key={idx} className="h-2"></div>;
                            }
                            
                            if (isDivider) {
                              return (
                                <div key={idx} className="border-t border-warning/30 my-3"></div>
                              );
                            }
                            
                            if (isTitle) {
                              return (
                                <div key={idx} className="font-bold text-lg text-primary mb-2 mt-1">
                                  {item}
                                </div>
                              );
                            }
                            
                            if (isNumbered) {
                              return (
                                <div key={idx} className="pl-2">
                                  {item}
                                </div>
                              );
                            }
                            
                            return (
                              <div key={idx} className="list-disc pl-5">
                                {item}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {section.events && (
                        <div className="space-y-3">
                          {section.events.map((event, idx) => (
                            <div key={idx} className="bg-primaryBg p-3 rounded-acnh text-left">
                              <h5 className="font-medium text-primary text-left">{event.name}</h5>
                              {event.deadline && <p className="text-sm text-textSecondary text-left">截止日期：{event.deadline}</p>}
                              {event.time && <p className="text-sm text-textSecondary text-left">时间：{event.time}</p>}
                              <p className="text-sm text-textSecondary text-left">奖励：{event.reward}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {section.updates && (
                        <div className="space-y-1">
                          {section.updates.map((update, idx) => (
                            <p key={idx} className="text-sm text-text text-left">{update}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        </div>

        <Divider type="wave-yellow" className="my-6" />

        {/* 个人查询 */}
        <div className="max-w-2xl mx-auto mb-8 rounded-acnh p-6 shadow-acnh" style={{ backgroundColor: '#f7f3df' }}>
          <h2 style={{
            fontFamily: "Nunito, 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
            fontSize: '24px',
            fontWeight: 700,
            color: '#725d42',
            margin: 0,
            marginBottom: '8px',
          }}>个人查询</h2>
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
              {searchResult.isMultiple ? (
                <>
                  <h3 className="text-xl font-semibold mb-3 text-primary">找到多个匹配的玩家</h3>
                  <div className="space-y-2">
                    {searchResult.matches.map((user, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-acnh cursor-pointer hover:bg-primaryBg transition-colors shadow-acnh-sm"
                        style={{ backgroundColor: '#f7f3df' }}
                        onClick={() => setSearchResult(user)}
                      >
                        <span className="text-lg text-primary font-medium">{user.displayName}</span>
                        <span className="text-sm text-textSecondary ml-2">🌟 {user.xp} XP</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold mb-3 text-primary">{searchResult.displayName}</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-4 rounded-acnh shadow-acnh-sm" style={{ backgroundColor: '#f7f3df' }}>
                      <p className="text-textSecondary">经验值 (XP)</p>
                      <p className="text-2xl font-bold text-primary">{searchResult.xp}</p>
                      <p className="text-sm text-textSecondary">{searchResult.title || '无称号'}</p>
                    </div>
                    <div className="p-4 rounded-acnh shadow-acnh-sm" style={{ backgroundColor: '#f7f3df' }}>
                      <p className="text-textSecondary">可用积分</p>
                      <p className="text-2xl font-bold text-warning">{searchResult.xp - (searchResult.points || 0)}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-lg font-semibold mb-2 text-primary">经验值记录</h4>
                    <div className="rounded-acnh p-4 max-h-40 overflow-y-auto shadow-acnh-sm" style={{ backgroundColor: '#f7f3df' }}>
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
                    <div className="rounded-acnh p-4 max-h-40 overflow-y-auto shadow-acnh-sm" style={{ backgroundColor: '#f7f3df' }}>
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
                </>
              )}
            </div>
          )}
        </div>

        {/* 排行榜 */}
        <div className="max-w-4xl mx-auto rounded-acnh p-6 shadow-acnh mb-8" style={{ backgroundColor: '#f7f3df' }}>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-4 md:mb-0">
              <h2 
                className="md:translate-x-0"
                style={{
                  fontFamily: "Nunito, 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#725d42',
                  margin: 0,
                  transform: 'translateX(7px)',
                }}
              >排行榜</h2>
              <span 
                onClick={handlePlayDanmaku}
                className="text-2xl cursor-pointer hover:scale-125 transition-transform duration-200 md:translate-x-0"
                title="点击播放弹幕"
                style={{ transform: 'translateX(5px)' }}
              >
                🎉
              </span>
            </div>
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
                {(() => {
                  const sortedUsers = [...users].sort((a, b) => calculatePeriodXP(b, leaderboardType) - calculatePeriodXP(a, leaderboardType));
                  const usersWithRank = [];
                  sortedUsers.forEach((user, index) => {
                    let rank = index + 1;
                    if (index > 0) {
                      const previousScore = calculatePeriodXP(sortedUsers[index - 1], leaderboardType);
                      const currentScore = calculatePeriodXP(user, leaderboardType);
                      if (previousScore === currentScore) {
                        rank = usersWithRank[index - 1].rank;
                      }
                    }
                    usersWithRank.push({ ...user, rank });
                  });
                  return usersWithRank.slice(0, 20);
                })().map((user, index) => (
                    <React.Fragment key={user.id}>
                      <tr 
                        className={`hover:bg-primaryBg transition-colors cursor-pointer ${user.rank <= 3 ? 'font-bold' : ''}`}
                        onClick={() => user.rank <= 3 && toggleUserExpand(user.id)}
                      >
                        <td className="py-3 px-4 font-medium w-16">
                          <div className="flex items-center h-8">
                            {user.rank === 1 && <span className="text-warning text-2xl">🥇</span>}
                            {user.rank === 2 && <span className="text-textSecondary text-2xl">🥈</span>}
                            {user.rank === 3 && <span className="text-acnhBrown text-2xl">🥉</span>}
                            {user.rank > 3 && <span className="w-8"></span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {user.rank <= 3 ? (
                            <span className="flex items-center gap-2">
                              {user.displayName}
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
                      {user.rank <= 3 && expandedUsers[user.id] && (
                        <tr key={`${user.id}-expanded`}>
                          <td colSpan="4" className="p-2 bg-primaryBg">
                            <div className="rounded-acnh overflow-hidden" style={{ backgroundColor: '#f7f3df' }}>
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
                                    最近经验值记录
                                  </h4>
                                  {user.xpHistory && user.xpHistory.length > 0 ? (
                                    <div className="space-y-1">
                                      {[...user.xpHistory]
                                        .reverse()
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

        {/* 留言板 */}
        <Guestbook />

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

        {/* 提交积分模态框 */}
        {showSubmitModal && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => {
              if (!isSubmitting) {
                setShowSubmitModal(false);
                setSubmitName('');
                setSubmitReason('');
                setSubmitMessage('');
                setSelectedReason('');
                setCustomReason('');
              }
            }}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                width: '90%',
                maxWidth: '400px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>📝 提交积分</h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#333' }}>我是：</label>
                <input
                  type="text"
                  value={submitName}
                  onChange={(e) => setSubmitName(e.target.value)}
                  placeholder="请输入你的名字或昵称"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: isSubmitting ? '#f5f5f5' : 'white',
                    color: isSubmitting ? '#999' : '#333',
                  }}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#333' }}>因为：</label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: isSubmitting ? '#f5f5f5' : 'white',
                    color: isSubmitting ? '#999' : '#333',
                    marginBottom: '8px',
                  }}
                >
                  <option value="">请选择加分项目</option>
                  {getPointOptions().map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                  <option value="其他">其他（请在下方填写）</option>
                </select>
                {selectedReason === '其他' && (
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="请描述你获得积分的原因..."
                    rows={2}
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: isSubmitting ? '#f5f5f5' : 'white',
                      color: isSubmitting ? '#999' : '#333',
                    }}
                  />
                )}
              </div>
              {submitMessage && (
                <div style={{
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '12px',
                  backgroundColor: submitMessage.includes('成功') ? '#d4edda' : '#f8d7da',
                  color: submitMessage.includes('成功') ? '#155724' : '#721c24',
                }}>
                  {submitMessage}
                </div>
              )}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    if (!isSubmitting) {
                      setShowSubmitModal(false);
                      setSubmitName('');
                      setSubmitReason('');
                      setSubmitMessage('');
                      setSelectedReason('');
                      setCustomReason('');
                    }
                  }}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: isSubmitting ? '#e0e0e0' : '#f5f5f5',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    color: isSubmitting ? '#9e9e9e' : '#333',
                  }}
                >
                  取消
                </button>
                <button
                  onClick={async () => {
                    if (!submitName.trim() || !selectedReason) {
                      setSubmitMessage('请填写完整信息');
                      return;
                    }
                    if (selectedReason === '其他' && !customReason.trim()) {
                      setSubmitMessage('请填写具体原因');
                      return;
                    }
                    setIsSubmitting(true);
                    const today = new Date().toISOString().split('T')[0];
                    const finalReason = selectedReason === '其他' ? customReason.trim() : selectedReason;
                    try {
                      const response = await fetch('/api/submit', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          name: submitName.trim(),
                          reason: finalReason,
                          date: today
                        })
                      });
                      const result = await response.json();
                      setSubmitMessage(result.message || result.error);
                      if (result.success) {
                        setTimeout(() => {
                          setShowSubmitModal(false);
                          setSubmitName('');
                          setSubmitReason('');
                          setSubmitMessage('');
                          setSelectedReason('');
                          setCustomReason('');
                        }, 2000);
                      }
                    } catch (error) {
                      setSubmitMessage('提交失败，请稍后重试');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: isSubmitting ? '#9E9E9E' : '#4CAF50',
                    color: 'white',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {isSubmitting ? '提交中...' : '提交'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 注册模态框 */}
        {showRegisterModal && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => {
              if (!isRegistering) {
                setShowRegisterModal(false);
                setRegisterEnglishName('');
                setRegisterNickname('');
                setRegisterReferrer('');
                setRegisterMessage('');
              }
            }}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                width: '90%',
                maxWidth: '400px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>📋 注册</h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#333' }}>我是谁（英文名）：</label>
                <input
                  type="text"
                  value={registerEnglishName}
                  onChange={(e) => setRegisterEnglishName(e.target.value)}
                  placeholder="请输入你的英文名"
                  disabled={isRegistering}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: isRegistering ? '#f5f5f5' : 'white',
                    color: isRegistering ? '#999' : '#333',
                  }}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#333' }}>昵称是什么：</label>
                <input
                  type="text"
                  value={registerNickname}
                  onChange={(e) => setRegisterNickname(e.target.value)}
                  placeholder="请输入你的昵称"
                  disabled={isRegistering}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: isRegistering ? '#f5f5f5' : 'white',
                    color: isRegistering ? '#999' : '#333',
                  }}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#333' }}>推荐人是谁（选填）：</label>
                <input
                  type="text"
                  value={registerReferrer}
                  onChange={(e) => setRegisterReferrer(e.target.value)}
                  placeholder="请输入推荐人的名字（可选）"
                  disabled={isRegistering}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: isRegistering ? '#f5f5f5' : 'white',
                    color: isRegistering ? '#999' : '#333',
                  }}
                />
              </div>
              {registerMessage && (
                <div style={{
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '12px',
                  backgroundColor: registerMessage.includes('成功') ? '#d4edda' : '#f8d7da',
                  color: registerMessage.includes('成功') ? '#155724' : '#721c24',
                }}>
                  {registerMessage}
                </div>
              )}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    if (!isRegistering) {
                      setShowRegisterModal(false);
                      setRegisterEnglishName('');
                      setRegisterNickname('');
                      setRegisterReferrer('');
                      setRegisterMessage('');
                    }
                  }}
                  disabled={isRegistering}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: isRegistering ? '#e0e0e0' : '#f5f5f5',
                    cursor: isRegistering ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    color: isRegistering ? '#9e9e9e' : '#333',
                  }}
                >
                  取消
                </button>
                <button
                  onClick={async () => {
                    if (!registerEnglishName.trim() || !registerNickname.trim()) {
                      setRegisterMessage('请填写完整信息');
                      return;
                    }
                    setIsRegistering(true);
                    try {
                      const response = await fetch('/api/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          englishName: registerEnglishName.trim(),
                          nickname: registerNickname.trim(),
                          referrer: registerReferrer.trim(),
                        })
                      });
                      const result = await response.json();
                      setRegisterMessage(result.message || result.error);
                      if (result.success) {
                        setTimeout(() => {
                          setShowRegisterModal(false);
                          setRegisterEnglishName('');
                          setRegisterNickname('');
                          setRegisterReferrer('');
                          setRegisterMessage('');
                        }, 2000);
                      }
                    } catch (error) {
                      setRegisterMessage('注册失败，请稍后重试');
                    } finally {
                      setIsRegistering(false);
                    }
                  }}
                  disabled={isRegistering}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: isRegistering ? '#9E9E9E' : '#FF9800',
                    color: 'white',
                    cursor: isRegistering ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {isRegistering ? '注册中...' : '注册'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </Cursor>
  );
}

export default App;