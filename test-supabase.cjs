const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('SUPABASE_URL:', supabaseUrl ? '已设置' : '未设置');
console.log('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '已设置' : '未设置');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('环境变量缺失');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*');

    if (error) {
      console.error('查询错误:', error);
      return;
    }

    console.log('admins 表数据:', data);

    const { data: users, error: usersError } = await supabase
      .from('point_transactions')
      .select('*')
      .limit(5);

    if (usersError) {
      console.error('point_transactions 查询错误:', usersError);
      return;
    }

    console.log('point_transactions 表数据条数:', users.length);
  } catch (err) {
    console.error('连接失败:', err);
  }
}

testConnection();