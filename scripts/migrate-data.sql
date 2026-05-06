-- ========================================
-- 数据转移脚本：从 data.json 转移到 Supabase
-- 执行日期: 2026-05-06
-- ========================================

-- 1. 插入用户到 xp_total 表
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

-- 2. 插入积分变动记录
-- Ada
INSERT INTO point_transactions (user_name, change_amount, balance_after, reason, type, created_by) VALUES
('Ada', 10, 10, '新用户注册', 'initial', 'system'),
('Ada', 10, 20, 'Outing 九宫图', 'initial', 'system'),
('Ada', 20, 40, '4月 Training 已完成', 'initial', 'system');

-- Amelia
INSERT INTO point_transactions (user_name, change_amount, balance_after, reason, type, created_by) VALUES
('Amelia', 10, 10, '新用户注册', 'initial', 'system'),
('Amelia', 10, 20, 'Outing 九宫图', 'initial', 'system'),
('Amelia', 20, 40, '4月 Training 已完成', 'initial', 'system');

-- Alvin
INSERT INTO point_transactions (user_name, change_amount, balance_after, reason, type, created_by) VALUES
('Alvin', 10, 10, '新用户注册', 'initial', 'system'),
('Alvin', 25, 35, '学习进度达标', 'initial', 'system'),
('Alvin', 40, 75, '完成隐藏任务', 'initial', 'system'),
('Alvin', 30, 105, '5月 Training 已完成', 'initial', 'system');

-- 请根据实际 data.json 数据补充其他用户的记录...
-- 这里只是示例，你需要根据实际数据添加

-- 3. 验证数据
SELECT 'xp_total 表数据验证:' as info;
SELECT COUNT(*) as total_users, SUM(total_xp) as total_xp FROM xp_total;

SELECT 'point_transactions 表数据验证:' as info;
SELECT COUNT(*) as total_transactions FROM point_transactions;