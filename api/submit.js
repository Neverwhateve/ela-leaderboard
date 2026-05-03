export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, reason, date } = req.body;
    
    if (!name || !reason) {
      return res.status(400).json({ error: '请填写姓名和原因' });
    }

    const webhookUrl = process.env.FEISHU_WEBHOOK_URL;
    
    if (!webhookUrl) {
      return res.status(500).json({ error: '未配置飞书机器人 Webhook' });
    }

    const message = {
      msg_type: 'text',
      content: {
        text: `📝 新的积分提交请求\n\n姓名：${name}\n原因：${reason}\n日期：${date}`
      }
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error('飞书机器人请求失败');
    }

    res.status(200).json({ success: true, message: '提交成功！已通知管理员' });
  } catch (error) {
    console.error('提交失败:', error);
    res.status(500).json({ error: '提交失败，请稍后重试' });
  }
}