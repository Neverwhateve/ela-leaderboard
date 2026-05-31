import React, { useState, useEffect } from 'react';

const ACADEMIES = ['种草实验室', '隐藏技能局', '偶像集中营'];

const calculateLevel = (xp) => {
  if (xp >= 300) return 'Lv3';
  if (xp >= 100) return 'Lv2';
  return 'Lv1';
};

const getLevelColor = (level) => {
  switch (level) {
    case 'Lv3': return '#FFD700';
    case 'Lv2': return '#C0C0C0';
    case 'Lv1': return '#CD7F32';
    default: return '#CD7F32';
  }
};

const AcademyPage = ({ onBack, users, academies }) => {
  const [selectedAcademy, setSelectedAcademy] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [visibleMembers, setVisibleMembers] = useState([]);

  useEffect(() => {
    if (selectedAcademy && showMembers) {
      const members = academies[selectedAcademy] || [];
      setVisibleMembers([]);
      
      members.forEach((_, index) => {
        setTimeout(() => {
          setVisibleMembers(prev => [...prev, index]);
        }, index * 150);
      });
    } else {
      setVisibleMembers([]);
    }
  }, [selectedAcademy, showMembers, academies]);

  const handleAcademyClick = (academy) => {
    if (selectedAcademy === academy) {
      setSelectedAcademy(null);
      setShowMembers(false);
    } else {
      setSelectedAcademy(academy);
      setShowMembers(false);
      setTimeout(() => setShowMembers(true), 300);
    }
  };

  const getMemberPosition = (index, total) => {
    const radius = Math.min(180, 100 + total * 5);
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y };
  };

  return (
    <div 
      className="min-h-screen p-4 md:p-8 font-acnh text-text relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 40%)',
        }}
      />

      <div className="relative z-10">
        <div className="flex justify-center mb-8">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-xl text-white font-medium transition-all hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            ← 返回首页
          </button>
        </div>

        <div className="text-center mb-12">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              fontFamily: "Nunito, 'Zen Maru Gothic', sans-serif",
              color: '#FFF9E6',
              textShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            🏫 学院成员榜
          </h1>
          <p 
            className="text-lg"
            style={{
              fontFamily: "Nunito, 'Zen Maru Gothic', sans-serif",
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            点击学院图标查看成员
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-8 md:gap-12">
          {selectedAcademy ? (
            <div className="relative flex flex-col items-center">
              <div 
                className="relative cursor-pointer transition-all duration-500 hover:scale-105"
                onClick={() => handleAcademyClick(selectedAcademy)}
              >
                <img
                  src={`/Lv/${selectedAcademy}.png`}
                  alt={selectedAcademy}
                  className="w-48 h-48 md:w-64 md:h-64 object-contain rounded-3xl"
                  style={{
                    filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))',
                  }}
                />
                <div 
                  className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-2 rounded-full text-white font-bold text-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {selectedAcademy}
                </div>
              </div>

              {showMembers && (
                <div className="relative mt-16" style={{ width: '400px', height: '400px' }}>
                  {(academies[selectedAcademy] || []).map((userName, index) => {
                    const user = users.find(u => u.name === userName);
                    const level = user ? calculateLevel(user.xp) : 'Lv1';
                    const { x, y } = getMemberPosition(index, academies[selectedAcademy].length);
                    const isVisible = visibleMembers.includes(index);

                    return (
                      <div
                        key={userName}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                        style={{
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                          opacity: isVisible ? 1 : 0,
                          transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 0})`,
                        }}
                      >
                        <div
                          className="px-4 py-2 rounded-xl text-center whitespace-nowrap"
                          style={{
                            background: 'rgba(255, 255, 255, 0.25)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                          }}
                        >
                          <div className="font-medium text-white text-sm">
                            {user?.displayName || userName}
                          </div>
                          <div 
                            className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block"
                            style={{ 
                              backgroundColor: getLevelColor(level),
                              color: level === 'Lv3' ? '#333' : '#fff',
                            }}
                          >
                            {level}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-4 mt-8">
                {ACADEMIES.filter(a => a !== selectedAcademy).map((academy) => (
                  <button
                    key={academy}
                    onClick={() => handleAcademyClick(academy)}
                    className="relative transition-all duration-300 hover:scale-110"
                  >
                    <img
                      src={`/Lv/${academy}.png`}
                      alt={academy}
                      className="w-20 h-20 md:w-24 md:h-24 object-contain rounded-2xl opacity-70 hover:opacity-100"
                      style={{
                        filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))',
                      }}
                    />
                    <div 
                      className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-white whitespace-nowrap"
                      style={{
                        textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                      }}
                    >
                      {academy}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              {ACADEMIES.map((academy) => (
                <button
                  key={academy}
                  onClick={() => handleAcademyClick(academy)}
                  className="relative transition-all duration-300 hover:scale-110 group"
                >
                  <div
                    className="p-4 rounded-3xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <img
                      src={`/Lv/${academy}.png`}
                      alt={academy}
                      className="w-40 h-40 md:w-48 md:h-48 object-contain"
                      style={{
                        filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.3))',
                      }}
                    />
                    <div 
                      className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-white font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: 'rgba(255, 255, 255, 0.3)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      {(academies[academy] || []).length} 位成员
                    </div>
                  </div>
                  <div 
                    className="mt-4 text-center text-white font-bold text-lg"
                    style={{
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    }}
                  >
                    {academy}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademyPage;
