import React, { useState, useEffect } from 'react';

const Guestbook = () => {
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');

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

  // 点击删除按钮
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeletePassword('');
    setShowDeleteModal(true);
  };

  // 确认删除
  const confirmDelete = async () => {
    if (!deletePassword.trim()) {
      setError('请输入删除密码');
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);
      const response = await fetch('/api/guestbook', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: deleteId, 
          password: deletePassword 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowDeleteModal(false);
        await fetchMessages(); // 重新获取留言列表
      } else {
        setError(data.error || '删除失败，请重试');
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
      setError('删除失败，请检查网络连接');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 取消删除
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
    setDeletePassword('');
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
                    onClick={() => handleDeleteClick(item.id)}
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
      
      {/* 删除密码弹窗 */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={cancelDelete}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '90%',
              maxWidth: '350px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>
              🔒 删除留言
            </h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
              请输入删除密码
            </p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="输入密码..."
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: isSubmitting ? '#f5f5f5' : 'white',
                marginBottom: '16px',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  confirmDelete();
                }
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={cancelDelete}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: isSubmitting ? '#e0e0e0' : '#f5f5f5',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  color: isSubmitting ? '#999' : '#333',
                }}
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: isSubmitting ? '#9E9E9E' : '#e74c3c',
                  color: 'white',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                {isSubmitting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guestbook;
