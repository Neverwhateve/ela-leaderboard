import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('app_config')
        .select('config_value')
        .eq('config_key', 'announcement_config')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return res.status(200).json({
        success: true,
        config: data?.config_value || null
      });
    } catch (err) {
      console.error('Get config error:', err);
      return res.status(500).json({ error: '服务器错误' });
    }
  } else if (req.method === 'POST') {
    const { admin_name, admin_password, config } = req.body;

    if (!admin_name || !admin_password) {
      return res.status(400).json({ error: '需要管理员身份验证' });
    }

    try {
      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('name', admin_name)
        .eq('password_hash', admin_password)
        .single();

      if (adminError || !admin) {
        return res.status(401).json({ error: '管理员身份验证失败' });
      }

      const { error: upsertError } = await supabase
        .from('app_config')
        .upsert({
          config_key: 'announcement_config',
          config_value: config
        }, {
          onConflict: 'config_key'
        });

      if (upsertError) throw upsertError;

      await supabase
        .from('admin_logs')
        .insert({
          admin_name: admin_name,
          action: 'update_config',
          details: '更新公告栏配置'
        });

      return res.status(200).json({ success: true, message: '公告配置已保存' });
    } catch (err) {
      console.error('Save config error:', err);
      return res.status(500).json({ error: '服务器错误' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}