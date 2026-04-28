import React from 'react';
import 'animal-island-ui/style';
import laborDayData from './laborDay.json';
import usersData from './data.json';

const LaborDayEvent = ({ onBack }) => {
  const sortedParticipants = [...laborDayData.participants]
    .filter(p => p.laborDayXP > 0)
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
    const user = usersData.find(u => u.id === participant.id);
    usersWithRank.push({ ...participant, rank, displayName: user?.displayName || participant.displayName });
  });

  return (
    <div className="min-h-screen p-4 md:p-8 font-acnh text-text">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-acnh hover:bg-primaryHover transition-colors shadow-acnh"
        >
          <span>←</span> 返回主页
        </button>

        <div className="bg-gradient-to-br from-warning/10 via-primary/5 to-success/10 rounded-acnh-lg p-6 shadow-acnh-lg border-2 border-warning/30 relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-warning/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10 text-center">
            <h1
              className="mb-2 flex items-center justify-center gap-3"
              style={{
                fontFamily: "Nunito, 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                fontSize: 'clamp(1.875rem, 4vw, 2.5rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                color: '#FFF9E6',
                textShadow: '0px 4px 1px rgba(0, 0, 0, 0.4)',
              }}
            >
              <span className="text-4xl">🎉</span> 五一劳动节特别活动
            </h1>
            <p style={{
              fontFamily: "Nunito, 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
              fontSize: '18px',
              fontWeight: 500,
              color: '#725d42',
              margin: 0,
              marginBottom: '16px',
            }}>{laborDayData.eventDateRange}</p>
            <div className="inline-block glassmorphism px-6 py-3 rounded-acnh">
              <p className="text-sm" style={{ color: '#9f927d' }}>活动说明</p>
              <p style={{
                fontFamily: "Nunito, 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                color: '#725d42',
              }}>假期特别任务积分 · 不计入总积分，单独计算排名！</p>
            </div>
          </div>
        </div>

        <div className="rounded-acnh-lg p-6 shadow-acnh-lg" style={{ backgroundColor: '#f7f3df' }}>
          <h2 style={{
            fontFamily: "Nunito, 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
            fontSize: '24px',
            fontWeight: 700,
            color: '#725d42',
            margin: 0,
            marginBottom: '24px',
            textAlign: 'center',
          }}>🏆 活动积分排行榜</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] border-collapse">
              <thead>
                <tr className="bg-warning/20">
                  <th className="py-3 px-4 text-left font-semibold text-warning border-b-2 border-warning w-16">排名</th>
                  <th className="py-3 px-4 text-left font-semibold text-warning border-b-2 border-warning">玩家名</th>
                  <th className="py-3 px-4 text-left font-semibold text-warning border-b-2 border-warning w-32">活动积分</th>
                </tr>
              </thead>
              <tbody>
                {usersWithRank.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-12 text-center">
                      <div className="text-5xl mb-3">🌱</div>
                      <p className="text-lg text-textSecondary">活动即将开始，敬请期待！</p>
                      <p className="text-sm text-textDisabled mt-2">2026-05-01 至 2026-05-05</p>
                    </td>
                  </tr>
                ) : (
                  usersWithRank.map((participant) => (
                    <tr 
                      key={participant.id}
                      className={`hover:bg-warning/10 transition-colors ${participant.rank <= 3 ? 'font-bold' : ''}`}
                    >
                      <td className="py-3 px-4 font-medium w-16">
                        <div className="flex items-center h-8">
                          {participant.rank === 1 && <span className="text-warning text-2xl">🥇</span>}
                          {participant.rank === 2 && <span className="text-textSecondary text-2xl">🥈</span>}
                          {participant.rank === 3 && <span className="text-acnhBrown text-2xl">🥉</span>}
                          {participant.rank > 3 && <span className="w-8 text-center">{participant.rank}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-text">
                        {participant.displayName}
                      </td>
                      <td className="py-3 px-4 font-bold text-warning text-lg w-32">
                        {participant.laborDayXP}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-textSecondary text-sm">
            💡 如有疑问，请联系活动管理员
          </p>
        </div>
      </div>
    </div>
  );
};

export default LaborDayEvent;