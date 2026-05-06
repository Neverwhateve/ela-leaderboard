import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const logAdminAction = async (adminName, action, targetUser, details) => {
  await supabase
    .from('admin_logs')
    .insert({
      admin_name: adminName,
      action,
      target_user: targetUser,
      details
    });
};

const getUserBalance = async (userName) => {
  const { data } = await supabase
    .from('xp_total')
    .select('total_xp')
    .eq('name', userName)
    .single();
  return data?.total_xp || 0;
};

const updateUserBalance = async (userName, changeAmount, reason, type, adminName) => {
  const currentBalance = await getUserBalance(userName);
  const newBalance = currentBalance + changeAmount;

  await supabase
    .from('xp_total')
    .update({ total_xp: newBalance })
    .eq('name', userName);

  await supabase
    .from('point_transactions')
    .insert({
      user_name: userName,
      change_amount: changeAmount,
      balance_after: newBalance,
      reason,
      type,
      created_by: adminName
    });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, admin_name, admin_password, id, user_name, points, reason, item_name, points_cost, reject_reason } = req.body;

  if (!admin_name || !admin_password) {
    return res.status(400).json({ error: '需要管理员身份验证' });
  }

  try {
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('name', admin_name)
      .eq('password_hash', admin_password)
      .single();

    if (adminError || !admin) {
      return res.status(401).json({ error: '管理员身份验证失败' });
    }

    switch (action) {
      case 'get_pending':
        const pendingApprovals = await supabase
          .from('pending_approvals')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        const pendingRedemptions = await supabase
          .from('redemption_requests')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        return res.status(200).json({
          success: true,
          pending_approvals: pendingApprovals.data || [],
          pending_redemptions: pendingRedemptions.data || []
        });

      case 'approve_points':
        const { data: approval, error: approvalError } = await supabase
          .from('pending_approvals')
          .update({
            status: 'approved',
            reviewed_by: admin_name,
            reviewed_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('status', 'pending')
          .select()
          .single();

        if (approvalError) throw approvalError;
        if (!approval) {
          return res.status(404).json({ error: '申请不存在或已被处理' });
        }

        await updateUserBalance(
          approval.user_name,
          approval.points,
          `积分申请：${approval.reason}`,
          'auto_approved',
          admin_name
        );

        await logAdminAction(admin_name, 'approve', approval.user_name, `批准积分申请：+${approval.points}积分，原因：${approval.reason}`);

        return res.status(200).json({ success: true, message: '积分申请已批准' });

      case 'reject_points':
        const { data: rejectedApproval, error: rejectApprovalError } = await supabase
          .from('pending_approvals')
          .update({
            status: 'rejected',
            reviewed_by: admin_name,
            reviewed_at: new Date().toISOString(),
            reject_reason: reject_reason || ''
          })
          .eq('id', id)
          .eq('status', 'pending')
          .select()
          .single();

        if (rejectApprovalError) throw rejectApprovalError;
        if (!rejectedApproval) {
          return res.status(404).json({ error: '申请不存在或已被处理' });
        }

        await logAdminAction(admin_name, 'reject', rejectedApproval.user_name, `拒绝积分申请：${rejectedApproval.reason}，原因：${reject_reason}`);

        return res.status(200).json({ success: true, message: '积分申请已拒绝' });

      case 'approve_redemption':
        const { data: redemption, error: redemptionError } = await supabase
          .from('redemption_requests')
          .update({
            status: 'approved',
            reviewed_by: admin_name,
            reviewed_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('status', 'pending')
          .select()
          .single();

        if (redemptionError) throw redemptionError;
        if (!redemption) {
          return res.status(404).json({ error: '兑换申请不存在或已被处理' });
        }

        await updateUserBalance(
          redemption.user_name,
          -redemption.points_cost,
          `兑换：${redemption.item_name}`,
          'redemption',
          admin_name
        );

        await logAdminAction(admin_name, 'approve', redemption.user_name, `批准兑换申请：${redemption.item_name}，消耗${redemption.points_cost}积分`);

        return res.status(200).json({ success: true, message: '兑换申请已批准' });

      case 'reject_redemption':
        const { data: rejectedRedemption, error: rejectRedemptionError } = await supabase
          .from('redemption_requests')
          .update({
            status: 'rejected',
            reviewed_by: admin_name,
            reviewed_at: new Date().toISOString(),
            reject_reason: reject_reason || ''
          })
          .eq('id', id)
          .eq('status', 'pending')
          .select()
          .single();

        if (rejectRedemptionError) throw rejectRedemptionError;
        if (!rejectedRedemption) {
          return res.status(404).json({ error: '兑换申请不存在或已被处理' });
        }

        await logAdminAction(admin_name, 'reject', rejectedRedemption.user_name, `拒绝兑换申请：${rejectedRedemption.item_name}，原因：${reject_reason}`);

        return res.status(200).json({ success: true, message: '兑换申请已拒绝' });

      case 'add_points':
        if (!user_name || !points || points <= 0) {
          return res.status(400).json({ error: '需要填写用户名和积分数' });
        }

        await updateUserBalance(user_name, points, reason || '管理员添加积分', 'admin_add', admin_name);
        await logAdminAction(admin_name, 'add_points', user_name, `手动添加${points}积分，原因：${reason}`);

        return res.status(200).json({ success: true, message: `已为 ${user_name} 添加 ${points} 积分` });

      case 'deduct_points':
        if (!user_name || !points || points <= 0) {
          return res.status(400).json({ error: '需要填写用户名和积分数' });
        }

        const currentBal = await getUserBalance(user_name);
        if (currentBal < points) {
          return res.status(400).json({ error: `${user_name} 当前积分不足，当前积分：${currentBal}` });
        }

        await updateUserBalance(user_name, -points, reason || '管理员扣除积分', 'admin_deduct', admin_name);
        await logAdminAction(admin_name, 'deduct_points', user_name, `手动扣除${points}积分，原因：${reason}`);

        return res.status(200).json({ success: true, message: `已为 ${user_name} 扣除 ${points} 积分` });

      case 'get_user_balance':
        const balance = await getUserBalance(user_name);
        const transactions = await supabase
          .from('point_transactions')
          .select('*')
          .eq('user_name', user_name)
          .order('created_at', { ascending: false })
          .limit(50);

        return res.status(200).json({
          success: true,
          user_name,
          balance,
          transactions: transactions.data || []
        });

      case 'get_logs':
        const logs = await supabase
          .from('admin_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        return res.status(200).json({
          success: true,
          logs: logs.data || []
        });

      case 'get_all_users':
        const users = await supabase
          .from('xp_total')
          .select('name, nickname, total_xp')
          .order('total_xp', { ascending: false });

        return res.status(200).json({
          success: true,
          users: users.data || []
        });

      case 'update_user_nickname':
        const { userName, nickname } = req.body;

        if (!userName) {
          return res.status(400).json({ success: false, error: '用户名不能为空' });
        }

        const { error: nickError } = await supabase
          .from('xp_total')
          .update({ nickname })
          .eq('name', userName);

        if (nickError) {
          console.error('更新昵称失败:', nickError);
          return res.status(500).json({ success: false, error: '更新失败' });
        }

        // 记录操作日志
        await supabase.from('admin_logs').insert([{
          action: 'update_nickname',
          admin_name: adminName,
          target_user: userName,
          reason: `设置昵称为 ${nickname || '(空)'}`,
          created_at: new Date().toISOString()
        }]);

        return res.status(200).json({ success: true });

      case 'get_redemption_history':
        const history = await supabase
          .from('redemption_requests')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        return res.status(200).json({
          success: true,
          history: history.data || []
        });

      case 'delete_transaction':
        const { data: transactionToDelete, error: deleteTxError } = await supabase
          .from('point_transactions')
          .select('*')
          .eq('id', id)
          .single();

        if (deleteTxError || !transactionToDelete) {
          return res.status(404).json({ error: '积分记录不存在' });
        }

        await supabase
          .from('xp_total')
          .update({ total_xp: transactionToDelete.balance_after - transactionToDelete.change_amount })
          .eq('name', transactionToDelete.user_name);

        await supabase
          .from('point_transactions')
          .delete()
          .eq('id', id);

        await logAdminAction(admin_name, 'delete_transaction', transactionToDelete.user_name, `删除积分记录：${transactionToDelete.change_amount > 0 ? '+' : ''}${transactionToDelete.change_amount}积分，原因：${transactionToDelete.reason}`);

        return res.status(200).json({ success: true, message: '积分记录已删除' });

      case 'update_transaction':
        const { data: transactionToUpdate, error: updateTxError } = await supabase
          .from('point_transactions')
          .select('*')
          .eq('id', id)
          .single();

        if (updateTxError || !transactionToUpdate) {
          return res.status(404).json({ error: '积分记录不存在' });
        }

        const oldAmount = transactionToUpdate.change_amount;
        const newAmount = points;
        const amountDiff = newAmount - oldAmount;
        const newBalance = transactionToUpdate.balance_after + amountDiff;

        await supabase
          .from('point_transactions')
          .update({
            change_amount: newAmount,
            balance_after: newBalance,
            reason: reason || transactionToUpdate.reason
          })
          .eq('id', id);

        await supabase
          .from('xp_total')
          .update({ total_xp: newBalance })
          .eq('name', transactionToUpdate.user_name);

        await logAdminAction(admin_name, 'update_transaction', transactionToUpdate.user_name, `修改积分记录：从${oldAmount}改为${newAmount}，原因：${reason || transactionToUpdate.reason}`);

        return res.status(200).json({ success: true, message: '积分记录已更新' });

      case 'add_transaction':
        if (!user_name || !points) {
          return res.status(400).json({ error: '需要填写用户名和积分数' });
        }

        const currentUserBalance = await getUserBalance(user_name);
        const newUserBalance = currentUserBalance + points;

        await supabase
          .from('point_transactions')
          .insert({
            user_name,
            change_amount: points,
            balance_after: newUserBalance,
            reason: reason || '管理员手动添加',
            type: 'admin_add',
            created_by: admin_name
          });

        await supabase
          .from('xp_total')
          .update({ total_xp: newUserBalance })
          .eq('name', user_name);

        await logAdminAction(admin_name, 'add_points', user_name, `手动添加积分记录：${points > 0 ? '+' : ''}${points}积分，原因：${reason || '管理员手动添加'}`);

        return res.status(200).json({ success: true, message: '积分记录已添加' });

      default:
        return res.status(400).json({ error: '未知的操作' });
    }
  } catch (err) {
    console.error('Review error:', err);
    return res.status(500).json({ error: '服务器错误' });
  }
};
