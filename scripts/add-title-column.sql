-- 1. 为 xp_total 表添加 title 字段（用于存储用户称号）
ALTER TABLE IF EXISTS xp_total 
ADD COLUMN IF NOT EXISTS title VARCHAR(100);

-- 2. 先查看现有的 action 值（可选，用于调试）
-- SELECT DISTINCT action FROM admin_logs;

-- 3. 先删除现有的约束（如果存在）
ALTER TABLE admin_logs 
DROP CONSTRAINT IF EXISTS admin_logs_action_check;

-- 4. 不重新添加约束，或者使用更宽松的约束
-- 注意：如果需要添加约束，请先运行上面的 SELECT 语句查看所有现有的 action 值
-- 然后将它们全部添加到下面的 CHECK 约束中
