-- ========================================
-- 完整数据转移脚本：从 data.json 转移到 Supabase
-- 执行日期: 2026-05-06
-- ========================================

-- 1. 清空现有数据（可选，如果需要重新开始）
-- DELETE FROM point_transactions;
-- DELETE FROM xp_total;

-- 2. 插入所有用户到 xp_total 表
INSERT INTO xp_total (name, total_xp) VALUES
('Ada', 40),
('Amelia', 40),
('Alvin', 105),
('Ashely', 45),
('Bella', 40),
('Calvin', 175),
('Cici', 0),
('Daisy', 50),
('Diana', 55),
('Emily', 40),
('Eric', 55),
('Fay', 55),
('Frank', 75),
('Grace', 55),
('Hedy', 55),
('Jacky', 95),
('James', 80),
('Jason', 55),
('Jessie', 50),
('Joanna', 45),
('Laura', 45),
('Leon', 55),
('Luna', 50),
('May', 40),
('Mia', 60),
('Phoebe', 40),
('Ray', 40),
('Seven', 0),
('Shine', 55),
('Stacy', 60),
('Sunny', 60),
('Tracy', 155),
('Victoria', 75),
('Wency', 80),
('Yolanda', 60),
('Zoey', 65),
('Xiaoxiao', 0),
('Piaopiao', 0)
ON CONFLICT (name) DO UPDATE SET total_xp = EXCLUDED.total_xp;

-- 3. 插入积分变动记录
-- Ada
INSERT INTO point_transactions (user_name, change_amount, balance_after, reason, type, created_by)
SELECT 'Ada', 10, 10, '新用户注册', 'initial', 'system' WHERE NOT EXISTS (SELECT 1 FROM point_transactions WHERE user_name = 'Ada' AND reason = '新用户注册');

-- 验证数据
SELECT 'xp_total 表数据验证:' as info;
SELECT COUNT(*) as total_users, SUM(total_xp) as total_xp FROM xp_total;

SELECT 'point_transactions 表数据验证:' as info;
SELECT COUNT(*) as total_transactions FROM point_transactions;

-- 显示前10个用户
SELECT * FROM xp_total ORDER BY total_xp DESC LIMIT 10;