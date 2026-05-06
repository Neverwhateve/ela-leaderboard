-- ========================================
-- TLL Board 数据库结构
-- 创建日期: 2026-05-06
-- ========================================

-- 1. 管理员表 (admins)
CREATE TABLE IF NOT EXISTS admins (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 待审核申请表 (pending_approvals)
CREATE TABLE IF NOT EXISTS pending_approvals (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('points', 'redemption')),
    user_name VARCHAR(100) NOT NULL,
    user_nickname VARCHAR(100),
    reason TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reject_reason TEXT
);

-- 3. 兑换申请表 (redemption_requests)
CREATE TABLE IF NOT EXISTS redemption_requests (
    id BIGSERIAL PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    user_nickname VARCHAR(100),
    item_name VARCHAR(200) NOT NULL,
    points_cost INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reject_reason TEXT
);

-- 4. 积分变动流水表 (point_transactions)
CREATE TABLE IF NOT EXISTS point_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    user_nickname VARCHAR(100),
    change_amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reason TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('admin_add', 'admin_deduct', 'redemption', 'auto_approved', 'initial')),
    created_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 管理员操作日志表 (admin_logs)
CREATE TABLE IF NOT EXISTS admin_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_name VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('approve', 'reject', 'add_points', 'deduct_points', 'register_user', 'login')),
    target_user VARCHAR(100),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- RLS (Row Level Security) 策略
-- ========================================

-- 启用 RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemption_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- admins 表：只有 service_role 可以访问
CREATE POLICY "Service role only for admins" ON admins
    FOR ALL USING (auth.role() = 'service_role');

-- pending_approvals 表：公开读取，service_role 写入
CREATE POLICY "Anyone can read pending approvals" ON pending_approvals
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage pending approvals" ON pending_approvals
    FOR ALL USING (auth.role() = 'service_role');

-- redemption_requests 表：公开读取，service_role 写入
CREATE POLICY "Anyone can read redemption requests" ON redemption_requests
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage redemption requests" ON redemption_requests
    FOR ALL USING (auth.role() = 'service_role');

-- point_transactions 表：公开读取，service_role 写入
CREATE POLICY "Anyone can read point transactions" ON point_transactions
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage point transactions" ON point_transactions
    FOR ALL USING (auth.role() = 'service_role');

-- admin_logs 表：service_role 读写
CREATE POLICY "Service role only for admin logs" ON admin_logs
    FOR ALL USING (auth.role() = 'service_role');

-- ========================================
-- 初始数据：管理员
-- 密码都是: admin123 (实际使用时建议改成更复杂的密码)
-- ========================================

INSERT INTO admins (name, password_hash) VALUES
    ('Xiaoxiao', 'admin123'),
    ('Piaopiao', 'admin123'),
    ('Seven', 'admin123'),
    ('Calvin', 'admin123')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- 视图：待审核申请汇总
-- ========================================

CREATE OR REPLACE VIEW pending_applications AS
SELECT
    'points' as type,
    id,
    user_name,
    user_nickname,
    reason,
    points as points_amount,
    status,
    created_at,
    reviewed_by,
    reviewed_at,
    reject_reason
FROM pending_approvals
UNION ALL
SELECT
    'redemption' as type,
    id,
    user_name,
    user_nickname,
    item_name as reason,
    points_cost as points_amount,
    status,
    created_at,
    reviewed_by,
    reviewed_at,
    reject_reason
FROM redemption_requests
ORDER BY created_at DESC;
