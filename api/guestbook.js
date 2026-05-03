import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const deletePassword = process.env.DELETE_PASSWORD;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // 获取留言列表
      const { data, error } = await supabase
        .from('guestbook')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ messages: data || [] });
    }

    if (req.method === 'POST') {
      // 添加新留言
      const { name, message } = req.body;
      
      if (!name || !message) {
        return res.status(400).json({ error: '昵称和留言内容不能为空' });
      }

      const { data, error } = await supabase
        .from('guestbook')
        .insert([
          {
            name: name.trim(),
            message: message.trim()
          }
        ])
        .select();

      if (error) throw error;
      return res.status(200).json({ success: true, message: data[0] });
    }

    if (req.method === 'DELETE') {
      // 删除留言
      const { id, password } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: '留言 ID 不能为空' });
      }
      
      // 验证密码
      if (!deletePassword) {
        return res.status(500).json({ error: '服务器未配置删除密码' });
      }
      
      if (password !== deletePassword) {
        return res.status(403).json({ error: '密码错误' });
      }

      const { error } = await supabase
        .from('guestbook')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: '不支持的请求方法' });
  } catch (error) {
    console.error('Guestbook API Error:', error);
    return res.status(500).json({ error: '服务器错误: ' + error.message });
  }
}
