-- ========================================
-- 完整数据转移脚本：从 data.json 转移到 Supabase
-- 执行日期: 2026-05-06
-- ========================================

-- 1. 插入所有用户到 xp_total 表
INSERT INTO xp_total (name, total_xp) VALUES
('Ada', 40),
('Amelia', 40),
('Angela', 30),
('April', 50),
('Barry', 30),
('Bryan', 140),
('Candy', 60),
('Carmen', 30),
('CC', 30),
('Changliang', 30),
('Cody', 50),
('Daisy Lu', 45),
('Danni', 35),
('Dido', 10),
('DJ', 30),
('Dobby', 45),
('Edward', 30),
('Gina', 40),
('Grace', 30),
('Heidi', 30),
('Iris', 40),
('Jason', 40),
('Jesse', 40),
('Jim', 30),
('Joy', 40),
('Kevin', 30),
('Krystal', 45),
('Laughing', 50),
('Lily', 30),
('Lori', 30),
('Max', 30),
('Mediha', 30),
('Moon', 60),
('Nanyi', 30),
('Olivia', 50),
('Oscar', 65),
('Patrick', 30),
('Rik', 50),
('Rita', 30),
('Serena', 60),
('Seven', 30),
('Strange', 60),
('Tina', 30),
('Vicky', 30),
('Victor', 30),
('Vincent', 30),
('Xiaolan', 75),
('Ya', 45),
('Yolanda', 30),
('Yoyo', 40),
('Yulong', 50),
('Zoe', 55),
('Zoey', 10),
('Sally', 40),
('Xiaoxiao', 45),
('Julia', 35),
('Vika', 40),
('Alvin', 65),
('Alicia', 50),
('Tracy', 75),
('Lucia', 45)
ON CONFLICT (name) DO UPDATE SET total_xp = EXCLUDED.total_xp;

-- 2. 插入积分变动记录（使用简单的 INSERT）
-- Ada
INSERT INTO point_transactions (user_name, change_amount, balance_after, reason, type, created_by)
VALUES ('Ada', 10, 10, '新用户注册', 'initial', 'system');
INSERT INTO point_transactions (user_name, change_amount, balance_after, reason, type, created_by)
VALUES ('Ada', 10, 20, 'Outing 九宫图', 'initial', 'system');
INSERT INTO point_transactions (user_name, change_amount, balance_after, reason, type, created_by)
VALUES ('Ada', 20, 40, '4月 Training 已完成', 'initial', 'system');

-- Amelia
INSERT INTO point_transactions (user_name, change_amount, balance_after, reason, type, created_by)
VALUES ('Amelia', 10, 10, '新用户注册', 'initial', 'system');
INSERT INTO point_transactions (user_name, change_amount, balance_after, reason, type, created_by)
VALUES ('Amelia', 10, 20, 'Outing 九宫图', 'initial', 'system');
INSERT INTO point_transactions (user_name, change_amount, balance_after, reason, type, created_by)
VALUES ('Amelia', 20, 40, '4月 Training 已完成', 'initial', 'system');

-- Bryan
INSERT INTO point_transactions (user_name, change_amount, balance_after, reason, type, created_by)
VALUES ('Bryan', 10, 10, '新用户注册', 'initial', 'system');
INSERT INTO point_transactions (user_name, change_amount, balance_after, reason, type, created_by)
VALUES ('Bryan', 10, 20, 'Outing 九宫图', 'initial', 'system');
INSERT INTO point_transactions (user_name, change_amount, balance_after, reason, type, created_by)
VALUES ('Bryan', 60, 80, '四封邮件的含金量', 'initial', 'system');
INSERT INTO point_transactions (user_name, change_amount, balance_after, reason, type, created_by)
VALUES ('Bryan', 20, 100, 'DD 分享', 'initial', 'system');
INSERT INTO point_transactions (user_name, change_amount, balance_after, reason, type, created_by)
VALUES ('Bryan', 5, 105, '认真学习 Town Hall', 'initial', 'system');
INSERT INTO point_transactions (user_name, change_amount, balance_after, reason, type, created_by)
VALUES ('Bryan', 15, 120, 'Acc 邮件分享', 'initial', 'system');
INSERT INTO point_transactions (user_name, change_amount, balance_after, reason, type, created_by)
VALUES ('Bryan', 20, 140, '4月 Training 已完成', 'initial', 'system');

-- Tracy
INSERT INTO point_transactions (user_name, change_amount, balance_after, reason, type, created_by)
VALUES ('Tracy', 10, 10, '新用户注册', 'initial', 'system');
INSERT INTO point_transactions (user_name, change_amount, balance_after, reason, type, created_by)
VALUES ('Tracy', 5, 15, '认真学习 Town Hall', 'initial', 'system');
INSERT INTO point_transactions (user_name, change_amount, balance_after, reason, type, created_by)
VALUES ('Tracy', 40, 55, '发起 Peer Tips*8', 'initial', 'system');
INSERT INTO point_transactions (user_name, change_amount, balance_after, reason, type, created_by)
VALUES ('Tracy', 20, 75, '4月 Training 已完成', 'initial', 'system');

-- 验证数据
SELECT 'xp_total 表数据验证:' as info;
SELECT COUNT(*) as total_users, SUM(total_xp) as total_xp FROM xp_total;

SELECT 'point_transactions 表数据验证:' as info;
SELECT COUNT(*) as total_transactions FROM point_transactions;

-- 显示前20个用户
SELECT * FROM xp_total ORDER BY total_xp DESC LIMIT 20;