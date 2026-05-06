const XLSX = require('xlsx');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 请设置 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY 环境变量');
  console.log('可以在项目根目录创建 .env 文件来设置这些变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    (u.nickname && u.nickname.toLowerCase() === searchName)
  );
  if (match) return match;

  // 第二步：只有在输入名称>=3个字符时才使用包含匹配
  if (searchName.length >= 3) {
    // 包含匹配（输入的名称包含在用户信息里，且长度>=3）
    match = users.find(u =>
      (u.name && u.name.toLowerCase().includes(searchName)) ||
      (u.nickname && u.nickname.toLowerCase().includes(searchName))
    );
    if (match) return match;

    // 反过来匹配（用户信息包含输入的名称，且长度>=3）
    match = users.find(u =>
      (u.name && searchName.includes(u.name.toLowerCase())) ||
      (u.nickname && searchName.includes(u.nickname.toLowerCase()))
    );
    if (match) return match;

    // 部分匹配（去掉空格和特殊字符）
    const cleanSearch = searchName.replace(/[\s\-_\.]+/g, '');
    match = users.find(u => {
      const cleanName = (u.name || '').toLowerCase().replace(/[\s\-_\.]+/g, '');
      const cleanNickname = (u.nickname || '').toLowerCase().replace(/[\s\-_\.]+/g, '');
      return cleanName === cleanSearch || cleanNickname === cleanSearch ||
             cleanName.includes(cleanSearch) || cleanNickname.includes(cleanSearch);
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

async function main() {
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
        title: row['称号'] || '',
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

  // 获取数据库中的用户
  console.log('📡 从数据库获取当前用户...');
  const { data: dbUsers, error: dbError } = await supabase
    .from('xp_total')
    .select('*');

  if (dbError) {
    console.error('❌ 从数据库获取用户失败:', dbError);
    process.exit(1);
  }

  console.log(`✅ 从数据库获取了 ${dbUsers.length} 个用户`);
  console.log('');

  // 更新每个用户
  let updatedCount = 0;
  let unmatchedUsers = [];

  for (const [userName, userData] of excelUserMap) {
    // 查找数据库中对应的用户
    const dbUser = findUserByName(dbUsers, userName);
    
    if (dbUser) {
      const points = userData.totalXP - userData.totalRedeemed;
      console.log(`更新 ${dbUser.name} (${dbUser.nickname}): 总经验=${userData.totalXP}, 可用积分=${points}`);
      
      const { error: updateError } = await supabase
        .from('xp_total')
        .update({
          total_xp: userData.totalXP,
          points: points,
          nickname: userData.nickname
        })
        .eq('name', dbUser.name);
      
      if (updateError) {
        console.error(`  ❌ 更新失败:`, updateError);
      } else {
        updatedCount++;
      }
    } else {
      unmatchedUsers.push(userName);
    }
  }

  console.log('');
  console.log(`✅ 更新完成！共更新了 ${updatedCount} 个用户`);
  
  if (unmatchedUsers.length > 0) {
    console.log(`⚠️  以下用户在数据库中未找到: ${unmatchedUsers.join(', ')}`);
  }
}

main().catch(err => {
  console.error('❌ 执行失败:', err);
  process.exit(1);
});
