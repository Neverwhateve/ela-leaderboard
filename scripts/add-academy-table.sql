-- ========================================
-- 学院成员表 (academy_members)
-- 创建日期: 2026-05-31
-- ========================================

-- 学院成员表：记录用户与学院的关系（一个用户可以属于多个学院）
CREATE TABLE IF NOT EXISTS academy_members (
    id BIGSERIAL PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    academy VARCHAR(50) NOT NULL CHECK (academy IN ('种草实验室', '隐藏技能局', '偶像集中营')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(100),
    UNIQUE(user_name, academy)
);

-- 创建索引加速查询
CREATE INDEX IF NOT EXISTS idx_academy_members_user ON academy_members(user_name);
CREATE INDEX IF NOT EXISTS idx_academy_members_academy ON academy_members(academy);

-- 启用 RLS
ALTER TABLE academy_members ENABLE ROW LEVEL SECURITY;

-- 公开读取策略
CREATE POLICY "Anyone can read academy members" ON academy_members
    FOR SELECT USING (true);

-- service_role 写入策略
CREATE POLICY "Service role can manage academy members" ON academy_members
    FOR ALL USING (auth.role() = 'service_role');
