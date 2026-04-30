import React, { useState } from 'react';
import 'animal-island-ui/style';
import laborDayData from './laborDay.json';
import data from './data.json';

const LaborDayEvent = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const usersMap = {};
  data.users.forEach(u => {
    usersMap[u.id] = u;
  });

  const sortedParticipants = [...laborDayData.participants]
    .filter(p => p.laborDayXP > 0 || p.laborDayRedeemed > 0)
    .sort((a, b) => b.laborDayXP - a.laborDayXP);

  const usersWithRank = [];
  sortedParticipants.forEach((participant, index) => {
    let rank = index + 1;
    if (index > 0) {
      const previousScore = sortedParticipants[index - 1].laborDayXP;
      const currentScore = participant.laborDayXP;
      if (previousScore === currentScore) {
        rank = usersWithRank[index - 1].rank;
      }
    }
    const user = usersMap[participant.id];
    const redeemedPoints = user?.laborDayRedeemed || participant.laborDayRedeemed || 0;
    usersWithRank.push({
      ...participant,
      rank,
      displayName: user?.displayName || participant.displayName,
      remainingXP: participant.laborDayXP - redeemedPoints
    });
  });

  const filteredParticipants = usersWithRank.filter(p =>
    p.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedParticipants = searchTerm 
    ? filteredParticipants 
    : filteredParticipants.slice(0, 25);

  return (
    <div className="min-h-screen p-2 md:p-4 font-acnh text-text">
      <div className="max-w-lg mx-auto">
        <button
          onClick={onBack}
          className="mb-2 flex items-center gap-1 px-2 py-1 bg-primary text-white rounded-acnh hover:bg-primaryHover transition-colors shadow-acnh text-xs"
        >
          <span>←</span> 返回
        </button>

        <div className="bg-gradient-to-br from-warning/10 via-primary/5 to-success/10 rounded-acnh-lg p-3 md:p-4 shadow-acnh-lg border-2 border-warning/30 relative overflow-hidden mb-2">
          <div className="absolute top-0 right-0 w-20 h-20 bg-warning/10 rounded-full -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 bg-primary/10 rounded-full -ml-6 -mb-6"></div>

          <div className="relative z-10 text-center">
            <h1
              className="mb-1 flex items-center justify-center gap-2 flex-wrap"
              style={{
                fontFamily: "Nunito, 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                color: '#FFF9E6',
                textShadow: '0px 3px 1px rgba(0, 0, 0, 0.4)',
              }}
            >
              <span className="text-2xl">🎉</span> 五一劳动节特别活动
            </h1>
            <p style={{
              fontFamily: "Nunito, 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              color: '#725d42',
              margin: 0,
              marginBottom: '8px',
            }}>{laborDayData.eventDateRange}</p>
            <p style={{
              fontFamily: "Nunito, 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
              fontSize: '11px',
              fontWeight: 600,
              color: '#725d42',
              margin: 0,
            }}>假期特别任务积分 · 不计入总积分</p>
          </div>
        </div>

        <div className="rounded-acnh-lg p-2 md:p-3 shadow-acnh-lg" style={{ backgroundColor: '#f7f3df' }}>
          <h2 style={{
            fontFamily: "Nunito, 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
            fontSize: '16px',
            fontWeight: 700,
            color: '#725d42',
            margin: 0,
            marginBottom: '8px',
            textAlign: 'center',
          }}>🏆 活动积分排行榜</h2>

          <div className="relative mb-2">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-textSecondary text-xs">🔍</span>
            <input
              type="text"
              placeholder="搜索玩家..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-3 py-1 bg-white/80 border-2 border-warning/30 rounded-acnh text-xs focus:outline-none focus:border-warning/60 transition-colors"
              style={{ color: '#725d42' }}
            />
          </div>

          <div className="space-y-1">
            {displayedParticipants.length === 0 ? (
              <div className="py-6 text-center">
                {searchTerm ? (
                  <>
                    <div className="text-3xl mb-1">🔍</div>
                    <p className="text-sm text-textSecondary">未找到匹配</p>
                  </>
                ) : (
                  <>
                    <div className="text-3xl mb-1">🌱</div>
                    <p className="text-sm text-textSecondary">活动即将开始</p>
                  </>
                )}
              </div>
            ) : (
              displayedParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
                    participant.rank <= 3
                      ? 'bg-warning/15 border border-warning/30'
                      : 'hover:bg-warning/5'
                  }`}
                >
                  <div className="w-6 flex items-center justify-center flex-shrink-0">
                    {participant.rank === 1 && <span className="text-warning text-base">🥇</span>}
                    {participant.rank === 2 && <span className="text-textSecondary text-base">🥈</span>}
                    {participant.rank === 3 && <span className="text-acnhBrown text-base">🥉</span>}
                    {participant.rank > 3 && <span className="font-bold text-textSecondary text-xs">{participant.rank}</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text truncate text-xs" style={{ margin: 0 }}>
                      {participant.displayName}
                    </p>
                  </div>

                  <div className="flex-shrink-0 text-right w-14">
                    <div className="text-xs tabular-nums">
                      <span className="font-bold text-warning">{participant.laborDayXP}</span>
                      <span className="text-textSecondary">分</span>
                    </div>
                    <div className="text-xs tabular-nums">
                      <span className="font-bold text-primary">{participant.remainingXP}</span>
                      <span className="text-textSecondary">剩</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-2 text-center">
          <p className="text-textSecondary text-xs">
            💡 如有疑问请联系管理员
          </p>
        </div>
      </div>
    </div>
  );
};

export default LaborDayEvent;
