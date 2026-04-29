import { useState, useEffect } from 'react';

const Danmaku = ({ records, play }) => {
  const [visibleDanmakus, setVisibleDanmakus] = useState([]);

  useEffect(() => {
    if (!records || records.length === 0 || !play) {
      setVisibleDanmakus([]);
      return;
    }

    records.forEach((record, index) => {
      const uniqueId = `${record.displayName}-${record.reason}-${record.amount}-${Date.now()}-${index}`;
      const newDanmaku = {
        id: uniqueId,
        ...record,
        top: 10 + (index * 8) % 60,
        duration: 8 + Math.random() * 2,
        delay: index * 0.6
      };

      const showTimer = setTimeout(() => {
        setVisibleDanmakus(prev => [...prev, newDanmaku]);
      }, index * 600);

      const removeTimer = setTimeout(() => {
        setVisibleDanmakus(prev => prev.filter(d => d.id !== newDanmaku.id));
      }, (newDanmaku.duration + newDanmaku.delay + 1) * 1000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(removeTimer);
      };
    });
  }, [records, play]);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-50"
      style={{ top: '60px' }}
    >
      {visibleDanmakus.map(danmaku => (
        <div
          key={danmaku.id}
          className="absolute whitespace-nowrap"
          style={{
            top: `${danmaku.top}%`,
            right: '-300px',
            animation: `danmakuMove ${danmaku.duration}s linear ${danmaku.delay}s forwards`,
            fontSize: '16px',
            fontWeight: 600,
            color: '#FFF9E6',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5), 0 0 10px rgba(25, 200, 185, 0.5)',
            padding: '4px 12px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '20px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <span className="mr-2">🎊</span>
          <span>{danmaku.displayName}</span>
          <span className="mx-2">{danmaku.reason}</span>
          <span className="font-bold">+{danmaku.amount}</span>
        </div>
      ))}
      <style>{`
        @keyframes danmakuMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100vw - 400px)); }
        }
      `}</style>
    </div>
  );
};

export default Danmaku;
