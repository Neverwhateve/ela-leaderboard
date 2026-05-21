import React, { useState, useEffect } from 'react';
import { Time, Cursor, Modal, Footer, Divider, Button, Typewriter as AnimalTypewriter, Collapse, Loading, Icon, Tabs, Select } from 'animal-island-ui';
import { announcementConfig as defaultAnnouncementConfig, getPointOptions, pointMapping as defaultPointMapping, defaultPointCategories } from './announcementConfig';
import LaborDayEvent from './LaborDayEvent';
import Danmaku from './components/Danmaku';
import Guestbook from './components/Guestbook';
import AdminPanel from './components/AdminPanel';
import gitTime from './git-time.json';

import data from './data.json';

const calculateLevel = (xp) => {
  if (xp >= 300) return 'Lv3';
  if (xp >= 100) return 'Lv2';
  return 'Lv1';
};

// 格式化日期为YYYY-MM-DD格式
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  const [customPoints, setCustomPoints] = useState('');
  const [pointCategories, setPointCategories] = useState(defaultPointCategories);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerEnglishName, setRegisterEnglishName] = useState('');
  const [registerNickname, setRegisterNickname] = useState('');
  const [registerReferrer, setRegisterReferrer] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [redemptionItem, setRedemptionItem] = useState('');
  const [redemptionName, setRedemptionName] = useState('');
  const [announcementConfig, setAnnouncementConfig] = useState(defaultAnnouncementConfig);
  const [pointMapping, setPointMapping] = useState(defaultPointMapping);
  const [redemptionMessage, setRedemptionMessage] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [showRedeemSearchSuggestions, setShowRedeemSearchSuggestions] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showRedemptionItemModal, setShowRedemptionItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

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
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setCurrentPage('admin');
    }
    
    // 从 Supabase 获取数据
    fetch('/api/get-data')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setUsers(result.users || []);
          setLatestRecords(result.latestRecords || []);
        } else {
          // 如果 API 失败，回退到 data.json
          setUsers(data.users || []);
          setLatestRecords(data.latestRecords || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('获取数据失败，回退到静态数据:', err);
        setUsers(data.users || []);
        setLatestRecords(data.latestRecords || []);
        setLoading(false);
      });

    // 加载公告配置
    fetch('/api/admin/config')
      .then(res => res.json())
      .then(result => {
        if (result.success && result.config) {
          setAnnouncementConfig(result.config);
        }
      })
      .catch(err => console.error('加载公告配置失败:', err));

    // 加载积分分类配置
    fetch('/api/admin/point-categories')
      .then(res => res.json())
      .then(result => {
        if (result.success && result.categories) {
          setPointCategories(result.categories);
        }
      })
      .catch(err => console.error('加载积分分类配置失败:', err));
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

  const handleBackToHome = () => {
    setCurrentPage('home');
    window.history.pushState({}, '', window.location.pathname);
  };

  return (
    <>
      <Loading 
        active={loading} 
        style={{ position: 'fixed', inset: 0, zIndex: 9999 }} 
      />
      <Cursor>
        {currentPage === 'laborDay' ? (
          <LaborDayEvent onBack={() => setCurrentPage('home')} />
        ) : currentPage === 'admin' ? (
          <AdminPanel onBack={handleBackToHome} />
        ) : (
      <div className="min-h-screen p-4 md:p-8 font-acnh text-text relative">
        <Danmaku records={latestRecords} play={playDanmaku} />
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1
            className="mb-2 animate-float cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              fontFamily: "Nunito, 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
              fontSize: 'clamp(2.5rem, 5vw, 60px)',
              fontWeight: 800,
              lineHeight: 1.1,
              color: '#FFF9E6',
              textShadow: '0px 4px 1px rgba(0, 0, 0, 0.4)',
            }}
            onClick={() => setCurrentPage('admin')}
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
            <div className="mb-3">
              <h3 style={{
                fontFamily: "Nunito, 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                fontSize: '24px',
                fontWeight: 700,
                color: '#725d42',
                margin: 0,
                marginBottom: '16px',
                textAlign: 'center',
              }}>{announcementConfig.title}</h3>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="px-4 py-3 bg-primary text-white rounded-acnh hover:bg-primaryHover transition-colors font-medium shadow-acnh flex items-center gap-2"
                >
                  <Icon name="icon-miles" size={20} /> 注册
                </button>
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-4 py-3 bg-primary text-white rounded-acnh hover:bg-primaryHover transition-colors font-medium shadow-acnh flex items-center gap-2"
                >
                  <Icon name="icon-design" size={20} /> 提交积分
                </button>
                <button
                  onClick={() => setShowRedemptionModal(true)}
                  className="px-4 py-3 bg-warning text-white rounded-acnh hover:bg-warningHover transition-colors font-medium shadow-acnh flex items-center gap-2"
                >
                  <Icon name="icon-shopping" size={20} /> 兑换
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
                      <p className="text-2xl font-bold text-warning">{searchResult.points || 0}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-lg font-semibold mb-2 text-primary">经验值记录</h4>
                    <div className="rounded-acnh p-4 max-h-40 overflow-y-auto shadow-acnh-sm" style={{ backgroundColor: '#f7f3df' }}>
                      {searchResult.xpHistory && searchResult.xpHistory.length > 0 ? (
                        searchResult.xpHistory.map((record, index) => (
                          <div key={index} className="flex justify-between text-sm py-1">
                            <span>{formatDate(record.date)} - {record.reason}</span>
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
                            <span>{formatDate(record.date)} - {record.item}</span>
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
          </div>
          
          <Tabs
            activeKey={leaderboardType}
            onChange={(key) => setLeaderboardType(key)}
            items={[
              {
                key: 'total',
                label: '总榜单',
                children: (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] border-collapse">
                      <thead>
                        <tr className="bg-primaryBg">
                          <th className="py-3 px-4 text-left font-semibold border-b-2 text-primary border-primary">玩家名</th>
                          <th className="py-3 px-4 text-left font-semibold border-b-2 w-32 text-primary border-primary">总经验值</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const sortedUsers = [...users].sort((a, b) => calculatePeriodXP(b, 'total') - calculatePeriodXP(a, 'total'));
                          const usersWithRank = [];
                          sortedUsers.forEach((user, index) => {
                            let rank = index + 1;
                            if (index > 0) {
                              const previousScore = calculatePeriodXP(sortedUsers[index - 1], 'total');
                              const currentScore = calculatePeriodXP(user, 'total');
                              if (previousScore === currentScore) {
                                rank = usersWithRank[index - 1].rank;
                              }
                            }
                            usersWithRank.push({ ...user, rank });
                          });
                          return usersWithRank.slice(0, 20);
                        })().map((user, index) => (
                            <React.Fragment key={user.name}>
                              <tr 
                                className={`hover:bg-primaryBg transition-colors cursor-pointer ${user.rank <= 3 ? 'font-bold' : ''}`}
                                onClick={() => toggleUserExpand(user.name)}
                              >
                                <td className="py-3 px-4 font-medium">
                                  <span className="flex items-center gap-2">
                                    {user.rank === 1 && <span className="text-warning text-xl">🥇</span>}
                                    {user.rank === 2 && <span className="text-textSecondary text-xl">🥈</span>}
                                    {user.rank === 3 && <span className="text-acnhBrown text-xl">🥉</span>}
                                    {user.rank > 3 && <span className="w-6"></span>}
                                    {user.displayName}
                                    {user.title && <span className="text-xs text-textSecondary">({user.title})</span>}
                                    {expandedUsers[user.name] && <span className="text-xs">🌟</span>}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-bold text-primary w-32">{calculatePeriodXP(user, 'total')}</td>
                              </tr>
                              {expandedUsers[user.name] && (
                                <tr key={`${user.name}-expanded`}>
                                  <td colSpan="2" className="p-2 bg-primaryBg">
                                    <div className="rounded-acnh overflow-hidden" style={{ backgroundColor: '#f7f3df' }}>
                                      <div 
                                        className="p-3 cursor-pointer flex justify-between items-center"
                                        onClick={() => toggleUserExpand(user.name)}
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
                                              {user.xpHistory
                                                .slice(0, 5)
                                                .map((record, idx) => (
                                                  <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-textSecondary">{formatDate(record.date)} - {record.reason}</span>
                                                    <span className={record.amount >= 0 ? 'text-primary font-semibold' : 'text-red-500 font-semibold'}>
                                                      {record.amount >= 0 ? '+' : ''}{record.amount}
                                                    </span>
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
                ),
              },
              {
                key: 'month',
                label: '月榜单',
                children: (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] border-collapse">
                      <thead>
                        <tr className="bg-primaryBg">
                          <th className="py-3 px-4 text-left font-semibold border-b-2 text-success border-success">玩家名</th>
                          <th className="py-3 px-4 text-left font-semibold border-b-2 w-32 text-success border-success">月经验值</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const sortedUsers = [...users].sort((a, b) => calculatePeriodXP(b, 'month') - calculatePeriodXP(a, 'month'));
                          const usersWithRank = [];
                          sortedUsers.forEach((user, index) => {
                            let rank = index + 1;
                            if (index > 0) {
                              const previousScore = calculatePeriodXP(sortedUsers[index - 1], 'month');
                              const currentScore = calculatePeriodXP(user, 'month');
                              if (previousScore === currentScore) {
                                rank = usersWithRank[index - 1].rank;
                              }
                            }
                            usersWithRank.push({ ...user, rank });
                          });
                          return usersWithRank.slice(0, 20);
                        })().map((user, index) => (
                            <React.Fragment key={user.name}>
                              <tr 
                                className={`hover:bg-primaryBg transition-colors cursor-pointer ${user.rank <= 3 ? 'font-bold' : ''}`}
                                onClick={() => toggleUserExpand(user.name)}
                              >
                                <td className="py-3 px-4 font-medium">
                                  <span className="flex items-center gap-2">
                                    {user.rank === 1 && <span className="text-warning text-xl">🥇</span>}
                                    {user.rank === 2 && <span className="text-textSecondary text-xl">🥈</span>}
                                    {user.rank === 3 && <span className="text-acnhBrown text-xl">🥉</span>}
                                    {user.rank > 3 && <span className="w-6"></span>}
                                    {user.displayName}
                                    {user.title && <span className="text-xs text-textSecondary">({user.title})</span>}
                                    {expandedUsers[user.name] && <span className="text-xs">🌟</span>}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-bold text-success w-32">{calculatePeriodXP(user, 'month')}</td>
                              </tr>
                              {expandedUsers[user.name] && (
                                <tr key={`${user.name}-expanded`}>
                                  <td colSpan="2" className="p-2 bg-primaryBg">
                                    <div className="rounded-acnh overflow-hidden" style={{ backgroundColor: '#f7f3df' }}>
                                      <div 
                                        className="p-3 cursor-pointer flex justify-between items-center"
                                        onClick={() => toggleUserExpand(user.name)}
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
                                              {user.xpHistory
                                                .slice(0, 5)
                                                .map((record, idx) => (
                                                  <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-textSecondary">{formatDate(record.date)} - {record.reason}</span>
                                                    <span className={record.amount >= 0 ? 'text-success font-semibold' : 'text-red-500 font-semibold'}>
                                                      {record.amount >= 0 ? '+' : ''}{record.amount}
                                                    </span>
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
                ),
              },
              {
                key: 'week',
                label: '周榜单',
                children: (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] border-collapse">
                      <thead>
                        <tr className="bg-primaryBg">
                          <th className="py-3 px-4 text-left font-semibold border-b-2 text-warning border-warning">玩家名</th>
                          <th className="py-3 px-4 text-left font-semibold border-b-2 w-32 text-warning border-warning">周经验值</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const sortedUsers = [...users].sort((a, b) => calculatePeriodXP(b, 'week') - calculatePeriodXP(a, 'week'));
                          const usersWithRank = [];
                          sortedUsers.forEach((user, index) => {
                            let rank = index + 1;
                            if (index > 0) {
                              const previousScore = calculatePeriodXP(sortedUsers[index - 1], 'week');
                              const currentScore = calculatePeriodXP(user, 'week');
                              if (previousScore === currentScore) {
                                rank = usersWithRank[index - 1].rank;
                              }
                            }
                            usersWithRank.push({ ...user, rank });
                          });
                          return usersWithRank.slice(0, 20);
                        })().map((user, index) => (
                            <React.Fragment key={user.name}>
                              <tr 
                                className={`hover:bg-primaryBg transition-colors cursor-pointer ${user.rank <= 3 ? 'font-bold' : ''}`}
                                onClick={() => toggleUserExpand(user.name)}
                              >
                                <td className="py-3 px-4 font-medium">
                                  <span className="flex items-center gap-2">
                                    {user.rank === 1 && <span className="text-warning text-xl">🥇</span>}
                                    {user.rank === 2 && <span className="text-textSecondary text-xl">🥈</span>}
                                    {user.rank === 3 && <span className="text-acnhBrown text-xl">🥉</span>}
                                    {user.rank > 3 && <span className="w-6"></span>}
                                    {user.displayName}
                                    {user.title && <span className="text-xs text-textSecondary">({user.title})</span>}
                                    {expandedUsers[user.name] && <span className="text-xs">🌟</span>}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-bold text-warning w-32">{calculatePeriodXP(user, 'week')}</td>
                              </tr>
                              {expandedUsers[user.name] && (
                                <tr key={`${user.name}-expanded`}>
                                  <td colSpan="2" className="p-2 bg-primaryBg">
                                    <div className="rounded-acnh overflow-hidden" style={{ backgroundColor: '#f7f3df' }}>
                                      <div 
                                        className="p-3 cursor-pointer flex justify-between items-center"
                                        onClick={() => toggleUserExpand(user.name)}
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
                                              {user.xpHistory
                                                .slice(0, 5)
                                                .map((record, idx) => (
                                                  <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-textSecondary">{formatDate(record.date)} - {record.reason}</span>
                                                    <span className={record.amount >= 0 ? 'text-warning font-semibold' : 'text-red-500 font-semibold'}>
                                                      {record.amount >= 0 ? '+' : ''}{record.amount}
                                                    </span>
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
                ),
              },
            ]}
          />
        </div>

        {/* 留言板 */}
        <Guestbook />

        {/* 底部 */}
        <div className="mt-12">
          <Footer type="tree" />
          <div className="text-center text-textSecondary text-xs mt-2" style={{ fontFamily: "Nunito, sans-serif" }}>
            版本更新时间：{gitTime.date} ({gitTime.hash})
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
              zIndex: 999999,
              pointerEvents: 'auto',
              overflow: 'hidden',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => {
              if (!isSubmitting) {
                setShowSubmitModal(false);
                setSubmitName('');
                setSubmitReason('');
                setSubmitMessage('');
                setSelectedReason('');
                setCustomReason('');
                setShowSearchSuggestions(false);
              }
            }}
          >
            <div 
              ref={(el) => { window.modalContainerRef = el; }}
              className="rounded-acnh shadow-acnh"
              style={{
                backgroundColor: '#f7f3df',
                padding: '28px',
                width: '90%',
                maxWidth: '420px',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 700, textAlign: 'center', fontFamily: "Nunito, 'Zen Maru Gothic', sans-serif", color: '#725d42' }}>📝 提交积分</h3>
              <div style={{ marginBottom: '16px', position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#725d42', fontFamily: "Nunito, sans-serif" }}>我是：</label>
                <input
                  type="text"
                  value={submitName}
                  onChange={(e) => {
                    setSubmitName(e.target.value);
                    setShowSearchSuggestions(true);
                  }}
                  onFocus={() => setShowSearchSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                  placeholder="请输入你的名字或昵称"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-acnh border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  style={{
                    fontSize: '14px',
                    backgroundColor: isSubmitting ? '#f5f5f5' : 'white',
                    color: isSubmitting ? '#999' : '#333',
                  }}
                />
                {submitName.trim() && showSearchSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-acnh shadow-acnh overflow-hidden z-50" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {users
                      .filter(user => 
                        user.name.toLowerCase().includes(submitName.toLowerCase()) ||
                        (user.displayName && user.displayName.toLowerCase().includes(submitName.toLowerCase()))
                      )
                      .slice(0, 10)
                      .map(user => {
                        const matchedOnDisplayName = user.displayName && user.displayName.toLowerCase().includes(submitName.toLowerCase());
                        const matchedOnName = user.name.toLowerCase().includes(submitName.toLowerCase());
                        const displayName = matchedOnDisplayName ? user.displayName : user.name;
                        
                        return (
                          <div
                            key={user.name}
                            onClick={() => {
                              setSubmitName(displayName);
                              setSubmitMessage('');
                              setShowSearchSuggestions(false);
                            }}
                            className="px-4 py-3 cursor-pointer hover:bg-primaryBg transition-colors border-b border-border last:border-b-0"
                          >
                            <span className="font-medium text-primary">{displayName}</span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#725d42', fontFamily: "Nunito, sans-serif" }}>分类：</label>
                <Button
                  type={selectedCategory ? 'primary' : 'default'}
                  block
                  disabled={isSubmitting}
                  onClick={() => setShowCategoryModal(true)}
                >
                  {selectedCategory ? pointCategories.find(c => c.id === selectedCategory)?.name || '其他（自定义）' : '请选择分类'}
                </Button>

                {selectedCategory && selectedCategory !== 'other' && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#725d42', fontFamily: "Nunito, sans-serif" }}>项目：</label>
                    <Button
                      type={selectedReason ? 'primary' : 'default'}
                      block
                      disabled={isSubmitting}
                      onClick={() => setShowProjectModal(true)}
                    >
                      {selectedReason ? selectedReason : '请选择具体项目'}
                    </Button>
                  </div>
                )}

                {selectedCategory === 'other' && (
                  <>
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#333' }}>分数：</label>
                      <input
                        type="number"
                        value={customPoints}
                        onChange={(e) => setCustomPoints(e.target.value)}
                        placeholder="请输入分数"
                        min="1"
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-acnh border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                        style={{
                          fontSize: '14px',
                          backgroundColor: isSubmitting ? '#f5f5f5' : 'white',
                          color: isSubmitting ? '#999' : '#333',
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#725d42', fontFamily: "Nunito, sans-serif" }}>原因：</label>
                      <textarea
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="请描述你获得积分的原因..."
                        rows={2}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-acnh border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white resize-none"
                        style={{
                          fontSize: '14px',
                          backgroundColor: isSubmitting ? '#f5f5f5' : 'white',
                          color: isSubmitting ? '#999' : '#333',
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
              {submitMessage && (
                <div className={`rounded-acnh p-3 mb-4 text-sm ${
                  submitMessage.includes('成功') || submitMessage.includes('已提交') 
                    ? 'bg-success/10 text-success border border-success/30' 
                    : 'bg-error/10 text-error border border-error/30'
                }`}>
                  {submitMessage}
                </div>
              )}
              <div className="flex gap-3">
                <Button 
                  type="default" 
                  block 
                  disabled={isSubmitting}
                  onClick={() => {
                    if (!isSubmitting) {
                      setShowSubmitModal(false);
                      setSubmitName('');
                      setSubmitReason('');
                      setSubmitMessage('');
                      setSelectedReason('');
                      setCustomReason('');
                      setCustomPoints('');
                      setSelectedCategory('');
                      setShowSearchSuggestions(false);
                    }
                  }}
                >
                  取消
                </Button>
                <Button 
                  type="primary" 
                  block 
                  loading={isSubmitting}
                  onClick={async () => {
                    if (!submitName.trim() || !selectedCategory) {
                      setSubmitMessage('请填写完整信息');
                      return;
                    }
                    if (selectedCategory !== 'other' && !selectedReason) {
                      setSubmitMessage('请选择具体项目');
                      return;
                    }
                    if (selectedCategory === 'other') {
                      if (!customReason.trim()) {
                        setSubmitMessage('请填写具体原因');
                        return;
                      }
                      if (!customPoints || parseInt(customPoints) <= 0) {
                        setSubmitMessage('请填写有效的分数');
                        return;
                      }
                    }
                    setIsSubmitting(true);
                    const finalReason = selectedCategory === 'other' ? customReason.trim() : selectedReason;
                    let points;
                    if (selectedCategory === 'other') {
                      points = parseInt(customPoints);
                    } else {
                      const category = pointCategories.find(c => c.id === selectedCategory);
                      const item = category?.items.find(i => i.name === selectedReason);
                      points = item?.points || 0;
                    }
                    
                    const searchName = submitName.trim();
                    const matchedUser = users.find(u => 
                      u.name.toLowerCase() === searchName.toLowerCase() || 
                      (u.nickname && u.nickname.toLowerCase() === searchName.toLowerCase())
                    );
                    const actualUserName = matchedUser ? matchedUser.name : searchName;
                    const actualNickname = matchedUser ? (matchedUser.nickname || '') : '';
                    
                    try {
                      const response = await fetch('/api/admin/apply', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          type: 'points',
                          user_name: actualUserName,
                          user_nickname: actualNickname,
                          reason: finalReason,
                          points: points
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
                          setCustomPoints('');
                          setSelectedCategory('');
                          setShowSearchSuggestions(false);
                        }, 2000);
                      }
                    } catch (error) {
                      setSubmitMessage('提交失败，请稍后重试');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >
                  {isSubmitting ? '提交中...' : '提交'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 项目选择模态框 - 全屏居中 */}
        {showProjectModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999999,
              pointerEvents: 'auto',
              padding: '20px',
            }}
            onClick={() => setShowProjectModal(false)}
          >
            <div
              className="rounded-acnh shadow-acnh"
              style={{
                backgroundColor: '#f7f3df',
                padding: '24px',
                width: '100%',
                maxWidth: '360px',
                maxHeight: '70vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700, textAlign: 'center', fontFamily: "Nunito, 'Zen Maru Gothic', sans-serif", color: '#725d42' }}>🎯 选择项目</h3>
              
              <div className="space-y-2">
                {(pointCategories.find(c => c.id === selectedCategory)?.items || []).map((item) => (
                  <div
                    key={item.name}
                    onClick={() => {
                      setSelectedReason(item.name);
                      setShowProjectModal(false);
                    }}
                    className={`w-full px-4 py-3 rounded-acnh text-left cursor-pointer transition-all ${
                      selectedReason === item.name 
                        ? 'bg-primary text-white' 
                        : 'bg-white border-2 border-border hover:border-primary'
                    }`}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}
                  >
                    <span className="flex-1 text-sm truncate">{item.name}</span>
                    <span className={`text-sm font-medium whitespace-nowrap ${
                      selectedReason === item.name ? 'text-white' : 'text-primary'
                    }`}>+{item.points}积分</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <Button
                  type="default"
                  onClick={() => setShowProjectModal(false)}
                >
                  取消
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 分类选择模态框 - 全屏居中 */}
        {showCategoryModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999999,
              pointerEvents: 'auto',
              padding: '20px',
            }}
            onClick={() => setShowCategoryModal(false)}
          >
            <div
              className="rounded-acnh shadow-acnh"
              style={{
                backgroundColor: '#f7f3df',
                padding: '24px',
                width: '100%',
                maxWidth: '360px',
                maxHeight: '70vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700, textAlign: 'center', fontFamily: "Nunito, 'Zen Maru Gothic', sans-serif", color: '#725d42' }}>📊 选择分类</h3>
              
              <div className="space-y-2">
                {/* 常规积分 */}
                <div
                  onClick={() => {
                    setSelectedCategory('regular');
                    setSelectedReason('');
                    setShowCategoryModal(false);
                  }}
                  className={`w-full px-4 py-3 rounded-acnh text-left cursor-pointer transition-all ${
                    selectedCategory === 'regular' 
                      ? 'bg-primary text-white' 
                      : 'bg-white border-2 border-border hover:border-primary'
                  }`}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <Icon name="icon-miles" size={20} />
                  <span className="flex-1 text-sm truncate">常规积分</span>
                </div>
                {/* 特殊活动 */}
                <div
                  onClick={() => {
                    setSelectedCategory('event');
                    setSelectedReason('');
                    setShowCategoryModal(false);
                  }}
                  className={`w-full px-4 py-3 rounded-acnh text-left cursor-pointer transition-all ${
                    selectedCategory === 'event' 
                      ? 'bg-primary text-white' 
                      : 'bg-white border-2 border-border hover:border-primary'
                  }`}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <Icon name="icon-helicopter" size={20} />
                  <span className="flex-1 text-sm truncate">特殊活动</span>
                </div>
                {/* 悬赏任务 */}
                <div
                  onClick={() => {
                    setSelectedCategory('bounty');
                    setSelectedReason('');
                    setShowCategoryModal(false);
                  }}
                  className={`w-full px-4 py-3 rounded-acnh text-left cursor-pointer transition-all ${
                    selectedCategory === 'bounty' 
                      ? 'bg-primary text-white' 
                      : 'bg-white border-2 border-border hover:border-primary'
                  }`}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <Icon name="icon-design" size={20} />
                  <span className="flex-1 text-sm truncate">悬赏任务</span>
                </div>
                {/* 其他（自定义） */}
                <div
                  onClick={() => {
                    setSelectedCategory('other');
                    setSelectedReason('');
                    setShowCategoryModal(false);
                  }}
                  className={`w-full px-4 py-3 rounded-acnh text-left cursor-pointer transition-all ${
                    selectedCategory === 'other' 
                      ? 'bg-primary text-white' 
                      : 'bg-white border-2 border-border hover:border-primary'
                  }`}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <Icon name="icon-variant" size={20} />
                  <span className="flex-1 text-sm truncate">其他（自定义）</span>
                </div>
              </div>

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <Button
                  type="default"
                  onClick={() => setShowCategoryModal(false)}
                >
                  取消
                </Button>
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
              zIndex: 999999,
              pointerEvents: 'auto',
              overflow: 'hidden',
              backdropFilter: 'blur(4px)',
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
              className="rounded-acnh shadow-acnh"
              style={{
                backgroundColor: '#f7f3df',
                padding: '28px',
                width: '90%',
                maxWidth: '420px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 700, textAlign: 'center', fontFamily: "Nunito, 'Zen Maru Gothic', sans-serif", color: '#725d42' }}>📋 注册</h3>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#725d42', fontFamily: "Nunito, sans-serif" }}>我是谁（英文名）：</label>
                <input
                  type="text"
                  value={registerEnglishName}
                  onChange={(e) => setRegisterEnglishName(e.target.value)}
                  placeholder="请输入你的英文名"
                  disabled={isRegistering}
                  className="w-full px-4 py-3 rounded-acnh border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  style={{
                    fontSize: '14px',
                    backgroundColor: isRegistering ? '#f5f5f5' : 'white',
                    color: isRegistering ? '#999' : '#333',
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#725d42', fontFamily: "Nunito, sans-serif" }}>昵称是什么：</label>
                <input
                  type="text"
                  value={registerNickname}
                  onChange={(e) => setRegisterNickname(e.target.value)}
                  placeholder="请输入你的昵称"
                  disabled={isRegistering}
                  className="w-full px-4 py-3 rounded-acnh border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  style={{
                    fontSize: '14px',
                    backgroundColor: isRegistering ? '#f5f5f5' : 'white',
                    color: isRegistering ? '#999' : '#333',
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#725d42', fontFamily: "Nunito, sans-serif" }}>推荐人是谁（选填）：</label>
                <input
                  type="text"
                  value={registerReferrer}
                  onChange={(e) => setRegisterReferrer(e.target.value)}
                  placeholder="请输入推荐人的名字（可选）"
                  disabled={isRegistering}
                  className="w-full px-4 py-3 rounded-acnh border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  style={{
                    fontSize: '14px',
                    backgroundColor: isRegistering ? '#f5f5f5' : 'white',
                    color: isRegistering ? '#999' : '#333',
                  }}
                />
              </div>
              {registerMessage && (
                <div className={`rounded-acnh p-3 mb-4 text-sm ${
                  registerMessage.includes('成功') ? 'bg-success/10 text-success border border-success/30' : 'bg-error/10 text-error border border-error/30'
                }`}>
                  {registerMessage}
                </div>
              )}
              <div className="flex gap-3">
                <Button 
                  type="default" 
                  block 
                  disabled={isRegistering}
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
                  取消
                </Button>
                <Button 
                  type="primary" 
                  block 
                  loading={isRegistering}
                  onClick={async () => {
                    if (!registerEnglishName.trim() || !registerNickname.trim()) {
                      setRegisterMessage('请填写完整信息');
                      return;
                    }
                    setIsRegistering(true);
                    try {
                      const response = await fetch('/api/admin/apply', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          type: 'register',
                          user_name: registerEnglishName.trim(),
                          user_nickname: registerNickname.trim(),
                          reason: registerReferrer.trim()
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
                >
                  {isRegistering ? '注册中...' : '注册'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 兑换申请模态框 */}
        {showRedemptionModal && (
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
              zIndex: 999999,
              pointerEvents: 'auto',
              overflow: 'hidden',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => {
              if (!isRedeeming) {
                setShowRedemptionModal(false);
                setRedemptionName('');
                setRedemptionItem('');
                setRedemptionMessage('');
                setShowRedeemSearchSuggestions(false);
              }
            }}
          >
            <div
              ref={(el) => { window.modalContainerRef = el; }}
              className="rounded-acnh shadow-acnh"
              style={{
                backgroundColor: '#f7f3df',
                padding: '28px',
                width: '90%',
                maxWidth: '420px',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 700, textAlign: 'center', fontFamily: "Nunito, 'Zen Maru Gothic', sans-serif", color: '#725d42' }}>🎁 积分兑换</h3>
              <div style={{ marginBottom: '16px', position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#725d42', fontFamily: "Nunito, sans-serif" }}>我是：</label>
                <input
                  type="text"
                  value={redemptionName}
                  onChange={(e) => {
                    setRedemptionName(e.target.value);
                    setShowRedeemSearchSuggestions(true);
                  }}
                  onFocus={() => setShowRedeemSearchSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowRedeemSearchSuggestions(false), 200)}
                  placeholder="请输入你的名字或昵称"
                  disabled={isRedeeming}
                  className="w-full px-4 py-3 rounded-acnh border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  style={{
                    fontSize: '14px',
                    backgroundColor: isRedeeming ? '#f5f5f5' : 'white',
                    color: isRedeeming ? '#999' : '#333',
                  }}
                />
                {redemptionName.trim() && showRedeemSearchSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-acnh shadow-acnh overflow-hidden z-50" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {users
                      .filter(user => 
                        user.name.toLowerCase().includes(redemptionName.toLowerCase()) ||
                        (user.displayName && user.displayName.toLowerCase().includes(redemptionName.toLowerCase()))
                      )
                      .slice(0, 10)
                      .map(user => {
                        const matchedOnDisplayName = user.displayName && user.displayName.toLowerCase().includes(redemptionName.toLowerCase());
                        const matchedOnName = user.name.toLowerCase().includes(redemptionName.toLowerCase());
                        const displayName = matchedOnDisplayName ? user.displayName : user.name;
                        
                        return (
                          <div
                            key={user.name}
                            onClick={() => {
                              setRedemptionName(displayName);
                              setRedemptionMessage('');
                              setShowRedeemSearchSuggestions(false);
                            }}
                            className="px-4 py-3 cursor-pointer hover:bg-primaryBg transition-colors border-b border-border last:border-b-0"
                          >
                            <span className="font-medium text-primary">{displayName}</span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#725d42', fontFamily: "Nunito, sans-serif" }}>兑换物品：</label>
                <Button
                  type={redemptionItem ? 'primary' : 'default'}
                  block
                  disabled={isRedeeming}
                  onClick={() => setShowRedemptionItemModal(true)}
                >
                  {redemptionItem ? redemptionItem.replace('兑换礼物', '').replace('积分', '积分 - ') : '请选择兑换物品'}
                </Button>
              </div>
              {redemptionMessage && (
                <div className={`rounded-acnh p-3 mb-4 text-sm ${
                  redemptionMessage.includes('成功') || redemptionMessage.includes('已提交') 
                    ? 'bg-success/10 text-success border border-success/30' 
                    : 'bg-error/10 text-error border border-error/30'
                }`}>
                  {redemptionMessage}
                </div>
              )}
              <div className="flex gap-3">
                <Button 
                  type="default" 
                  block 
                  disabled={isRedeeming}
                  onClick={() => {
                    if (!isRedeeming) {
                      setShowRedemptionModal(false);
                      setRedemptionName('');
                      setRedemptionItem('');
                      setRedemptionMessage('');
                      setShowRedeemSearchSuggestions(false);
                    }
                  }}
                >
                  取消
                </Button>
                <Button 
                  type="primary" 
                  block 
                  loading={isRedeeming}
                  onClick={async () => {
                    if (!redemptionName.trim() || !redemptionItem) {
                      setRedemptionMessage('请填写完整信息');
                      return;
                    }
                    setIsRedeeming(true);
                    
                    const searchName = redemptionName.trim();
                    const matchedUser = users.find(u => 
                      u.name.toLowerCase() === searchName.toLowerCase() || 
                      (u.nickname && u.nickname.toLowerCase() === searchName.toLowerCase())
                    );
                    const actualUserName = matchedUser ? matchedUser.name : searchName;
                    const actualNickname = matchedUser ? (matchedUser.nickname || '') : '';
                    
                    try {
                      const pointsCost = redemptionItem.startsWith('50') ? 50 : 100;
                      const response = await fetch('/api/admin/apply', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          type: 'redemption',
                          user_name: actualUserName,
                          user_nickname: actualNickname,
                          item_name: redemptionItem,
                          points_cost: pointsCost
                        })
                      });
                      const result = await response.json();
                      setRedemptionMessage(result.message || result.error);
                      if (result.success) {
                        setTimeout(() => {
                          setShowRedemptionModal(false);
                          setRedemptionName('');
                          setRedemptionItem('');
                          setRedemptionMessage('');
                        }, 2000);
                      }
                    } catch (error) {
                      setRedemptionMessage('提交失败，请稍后重试');
                    } finally {
                      setIsRedeeming(false);
                    }
                  }}
                >
                  {isRedeeming ? '提交中...' : '提交'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 兑换物品选择模态框 - 全屏居中 */}
        {showRedemptionItemModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999999,
              pointerEvents: 'auto',
              padding: '20px',
            }}
            onClick={() => setShowRedemptionItemModal(false)}
          >
            <div
              className="rounded-acnh shadow-acnh"
              style={{
                backgroundColor: '#f7f3df',
                padding: '24px',
                width: '100%',
                maxWidth: '360px',
                maxHeight: '70vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700, textAlign: 'center', fontFamily: "Nunito, 'Zen Maru Gothic', sans-serif", color: '#725d42' }}>🎁 选择兑换物品</h3>
              
              <div className="space-y-2">
                {[
                  { key: '50积分兑换礼物', label: '50积分 - 兑换礼物', cost: 50 },
                  { key: '100积分兑换礼物', label: '100积分 - 兑换礼物', cost: 100 },
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => {
                      setRedemptionItem(item.key);
                      setShowRedemptionItemModal(false);
                    }}
                    className={`w-full px-4 py-3 rounded-acnh text-left cursor-pointer transition-all ${
                      redemptionItem === item.key 
                        ? 'bg-primary text-white' 
                        : 'bg-white border-2 border-border hover:border-primary'
                    }`}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}
                  >
                    <span className="flex-1 text-sm truncate">{item.label}</span>
                    <span className={`text-sm font-medium whitespace-nowrap ${
                      redemptionItem === item.key ? 'text-white' : 'text-primary'
                    }`}>-{item.cost}积分</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <Button
                  type="default"
                  onClick={() => setShowRedemptionItemModal(false)}
                >
                  取消
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
      )}
    </Cursor>
    </>
  );
}

export default App;