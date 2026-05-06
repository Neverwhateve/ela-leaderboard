// 公告板配置文件
export const announcementConfig = {
  "title": "📢 公告栏",
  "sections": [
    {
      "title": "常规积分规则",
      "content": [
        "专业解答 & 资讯分享：+5积分",
        "Kahoot 优胜：+10积分",
        "Peer Tips：+15积分",
        "分享知识（ DD,huddle,邮件 等）：+15积分",

        "---",
        "50积分可兑换限时礼物🎁",
        "100积分可兑换1个扭蛋币",
      ]
    },
    {
      "title": "特殊活动",
      "content": [
        "观看 Town Hall 视频：+5积分",
        "藏宝图：Forum 硬盘 - 丰富人生学院 里有三份秘籍，修炼有成 +20积分"
      ]
    },
    {
      "title": "悬赏任务",
      "content": [
        "家人共享与儿童账户：整理并分享知识 +20积分",
        "Creator Studio 演示与分享：每个 app +10积分",

      ]
    },
    {
      "title": "升级指南",
      "content": [
        "🎉 Lv0 → Lv1 升级条件",

        "",

        "1. Learning 进度 100%",
        "2. 个人积分达到 50",
        "3. 任选以下一项完成：",
        "   - （种草实验室）完成 Kahoot 考核",
        "   - （隐藏技能局）参加一场 WKSP / DD 分享你的技能",
        "   - （偶像训练营）上传 Peer Tips",

        "",
        "完成以上所有条件即可升级！💪"
      ]
    }
  ]
};

// 积分映射表
export const pointMapping = {
  "专业解答 & 资讯分享": 5,
  "Kahoot 优胜": 10,
  "Peer Tips": 15,
  "分享知识（ DD,huddle,邮件 等）": 15,
  "观看 Town Hall 视频": 5,
  "藏宝图：Forum 硬盘 - 丰富人生学院 里有三份秘籍，修炼有成": 20,
  "家人共享与儿童账户：整理并分享知识": 20,
  "Creator Studio 演示与分享：每个 app": 10
};

// 从公告板提取加分选项（带积分值）
export function getPointOptions() {
  const options = [];

  announcementConfig.sections.forEach(section => {
    section.content.forEach(line => {
      if (line === "---" || line.trim() === "" || line.includes("兑换")) {
        return;
      }

      const match = line.match(/^(.*?)(：|:)\s*\+(\d+)积分/);
      if (match) {
        const name = match[1].trim();
        const points = parseInt(match[3]);
        if (name && !options.find(o => o.value === name)) {
          options.push({ label: `${name} (+${points}积分)`, value: name, points });
        }
      } else if (line.includes("+") && !line.includes("升级条件")) {
        const plusIndex = line.lastIndexOf("+");
        const numMatch = line.substring(plusIndex).match(/\+(\d+)/);
        if (plusIndex > 0 && numMatch) {
          const name = line.substring(0, plusIndex).trim();
          const points = parseInt(numMatch[1]);
          if (name && !options.find(o => o.value === name)) {
            options.push({ label: `${name} (+${points}积分)`, value: name, points });
          }
        }
      }
    });
  });

  return options;
}
