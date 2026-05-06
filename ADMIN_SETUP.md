# 管理员系统配置指南

## 📋 概述

这个系统包含：
- 用户注册（自动批准）
- 积分申请（需要管理员审核）
- 兑换申请（需要管理员审核）
- 管理员后台（审核申请、管理用户积分）

---

## 🚀 第一步：在 Supabase 中执行 SQL

### 1. 打开 Supabase SQL Editor

1. 登录 [Supabase](https://supabase.com)
2. 进入你的项目
3. 左侧菜单点击 **SQL Editor**

### 2. 创建表

1. 点击 **New Query**
2. 复制 `supabase-schema.sql` 文件中的所有内容
3. 粘贴到 SQL Editor 中
4. 点击 **Run** 执行

### 3. 验证表是否创建成功

执行以下 SQL 查看所有表：

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

应该看到以下表：
- `admins`
- `pending_approvals`
- `redemption_requests`
- `point_transactions`
- `admin_logs`

### 4. 验证管理员是否创建成功

```sql
SELECT * FROM admins;
```

应该看到 4 个管理员：
- Xiaoxiao
- Piaopiao
- Seven
- Calvin

---

## 🔑 第二步：获取 Supabase API 密钥

### 1. 获取 API URL

1. 进入 **Settings** → **API**
2. 找到 **Project URL**
3. 复制类似 `https://xxxx.supabase.co` 的 URL

### 2. 获取 Service Role Key

1. 同样在 **API** 页面
2. 找到 **service_role** secret
3. 复制这个密钥（注意：这是秘密密钥，不要泄露！）

### 3. 在 Vercel 中配置环境变量

1. 打开 Vercel 项目
2. 进入 **Settings** → **Environment Variables**
3. 添加以下变量：

| Name | Value |
|------|-------|
| `SUPABASE_URL` | 你的 Project URL |
| `SUPABASE_SERVICE_KEY` | 你的 service_role secret |
| `DELETE_PASSWORD` | 留言板删除密码（任意字符串） |

4. 点击 **Save**
5. 如果需要，重新部署

---

## 🔐 第三步：修改管理员密码

默认密码是 `admin123`，建议修改！

### 在 Supabase 中修改密码

执行以下 SQL（把 `new_password` 改成你想要的密码）：

```sql
-- 修改单个管理员的密码
UPDATE admins
SET password_hash = '你的新密码'
WHERE name = 'Calvin';

-- 或者修改所有管理员的密码
UPDATE admins
SET password_hash = '你的新密码';
```

### ⚠️ 注意事项

- 密码目前是明文存储，建议后续改为哈希加密
- 如果需要哈希加密，可以执行：
```sql
UPDATE admins
SET password_hash = md5('你的密码')
WHERE name = 'Calvin';
```

---

## 🧪 第四步：测试系统

### 测试管理员登录

1. 访问你的网站
2. 进入管理员登录页面
3. 使用以下信息登录：
   - 管理员名：`Calvin`
   - 密码：`admin123`

### 测试用户注册

1. 点击"注册"按钮
2. 填写信息：
   - 英文名：TestUser
   - 昵称：测试用户
   - 推荐人：Calvin
3. 提交后应该自动通过，可以在排行榜看到

### 测试积分申请

1. 点击"提交积分"按钮
2. 填写信息
3. 提交后应该在管理员后台的待审核队列中看到

---

## 📊 数据库表说明

### admins（管理员表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键 |
| name | VARCHAR | 管理员名称 |
| password_hash | VARCHAR | 密码（建议用哈希） |
| created_at | TIMESTAMP | 创建时间 |

### pending_approvals（待审核申请表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键 |
| type | VARCHAR | 类型：'points' 或 'redemption' |
| user_name | VARCHAR | 申请人姓名 |
| user_nickname | VARCHAR | 申请人昵称 |
| reason | TEXT | 原因/说明 |
| points | INTEGER | 积分数量 |
| status | VARCHAR | 状态：pending/approved/rejected |
| created_at | TIMESTAMP | 申请时间 |
| reviewed_by | VARCHAR | 审核人 |
| reviewed_at | TIMESTAMP | 审核时间 |
| reject_reason | TEXT | 拒绝原因 |

### redemption_requests（兑换申请表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键 |
| user_name | VARCHAR | 申请人 |
| user_nickname | VARCHAR | 申请人昵称 |
| item_name | VARCHAR | 兑换物品 |
| points_cost | INTEGER | 消耗积分 |
| status | VARCHAR | 状态 |
| created_at | TIMESTAMP | 申请时间 |
| reviewed_by | VARCHAR | 审核人 |
| reviewed_at | TIMESTAMP | 审核时间 |
| reject_reason | TEXT | 拒绝原因 |

### point_transactions（积分变动流水）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键 |
| user_name | VARCHAR | 用户名 |
| user_nickname | VARCHAR | 昵称 |
| change_amount | INTEGER | 变动积分（正数加，负数减） |
| balance_after | INTEGER | 变动后余额 |
| reason | TEXT | 原因 |
| type | VARCHAR | 类型 |
| created_by | VARCHAR | 操作人 |
| created_at | TIMESTAMP | 时间 |

### admin_logs（管理员操作日志）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键 |
| admin_name | VARCHAR | 管理员名称 |
| action | VARCHAR | 操作类型 |
| target_user | VARCHAR | 目标用户 |
| details | TEXT | 详细信息 |
| created_at | TIMESTAMP | 操作时间 |

---

## ❓ 常见问题

### Q: 如何添加新的管理员？
```sql
INSERT INTO admins (name, password_hash) VALUES ('新管理员名', '密码');
```

### Q: 如何删除管理员？
```sql
DELETE FROM admins WHERE name = '管理员名';
```

### Q: 如何重置管理员密码？
```sql
UPDATE admins SET password_hash = '新密码' WHERE name = '管理员名';
```

### Q: 如何查看所有待审核申请？
```sql
SELECT * FROM pending_approvals WHERE status = 'pending' ORDER BY created_at DESC;
```

### Q: 如何查看操作日志？
```sql
SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 100;
```

---

## 🎉 完成！

配置完成后，你的系统就支持：
- ✅ 用户自助注册（自动批准）
- ✅ 积分申请（需要审核）
- ✅ 兑换申请（需要审核）
- ✅ 管理员后台管理
