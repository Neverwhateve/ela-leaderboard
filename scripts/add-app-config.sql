-- ========================================
-- 添加 app_config 表用于存储应用配置（包括公告栏）
-- 执行日期: 2026-05-06
-- ========================================

-- 创建 app_config 表
CREATE TABLE IF NOT EXISTS app_config (
    id BIGSERIAL PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by VARCHAR(100)
);

-- 启用 RLS
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- 只有 service_role 可以访问
CREATE POLICY "Service role only for app_config" ON app_config
    FOR ALL USING (auth.role() = 'service_role');

-- 插入默认公告配置
INSERT INTO app_config (config_key, config_value) VALUES
('announcement_config', '{"title":"📢 公告栏","sections":[{"title":"常规积分规则","content":["专业解答 & 资讯分享：+5积分","Kahoot 优胜：+10积分","Peer Tips：+15积分","分享知识（ DD,huddle,邮件 等）：+15积分","---","50积分可兑换限时礼物🎁","100积分可兑换1个扭蛋币"]},{"title":"特殊活动","content":["观看 Town Hall 视频：+5积分","藏宝图：Forum 硬盘 - 丰富人生学院 里有三份秘籍，修炼有成 +20积分"]},{"title":"悬赏任务","content":["家人共享与儿童账户：整理并分享知识 +20积分","Creator Studio 演示与分享：每个 app +10积分"]},{"title":"升级指南","content":["🎉 Lv0 → Lv1 升级条件","","1. Learning 进度 100%","2. 个人积分达到 50","3. 任选以下一项完成：","   - （种草实验室）完成 Kahoot 考核","   - （隐藏技能局）参加一场 WKSP / DD 分享你的技能","   - （偶像训练营）上传 Peer Tips","","完成以上所有条件即可升级！💪"]}]}')
ON CONFLICT (config_key) DO NOTHING;

-- 验证
SELECT * FROM app_config;