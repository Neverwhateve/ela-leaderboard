-- 添加 admin_batch_add 类型到 point_transactions 表的 CHECK 约束
-- 创建日期: 2026-05-31

-- 移除原有的 CHECK 约束
ALTER TABLE point_transactions DROP CONSTRAINT IF EXISTS point_transactions_type_check;

-- 添加新的 CHECK 约束，包含 admin_batch_add 类型
ALTER TABLE point_transactions ADD CONSTRAINT point_transactions_type_check 
    CHECK (type IN ('admin_add', 'admin_deduct', 'redemption', 'auto_approved', 'initial', 'admin_batch_add'));

-- 同时更新 admin_logs 表的 action CHECK 约束（如果需要）
ALTER TABLE admin_logs DROP CONSTRAINT IF EXISTS admin_logs_action_check;
ALTER TABLE admin_logs ADD CONSTRAINT admin_logs_action_check 
    CHECK (action IN ('approve', 'reject', 'add_points', 'deduct_points', 'batch_add_points', 'register_user', 'login', 'update_title'));
