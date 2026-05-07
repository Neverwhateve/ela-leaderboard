import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const feishuWebhookUrl = process.env.FEISHU_WEBHOOK_URL;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sendFeishuNotification = async (title, content) => {
  if (!feishuWebhookUrl) {
    console.log('Feishu webhook not configured, skipping notification');
    return;
  }

  try {
    await fetch(feishuWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msg_type: 'text',
        content: { text: `${title}\n\n${content}` }
      })
    });
  } catch (err) {
    console.error('Failed to send Feishu notification:', err);
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { type, user_name, user_nickname, reason, points, item_name, points_cost } = req.body;

  if (!type || !user_name) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  try {
    if (type === 'points') {
      if (!reason || !points) {
        return res.status(400).json({ error: '积分申请需要填写原因和积分数量' });
      }

      const { error } = await supabase
        .from('pending_approvals')
        .insert({
          type: 'points',
          user_name,
          user_nickname: user_nickname || '',
          reason,
          points,
          status: 'pending'
        });

      if (error) throw error;

      await sendFeishuNotification(
        '📝 新的积分申请',
        `申请人：${user_name} (${user_nickname || '无昵称'})\n原因：${reason}\n积分：+${points}`
      );

      return res.status(200).json({ success: true, message: '积分申请已提交，请等待审核' });

    } else if (type === 'redemption') {
      if (!item_name || !points_cost) {
        return res.status(400).json({ error: '兑换申请需要填写物品名称和消耗积分' });
      }

      const { error } = await supabase
        .from('redemption_requests')
        .insert({
          user_name,
          user_nickname: user_nickname || '',
          item_name,
          points_cost,
          status: 'pending'
        });

      if (error) throw error;

      await sendFeishuNotification(
        '🎁 新的兑换申请',
        `申请人：${user_name} (${user_nickname || '无昵称'})\n物品：${item_name}\n消耗积分：${points_cost}`
      );

      return res.status(200).json({ success: true, message: '兑换申请已提交，请等待审核' });

    } else if (type === 'register') {
      if (!user_name) {
        return res.status(400).json({ error: '注册需要填写姓名' });
      }

      const { error: insertError } = await supabase
        .from('xp_total')
        .insert({
          name: user_name,
          nickname: user_nickname,
          total_xp: 10,
          points: 10
        });

      if (insertError && insertError.code !== '23505') {
        console.error('注册插入用户错误:', insertError);
      }

      await supabase
        .from('point_transactions')
        .insert({
          user_name: user_name,
          user_nickname: user_nickname || '',
          change_amount: 10,
          balance_after: 10,
          reason: '新用户注册奖励',
          type: 'initial',
          created_by: 'system'
        });

      await sendFeishuNotification(
        '👤 新用户注册',
        `姓名：${user_name}\n昵称：${user_nickname || '无'}\n推荐人：${reason || '无'}`
      );

      return res.status(200).json({ success: true, message: '注册成功！获得10积分奖励！' });

    } else {
      return res.status(400).json({ error: '未知的申请类型' });
    }
  } catch (err) {
    console.error('Apply error:', err);
    return res.status(500).json({ error: '服务器错误' });
  }
};
