const XLSX = require('xlsx');
const path = require('path');

const outputPath = path.join(__dirname, '../五一特别活动.xlsx');

const workbook = XLSX.utils.book_new();

const templateData = [
  { '姓名': 'Alvin', '日期': '2026-05-01', '原因': '完成任务A', '积分变化': 10 },
  { '姓名': '煮鱼', '日期': '2026-05-01', '原因': '完成任务B', '积分变化': 15 },
  { '姓名': 'Tracy', '日期': '2026-05-01', '原因': '参与讨论', '积分变化': 5 },
  { '姓名': '外国公主', '日期': '2026-05-02', '原因': '分享资源', '积分变化': 10 },
  { '姓名': 'Moon', '日期': '2026-05-02', '原因': 'Shortcuts 入门', '积分变化': 20 },
  { '姓名': '花果山小母猴', '日期': '2026-05-02', '原因': 'Good Idea', '积分变化': 15 },
  { '姓名': 'Bryan', '日期': '2026-05-03', '原因': '认真学习 Town Hall', '积分变化': 5 },
  { '姓名': '幼儿园高材生', '日期': '2026-05-03', '原因': 'Peer Tips', '积分变化': 15 },
  { '姓名': 'Julia', '日期': '2026-05-03', '原因': '新用户注册', '积分变化': 10 },
  { '姓名': '8low8lowme', '日期': '2026-05-04', '原因': '完成任务C', '积分变化': 10 },
  { '姓名': 'Lucia', '日期': '2026-05-04', '原因': 'Good Idea', '积分变化': 15 },
  { '姓名': '泡泡', '日期': '2026-05-04', '原因': '参与讨论', '积分变化': 5 },
  { '姓名': 'Ya', '日期': '2026-05-05', '原因': 'Peer Tips', '积分变化': 15 },
  { '姓名': '新来的同事', '日期': '2026-05-05', '原因': '完成入职培训', '积分变化': 20 },
  { '姓名': '测试用户', '日期': '2026-05-05', '原因': '测试积分', '积分变化': 5 },
];

const pointsData = [
  { '姓名': 'Alvin', '日期': '2026-05-03', '兑换物品': '咖啡券', '消耗积分': 15 },
  { '姓名': '煮鱼', '日期': '2026-05-04', '兑换物品': '零食大礼包', '消耗积分': 20 },
  { '姓名': 'Tracy', '日期': '2026-05-05', '兑换物品': '笔记本', '消耗积分': 10 },
  { '姓名': '新来的同事', '日期': '2026-05-05', '兑换物品': '钥匙扣', '消耗积分': 5 },
];

const laborDayHistorySheet = XLSX.utils.json_to_sheet(templateData);
laborDayHistorySheet['!cols'] = [
  { wch: 15 },
  { wch: 12 },
  { wch: 25 },
  { wch: 10 }
];
XLSX.utils.book_append_sheet(workbook, laborDayHistorySheet, '活动积分记录');

const laborDayRedeemSheet = XLSX.utils.json_to_sheet(pointsData);
laborDayRedeemSheet['!cols'] = [
  { wch: 15 },
  { wch: 12 },
  { wch: 20 },
  { wch: 10 }
];
XLSX.utils.book_append_sheet(workbook, laborDayRedeemSheet, '活动积分兑换');

XLSX.writeFile(workbook, outputPath);

console.log('✅ 五一特别活动 Excel 模板已生成: ' + outputPath);
console.log('');
console.log('📋 使用说明：');
console.log('   1. "活动积分记录"表单：记录积分获取情况（姓名、日期、原因、积分变化）');
console.log('   2. "活动积分兑换"表单：记录积分兑换情况（姓名、日期、兑换物品、消耗积分）');
console.log('');
console.log('⚠️  姓名支持：英文名、昵称均可，系统会自动匹配显示昵称');
console.log('⚠️  新同事直接填写名字即可，无需预先添加到名单');
console.log('⚠️  运行 npm run labor-day-convert 可自动更新活动页面数据');
