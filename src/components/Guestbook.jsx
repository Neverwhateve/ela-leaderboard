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
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyName, setReplyName] = useState('');
  const [replyMessage, setReplyMessage] = useState('');

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

  // 提交回复
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyName.trim() || !replyMessage.trim()) {
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
          name: replyName.trim(),
          message: replyMessage.trim(),
          parent_id: replyingTo.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setReplyName('');
        setReplyMessage('');
        setReplyingTo(null);
        await fetchMessages(); // 重新获取留言列表
      } else {
        setError(data.error || '发送失败，请重试');
      }
    } catch (err) {
      console.error('Failed to submit reply:', err);
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

  // 点击回复按钮
  const handleReplyClick = (item) => {
    setReplyingTo(item);
    setReplyName('');
    setReplyMessage('');
  };

  // 取消回复
  const cancelReply = () => {
    setReplyingTo(null);
    setReplyName('');
    setReplyMessage('');
  };

  // 渲染单个留言和它的回复
  const renderMessage = (item, isReply = false) => (
    <div
      key={item.id}
      className={`rounded-acnh p-4 shadow-acnh-sm ${isReply ? 'ml-8 border-l-4 border-primary' : ''}`}
      style={{ backgroundColor: isReply ? '#fff3cd' : '#fff9e6' }}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="font-semibold text-primary" style={{ fontSize: '16px' }}>
            {isReply ? '↳ ' : ''}{item.name}
          </span>
          <span className="text-textSecondary ml-2" style={{ fontSize: '12px' }}>
            {new Date(item.created_at).toLocaleDateString('zh-CN')} {new Date(item.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="flex gap-2">
          {!isReply && (
            <button
              onClick={() => handleReplyClick(item)}
              disabled={isSubmitting}
              style={{
                background: 'none',
                border: 'none',
                color: '#2196F3',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                padding: '4px 8px',
                borderRadius: '6px'
              }}
              title="回复留言"
            >
              💬 回复
            </button>
          )}
          <button
              onClick={() => handleDeleteClick(item.id)}
              disabled={isSubmitting}
              style={{
                background: '#6c757d',
                border: 'none',
                color: 'white',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
              title="删除留言"
            >
              ✕
            </button>
        </div>
      </div>
      <p className="text-text" style={{ fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
        {item.message}
      </p>
      
      {/* 回复表单 */}
      {replyingTo && replyingTo.id === item.id && (
        <form onSubmit={handleReplySubmit} className="mt-4">
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#725d42' }}>
              回复 {item.name} - 你的昵称
            </label>
            <input
              type="text"
              value={replyName}
              onChange={(e) => setReplyName(e.target.value)}
              placeholder="你的昵称..."
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
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
              回复内容
            </label>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="说点什么吧..."
              rows={2}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
                backgroundColor: isSubmitting ? '#f5f5f5' : 'white',
                color: isSubmitting ? '#999' : '#333'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={cancelReply}
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
              type="submit"
              disabled={isSubmitting || !replyName.trim() || !replyMessage.trim()}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: (isSubmitting || !replyName.trim() || !replyMessage.trim()) ? '#9E9E9E' : '#2196F3',
                color: 'white',
                cursor: (isSubmitting || !replyName.trim() || !replyMessage.trim()) ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              {isSubmitting ? '发送中...' : '发送回复'}
            </button>
          </div>
        </form>
      )}

      {/* 渲染回复 */}
      {item.replies && item.replies.length > 0 && (
        <div className="mt-4 space-y-3">
          {item.replies.map(reply => renderMessage(reply, true))}
        </div>
      )}
    </div>
  );

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
            messages.map((item) => renderMessage(item))
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