export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { englishName, nickname, referrer } = req.body;

    if (!englishName || !nickname) {
      return res.status(400).json({ error: '请填写姓名和昵称' });
    }

    const webhookUrl = process.env.FEISHU_WEBHOOK_URL;

    if (!webhookUrl) {
      return res.status(500).json({ error: '未配置飞书机器人 Webhook' });
    }

    const referrerText = referrer ? referrer : '无';

    const message = {
      msg_type: 'text',
      content: {
        text: `🎉 新用户注册请求\n\n英文名：${englishName}\n昵称：${nickname}\n推荐人：${referrerText}`
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

    res.status(200).json({ success: true, message: '注册成功！已通知管理员' });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
}