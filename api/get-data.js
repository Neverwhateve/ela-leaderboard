import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  try {
    console.log('开始获取数据...');

    // 获取所有用户数据
    console.log('获取用户列表...');
    const { data: xpData, error: xpError } = await supabase
      .from('xp_total')
      .select('name, nickname, total_xp, points, title')
      .order('total_xp', { ascending: false });

    if (xpError) {
      console.error('获取用户数据失败:', xpError);
      return res.status(500).json({ success: false, error: '获取用户数据失败' });
    }

    console.log('用户数据:', xpData?.length || 0, '条');

    // 获取所有积分记录
    console.log('获取积分记录...');
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('point_transactions')
      .select('user_name, change_amount, reason, created_at')
      .order('created_at', { ascending: false });

    if (transactionsError) {
      console.error('获取积分记录失败:', transactionsError);
    }

    // 按用户名分组记录
    const transactionsByUser = {};
    (transactionsData || []).forEach(tx => {
      if (!transactionsByUser[tx.user_name]) {
        transactionsByUser[tx.user_name] = [];
      }
      transactionsByUser[tx.user_name].push({
        date: tx.created_at,
        reason: tx.reason,
        amount: tx.change_amount
      });
    });

    // 获取所有兑换记录
    const { data: redeemData, error: redeemError } = await supabase
      .from('redemption_requests')
      .select('user_name, item_name, points_cost, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (redeemError) {
      console.error('获取兑换记录失败:', redeemError);
    }

    // 按用户名分组兑换记录
    const redeemByUser = {};
    (redeemData || []).forEach(r => {
      if (!redeemByUser[r.user_name]) {
        redeemByUser[r.user_name] = [];
      }
      redeemByUser[r.user_name].push({
        date: r.created_at,
        item: r.item_name,
        points: r.points_cost
      });
    });

    console.log('积分记录:', Object.keys(transactionsByUser).length, '个用户有记录');
    console.log('兑换记录:', Object.keys(redeemByUser).length, '个用户有记录');

    // 获取最新的10条记录（用于弹幕）
    const { data: recordsData, error: recordsError } = await supabase
      .from('point_transactions')
      .select('user_name, change_amount, reason, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recordsError) {
      console.error('获取最近10条记录失败:', recordsError);
    }

    // 格式化数据为兼容 data.json 的格式
    const users = (xpData || []).map((user, index) => ({
      id: `user_${index + 1}`,
      name: user.name,
      displayName: user.nickname || user.name, // 优先显示昵称
      nickname: user.nickname,
      title: user.title || '',
      xp: user.total_xp,
      points: user.points || 0,
      xpHistory: transactionsByUser[user.name] || [],
      redeemHistory: redeemByUser[user.name] || [],
      weekly: 0, // 暂时没有周统计
      monthly: 0 // 暂时没有月统计
    }));

    console.log('格式化用户数:', users.length);

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
    return res.status(500).json({ success: false, error: '服务器错误', message: err.message });
  }
}
