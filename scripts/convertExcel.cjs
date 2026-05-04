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

// 智能匹配用户函数
function findUserByName(users, inputName) {
  if (!inputName) return null;

  const searchName = String(inputName).trim().toLowerCase();

  // 第一步：精确匹配（完全相等，不区分大小写）
  let match = users.find(u =>
    (u.name && u.name.toLowerCase() === searchName) ||
    (u.displayName && u.displayName.toLowerCase() === searchName)
  );
  if (match) return match;

  // 第二步：只有在输入名称>=3个字符时才使用包含匹配
  // 这样可以避免短名字匹配到多个用户
  if (searchName.length >= 3) {
    // 包含匹配（输入的名称包含在用户信息里，且长度>=3）
    match = users.find(u =>
      (u.name && u.name.toLowerCase().includes(searchName)) ||
      (u.displayName && u.displayName.toLowerCase().includes(searchName))
    );
    if (match) return match;

    // 反过来匹配（用户信息包含输入的名称，且长度>=3）
    match = users.find(u =>
      (u.name && searchName.includes(u.name.toLowerCase())) ||
      (u.displayName && searchName.includes(u.displayName.toLowerCase()))
    );
    if (match) return match;

    // 部分匹配（去掉空格和特殊字符）
    const cleanSearch = searchName.replace(/[\s\-_\.]+/g, '');
    match = users.find(u => {
      const cleanName = (u.name || '').toLowerCase().replace(/[\s\-_\.]+/g, '');
      const cleanDisplayName = (u.displayName || '').toLowerCase().replace(/[\s\-_\.]+/g, '');
      return cleanName === cleanSearch || cleanDisplayName === cleanSearch ||
             cleanName.includes(cleanSearch) || cleanDisplayName.includes(cleanSearch);
    });
    if (match) return match;
  }

  return null;
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

const unmatchedRecords = [];

// 用于去重的 Set
const processedRecords = new Set();

if (historySheet) {
  const historyData = XLSX.utils.sheet_to_json(historySheet);

  historyData.forEach(record => {
    const userName = record['姓名'];
    const user = findUserByName(users, userName);

    if (user) {
      const date = excelDateToString(record['日期']);
      const reason = record['原因'] || '';
      const amount = parseInt(record['经验值变化']) || 0;

      // 创建唯一标识来判断是否重复
      const recordKey = `${user.name}|${date}|${reason}|${amount}`;

      // 检查是否已经处理过这条记录
      if (processedRecords.has(recordKey)) {
        console.log(`   ⚠️  跳过重复记录: ${user.displayName} - ${date} - ${reason} (+${amount})`);
        return; // 跳过这条重复记录
      }

      processedRecords.add(recordKey);

      user.xp += amount;
      user.xpHistory.push({
        date: date,
        reason: reason,
        amount: amount
      });
    } else {
      unmatchedRecords.push({ type: '经验值', name: userName, record });
    }
  });
}

if (redeemSheet) {
  const redeemData = XLSX.utils.sheet_to_json(redeemSheet);

  redeemData.forEach(record => {
    const userName = record['姓名'];
    const user = findUserByName(users, userName);

    if (user) {
      const points = parseInt(record['消耗积分']) || 0;
      user.points += points;
      user.redeemHistory.push({
        date: excelDateToString(record['日期']),
        item: record['兑换物品'] || '',
        points: points
      });
    } else {
      unmatchedRecords.push({ type: '兑换', name: userName, record });
    }
  });
}

let latestRecords = [];
if (historySheet) {
  const historyData = XLSX.utils.sheet_to_json(historySheet);
  const last10Records = historyData.slice(-10);

  last10Records.forEach(record => {
    const userName = record['姓名'];
    const user = findUserByName(users, userName);

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

if (unmatchedRecords.length > 0) {
  console.log(`\n⚠️  未匹配到用户的记录 (${unmatchedRecords.length}条)：`);
  unmatchedRecords.forEach((item, index) => {
    console.log(`   ${index + 1}. [${item.type}] "${item.name}"`);
  });
  console.log(`\n提示：请检查"同事信息"表中是否有该用户，或姓名/昵称是否正确`);
  console.log(`支持的匹配方式：精确匹配（优先），包含匹配（仅当名称>=3字符时）`);
} else {
  console.log(`\n✅ 所有记录都成功匹配！`);
}
