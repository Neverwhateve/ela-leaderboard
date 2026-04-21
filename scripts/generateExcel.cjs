const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/data.json');
const outputPath = path.join(__dirname, '../ELA Data.xlsx');

const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const workbook = XLSX.utils.book_new();

const usersSheet = XLSX.utils.json_to_sheet(data.map(user => ({
  '姓名': user.name,
  '昵称': user.displayName,
  '称号': user.title
})));

usersSheet['!cols'] = [
  { wch: 15 },
  { wch: 20 },
  { wch: 20 }
];

XLSX.utils.book_append_sheet(workbook, usersSheet, '同事信息');

const historyData = [];
data.forEach(user => {
  if (user.xpHistory && user.xpHistory.length > 0) {
    user.xpHistory.forEach(record => {
      historyData.push({
        '姓名': user.name,
        '日期': record.date,
        '原因': record.reason,
        '经验值变化': record.amount
      });
    });
  }
});

const historySheet = XLSX.utils.json_to_sheet(historyData.length > 0 ? historyData : [
  { '姓名': '', '日期': '', '原因': '', '经验值变化': '' }
]);

historySheet['!cols'] = [
  { wch: 15 },
  { wch: 12 },
  { wch: 30 },
  { wch: 12 }
];

XLSX.utils.book_append_sheet(workbook, historySheet, '经验值记录');

const redeemData = [];
data.forEach(user => {
  if (user.redeemHistory && user.redeemHistory.length > 0) {
    user.redeemHistory.forEach(record => {
      redeemData.push({
        '姓名': user.name,
        '日期': record.date,
        '兑换物品': record.item,
        '消耗积分': record.points
      });
    });
  }
});

const redeemSheet = XLSX.utils.json_to_sheet(redeemData.length > 0 ? redeemData : [
  { '姓名': '', '日期': '', '兑换物品': '', '消耗积分': '' }
]);

redeemSheet['!cols'] = [
  { wch: 15 },
  { wch: 12 },
  { wch: 30 },
  { wch: 12 }
];

XLSX.utils.book_append_sheet(workbook, redeemSheet, '积分兑换记录');

XLSX.writeFile(workbook, outputPath);

console.log('✅ Excel模板已生成: ' + outputPath);
console.log('');
console.log('📋 使用说明：');
console.log('   1. "同事信息"表单：填写姓名、昵称、称号');
console.log('   2. "经验值记录"表单：记录每次经验值变化');
console.log('   3. "积分兑换记录"表单：记录积分兑换情况');
console.log('   4. 运行 npm run convert 自动计算总积分和可用积分');
