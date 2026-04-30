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

const usersMap = {};
const displayNameMap = {};
data.users.forEach(user => {
  usersMap[user.name] = user;
  displayNameMap[user.displayName] = user;
});

let laborDayParticipants = {};

function findUserByName(name) {
  if (usersMap[name]) {
    return usersMap[name];
  }
  if (displayNameMap[name]) {
    return displayNameMap[name];
  }
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
