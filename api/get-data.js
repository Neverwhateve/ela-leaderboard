import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  try {
    // 获取所有用户数据
    const { data: xpData, error: xpError } = await supabase
      .from('xp_total')
      .select('name, total_xp')
      .order('total_xp', { ascending: false });

    if (xpError) {
      console.error('获取用户数据失败:', xpError);
      return res.status(500).json({ success: false, error: '获取用户数据失败' });
    }

    // 获取最新的积分记录（用于弹幕）
    const { data: recordsData, error: recordsError } = await supabase
      .from('point_transactions')
      .select('user_name, change_amount, reason, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recordsError) {
      console.error('获取积分记录失败:', recordsError);
    }

    // 格式化数据为兼容 data.json 的格式
    const users = (xpData || []).map((user, index) => ({
      id: `user_${index + 1}`,
      name: user.name,
      displayName: user.nickname || user.name, // 优先显示昵称
      nickname: user.nickname,
      title: '',
      xp: user.total_xp,
      points: 0,
      xpHistory: [],
      redeemHistory: [],
      weekly: 0, // 暂时没有周统计
      monthly: 0 // 暂时没有月统计
    }));

    const latestRecords = (recordsData || []).map(record => ({
      name: record.user_name,
      reason: record.reason,
      points: record.change_amount,
      date: record.created_at
    }));

    return res.status(200).json({
      success: true,
      users,
      latestRecords
    });
  } catch (err) {
    console.error('获取数据失败:', err);
    return res.status(500).json({ success: false, error: '服务器错误' });
  }
}
