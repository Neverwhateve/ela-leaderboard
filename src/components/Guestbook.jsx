import React, { useState, useEffect } from 'react';

const Guestbook = () => {
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 从 API 加载留言
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch('/api/guestbook');
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('加载留言失败，请刷新页面重试');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // 提交新留言
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/guestbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setName('');
        setMessage('');
        await fetchMessages(); // 重新获取留言列表
      } else {
        setError(data.error || '发送失败，请重试');
      }
    } catch (err) {
      console.error('Failed to submit message:', err);
      setError('发送失败，请检查网络连接');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除留言
  const deleteMessage = async (id) => {
    if (!window.confirm('确定要删除这条留言吗？')) {
      return;
    }

    try {
      setError('');
      const response = await fetch('/api/guestbook', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchMessages(); // 重新获取留言列表
      } else {
        setError(data.error || '删除失败，请重试');
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
      setError('删除失败，请检查网络连接');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 mb-8">
      <div className="rounded-acnh p-6 shadow-acnh" style={{ backgroundColor: '#f7f3df' }}>
        <h2 style={{
          fontFamily: "Nunito, 'Zen Maru Gothic', -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
          fontSize: '24px',
          fontWeight: 700,
          color: '#725d42',
          margin: 0,
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          📝 留言板
        </h2>

        {/* 发表留言表单 */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#725d42' }}>
              昵称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="你的昵称..."
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid #ddd',
                borderRadius: '12px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: isSubmitting ? '#f5f5f5' : 'white',
                color: isSubmitting ? '#999' : '#333'
              }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#725d42' }}>
              留言
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="说点什么吧..."
              rows={3}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid #ddd',
                borderRadius: '12px',
                fontSize: '14px',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
                backgroundColor: isSubmitting ? '#f5f5f5' : 'white',
                color: isSubmitting ? '#999' : '#333'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim() || !message.trim()}
            style={{
              width: '100%',
              padding: '12px',
              border: 'none',
              borderRadius: '12px',
              backgroundColor: (isSubmitting || !name.trim() || !message.trim()) ? '#9E9E9E' : '#4CAF50',
              color: 'white',
              cursor: (isSubmitting || !name.trim() || !message.trim()) ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            {isSubmitting ? '发送中...' : '发送留言 🎉'}
          </button>
        </form>

        {/* 错误提示 */}
        {error && (
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: '#fee',
            color: '#c33',
            marginBottom: '16px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* 留言列表 */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-textSecondary" style={{ fontSize: '16px' }}>
                加载中... ⏳
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-textSecondary" style={{ fontSize: '16px' }}>
                还没有留言，来做第一个留言的人吧！✨
              </p>
            </div>
          ) : (
            messages.map((item) => (
              <div
                key={item.id}
                className="bg-primaryBg rounded-acnh p-4 shadow-acnh-sm"
                style={{ backgroundColor: '#fff9e6' }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-semibold text-primary" style={{ fontSize: '16px' }}>
                      {item.name}
                    </span>
                    <span className="text-textSecondary ml-2" style={{ fontSize: '12px' }}>
                      {new Date(item.created_at).toLocaleDateString('zh-CN')} {new Date(item.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteMessage(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e74c3c',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '4px 8px',
                      borderRadius: '6px'
                    }}
                    title="删除留言"
                  >
                    🗑️
                  </button>
                </div>
                <p className="text-text" style={{ fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                  {item.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Guestbook;
