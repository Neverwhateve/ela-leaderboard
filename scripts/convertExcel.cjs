const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = path.join(__dirname, '../ELA Data.xlsx');
const workbook = XLSX.readFile(excelPath);

function excelDateToString(serial) {
  if (typeof serial === 'number' && serial > 25569 && serial < 2958465) {
    const date = XLSX.SSF.parse_date_code(serial);
    return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
  }
  return String(serial);
}

let usersSheet = null;
let historySheet = null;
let redeemSheet = null;

workbook.SheetNames.forEach(sheetName => {
  if (sheetName === '同事信息') {
    usersSheet = workbook.Sheets[sheetName];
  } else if (sheetName === '经验值记录') {
    historySheet = workbook.Sheets[sheetName];
  } else if (sheetName === '积分兑换记录') {
    redeemSheet = workbook.Sheets[sheetName];
  }
});

if (!usersSheet) {
  console.error('❌ 未找到"同事信息"工作表');
  process.exit(1);
}

const usersData = XLSX.utils.sheet_to_json(usersSheet);
const users = [];

usersData.forEach((row, index) => {
  users.push({
    id: `user_${index + 1}`,
    name: row['姓名'] || '',
    displayName: row['昵称'] || row['姓名'] || '',
    title: row['称号'] || '',
    xp: 0,
    points: 0,
    xpHistory: [],
    redeemHistory: []
  });
});

if (historySheet) {
  const historyData = XLSX.utils.sheet_to_json(historySheet);
  
  historyData.forEach(record => {
    const userName = record['姓名'];
    const user = users.find(u => u.name === userName || u.displayName === userName);
    
    if (user) {
      const amount = parseInt(record['经验值变化']) || 0;
      user.xp += amount;
      user.xpHistory.push({
        date: excelDateToString(record['日期']),
        reason: record['原因'] || '',
        amount: amount
      });
    }
  });
}

if (redeemSheet) {
  const redeemData = XLSX.utils.sheet_to_json(redeemSheet);
  
  redeemData.forEach(record => {
    const userName = record['姓名'];
    const user = users.find(u => u.name === userName || u.displayName === userName);
    
    if (user) {
      const points = parseInt(record['消耗积分']) || 0;
      user.points += points;
      user.redeemHistory.push({
        date: excelDateToString(record['日期']),
        item: record['兑换物品'] || '',
        points: points
      });
    }
  });
}

let latestRecords = [];
if (historySheet) {
  const historyData = XLSX.utils.sheet_to_json(historySheet);
  const last10Records = historyData.slice(-10);
  
  last10Records.forEach(record => {
    const userName = record['姓名'];
    const user = users.find(u => u.name === userName || u.displayName === userName);
    
    if (user) {
      latestRecords.push({
        displayName: user.displayName,
        date: excelDateToString(record['日期']),
        reason: record['原因'] || '',
        amount: parseInt(record['经验值变化']) || 0
      });
    }
  });
}

const outputPath = path.join(__dirname, '../src/data.json');
const outputData = {
  users,
  latestRecords
};
fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');

console.log(`✅ Excel转换完成，生成了 ${users.length} 条记录`);
console.log(`📊 数据统计：`);
users.forEach(user => {
  if (user.xp > 0 || user.points > 0) {
    const availablePoints = user.xp - user.points;
    console.log(`   ${user.displayName}: 总积分${user.xp}, 可用${availablePoints}, 已兑换${user.points}`);
  }
});
