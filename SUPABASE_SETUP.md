# Supabase 配置指南

## 步骤 1：创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 点击 **Start your project**，注册/登录
3. 点击 **New project**
4. 填写项目信息：
   - **Name**: `tllboard`（或你喜欢的名字）
   - **Database Password**: 设置一个强密码（记住它！）
   - **Region**: 选择离你近的区域（推荐新加坡）
5. 点击 **Create new project**
6. 等待项目创建完成（需要几分钟）

## 步骤 2：创建数据库表

项目创建完成后：

1. 点击左侧菜单的 **Table Editor**
2. 点击 **New table**
3. 填写表信息：
   - **Name**: `guestbook`
   - **Description**: 留言板
4. 在 **Columns** 区域，添加以下列（保留默认的 id 和 created_at）：
   - **name** (类型: text, 不勾选 Nullable) - 用户昵称
   - **message** (类型: text, 不勾选 Nullable) - 留言内容
5. 点击 **Save** 创建表

## 步骤 3：获取 API 密钥

1. 点击左侧菜单的 **Project Settings**（齿轮图标）
2. 点击 **API**
3. 找到以下信息并保存：
   - **Project URL**（看起来像 `https://xxxx.supabase.co`）
   - **service_role** Secret（点击眼睛图标复制）

## 步骤 4：配置 Vercel 环境变量

1. 打开你的 Vercel 项目
2. 点击 **Settings** -> **Environment Variables**
3. 添加两个环境变量：
   - **Name**: `SUPABASE_URL`
   - **Value**: 刚才复制的 Project URL
   
   - **Name**: `SUPABASE_SERVICE_KEY`
   - **Value**: 刚才复制的 service_role 密钥
4. 点击 **Save**

## 步骤 5：配置数据库权限（重要！）

为了让 API 能读写数据，需要配置权限：

1. 在 Supabase 中，点击左侧菜单的 **SQL Editor**
2. 点击 **New query**
3. 粘贴以下 SQL：
   ```sql
   -- 允许所有人读取留言
   GRANT SELECT ON guestbook TO anon;
   
   -- 允许所有人添加留言
   GRANT INSERT ON guestbook TO anon;
   
   -- 允许所有人删除留言
   GRANT DELETE ON guestbook TO anon;
   
   -- 允许序列使用（自动生成 ID）
   GRANT USAGE, SELECT ON SEQUENCE guestbook_id_seq TO anon;
   ```
4. 点击 **Run** 执行

## 步骤 6：重新部署

配置完成后，重新部署你的项目：

```bash
git add .
git commit -m "Switch guestbook to Supabase"
git push
```

Vercel 会自动构建和部署。

## 本地开发（可选）

如果你想在本地测试：

1. 在项目根目录创建 `.env.local` 文件：
   ```
   SUPABASE_URL=你的URL
   SUPABASE_SERVICE_KEY=你的密钥
   ```
2. 重新运行 `npm run dev`

## 验证

部署完成后，测试留言功能：
1. 发表一条留言
2. 刷新页面，看看留言是否还在
3. 用另一个设备/浏览器访问，看看是否能看到留言
4. 测试删除功能

## 免费额度

Supabase 免费版提供：
- 500 MB 数据库存储
- 每月 2 GB 带宽
- 无限用户
- 无限 API 请求

对留言板功能完全够用！

## 管理留言

你可以在 Supabase 的 **Table Editor** 中：
- 查看所有留言
- 手动删除不当留言
- 编辑留言内容
