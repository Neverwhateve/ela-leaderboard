-- 更新用户昵称脚本
-- 使用 data.json 中的 displayName 作为 nickname

-- Ada
UPDATE xp_total SET nickname = '冃半' WHERE name = 'Ada';

-- Amelia
UPDATE xp_total SET nickname = '扭啊扭' WHERE name = 'Amelia';

-- Angela
UPDATE xp_total SET nickname = '没奶油的奥利奥' WHERE name = 'Angela';

-- April
UPDATE xp_total SET nickname = 'Siyue' WHERE name = 'April';

-- Barry
UPDATE xp_total SET nickname = 'Flash' WHERE name = 'Barry';

-- Bryan
UPDATE xp_total SET nickname = '幼儿园高材生' WHERE name = 'Bryan';

-- Candy
UPDATE xp_total SET nickname = 'Candy' WHERE name = 'Candy';

-- Carmen
UPDATE xp_total SET nickname = 'Carmen' WHERE name = 'Carmen';

-- CC
UPDATE xp_total SET nickname = '宫西西' WHERE name = 'CC';

-- Changliang
UPDATE xp_total SET nickname = '机智的小胖哥' WHERE name = 'Changliang';

-- Cody
UPDATE xp_total SET nickname = '川川' WHERE name = 'Cody';

-- Daisy Lu
UPDATE xp_total SET nickname = '漫野雏菊' WHERE name = 'Daisy Lu';

-- Danni
UPDATE xp_total SET nickname = '宇宙当红炸子鸡😎' WHERE name = 'Danni';

-- Dido
UPDATE xp_total SET nickname = '无锡荠菜馄饨' WHERE name = 'Dido';

-- DJ
UPDATE xp_total SET nickname = 'déjà vu' WHERE name = 'DJ';

-- Dobby
UPDATE xp_total SET nickname = '时间管理大师' WHERE name = 'Dobby';

-- Edward
UPDATE xp_total SET nickname = '千万别声张先生' WHERE name = 'Edward';

-- Gina
UPDATE xp_total SET nickname = '金佰利' WHERE name = 'Gina';

-- Grace
UPDATE xp_total SET nickname = 'Grace' WHERE name = 'Grace';

-- Heidi
UPDATE xp_total SET nickname = 'Heidi' WHERE name = 'Heidi';

-- Iris
UPDATE xp_total SET nickname = '羊没吐气' WHERE name = 'Iris';

-- Jason
UPDATE xp_total SET nickname = '森森' WHERE name = 'Jason';

-- Jesse
UPDATE xp_total SET nickname = '二朵龙' WHERE name = 'Jesse';

-- Jim
UPDATE xp_total SET nickname = '阿油几亩菜' WHERE name = 'Jim';

-- Joy
UPDATE xp_total SET nickname = '陶瓷女工' WHERE name = 'Joy';

-- Kevin
UPDATE xp_total SET nickname = 'すみません' WHERE name = 'Kevin';

-- Krystal
UPDATE xp_total SET nickname = '小黄努力减肥' WHERE name = 'Krystal';

-- Laughing
UPDATE xp_total SET nickname = '爆炸瓜' WHERE name = 'Laughing';

-- Lily
UPDATE xp_total SET nickname = 'Lily' WHERE name = 'Lily';

-- Lori
UPDATE xp_total SET nickname = '黎晚' WHERE name = 'Lori';

-- Max
UPDATE xp_total SET nickname = '马化藤' WHERE name = 'Max';

-- Mediha
UPDATE xp_total SET nickname = 'Mediha' WHERE name = 'Mediha';

-- Moon
UPDATE xp_total SET nickname = '花果山小母猴' WHERE name = 'Moon';

-- Nanyi
UPDATE xp_total SET nickname = 'QQ少爷' WHERE name = 'Nanyi';

-- Olivia
UPDATE xp_total SET nickname = '一团儿' WHERE name = 'Olivia';

-- Oscar
UPDATE xp_total SET nickname = '不是艺术家' WHERE name = 'Oscar';

-- Patrick
UPDATE xp_total SET nickname = '满山猴子我腚最红' WHERE name = 'Patrick';

-- Rik
UPDATE xp_total SET nickname = 'Rik' WHERE name = 'Rik';

-- Rita
UPDATE xp_total SET nickname = '陶喆演唱会抢票超人' WHERE name = 'Rita';

-- Serena
UPDATE xp_total SET nickname = '艺臻' WHERE name = 'Serena';

-- Seven
UPDATE xp_total SET nickname = '七七' WHERE name = 'Seven';

-- Strange
UPDATE xp_total SET nickname = '于适的老公' WHERE name = 'Strange';

-- Tina
UPDATE xp_total SET nickname = '大顺' WHERE name = 'Tina';

-- Vicky
UPDATE xp_total SET nickname = '山竹' WHERE name = 'Vicky';

-- Victor
UPDATE xp_total SET nickname = '皮卡丨皮卡' WHERE name = 'Victor';

-- Vincent
UPDATE xp_total SET nickname = 'Vincent' WHERE name = 'Vincent';

-- Xiaolan
UPDATE xp_total SET nickname = '月野子' WHERE name = 'Xiaolan';

-- Ya
UPDATE xp_total SET nickname = 'ya' WHERE name = 'Ya';

-- Yolanda
UPDATE xp_total SET nickname = '3199' WHERE name = 'Yolanda';

-- Yoyo
UPDATE xp_total SET nickname = 'YOYO' WHERE name = 'Yoyo';

-- Yulong
UPDATE xp_total SET nickname = '毛腿吴彦祖' WHERE name = 'Yulong';

-- Zoe
UPDATE xp_total SET nickname = '周芳菲' WHERE name = 'Zoe';

-- Zoey
UPDATE xp_total SET nickname = 'Zoey' WHERE name = 'Zoey';

-- Sally
UPDATE xp_total SET nickname = '最好的地方II有我一票' WHERE name = 'Sally';

-- Xiaoxiao
UPDATE xp_total SET nickname = 'Daddy' WHERE name = 'Xiaoxiao';

-- Julia
UPDATE xp_total SET nickname = '8low8lowme' WHERE name = 'Julia';

-- Vika
UPDATE xp_total SET nickname = '正正' WHERE name = 'Vika';

-- Alvin
UPDATE xp_total SET nickname = '煮鱼' WHERE name = 'Alvin';

-- Alicia
UPDATE xp_total SET nickname = '你算哪头朱' WHERE name = 'Alicia';

-- Tracy
UPDATE xp_total SET nickname = '外国公主' WHERE name = 'Tracy';

-- Lucia
UPDATE xp_total SET nickname = '泡泡' WHERE name = 'Lucia';

-- 验证更新
SELECT name, nickname, total_xp FROM xp_total ORDER BY total_xp DESC;
