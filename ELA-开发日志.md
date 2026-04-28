# ELA 积分榜 - 开发日志

日期：2026-04-28 ~ 2026-04-29

## 📅 开发流程

### Day 1 - 五一活动页面

**任务**：创建五一劳动节特别活动页面

**完成内容**：
- ✅ 创建 `src/laborDay.json` - 五一活动数据
- ✅ 创建 `src/LaborDayEvent.jsx` - 五一活动页面组件
- ✅ 在主页添加 Apple 5.1.png 按钮
- ✅ 添加页面切换逻辑（currentPage 状态）
- ✅ 推送到 GitHub

**文件变更**：
```
新增：
- public/Apple-5.1.png
- src/laborDay.json
- src/LaborDayEvent.jsx

修改：
- src/App.jsx
```

---

### Day 2 - 动态背景

**任务**：添加动态叶子背景，模仿 animal-island-ui

**完成内容**：
- ✅ 下载并添加 `public/home_bg.webp`
- ✅ 添加 CSS 背景滚动动画
- ✅ 移除 `bg-bg` 类，显示动态背景
- ✅ 推送到 GitHub

**文件变更**：
```
新增：
- public/home_bg.webp

修改：
- src/index.css
- src/App.jsx
- src/LaborDayEvent.jsx
```

---

### Day 3 - UI 美化

**任务**：模仿 animal-island-ui 样式更新

**完成内容**：
- ✅ 更新标题样式（Nunito 字体、奶白色、阴影）
- ✅ 更新卡片背景为奶油色 `#f7f3df`
- ✅ 更新文字样式为棕色 `#725d42`
- ✅ 移除多余的渐变覆盖层
- ✅ 推送到 GitHub

**文件变更**：
```
修改：
- src/App.jsx
- src/LaborDayEvent.jsx
- src/index.css
```

---

### Day 4 - 文档

**任务**：创建开发流程文档

**完成内容**：
- ✅ 创建通用开发指南
- ✅ 推送到 GitHub

**文件变更**：
```
新增：
- 开发流程指南.md
- ELA-开发日志.md（本文件）
```

---

## 🎨 设计风格

**参考网站**：animal-island-ui

**颜色主题**：
| 用途 | 颜色 |
|------|------|
| 背景色 | `#7DC395` |
| 卡片色 | `#f7f3df` |
| 主色 | `#19c8b9` |
| 文字色 | `#725d42` |
| 奶白色 | `#FFF9E6` |
| 警告色 | `#f5c31c` |

**字体**：Nunito, 'Zen Maru Gothic', 动森风格

---

## 🚀 提交记录

| 提交 | 说明 |
|------|------|
| a09c5c7 | feat: 更新UI样式，模仿 animal-island-ui 风格 |
| 380a663 | 修复提交作者信息 |
| 1cf65ae | feat: 添加五一劳动节特别活动页面 |

---

## 📁 项目结构

```
ELA-积分榜/
├── public/
│   ├── Apple-5.1.png
│   └── home_bg.webp
├── src/
│   ├── App.jsx                # 主应用
│   ├── LaborDayEvent.jsx      # 五一活动页
│   ├── laborDay.json          # 活动数据
│   ├── announcementConfig.js  # 公告配置
│   └── index.css              # 全局样式
├── 开发流程指南.md
└── ELA-开发日志.md            # 本文件
```

---

## 💡 关键代码片段

### 1. 页面切换

```jsx
const [currentPage, setCurrentPage] = useState('home');

{currentPage === 'laborDay' ? (
  <LaborDayEvent onBack={() => setCurrentPage('home')} />
) : (
  <div>
    <button onClick={() => setCurrentPage('laborDay')}>
      <img src="/Apple-5.1.png" />
    </button>
  </div>
)}
```

### 2. 动态背景

```css
body {
  background: url('/home_bg.webp') 0 0 / auto repeat, #7DC395;
  animation: bgScroll 80s linear infinite;
}

@keyframes bgScroll {
  0% { background-position: 100% 0%; }
  100% { background-position: 0% 100%; }
}
```

### 3. 标题样式

```jsx
<h1 style={{
  fontFamily: "Nunito, 'Zen Maru Gothic', ...",
  fontSize: 'clamp(2.5rem, 5vw, 60px)',
  fontWeight: 800,
  color: '#FFF9E6',
  textShadow: '0px 4px 1px rgba(0, 0, 0, 0.4)',
}}>
  ELA 积分榜
</h1>
```

---

## 🎯 下一步可能的改进

- [ ] 添加更多特殊活动页面
- [ ] 优化响应式布局
- [ ] 添加动画效果
- [ ] 接入真实后端
- [ ] 添加用户认证

---

*日志创建时间：2026-04-29*
