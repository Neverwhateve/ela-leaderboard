const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const excelPath = path.join(__dirname, '../ELA Data.xlsx');
const workbook = XLSX.readFile(excelPath);

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

console.log('📊 从 Excel 文件读取数据...');

// 从 Excel 读取用户列表
const usersFromExcel = XLSX.utils.sheet_to_json(usersSheet);
const excelUserMap = new Map();

usersFromExcel.forEach(row => {
  const name = row['姓名'] || '';
  if (name) {
    excelUserMap.set(name, {
      name,
      nickname: row['昵称'] || name,
      totalXP: 0,
      totalRedeemed: 0
    });
  }
});

// 计算总经验值
if (historySheet) {
  const historyData = XLSX.utils.sheet_to_json(historySheet);
  historyData.forEach(record => {
    const userName = record['姓名'];
    const userData = excelUserMap.get(userName);
    if (userData) {
      const amount = parseInt(record['经验值变化']) || 0;
      userData.totalXP += amount;
    }
  });
}

// 计算总已兑换积分
if (redeemSheet) {
  const redeemData = XLSX.utils.sheet_to_json(redeemSheet);
  redeemData.forEach(record => {
    const userName = record['姓名'];
    const userData = excelUserMap.get(userName);
    if (userData) {
      const points = parseInt(record['消耗积分']) || 0;
      userData.totalRedeemed += points;
    }
  });
}

console.log('✅ Excel 数据解析完成');
console.log('');

// Generate SQL
let sqlStatements = [];
sqlStatements.push('-- 更新用户总经验值和可用积分的 SQL 脚本');
sqlStatements.push('-- 生成时间: ' + new Date().toISOString());
sqlStatements.push('');

for (const [userName, userData] of excelUserMap) {
  const points = userData.totalXP - userData.totalRedeemed;
  // Escape single quotes in nickname
  const escapedNickname = userData.nickname.replace(/'/g, "''");
  sqlStatements.push(`UPDATE xp_total SET total_xp = ${userData.totalXP}, points = ${points}, nickname = '${escapedNickname}' WHERE name = '${userName}';`);
}

const sqlPath = path.join(__dirname, '../scripts/update_points_from_excel.sql');
fs.writeFileSync(sqlPath, sqlStatements.join('\n'), 'utf-8');

console.log('✅ SQL 文件已生成: ' + sqlPath);
console.log('');
console.log('📋 生成的统计:');
for (const [userName, userData] of excelUserMap) {
  const points = userData.totalXP - userData.totalRedeemed;
  console.log(`  ${userName} (${userData.nickname}): 总经验=${userData.totalXP}, 已兑换=${userData.totalRedeemed}, 可用积分=${points}`);
}
