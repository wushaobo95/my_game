---
name: game-development-guide
description: 游戏开发指南 - 包含修改游戏、添加资源、音频系统等具体操作步骤
license: MIT
metadata:
  author: opencode
  version: "1.0"
---

# 卡皮巴拉来了游戏开发指南

## 修改游戏指南

### 1. 添加新敌人类型
1. 在 `core/game-config.js` 的 `ENEMY_TYPES` 中添加配置
2. 在 `entities/enemy.js` 的 `draw()` 方法中添加对应的绘制形状

### 2. 添加新升级/道具
1. 在 `core/strings.js` 的 `STRINGS.UPGRADES` 或 `STRINGS.ITEMS` 中添加文案
2. 在 `systems/upgrade.js` 的 `UPGRADES` 或 `ITEMS` 数组中添加定义
3. 使用 `formatString()` 格式化描述中的动态数值

#### 2.1 添加新法宝（永久道具，Boss掉落）
1. 在 `core/strings.js` 的 `STRINGS.ITEMS` 中添加文案（id, name, desc, icon）
2. 在 `core/game-config.js` 添加数值配置（如需要）
3. 在 `systems/upgrade.js` 的 `ITEMS` 数组中添加定义（id, apply函数, isItem: true）
4. 在 `systems/upgrade.js` 的 `getItemDisplay()` 中添加格式化逻辑（如需要）
5. 在 `entities/player.js` 中添加相关属性（如需要）

示例：
```js
// 1. strings.js - ITEMS 中添加
111: {
    name: '破势',
    desc: '对生命值高于{threshold}%的单位，造成额外{bonus}%伤害',
    icon: '🗡️'
}

// 2. game-config.js - 添加配置
DAMAGE_CONFIG: {
    PO_SHI: {
        HP_THRESHOLD: 0.7,
        DAMAGE_BONUS: 0.4
    }
}

// 3. upgrade.js - ITEMS 数组中添加
{
    id: 111,
    apply: function(p) { p.hasPoShi = true; },
    isItem: true
}

// 4. upgrade.js - getItemDisplay() 中添加
case 111:
    desc = ArcSurvivors.formatString(desc, { 
        threshold: Math.round(CFG.DAMAGE_CONFIG.PO_SHI.HP_THRESHOLD * 100),
        bonus: Math.round(CFG.DAMAGE_CONFIG.PO_SHI.DAMAGE_BONUS * 100)
    });
    break;

// 5. player.js - 构造函数中添加属性
this.hasPoShi = false;
```

#### 2.2 添加新Buff道具（临时效果，敌人掉落）
1. 在 `core/game-config.js` 的 `BUFF_ITEMS.TYPES` 中添加配置（DURATION、COLOR等）
2. 在 `core/strings.js` 的 `STRINGS.BUFF_ITEMS` 中添加文案（name、desc、icon）
3. 在 `systems/buff.js` 的 `activate()` 函数中添加对应的 case 逻辑
4. 在 `systems/buff.js` 的 `updatePlayerBuffs()` 函数中添加计时器更新逻辑（如需要）
5. 在 `systems/buff.js` 的 `drawBuffIndicators()` 函数中添加UI显示逻辑（如需要）

### 3. 添加新音效
1. 在 `core/game-config.js` 的 `AUDIO` 中添加配置（如需要）
2. 在 `systems/audio.js` 中添加函数，在 return 对象中暴露
3. 在游戏代码中调用

### 4. 添加 UI 元素
1. 在 `index.html` 中添加 HTML
2. 在 `style.css` 中添加样式
3. 在 `core/strings.js` 的 `STRINGS.UI` 中添加文案
4. 在 `systems/renderer.js` 或 `game.js` 中更新渲染逻辑

### 5. 添加新实体类型
1. 在 `entities/` 文件夹创建新文件，定义构造函数 + 原型方法
2. 在 `index.html` 中按正确顺序添加 `<script>` 标签
3. 在 `core/game-config.js` 中添加相关配置

### 6. 调整游戏平衡
直接修改 `core/game-config.js` 中的数值即可，无需改动其他文件：
- 调整玩家属性 → 修改 `PLAYER`
- 调整敌人属性 → 修改 `ENEMY_TYPES`
- 调整生成节奏 → 修改 `SPAWN`
- 调整升级效果 → 修改 `UPGRADES`

### 7. 使用事件系统
在模块间通信时使用事件系统，避免直接依赖：
```js
// 在 player.js 中
ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.PLAYER_LEVEL_UP, level);

// 在 game.js 中
ArcSurvivors.EventSystem.on(ArcSurvivors.Events.PLAYER_LEVEL_UP, function(level) {
    console.log('Player leveled up to:', level);
});
```

## 资源系统操作

### 添加新资源
1. 将资源文件放入对应的 `assets/` 文件夹
2. 在 `core/resource-loader.js` 的清单中添加资源路径
3. 修改对应的绘制方法以支持新资源

### 测试资源加载
使用 `test-resources.html` 页面测试资源加载状态：
- 显示所有资源的加载状态
- 提供测试功能验证资源加载器
- 实时日志输出便于调试

### 资源规格文档
详细的资源规格请参考 `assets/资源规格文档.md`，包含：
- 所有需要的精灵图规格（尺寸、格式、风格）
- 所有需要的音频文件规格（时长、格式、风格）
- 文件命名规范和目录结构
- 颜色参考和技术规格

## 音频系统详细说明

音频系统支持两种模式：
1. **Web Audio API 合成**：默认模式，无需外部音频文件
2. **外部音频文件**：支持 MP3/OGG 格式的音频文件

音频上下文需要用户手势才能启动；`game.js` 在首次点击画布时初始化。
播放前调用 `ArcSurvivors.Audio.init()` 然后 `resume()`。

### 音频资源优先级
1. 如果外部音频文件存在，优先使用外部文件
2. 如果外部文件不存在，回退到 Web Audio API 合成
3. 这允许逐步替换音频资源，无需一次性完成所有音频

## 扩展建议

1. 添加新功能时，优先使用事件系统进行通信
2. 新实体类放在 `entities/` 文件夹
3. 新游戏系统放在 `systems/` 文件夹
4. 添加新资源时，先更新资源加载器清单，再修改绘制方法
5. 配置和工具函数放在 `core/` 文件夹

## 常用配置访问

### 动态获取升级/道具显示信息
```js
// 获取升级显示信息（自动格式化描述）
var display = ArcSurvivors.getUpgradeDisplay(upgrade);
// 返回: { name: '攻击强化', desc: '攻击力+10', icon: '⚔️' }

// 获取道具显示信息
var display = ArcSurvivors.getItemDisplay(item);
// 返回: { name: '神秘草药', desc: '每秒回复1点生命', icon: '🌿' }
```

### 格式化函数使用示例
```js
ArcSurvivors.formatString('攻击力+{value}', { value: 10 });
// 输出: '攻击力+10'

ArcSurvivors.formatString('存活: {time}s', { time: 120 });
// 输出: '存活: 120s'
```
