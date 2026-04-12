# AGENTS.md - 弧光幸存者 (Arc Survivors)

## 项目概述

一款单人吸血鬼幸存者风格的 HTML5 Canvas 游戏。无需构建工具、打包器或框架。
直接在浏览器中打开 `index.html` 或通过任意 HTTP 服务器提供服务。

## 文件结构

```
xixuegui_game/
├── index.html          # 入口文件，按顺序加载脚本
├── css/style.css       # 所有样式
├── js/
│   ├── config.js       # 游戏配置、文案、全局状态、实体数组
│   ├── utils.js        # 数学工具函数（距离、点到线距离）
│   ├── audio.js        # Web Audio API 合成音效（无外部文件）
│   ├── particle.js     # 粒子系统
│   ├── gem.js          # 经验宝石、道具拾取物
│   ├── bullet.js       # 玩家子弹 + 激光，敌方子弹在 enemy.js
│   ├── enemy.js        # 敌人类型、Boss、生成逻辑、EnemyBullet 类
│   ├── player.js       # 玩家移动、射击、受伤、升级
│   ├── upgrades.js     # 升级和道具定义，升级界面 UI
│   ├── buff.js         # 临时道具系统（炸弹、冰冻、护盾、狂暴）
│   ├── renderer.js     # 背景、UI 条、危险警告、受击特效
│   └── game.js         # 主循环、输入、暂停、状态面板、初始化
└── assets/             # 预留给未来使用
```

## 运行游戏

**无构建步骤、无包管理器、无测试套件、无代码检查工具**。
直接在浏览器中打开 `index.html` 即可。本地服务方式：

```bash
# 以下任选一种：
python -m http.server 8000        # Python 3
npx serve .                       # Node
# 或直接双击 index.html（file:// 协议可用）
```

## 架构设计

### 全局命名空间模式
所有代码都在 `var ArcSurvivors = ArcSurvivors || {};` 下——每个文件都以此开头。
不使用 ES6 模块（`import`/`export`），因为它们在 `file://` 协议下会失败。

### 脚本加载顺序（必须严格遵守）
在 `index.html` 中定义，依赖关系从上到下：
1. `config.js` — 必须最先加载，定义命名空间、游戏配置和全局状态
2. `utils.js` — 纯函数，无依赖
3. `audio.js` — IIFE，自包含音频引擎
4. `particle.js`、`gem.js`、`bullet.js` — 实体类
5. `enemy.js` — 依赖 bullet.js（EnemyBullet）、particle.js、config
6. `player.js` — 依赖 bullet.js、enemy.js（碰撞）、upgrades
7. `upgrades.js` — 依赖 player.js
8. `buff.js` — 依赖 player.js、config
9. `renderer.js` — 依赖所有实体进行绘制
10. `game.js` — 主循环，必须最后加载

**添加新 JS 文件时**，在 `index.html` 中的正确位置添加 `<script>` 标签。

### 实体模式
所有游戏实体使用构造函数 + 原型方法：
```js
ArcSurvivors.Enemy = function(x, y, type) {
    this.x = x;
    this.y = y;
    // ...
};
ArcSurvivors.Enemy.prototype.update = function(dt) { /* ... */ };
ArcSurvivors.Enemy.prototype.draw = function(ctx) { /* ... */ };
ArcSurvivors.Enemy.prototype.takeDamage = function(damage) { /* ... */ };
```

每个实体都有 `update(dt)` 和 `draw(ctx)` 方法。`dt` 是以秒为单位的增量时间。
主循环在 `game.js` 中调用这些方法，然后过滤死亡实体：
```js
for (i = 0; i < GS.enemies.length; i++) GS.enemies[i].update(dt);
GS.enemies = GS.enemies.filter(function(e) { return e.active; });
```

### 全局数组（在 config.js 中定义）
- `ArcSurvivors.enemies` — 活跃的敌人
- `ArcSurvivors.bullets` — 玩家子弹 + 激光
- `ArcSurvivors.enemyBullets` — Boss/投射物子弹
- `ArcSurvivors.gems` — 经验宝石
- `ArcSurvivors.particles` — 视觉粒子（上限 300）
- `ArcSurvivors.itemPickups` — 道具拾取物
- `ArcSurvivors.buffPickups` — 临时buff道具拾取物

## 配置系统

### 统一配置管理
所有游戏数值和文案都集中在 `config.js` 中管理，方便调整：

#### GAME_CONFIG - 游戏数值配置
```js
ArcSurvivors.GAME_CONFIG = {
    // 画布尺寸
    CANVAS_WIDTH: 1280,
    CANVAS_HEIGHT: 720,
    
    // 玩家属性
    PLAYER: {
        RADIUS: 20,
        HP: 100,
        SPEED: 5,
        ATTACK_POWER: 12,
        // ...
    },
    
    // 敌人类型配置
    ENEMY_TYPES: {
        normal: { RADIUS: 15, SPEED: 2.5, HP_BASE: 15, /* ... */ },
        fast: { RADIUS: 12, SPEED: 3.8, HP_BASE: 8, /* ... */ },
        boss: { RADIUS: 40, HP_BASE: 200, /* ... */ },
        // ...
    },
    
    // 生成系统、子弹系统、音频配置等
    // ...
};
```

#### STRINGS - 文案配置（支持格式化）
```js
ArcSurvivors.STRINGS = {
    UPGRADES: {
        1: {
            name: '攻击强化',
            desc: '攻击力+{value}',  // 支持 {变量} 格式化
            icon: '⚔️'
        },
        // ...
    },
    ITEMS: { /* ... */ },
    UI: {
        GAME_TITLE: '弧光幸存者 - 无限模式',
        LEVEL_PREFIX: 'LV.',
        KILLS_PREFIX: '击杀: ',
        // ...
    }
};
```

#### 格式化函数
```js
// 使用示例
ArcSurvivors.formatString('攻击力+{value}', { value: 10 });
// 输出: '攻击力+10'

ArcSurvivors.formatString('存活: {time}s', { time: 120 });
// 输出: '存活: 120s'
```

### 添加新配置
1. **新数值**：在 `GAME_CONFIG` 对应分类下添加
2. **新文案**：在 `STRINGS` 对应分类下添加，使用 `{变量}` 格式化
3. **使用配置**：在代码中通过 `ArcSurvivors.GAME_CONFIG.XXX` 或 `ArcSurvivors.STRINGS.XXX` 访问
4. **格式化文案**：调用 `ArcSurvivors.formatString(template, data)` 函数

### 动态获取升级/道具显示信息
```js
// 获取升级显示信息（自动格式化描述）
var display = ArcSurvivors.getUpgradeDisplay(upgrade);
// 返回: { name: '攻击强化', desc: '攻击力+10', icon: '⚔️' }

// 获取道具显示信息
var display = ArcSurvivors.getItemDisplay(item);
// 返回: { name: '神秘草药', desc: '每秒回复1点生命', icon: '🌿' }
```

## 代码风格

- **使用分号** — 当前代码使用分号；新代码应保持一致
- **使用 `var` 而非 `let`/`const`** — 保持 ES5 兼容性，确保 file:// 协议兼容
- **构造函数中使用 `this.prop`** — 不使用 class 语法
- **原型方法** — 不使用箭头函数（需要 `this` 绑定）
- **game.js 使用匿名 IIFE** — `(function() { ... })();`
- **中文**用于 HTML 标签、升级描述和设计文档。代码标识符和注释使用**英文**
- **4 空格缩进**贯穿整个项目
- **除非复杂逻辑，否则不写注释** — 代码应自解释

## 关键游戏常量（在 GAME_CONFIG 中定义）

| 配置项 | 路径 | 默认值 |
|--------|------|--------|
| 画布尺寸 | `CANVAS_WIDTH` / `CANVAS_HEIGHT` | 1280 × 720 |
| 玩家生命 | `PLAYER.HP` | 100 |
| 拾取范围 | `PLAYER.PICKUP_RANGE` | 160px |
| 升级基础经验 | `PLAYER.BASE_EXP_TO_LEVEL` | 60, ×1.3/级 |
| Boss 生成 | `SPAWN.BOSS_INTERVAL` / `BOSS_MIN_TIME` | 45秒/30秒后 |
| 粒子上限 | `PARTICLE.MAX_COUNT` | 300 |
| 难度增长 | `DIFFICULTY` | 基础1，每60秒+0.15 |
| Buff掉落概率 | `BUFF_ITEMS.DROP_CHANCE` | 5% |
| 冰霜效果 | `FROST.SLOW_FACTOR` / `SLOW_DURATION` | 0.5 / 1.5秒 |

## 修改游戏指南

### 1. 添加新敌人类型
1. 在 `config.js` 的 `ENEMY_TYPES` 中添加配置
2. 在 `enemy.js` 的 `draw()` 方法中添加对应的绘制形状

### 2. 添加新升级/道具
1. 在 `config.js` 的 `STRINGS.UPGRADES` 或 `STRINGS.ITEMS` 中添加文案
2. 在 `upgrades.js` 的 `UPGRADES` 或 `ITEMS` 数组中添加定义
3. 使用 `formatString()` 格式化描述中的动态数值

### 2.1 添加新临时buff道具
1. 在 `config.js` 的 `BUFF_ITEMS.TYPES` 中添加配置（DURATION、COLOR等）
2. 在 `config.js` 的 `STRINGS.BUFF_ITEMS` 中添加文案（name、desc、icon）
3. 在 `buff.js` 的 `activate()` 函数中添加对应的 case 逻辑
4. 在 `buff.js` 的 `updatePlayerBuffs()` 函数中添加计时器更新逻辑
5. 在 `buff.js` 的 `drawBuffIndicators()` 函数中添加UI显示逻辑

### 3. 添加新音效
1. 在 `config.js` 的 `AUDIO` 中添加配置（如需要）
2. 在 `audio.js` 中添加函数，在 return 对象中暴露
3. 在游戏代码中调用

### 4. 添加 UI 元素
1. 在 `index.html` 中添加 HTML
2. 在 `style.css` 中添加样式
3. 在 `config.js` 的 `STRINGS.UI` 中添加文案
4. 在 `renderer.js` 或 `game.js` 中更新渲染逻辑

### 5. 添加新实体类型
1. 创建新文件，定义构造函数 + 原型方法
2. 在 `index.html` 中按正确顺序添加 `<script>` 标签
3. 在 `config.js` 中添加相关配置

### 6. 调整游戏平衡
直接修改 `config.js` 中的数值即可，无需改动其他文件：
- 调整玩家属性 → 修改 `PLAYER`
- 调整敌人属性 → 修改 `ENEMY_TYPES`
- 调整生成节奏 → 修改 `SPAWN`
- 调整升级效果 → 修改 `UPGRADES`

## 音频系统

所有音效通过 Web Audio API 合成——无需外部音频文件。
音频上下文需要用户手势才能启动；`game.js` 在首次点击画布时初始化。
播放前调用 `ArcSurvivors.Audio.init()` 然后 `resume()`。

## 常见陷阱

- **脚本顺序很重要**：先加载 `player.js` 再加载 `bullet.js` 会导致问题
- **`var` 作用域**：`var` 是函数作用域，不是块作用域——在循环中使用闭包
- **Canvas 坐标系**：原点在左上角，Y 轴向下增大
- **`Set` 使用**：Bullet 中的 `hitEnemies` 使用 ES6 Set——作为项目中唯一的 ES6 特性，可以接受
- **配置引用时机**：确保在访问 `GAME_CONFIG` 或 `STRINGS` 时 `config.js` 已加载完成
- **Buff叠加问题**：临时buff道具（狂暴、护盾）重复拾取时只延长计时器，不重复叠加效果
