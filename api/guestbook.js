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
      // 获取留言列表（包括回复）
      const { data, error } = await supabase
        .from('guestbook')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // 构建树形结构
      const messages = data || [];
      const rootMessages = messages.filter(m => !m.parent_id);
      const replies = messages.filter(m => m.parent_id);
      
      // 调试信息
      console.log('All messages:', messages);
      console.log('Root messages:', rootMessages);
      console.log('Replies:', replies);
      
      // 递归构建树形结构（支持无限嵌套）
      function buildTree(parentId = null) {
        return messages
          .filter(m => {
            if (parentId === null) {
              return !m.parent_id;
            }
            return String(m.parent_id) === String(parentId);
          })
          .map(m => ({
            ...m,
            replies: buildTree(m.id)
          }));
      }
      
      const messagesWithReplies = buildTree();
      console.log('Final nested tree:', messagesWithReplies);
      
      console.log('Final messages with replies:', messagesWithReplies);
      
      // 按时间倒序排列
      messagesWithReplies.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return res.status(200).json({ messages: messagesWithReplies });
    }

    if (req.method === 'POST') {
      // 添加新留言或回复
      const { name, message, parent_id } = req.body;
      
      if (!name || !message) {
        return res.status(400).json({ error: '昵称和留言内容不能为空' });
      }

      const insertData = {
        name: name.trim(),
        message: message.trim()
      };
      
      if (parent_id) {
        insertData.parent_id = parent_id;
      }

      const { data, error } = await supabase
        .from('guestbook')
        .insert([insertData])
        .select();

      if (error) throw error;
      return res.status(200).json({ success: true, message: data[0] });
    }

    if (req.method === 'DELETE') {
      // 删除留言（包括删除回复）
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

      // 首先检查是否有子回复
      const { data: replies } = await supabase
        .from('guestbook')
        .select('id')
        .eq('parent_id', id);
      
      // 删除所有子回复（如果有）
      if (replies && replies.length > 0) {
        const replyIds = replies.map(r => r.id);
        await supabase
          .from('guestbook')
          .delete()
          .in('id', replyIds);
      }

      // 删除主留言
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