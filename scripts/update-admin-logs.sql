-- 更新 admin_logs 表，添加 update_config action 类型
ALTER TABLE admin_logs DROP CONSTRAINT admin_logs_action_check;
ALTER TABLE admin_logs ADD CONSTRAINT admin_logs_action_check
    CHECK (action IN ('approve', 'reject', 'add_points', 'deduct_points', 'register_user', 'login', 'update_config'));