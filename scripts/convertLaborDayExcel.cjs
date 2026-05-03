const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = path.join(__dirname, '../五一特别活动.xlsx');

if (!fs.existsSync(excelPath)) {
  console.error('❌ 未找到"五一特别活动.xlsx"文件');
  console.log('请先运行 npm run labor-day-template 生成模板');
  process.exit(1);
}

const workbook = XLSX.readFile(excelPath);

function excelDateToString(serial) {
  if (typeof serial === 'number' && serial > 25569 && serial < 2958465) {
    const date = XLSX.SSF.parse_date_code(serial);
    return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
  }
  return String(serial);
}

let historySheet = null;
let redeemSheet = null;

workbook.SheetNames.forEach(sheetName => {
  if (sheetName === '活动积分记录') {
    historySheet = workbook.Sheets[sheetName];
  } else if (sheetName === '活动积分兑换') {
    redeemSheet = workbook.Sheets[sheetName];
  }
});

const dataPath = path.join(__dirname, '../src/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

let laborDayParticipants = {};

// 智能匹配用户函数
function findUserByName(inputName) {
  if (!inputName) return null;
  
  const searchName = String(inputName).trim().toLowerCase();
  
  // 精确匹配（不区分大小写）
  let match = data.users.find(u => 
    (u.name && u.name.toLowerCase() === searchName) ||
    (u.displayName && u.displayName.toLowerCase() === searchName)
  );
  if (match) return match;
  
  // 包含匹配（不区分大小写）
  match = data.users.find(u => 
    (u.name && u.name.toLowerCase().includes(searchName)) ||
    (u.displayName && u.displayName.toLowerCase().includes(searchName))
  );
  if (match) return match;
  
  // 反过来匹配（输入的名称包含在用户信息里）
  match = data.users.find(u => 
    (u.name && searchName.includes(u.name.toLowerCase())) ||
    (u.displayName && searchName.includes(u.displayName.toLowerCase()))
  );
  if (match) return match;
  
  // 部分匹配（去掉空格和特殊字符）
  const cleanSearch = searchName.replace(/[\s\-_\.]+/g, '');
  match = data.users.find(u => {
    const cleanName = (u.name || '').toLowerCase().replace(/[\s\-_\.]+/g, '');
    const cleanDisplayName = (u.displayName || '').toLowerCase().replace(/[\s\-_\.]+/g, '');
    return cleanName === cleanSearch || cleanDisplayName === cleanSearch ||
           cleanName.includes(cleanSearch) || cleanDisplayName.includes(cleanSearch);
  });
  if (match) return match;
  
  return null;
}

function getOrCreateParticipant(userName) {
  if (!userName) {
    return null;
  }
  const user = findUserByName(userName);
  if (user) {
    if (!laborDayParticipants[user.name]) {
      laborDayParticipants[user.name] = {
        id: user.id,
        displayName: user.displayName,
        laborDayXP: 0,
        laborDayRedeemed: 0
      };
    }
    return laborDayParticipants[user.name];
  } else {
    if (!laborDayParticipants[userName]) {
      laborDayParticipants[userName] = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        displayName: userName,
        laborDayXP: 0,
        laborDayRedeemed: 0
      };
    }
    return laborDayParticipants[userName];
  }
}

if (historySheet) {
  const historyData = XLSX.utils.sheet_to_json(historySheet);
  historyData.forEach(record => {
    const userName = record['姓名'];
    const participant = getOrCreateParticipant(userName);
    if (participant) {
      const amount = parseInt(record['积分变化']) || 0;
      participant.laborDayXP += amount;
    }
  });
}

if (redeemSheet) {
  const redeemData = XLSX.utils.sheet_to_json(redeemSheet);
  redeemData.forEach(record => {
    const userName = record['姓名'];
    const participant = getOrCreateParticipant(userName);
    if (participant) {
      const points = parseInt(record['消耗积分']) || 0;
      participant.laborDayRedeemed += points;
    }
  });
}

data.users.forEach(user => {
  if (laborDayParticipants[user.name]) {
    user.laborDayXP = laborDayParticipants[user.name].laborDayXP;
    user.laborDayRedeemed = laborDayParticipants[user.name].laborDayRedeemed;
  } else {
    user.laborDayXP = 0;
    user.laborDayRedeemed = 0;
  }
});

const laborDayOutputPath = path.join(__dirname, '../src/laborDay.json');
const laborDayData = {
  eventName: '五一劳动节特别活动',
  eventDateRange: '2026-05-01 至 2026-05-05',
  eventDescription: '五一假期期间的特殊活动积分，不计入总积分，单独计算排名！',
  participants: Object.values(laborDayParticipants)
};
fs.writeFileSync(laborDayOutputPath, JSON.stringify(laborDayData, null, 2), 'utf-8');

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

console.log('✅ 五一特别活动数据已更新');
console.log('');
console.log('📊 活动统计：');
const participants = Object.values(laborDayParticipants).filter(p => p.laborDayXP > 0 || p.laborDayRedeemed > 0);
participants.sort((a, b) => b.laborDayXP - a.laborDayXP);
participants.forEach(p => {
  const remaining = p.laborDayXP - p.laborDayRedeemed;
  console.log(`   ${p.displayName}: 活动积分${p.laborDayXP}, 已兑换${p.laborDayRedeemed}, 剩余${remaining}`);
});
