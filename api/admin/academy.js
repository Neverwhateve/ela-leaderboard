import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ACADEMIES = ['种草实验室', '隐藏技能局', '偶像集中营'];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('academy_members')
        .select('user_name, academy, created_at')
        .order('academy')
        .order('user_name');

      if (error) throw error;

      const academyData = {};
      ACADEMIES.forEach(academy => {
        academyData[academy] = data.filter(m => m.academy === academy).map(m => m.user_name);
      });

      return res.status(200).json({
        success: true,
        academies: academyData,
        allMembers: data || []
      });
    } catch (err) {
      console.error('获取学院数据失败:', err);
      return res.status(500).json({ success: false, error: '服务器错误' });
    }
  }

  if (req.method === 'POST') {
    const { action, admin_name, admin_password, user_name, academy } = req.body;

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

      switch (action) {
        case 'add_member':
          if (!user_name || !academy) {
            return res.status(400).json({ error: '需要用户名和学院名' });
          }

          if (!ACADEMIES.includes(academy)) {
            return res.status(400).json({ error: '无效的学院名' });
          }

          const { error: addError } = await supabase
            .from('academy_members')
            .insert({
              user_name,
              academy,
              created_by: admin_name
            });

          if (addError) {
            if (addError.code === '23505') {
              return res.status(400).json({ error: '该用户已在此学院中' });
            }
            throw addError;
          }

          await supabase.from('admin_logs').insert([{
            action: 'add_academy_member',
            admin_name,
            target_user: user_name,
            details: `将 ${user_name} 添加到 ${academy}`,
            created_at: new Date().toISOString()
          }]);

          return res.status(200).json({ success: true, message: `已将 ${user_name} 添加到 ${academy}` });

        case 'remove_member':
          if (!user_name || !academy) {
            return res.status(400).json({ error: '需要用户名和学院名' });
          }

          const { error: removeError } = await supabase
            .from('academy_members')
            .delete()
            .eq('user_name', user_name)
            .eq('academy', academy);

          if (removeError) throw removeError;

          await supabase.from('admin_logs').insert([{
            action: 'remove_academy_member',
            admin_name,
            target_user: user_name,
            details: `将 ${user_name} 从 ${academy} 移除`,
            created_at: new Date().toISOString()
          }]);

          return res.status(200).json({ success: true, message: `已将 ${user_name} 从 ${academy} 移除` });

        case 'batch_update':
          const { members } = req.body;
          
          if (!members || typeof members !== 'object') {
            return res.status(400).json({ error: '需要成员数据' });
          }

          for (const academyName of ACADEMIES) {
            await supabase
              .from('academy_members')
              .delete()
              .eq('academy', academyName);

            const academyMembers = members[academyName] || [];
            if (academyMembers.length > 0) {
              const insertData = academyMembers.map(userName => ({
                user_name: userName,
                academy: academyName,
                created_by: admin_name
              }));

              await supabase
                .from('academy_members')
                .insert(insertData);
            }
          }

          await supabase.from('admin_logs').insert([{
            action: 'batch_update_academy',
            admin_name,
            details: '批量更新学院成员',
            created_at: new Date().toISOString()
          }]);

          return res.status(200).json({ success: true, message: '学院成员已更新' });

        default:
          return res.status(400).json({ error: '未知的操作' });
      }
    } catch (err) {
      console.error('学院操作失败:', err);
      return res.status(500).json({ success: false, error: '服务器错误' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
