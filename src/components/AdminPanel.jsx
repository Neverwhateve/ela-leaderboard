import React, { useState, useEffect } from 'react';

// 格式化日期为YYYY-MM-DD格式
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const AdminPanel = ({ onBack }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleBack = () => {
    setIsLoggedIn(false);
    setAdminName('');
    setAdminPassword('');
    onBack();
  };
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [pendingRedemptions, setPendingRedemptions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [userPoints, setUserPoints] = useState(null);
  const [userTransactions, setUserTransactions] = useState([]);
  const [operationAmount, setOperationAmount] = useState('');
  const [operationReason, setOperationReason] = useState('');
  const [operationCustomReason, setOperationCustomReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [announcementConfig, setAnnouncementConfig] = useState({ title: '📢 公告栏', sections: [] });
  const [pointCategories, setPointCategories] = useState([
    { id: "regular", name: "常规积分", icon: "📚", items: [{ name: "专业解答 & 资讯分享", points: 5 }] }
  ]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editReason, setEditReason] = useState('');
  const [editDate, setEditDate] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      loadPending();
      loadUsers();
      loadLogs();
    }
  }, [isLoggedIn]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: adminName, password: adminPassword })
      });
      const data = await response.json();
      if (data.success) {
        setIsLoggedIn(true);
        showMessage('success', `欢迎 ${data.admin.name}！`);
        // 登录成功后加载初始数据
        await loadPending();
        await loadUsers();
        await loadLogs();
      } else {
        showMessage('error', data.error || '登录失败');
      }
    } catch (err) {
      showMessage('error', '登录失败，请检查网络');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPending = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_pending', admin_name: adminName, admin_password: adminPassword })
      });
      const data = await response.json();
      if (data.success) {
        setPendingApprovals(data.pending_approvals || []);
        setPendingRedemptions(data.pending_redemptions || []);
      }
    } catch (err) {
      showMessage('error', '加载待审核列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_all_users', admin_name: adminName, admin_password: adminPassword })
      });
      const data = await response.json();
      if (data.success) {
        setAllUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_logs', admin_name: adminName, admin_password: adminPassword })
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };

  const loadAnnouncementConfig = async () => {
    try {
      const response = await fetch('/api/admin/config');
      const data = await response.json();
      if (data.success && data.config) {
        setAnnouncementConfig(data.config);
      }
    } catch (err) {
      console.error('Failed to load announcement config:', err);
    }
  };

  const loadPointCategories = async () => {
    try {
      const response = await fetch('/api/admin/point-categories');
      const data = await response.json();
      if (data.success && data.categories) {
        setPointCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to load point categories:', err);
    }
  };

  const savePointCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/point-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_name: adminName,
          admin_password: adminPassword,
          categories: pointCategories
        })
      });
      const data = await response.json();
      if (data.success) {
        showMessage('success', '积分分类配置已保存');
      } else {
        showMessage('error', data.error || '保存失败');
      }
    } catch (err) {
      showMessage('error', '保存失败');
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnnouncementConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_name: adminName,
          admin_password: adminPassword,
          config: announcementConfig
        })
      });
      const data = await response.json();
      if (data.success) {
        showMessage('success', '公告配置已保存');
      } else {
        showMessage('error', data.error || '保存失败');
      }
    } catch (err) {
      showMessage('error', '保存失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && activeTab === 'announcement') {
      loadAnnouncementConfig();
    }
    if (isLoggedIn && activeTab === 'users') {
      loadUsers();
    }
    if (isLoggedIn && activeTab === 'logs') {
      loadLogs();
    }
    if (isLoggedIn && activeTab === 'pointCategories') {
      loadPointCategories();
    }
  }, [isLoggedIn, activeTab]);

  const handleApprovePoints = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_points',
          id,
          admin_name: adminName,
          admin_password: adminPassword
        })
      });
      const data = await response.json();
      if (data.success) {
        showMessage('success', '积分申请已批准');
        await loadPending();
        await loadUsers();
        await loadLogs();
      } else {
        showMessage('error', data.error);
      }
    } catch (err) {
      showMessage('error', '操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectPoints = async (id) => {
    if (!confirm('确定要拒绝这个积分申请吗？')) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject_points',
          id,
          admin_name: adminName,
          admin_password: adminPassword,
          reject_reason: '管理员拒绝'
        })
      });
      const data = await response.json();
      if (data.success) {
        showMessage('success', '积分申请已拒绝');
        await loadPending();
        await loadLogs();
      } else {
        showMessage('error', data.error);
      }
    } catch (err) {
      showMessage('error', '操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRedemption = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_redemption',
          id,
          admin_name: adminName,
          admin_password: adminPassword
        })
      });
      const data = await response.json();
      if (data.success) {
        showMessage('success', '兑换申请已批准');
        await loadPending();
        await loadUsers();
        await loadLogs();
      } else {
        showMessage('error', data.error);
      }
    } catch (err) {
      showMessage('error', '操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectRedemption = async (id) => {
    if (!confirm('确定要拒绝这个兑换申请吗？')) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject_redemption',
          id,
          admin_name: adminName,
          admin_password: adminPassword,
          reject_reason: '管理员拒绝'
        })
      });
      const data = await response.json();
      if (data.success) {
        showMessage('success', '兑换申请已拒绝');
        await loadPending();
        await loadLogs();
      } else {
        showMessage('error', data.error);
      }
    } catch (err) {
      showMessage('error', '操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchUser = async (userName) => {
    if (!userName.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_user_balance',
          user_name: userName,
          admin_name: adminName,
          admin_password: adminPassword
        })
      });
      const data = await response.json();
      if (data.success) {
        setSelectedUser(data.user_name);
        setUserBalance(data.balance);
        setUserPoints(data.points || 0);
        setUserTransactions(data.transactions || []);
      } else {
        showMessage('error', '用户不存在');
      }
    } catch (err) {
      showMessage('error', '查询失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPoints = async () => {
    if (!selectedUser || !operationAmount || operationAmount <= 0) {
      showMessage('error', '请填写正确的积分数');
      return;
    }
    
    const finalReason = operationReason === '管理员手动调整' 
      ? operationCustomReason.trim() 
      : operationReason;
    
    if (!finalReason) {
      showMessage('error', '请填写原因');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_points',
          user_name: selectedUser,
          points: parseInt(operationAmount),
          reason: finalReason,
          admin_name: adminName,
          admin_password: adminPassword
        })
      });
      const data = await response.json();
      if (data.success) {
        showMessage('success', data.message);
        setOperationAmount('');
        setOperationReason('');
        setOperationCustomReason('');
        await handleSearchUser(selectedUser);
        await loadUsers();
        await loadLogs();
      } else {
        showMessage('error', data.error);
      }
    } catch (err) {
      showMessage('error', '操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!confirm('确定要删除这条积分记录吗？')) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_transaction',
          id: transactionId,
          admin_name: adminName,
          admin_password: adminPassword
        })
      });
      const data = await response.json();
      if (data.success) {
        showMessage('success', '积分记录已删除');
        await handleSearchUser(selectedUser);
        await loadUsers();
        await loadLogs();
      } else {
        showMessage('error', data.error);
      }
    } catch (err) {
      showMessage('error', '操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTransaction = async (transaction) => {
    // 格式化日期为 input 可接受的格式
    let formattedDate = '';
    try {
      const date = new Date(transaction.created_at);
      formattedDate = date.toISOString().split('T')[0];
    } catch (e) {
      formattedDate = '';
    }

    setEditingTransaction(transaction);
    setEditAmount(String(transaction.change_amount));
    setEditReason(transaction.reason);
    setEditDate(formattedDate);
    setShowEditModal(true);
  };

  const handleSaveTransaction = async () => {
    if (!editingTransaction) return;
    const amount = parseInt(editAmount);
    if (isNaN(amount)) {
      showMessage('error', '请输入正确的数字');
      return;
    }
    if (!editReason.trim()) {
      showMessage('error', '请输入原因');
      return;
    }

    setIsLoading(true);
    try {
      const requestBody = {
        action: 'update_transaction',
        id: editingTransaction.id,
        points: amount,
        reason: editReason.trim(),
        admin_name: adminName,
        admin_password: adminPassword
      };

      // 如果编辑了日期，也发送日期
      if (editDate) {
        requestBody.created_at = new Date(editDate).toISOString();
      }

      const response = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      if (data.success) {
        showMessage('success', '积分记录已更新');
        setShowEditModal(false);
        setEditingTransaction(null);
        await handleSearchUser(selectedUser);
        await loadUsers();
        await loadLogs();
      } else {
        showMessage('error', data.error);
      }
    } catch (err) {
      showMessage('error', '操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNickname = async (userName) => {
    const currentUser = allUsers.find(u => u.name === userName);
    const newNickname = prompt('请输入新的昵称：', currentUser?.nickname || '');
    if (newNickname === null) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_user_nickname',
          userName: userName,
          nickname: newNickname.trim(),
          admin_name: adminName,
          admin_password: adminPassword
        })
      });
      const data = await response.json();
      if (data.success) {
        showMessage('success', '昵称已更新');
        await loadUsers();
        await loadLogs();
      } else {
        showMessage('error', data.error);
      }
    } catch (err) {
      showMessage('error', '操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto mt-4 mb-8 px-4">
        <div className="rounded-acnh p-6 shadow-acnh" style={{ backgroundColor: '#f7f3df' }}>
          <div className="flex items-center mb-6">
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-lg text-white flex items-center gap-2 text-base"
              style={{ backgroundColor: '#725d42' }}
            >
              ← 返回
            </button>
          </div>
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: '#725d42' }}>
            🔐 管理员登录
          </h2>
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block mb-3 text-base font-medium" style={{ color: '#725d42' }}>
                管理员名称
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="请输入管理员名称"
                className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div className="mb-8">
              <label className="block mb-3 text-base font-medium" style={{ color: '#725d42' }}>
                密码
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-lg text-white text-lg font-semibold transition-colors"
              style={{ backgroundColor: isLoading ? '#9e9e9e' : '#4caf50' }}
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
          </form>
          {message.text && (
            <div className={`mt-6 p-4 rounded-lg text-center text-base ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-4 mb-8 px-4">
      <div className="rounded-acnh p-4 sm:p-6 shadow-acnh" style={{ backgroundColor: '#f7f3df' }}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-lg text-white flex items-center gap-2 text-base"
              style={{ backgroundColor: '#725d42' }}
            >
              ← 返回
            </button>
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#725d42' }}>
              ⚙️ 管理员后台
            </h2>
          </div>
          <button
            onClick={handleBack}
            className="px-4 py-2 rounded-lg text-white text-base"
            style={{ backgroundColor: '#e74c3c' }}
          >
            退出登录
          </button>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg text-center text-base ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-8">
          {['pending', 'users', 'logs', 'announcement', 'pointCategories'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-3 rounded-lg text-base font-medium transition-colors"
              style={{
                backgroundColor: activeTab === tab ? '#4caf50' : '#e0e0e0',
                color: activeTab === tab ? 'white' : '#333'
              }}
            >
              {tab === 'pending' && '📋 待审核'}
              {tab === 'users' && '👥 用户管理'}
              {tab === 'logs' && '📊 操作日志'}
              {tab === 'announcement' && '📢 公告管理'}
              {tab === 'pointCategories' && '🎯 积分分类'}
            </button>
          ))}
        </div>

        {activeTab === 'pending' && (
          <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-6" style={{ color: '#725d42' }}>
              积分申请 ({pendingApprovals.length})
            </h3>
            {pendingApprovals.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-base">暂无待审核的积分申请</p>
            ) : (
              <div className="space-y-6 mb-10">
                {pendingApprovals.map((item) => (
                  <div key={item.id} className="p-5 rounded-lg bg-white shadow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div>
                        <span className="font-bold text-base">{item.user_name}</span>
                        {item.user_nickname && <span className="text-gray-500 ml-2 text-sm">({item.user_nickname})</span>}
                      </div>
                      <span className="px-4 py-2 rounded-full text-white text-base" style={{ backgroundColor: '#2196F3' }}>
                        +{item.points} 积分
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3 text-base">原因：{item.reason}</p>
                    <p className="text-sm text-gray-400 mb-4">
                      申请时间：{formatDate(item.created_at)}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprovePoints(item.id)}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 rounded-lg text-white text-base"
                        style={{ backgroundColor: isLoading ? '#9e9e9e' : '#4caf50' }}
                      >
                        ✅ 批准
                      </button>
                      <button
                        onClick={() => handleRejectPoints(item.id)}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 rounded-lg text-white text-base"
                        style={{ backgroundColor: isLoading ? '#9e9e9e' : '#e74c3c' }}
                      >
                        ❌ 拒绝
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 className="text-xl sm:text-2xl font-bold mb-6" style={{ color: '#725d42' }}>
              兑换申请 ({pendingRedemptions.length})
            </h3>
            {pendingRedemptions.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-base">暂无待审核的兑换申请</p>
            ) : (
              <div className="space-y-6">
                {pendingRedemptions.map((item) => (
                  <div key={item.id} className="p-5 rounded-lg bg-white shadow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div>
                        <span className="font-bold text-base">{item.user_name}</span>
                        {item.user_nickname && <span className="text-gray-500 ml-2 text-sm">({item.user_nickname})</span>}
                      </div>
                      <span className="px-4 py-2 rounded-full text-white text-base" style={{ backgroundColor: '#ff9800' }}>
                        -{item.points_cost} 积分
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3 text-base">兑换物品：{item.item_name}</p>
                    <p className="text-sm text-gray-400 mb-4">
                      申请时间：{formatDate(item.created_at)}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveRedemption(item.id)}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 rounded-lg text-white text-base"
                        style={{ backgroundColor: isLoading ? '#9e9e9e' : '#4caf50' }}
                      >
                        ✅ 批准
                      </button>
                      <button
                        onClick={() => handleRejectRedemption(item.id)}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 rounded-lg text-white text-base"
                        style={{ backgroundColor: isLoading ? '#9e9e9e' : '#e74c3c' }}
                      >
                        ❌ 拒绝
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-6" style={{ color: '#725d42' }}>👥 用户积分管理</h3>
            
            {/* 搜索区域 */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="输入用户名或昵称搜索..."
                  className="flex-1 px-5 py-4 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
                <button
                  onClick={() => {
                    if (searchUser.trim()) {
                      const matchedUser = allUsers.find(u => 
                        u.name.toLowerCase().includes(searchUser.toLowerCase()) || 
                        (u.nickname && u.nickname.toLowerCase().includes(searchUser.toLowerCase()))
                      );
                      if (matchedUser) {
                        handleSearchUser(matchedUser.name);
                      }
                    }
                  }}
                  disabled={isLoading}
                  className="px-6 py-4 rounded-lg text-white text-base"
                  style={{ backgroundColor: '#4caf50' }}
                >
                  � 搜索
                </button>
              </div>

              <h4 className="font-bold mb-4 text-lg">👥 所有用户</h4>
              <div className="grid gap-3">
                {allUsers
                  .filter(user => {
                    if (!searchUser.trim()) return true;
                    const searchLower = searchUser.toLowerCase();
                    return user.name.toLowerCase().includes(searchLower) || 
                           (user.nickname && user.nickname.toLowerCase().includes(searchLower));
                  })
                  .map((user) => (
                    <div key={user.name} className="overflow-hidden rounded-lg">
                      {/* 用户卡片 */}
                      <div
                        className={`p-4 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 cursor-pointer transition-all ${
                          selectedUser === user.name ? 'bg-green-100 border-2 border-green-400' : 'bg-white hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          setSearchUser(user.name);
                          if (selectedUser !== user.name) {
                            handleSearchUser(user.name);
                          } else {
                            setSelectedUser(null);
                            setSearchUser('');
                          }
                        }}
                      >
                        <div className="flex-1">
                          <div className="font-medium text-base">{user.nickname || user.name}</div>
                          {user.nickname && <div className="text-sm text-gray-500">{user.name}</div>}
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="px-3 py-1 rounded-full text-white text-sm" style={{ backgroundColor: '#2196F3' }}>
                              {user.total_xp} 总经验
                            </span>
                            <span className="px-3 py-1 rounded-full text-white text-sm" style={{ backgroundColor: '#FF9800' }}>
                              {user.points} 可用积分
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {selectedUser !== user.name && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateNickname(user.name);
                              }}
                              className="px-4 py-2 text-base rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                            >
                              ✏️ 昵称
                            </button>
                          )}
                          {selectedUser === user.name && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(null);
                                setSearchUser('');
                              }}
                              className="px-4 py-2 text-base rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                              ✖️ 关闭
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 选中用户详情区域 - 直接在卡片下方展开 */}
                      {selectedUser === user.name && (
                        <div className="bg-green-50 border-x-2 border-b-2 border-green-400 p-6">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">👤</span>
                                <span className="font-bold text-2xl">
                                  {user.nickname || user.name}
                                </span>
                              </div>
                              {user.nickname && <span className="text-sm text-gray-500 ml-2">({user.name})</span>}
                              <div className="flex flex-wrap gap-3 mt-4">
                                <span className="px-5 py-3 rounded-full text-white text-lg" style={{ backgroundColor: '#2196F3' }}>
                                  🎖️ {userBalance} 总经验
                                </span>
                                <span className="px-5 py-3 rounded-full text-white text-lg" style={{ backgroundColor: '#FF9800' }}>
                                  🪙 {userPoints} 可用积分
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleUpdateNickname(user.name)}
                                className="px-4 py-3 text-base rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                              >
                                ✏️ 编辑昵称
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 mb-6">
                            <div className="flex flex-col sm:flex-row gap-3">
                              <input
                                type="number"
                                value={operationAmount}
                                onChange={(e) => setOperationAmount(e.target.value)}
                                placeholder="积分数"
                                className="w-full sm:w-40 px-5 py-4 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                              />
                              <select
                                value={operationReason}
                                onChange={(e) => setOperationReason(e.target.value)}
                                className="flex-1 px-5 py-4 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                              >
                                <option value="">选择原因</option>
                                <option value="专业解答 & 资讯分享">专业解答 & 资讯分享 (+5积分)</option>
                                <option value="Kahoot 优胜">Kahoot 优胜 (+10积分)</option>
                                <option value="Peer Tips">Peer Tips (+15积分)</option>
                                <option value="分享知识（DD, huddle, 邮件等）">分享知识（DD, huddle, 邮件等）(+15积分)</option>
                                <option value="管理员手动调整">管理员手动调整（自定义）</option>
                              </select>
                            </div>
                            {operationReason === '管理员手动调整' && (
                              <div>
                                <input
                                  type="text"
                                  value={operationCustomReason}
                                  onChange={(e) => setOperationCustomReason(e.target.value)}
                                  placeholder="请输入自定义原因..."
                                  className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                                />
                              </div>
                            )}
                            <div className="flex gap-3">
                              <button
                                onClick={handleAddPoints}
                                disabled={isLoading}
                                className="flex-1 px-4 py-3 rounded-lg text-white text-base"
                                style={{ backgroundColor: '#4caf50' }}
                              >
                                ➕ 添加积分
                              </button>
                            </div>
                          </div>

                          <h4 className="font-bold mb-4 text-lg">📋 积分变动记录</h4>
                          <div className="max-h-80 overflow-y-auto bg-white rounded-lg p-3">
                            {userTransactions.length === 0 ? (
                              <p className="text-gray-500 py-6 text-base text-center">暂无记录</p>
                            ) : (
                              <div className="space-y-3">
                                {userTransactions.map((t, i) => (
                                  <div key={i} className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                                      <div>
                                        <div className="text-gray-700 text-base">{formatDate(t.created_at)}</div>
                                        <div className="text-gray-500 text-base">{t.reason}</div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className={`font-bold text-lg ${t.change_amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {t.change_amount > 0 ? '+' : ''}{t.change_amount}
                                        </span>
                                        <span className="text-sm text-gray-500">余额: {t.balance_after}</span>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleEditTransaction(t)}
                                        disabled={isLoading}
                                        className="px-3 py-2 text-base rounded bg-blue-500 text-white"
                                      >
                                        编辑
                                      </button>
                                      <button
                                        onClick={() => handleDeleteTransaction(t.id)}
                                        disabled={isLoading}
                                        className="px-3 py-2 text-base rounded bg-red-500 text-white"
                                      >
                                        删除
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-6" style={{ color: '#725d42' }}>📊 操作日志</h3>
            <div className="max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-base">暂无操作记录</p>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log.id} className="p-4 bg-white rounded-lg shadow">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                        <div>
                          <div className="text-gray-700 text-base">{formatDate(log.created_at)}</div>
                          <div className="text-gray-500 text-sm">管理员: {log.admin_name}</div>
                        </div>
                        <span className={`px-3 py-1 rounded text-base ${
                          log.action === 'approve' ? 'bg-green-100 text-green-700' :
                          log.action === 'reject' ? 'bg-red-100 text-red-700' :
                          log.action === 'add_points' ? 'bg-blue-100 text-blue-700' :
                          log.action === 'deduct_points' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {log.action}
                        </span>
                      </div>
                      <div className="text-gray-700 text-base">
                        {log.target_user && <div>目标用户: {log.target_user}</div>}
                        <div className="mt-1">{log.details}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'announcement' && (
          <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-6" style={{ color: '#725d42' }}>📢 公告栏管理</h3>
            <div className="mb-6">
              <label className="block mb-3 text-base font-medium" style={{ color: '#725d42' }}>
                公告标题
              </label>
              <input
                type="text"
                value={announcementConfig.title || ''}
                onChange={(e) => setAnnouncementConfig({ ...announcementConfig, title: e.target.value })}
                className="w-full px-5 py-4 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <label className="text-base font-medium" style={{ color: '#725d42' }}>
                  公告内容
                </label>
                <button
                  onClick={() => setAnnouncementConfig({
                    ...announcementConfig,
                    sections: [...announcementConfig.sections, { title: '新板块', content: [''] }]
                  })}
                  className="px-4 py-2 bg-blue-500 text-white rounded text-base"
                >
                  + 添加板块
                </button>
              </div>

              {announcementConfig.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-6 p-5 bg-white rounded-lg shadow">
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => {
                        const newSections = [...announcementConfig.sections];
                        newSections[sectionIndex].title = e.target.value;
                        setAnnouncementConfig({ ...announcementConfig, sections: newSections });
                      }}
                      placeholder="板块标题"
                      className="flex-1 px-4 py-3 text-base border border-gray-300 rounded focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => {
                        const newSections = announcementConfig.sections.filter((_, i) => i !== sectionIndex);
                        setAnnouncementConfig({ ...announcementConfig, sections: newSections });
                      }}
                      className="px-4 py-3 bg-red-500 text-white rounded text-base"
                    >
                      删除
                    </button>
                  </div>

                  <div className="space-y-3">
                    {section.content.map((line, lineIndex) => (
                      <div key={lineIndex} className="flex gap-3">
                        <input
                          type="text"
                          value={line}
                          onChange={(e) => {
                            const newSections = [...announcementConfig.sections];
                            newSections[sectionIndex].content[lineIndex] = e.target.value;
                            setAnnouncementConfig({ ...announcementConfig, sections: newSections });
                          }}
                          placeholder="内容行"
                          className="flex-1 px-4 py-3 text-base border border-gray-300 rounded focus:outline-none focus:border-primary"
                        />
                        <button
                          onClick={() => {
                            const newSections = [...announcementConfig.sections];
                            newSections[sectionIndex].content = newSections[sectionIndex].content.filter((_, i) => i !== lineIndex);
                            setAnnouncementConfig({ ...announcementConfig, sections: newSections });
                          }}
                          className="px-4 py-3 bg-gray-200 rounded text-base"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const newSections = [...announcementConfig.sections];
                      newSections[sectionIndex].content.push('');
                      setAnnouncementConfig({ ...announcementConfig, sections: newSections });
                    }}
                    className="mt-3 px-4 py-2 bg-gray-100 rounded text-base"
                  >
                    + 添加内容行
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={saveAnnouncementConfig}
                disabled={isLoading}
                className="flex-1 px-6 py-3 rounded-lg text-white font-medium text-base"
                style={{ backgroundColor: isLoading ? '#9e9e9e' : '#4caf50' }}
              >
                {isLoading ? '保存中...' : '保存公告'}
              </button>
              <button
                onClick={() => {
                  const jsonStr = JSON.stringify(announcementConfig, null, 2);
                  prompt('复制以下JSON配置:', jsonStr);
                }}
                className="flex-1 px-6 py-3 rounded-lg bg-gray-200 text-gray-700 text-base"
              >
                导出JSON
              </button>
            </div>
          </div>
        )}

        {activeTab === 'pointCategories' && (
          <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-6" style={{ color: '#725d42' }}>🎯 积分分类管理</h3>
            
            <div className="space-y-6">
              {pointCategories.map((category, categoryIndex) => (
                <div key={category.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                    <div className="flex-1 flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) => {
                          const newCategories = [...pointCategories];
                          newCategories[categoryIndex].name = e.target.value;
                          setPointCategories(newCategories);
                        }}
                        className="flex-1 px-4 py-2 text-base border border-gray-300 rounded focus:outline-none focus:border-primary"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const newCategories = pointCategories.filter((_, i) => i !== categoryIndex);
                        setPointCategories(newCategories);
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded text-base"
                    >
                      删除分类
                    </button>
                  </div>

                  <div className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const newCategories = [...pointCategories];
                            newCategories[categoryIndex].items[itemIndex].name = e.target.value;
                            setPointCategories(newCategories);
                          }}
                          placeholder="项目名称"
                          className="flex-1 px-4 py-2 text-base border border-gray-300 rounded focus:outline-none focus:border-primary"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">+</span>
                          <input
                            type="number"
                            value={item.points}
                            onChange={(e) => {
                              const newCategories = [...pointCategories];
                              newCategories[categoryIndex].items[itemIndex].points = parseInt(e.target.value) || 0;
                              setPointCategories(newCategories);
                            }}
                            min="1"
                            className="w-24 px-4 py-2 text-base border border-gray-300 rounded focus:outline-none focus:border-primary"
                          />
                          <span className="text-gray-500">积分</span>
                          <button
                            onClick={() => {
                              const newCategories = [...pointCategories];
                              newCategories[categoryIndex].items = newCategories[categoryIndex].items.filter((_, i) => i !== itemIndex);
                              setPointCategories(newCategories);
                            }}
                            className="px-3 py-2 bg-gray-200 rounded text-base"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const newCategories = [...pointCategories];
                      newCategories[categoryIndex].items.push({ name: '', points: 5 });
                      setPointCategories(newCategories);
                    }}
                    className="mt-3 px-4 py-2 bg-gray-100 rounded text-base"
                  >
                    + 添加项目
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const newId = `category_${Date.now()}`;
                setPointCategories([...pointCategories, {
                  id: newId,
                  name: '新分类',
                  icon: '📌',
                  items: [{ name: '', points: 5 }]
                }]);
              }}
              className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg text-base"
            >
              + 添加分类
            </button>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={savePointCategories}
                disabled={isLoading}
                className="flex-1 px-6 py-3 rounded-lg text-white font-medium text-base"
                style={{ backgroundColor: isLoading ? '#9e9e9e' : '#4caf50' }}
              >
                {isLoading ? '保存中...' : '保存积分分类'}
              </button>
              <button
                onClick={() => {
                  const jsonStr = JSON.stringify(pointCategories, null, 2);
                  prompt('复制以下JSON配置:', jsonStr);
                }}
                className="flex-1 px-6 py-3 rounded-lg bg-gray-200 text-gray-700 text-base"
              >
                导出JSON
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 编辑积分记录模态框 */}
      {showEditModal && (
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
            zIndex: 999999,
            pointerEvents: 'auto',
            overflow: 'hidden'
          }}
          onClick={() => {
            if (!isLoading) {
              setShowEditModal(false);
              setEditingTransaction(null);
            }
          }}
        >
          <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                width: '90%',
                maxWidth: '450px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>
              ✏️ 编辑积分记录
            </h3>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#333' }}>
                用户：
              </label>
              <div style={{ padding: '8px 12px', backgroundColor: '#f5f5f5', borderRadius: '8px', fontSize: '14px' }}>
                {editingTransaction?.user_name}
                {editingTransaction?.user_nickname && ` (${editingTransaction.user_nickname})`}
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#333' }}>
                积分变动：
              </label>
              <input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="请输入积分数"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: isLoading ? '#f5f5f5' : 'white',
                  color: isLoading ? '#999' : '#333'
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#333' }}>
                原因：
              </label>
              <input
                type="text"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="请输入原因"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: isLoading ? '#f5f5f5' : 'white',
                  color: isLoading ? '#999' : '#333'
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#333' }}>
                日期：
              </label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: isLoading ? '#f5f5f5' : 'white',
                  color: isLoading ? '#999' : '#333'
                }}
              />
            </div>

            {message.text && (
              <div
                style={{
                  marginBottom: '12px',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: message.type === 'error' ? '#f8d7da' : '#d4edda',
                  color: message.type === 'error' ? '#721c24' : '#155724'
                }}
              >
                {message.text}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                onClick={() => {
                  if (!isLoading) {
                    setShowEditModal(false);
                    setEditingTransaction(null);
                  }
                }}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: isLoading ? '#e0e0e0' : '#f5f5f5',
                  color: isLoading ? '#9e9e9e' : '#333',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                取消
              </button>
              <button
                onClick={handleSaveTransaction}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: isLoading ? '#9e9e9e' : '#4caf50',
                  color: 'white',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                {isLoading ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
