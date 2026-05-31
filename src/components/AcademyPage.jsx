import React, { useState, useEffect } from 'react';
import { Time } from 'animal-island-ui';

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
    <div className="min-h-screen p-4 md:p-8 font-acnh text-text relative">
      <div 
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage: 'url("/home_bg.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative z-10">
        <div className="flex justify-center mb-8">
          <button
            onClick={onBack}
            className="px-4 py-3 bg-primary text-white rounded-acnh hover:bg-primaryHover transition-colors font-medium shadow-acnh flex items-center gap-2"
          >
            ← 返回首页
          </button>
        </div>

        <div className="text-center mb-8">
          <h1
            className="mb-2 animate-float"
            style={{
              fontFamily: "Nunito, 'Zen Maru Gothic', sans-serif",
              fontSize: 'clamp(2.5rem, 5vw, 60px)',
              fontWeight: 800,
              lineHeight: 1.1,
              color: '#FFF9E6',
              textShadow: '0px 4px 1px rgba(0, 0, 0, 0.4)',
            }}
          >
            🏫 学院成员榜
          </h1>
          <div className="flex justify-center mb-4">
            <Time />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-8 md:gap-12">
          {selectedAcademy ? (
            <div className="relative flex flex-col items-center">
              <div 
                className="cursor-pointer transition-all duration-500 hover:scale-105 p-6 rounded-acnh shadow-acnh"
                style={{ backgroundColor: '#f7f3df' }}
                onClick={() => handleAcademyClick(selectedAcademy)}
              >
                <img
                  src={`/Lv/${selectedAcademy}.png`}
                  alt={selectedAcademy}
                  className="w-40 h-40 md:w-48 md:h-48 object-contain"
                  style={{
                    filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.3))',
                  }}
                />
                <h2 
                  className="text-center mt-4 text-xl font-bold"
                  style={{
                    fontFamily: "Nunito, 'Zen Maru Gothic', sans-serif",
                    color: '#725d42',
                  }}
                >
                  {selectedAcademy}
                </h2>
              </div>

              {showMembers && (
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  {(academies[selectedAcademy] || []).map((member, index) => {
                    const { name: userName, level: memberLevel } = member;
                    const user = users.find(u => u.name === userName);
                    const level = memberLevel || 'Lv1';
                    const isVisible = visibleMembers.includes(index);

                    return (
                      <div
                        key={userName}
                        className="transition-all duration-500"
                        style={{
                          opacity: isVisible ? 1 : 0,
                          transform: `scale(${isVisible ? 1 : 0})`,
                        }}
                      >
                        <div
                          className="px-4 py-3 rounded-acnh text-center whitespace-nowrap shadow-acnh"
                          style={{
                            backgroundColor: '#f7f3df',
                          }}
                        >
                          <div className="font-medium text-base" style={{ color: '#725d42' }}>
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

              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {ACADEMIES.filter(a => a !== selectedAcademy).map((academy) => (
                  <button
                    key={academy}
                    onClick={() => handleAcademyClick(academy)}
                    className="relative transition-all duration-300 hover:scale-110 p-4 rounded-acnh shadow-acnh"
                    style={{ backgroundColor: '#f7f3df' }}
                  >
                    <img
                      src={`/Lv/${academy}.png`}
                      alt={academy}
                      className="w-16 h-16 md:w-20 md:h-20 object-contain"
                      style={{
                        filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))',
                      }}
                    />
                    <div 
                      className="mt-2 text-center text-sm font-medium"
                      style={{ color: '#725d42' }}
                    >
                      {academy}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {ACADEMIES.map((academy) => (
                <button
                  key={academy}
                  onClick={() => handleAcademyClick(academy)}
                  className="relative transition-all duration-300 hover:scale-105 p-6 rounded-acnh shadow-acnh"
                  style={{ backgroundColor: '#f7f3df' }}
                >
                  <img
                    src={`/Lv/${academy}.png`}
                    alt={academy}
                    className="w-32 h-32 md:w-40 md:h-40 object-contain"
                    style={{
                      filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.3))',
                    }}
                  />
                  <div 
                    className="mt-4 text-center text-xl font-bold"
                    style={{
                      fontFamily: "Nunito, 'Zen Maru Gothic', sans-serif",
                      color: '#725d42',
                    }}
                  >
                    {academy}
                  </div>
                  <div 
                    className="mt-2 text-center text-sm font-medium"
                    style={{
                      color: '#7c5734',
                    }}
                  >
                    {(academies[academy] || []).length} 位成员
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
