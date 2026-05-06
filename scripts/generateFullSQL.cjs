
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

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
  console.error('未找到"同事信息"工作表');
  process.exit(1);
}

console.log('从 Excel 文件读取数据...');

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

// 先按用户和日期对记录进行排序，以便正确计算 balance_after
let historyRecords = [];
const userBalances = {}; // 用于跟踪每个用户的余额

if (historySheet) {
  const historyData = XLSX.utils.sheet_to_json(historySheet);
  
  // 先按日期和顺序对记录进行排序
  historyData.sort((a, b) => {
    const dateA = excelDateToString(a['日期']);
    const dateB = excelDateToString(b['日期']);
    return dateA.localeCompare(dateB);
  });
  
  historyData.forEach((record, index) => {
    const userName = record['姓名'];
    const userData = excelUserMap.get(userName);
    if (userData) {
      const amount = parseInt(record['经验值变化']) || 0;
      const date = excelDateToString(record['日期']);
      const reason = record['原因'] || '';
      
      // 初始化或更新用户余额
      if (!userBalances[userName]) {
        userBalances[userName] = 0;
      }
      userBalances[userName] += amount;
      
      userData.totalXP += amount;
      historyRecords.push({
        id: index + 1,
        user_name: userName,
        user_nickname: userData.nickname,
        change_amount: amount,
        balance_after: userBalances[userName],
        reason: reason,
        created_at: date,
        type: 'auto_approved',
        created_by: 'system'
      });
    }
  });
}

let redeemRecords = [];
if (redeemSheet) {
  const redeemData = XLSX.utils.sheet_to_json(redeemSheet);
  redeemData.forEach((record, index) => {
    const userName = record['姓名'];
    const userData = excelUserMap.get(userName);
    if (userData) {
      const points = parseInt(record['消耗积分']) || 0;
      const date = excelDateToString(record['日期']);
      const item = record['兑换物品'] || '';
      
      userData.totalRedeemed += points;
      redeemRecords.push({
        id: index + 1,
        user_name: userName,
        user_nickname: userData.nickname,
        item_name: item,
        points_cost: points,
        created_at: date,
        status: 'approved',
        reviewed_by: 'system',
        reviewed_at: date
      });
    }
  });
}

console.log('Excel 数据解析完成');
console.log('');

let sqlStatements = [];
sqlStatements.push('-- 完整更新 SQL 脚本');
sqlStatements.push('-- 生成时间: ' + new Date().toISOString());
sqlStatements.push('');

// 1. 添加 points 列（如果不存在）
sqlStatements.push('-- 1. 添加 points 列（如果不存在）');
sqlStatements.push('ALTER TABLE xp_total ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;');
sqlStatements.push('');

// 2. 清空旧数据（可选，先备份）
sqlStatements.push('-- 2. 清空旧的积分记录和兑换记录（可选，先备份）');
sqlStatements.push('-- 如果你不想清空旧数据，请注释掉下面两行');
sqlStatements.push('TRUNCATE TABLE point_transactions;');
sqlStatements.push('TRUNCATE TABLE redemption_requests;');
sqlStatements.push('');

// 3. 更新 xp_total 表
sqlStatements.push('-- 3. 更新 xp_total 表（总经验和可用积分）');
for (const [userName, userData] of excelUserMap) {
  const points = userData.totalXP - userData.totalRedeemed;
  // Escape single quotes in nickname
  const escapedNickname = userData.nickname.replace(/'/g, "''");
  sqlStatements.push(`UPDATE xp_total SET total_xp = ${userData.totalXP}, points = ${points}, nickname = '${escapedNickname}' WHERE name = '${userName}';`);
}
sqlStatements.push('');

// 4. 插入积分记录
sqlStatements.push('-- 4. 插入积分记录');
historyRecords.forEach(record => {
  const escapedReason = record.reason.replace(/'/g, "''");
  const escapedNickname = record.user_nickname.replace(/'/g, "''");
  sqlStatements.push(`INSERT INTO point_transactions (user_name, user_nickname, change_amount, balance_after, reason, created_at, type, created_by) VALUES ('${record.user_name}', '${escapedNickname}', ${record.change_amount}, ${record.balance_after}, '${escapedReason}', '${record.created_at}', '${record.type}', '${record.created_by}');`);
});
sqlStatements.push('');

// 5. 插入兑换记录
sqlStatements.push('-- 5. 插入兑换记录');
redeemRecords.forEach(record => {
  const escapedItem = record.item_name.replace(/'/g, "''");
  const escapedNickname = record.user_nickname.replace(/'/g, "''");
  sqlStatements.push(`INSERT INTO redemption_requests (user_name, user_nickname, item_name, points_cost, created_at, status, reviewed_by, reviewed_at) VALUES ('${record.user_name}', '${escapedNickname}', '${escapedItem}', ${record.points_cost}, '${record.created_at}', '${record.status}', '${record.reviewed_by}', '${record.reviewed_at}');`);
});

const sqlPath = path.join(__dirname, '../scripts/full_update_from_excel.sql');
fs.writeFileSync(sqlPath, sqlStatements.join('\n'), 'utf-8');

console.log('完整 SQL 文件已生成: ' + sqlPath);
console.log('');
console.log('数据统计:');
console.log(`  - 用户数: ${excelUserMap.size}`);
console.log(`  - 积分记录数: ${historyRecords.length}`);
console.log(`  - 兑换记录数: ${redeemRecords.length}`);
console.log('');
for (const [userName, userData] of excelUserMap) {
  const points = userData.totalXP - userData.totalRedeemed;
  console.log(`  ${userName} (${userData.nickname}): 总经验=${userData.totalXP}, 已兑换=${userData.totalRedeemed}, 可用积分=${points}`);
}

