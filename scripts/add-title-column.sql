-- 为 xp_total 表添加 title 字段（用于存储用户称号）
ALTER TABLE IF EXISTS xp_total 
ADD COLUMN IF NOT EXISTS title VARCHAR(100);

-- 更新 admin_logs 表的 action 检查约束，添加 update_title
ALTER TABLE admin_logs 
DROP CONSTRAINT IF EXISTS admin_logs_action_check;

ALTER TABLE admin_logs 
ADD CONSTRAINT admin_logs_action_check 
CHECK (action IN ('approve', 'reject', 'add_points', 'deduct_points', 'register_user', 'login', 'update_nickname', 'update_title', 'delete_transaction', 'update_transaction'));
