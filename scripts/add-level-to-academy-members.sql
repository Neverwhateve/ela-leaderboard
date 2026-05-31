-- ========================================
-- 为学院成员表添加等级字段
-- 执行日期: 2026-05-31
-- ========================================

-- 添加等级字段（Lv1, Lv2, Lv3）
ALTER TABLE academy_members ADD COLUMN IF NOT EXISTS level VARCHAR(10) DEFAULT 'Lv1';

-- 更新现有成员为 Lv1
UPDATE academy_members SET level = 'Lv1' WHERE level IS NULL;

-- 添加约束确保等级值合法
ALTER TABLE academy_members DROP CONSTRAINT IF EXISTS valid_level;
ALTER TABLE academy_members ADD CONSTRAINT valid_level CHECK (level IN ('Lv1', 'Lv2', 'Lv3'));

-- 创建更新等级的函数
CREATE OR REPLACE FUNCTION update_member_level(
    p_user_name VARCHAR(100),
    p_academy VARCHAR(50),
    p_level VARCHAR(10)
)
RETURNS void AS $$
BEGIN
    UPDATE academy_members
    SET level = p_level
    WHERE user_name = p_user_name AND academy = p_academy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
