import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ error: '管理员名称和密码不能为空' });
  }

  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('name', name)
      .eq('password_hash', password)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: '管理员名称或密码错误' });
    }

    await supabase
      .from('admin_logs')
      .insert({
        admin_name: name,
        action: 'login',
        details: '管理员登录成功'
      });

    return res.status(200).json({
      success: true,
      admin: {
        id: data.id,
        name: data.name
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: '服务器错误' });
  }
};
