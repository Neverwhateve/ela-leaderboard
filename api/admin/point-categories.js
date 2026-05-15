import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('config')
        .select('value')
        .eq('key', 'point_categories')
        .single();

      if (error || !data) {
        return res.status(200).json({ success: true, categories: getDefaultCategories() });
      }

      return res.status(200).json({ success: true, categories: JSON.parse(data.value) });
    } catch (err) {
      console.error('Error getting point categories:', err);
      return res.status(200).json({ success: true, categories: getDefaultCategories() });
    }
  } else if (req.method === 'POST') {
    const { admin_name, admin_password, categories } = req.body;

    if (!admin_name || !admin_password) {
      return res.status(400).json({ success: false, error: '需要管理员身份验证' });
    }

    try {
      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('name', admin_name)
        .eq('password_hash', admin_password)
        .single();

      if (adminError || !admin) {
        return res.status(401).json({ success: false, error: '管理员身份验证失败' });
      }

      const { error: upsertError } = await supabase
        .from('config')
        .upsert({
          key: 'point_categories',
          value: JSON.stringify(categories)
        });

      if (upsertError) {
        throw upsertError;
      }

      return res.status(200).json({ success: true, message: '积分分类配置已保存' });
    } catch (err) {
      console.error('Error saving point categories:', err);
      return res.status(500).json({ success: false, error: '保存失败' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}

function getDefaultCategories() {
  return [
    {
      id: "regular",
      name: "常规积分",
      icon: "📚",
      items: [
        { name: "专业解答 & 资讯分享", points: 5 },
        { name: "Kahoot 优胜", points: 10 },
        { name: "Peer Tips", points: 15 },
        { name: "分享知识（DD, huddle, 邮件等）", points: 15 },
      ]
    },
    {
      id: "event",
      name: "特殊活动",
      icon: "🎉",
      items: [
        { name: "观看 Town Hall 视频", points: 5 },
        { name: "藏宝图任务", points: 20 },
      ]
    },
    {
      id: "bounty",
      name: "悬赏任务",
      icon: "💰",
      items: [
        { name: "家人共享与儿童账户：整理并分享知识", points: 20 },
        { name: "Creator Studio 演示与分享", points: 10 },
      ]
    }
  ];
}
