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
│   ├── core/           # 核心系统
│   │   ├── config.js   # 命名空间、全局状态、工具函数
│   │   ├── resource-loader.js # 资源加载器（精灵图、音频文件）
│   │   ├── game-config.js # 游戏数值配置
│   │   ├── strings.js  # 文案配置
│   │   ├── event.js    # 事件系统（解耦模块通信）
│   │   └── utils.js    # 数学工具函数（距离、点到线距离）
│   ├── entities/       # 实体类
│   │   ├── player.js   # 玩家角色
│   │   ├── enemy.js    # 敌人类型、Boss、生成逻辑、EnemyBullet 类
│   │   ├── bullet.js   # 玩家子弹 + 激光
│   │   ├── gem.js      # 经验宝石、道具拾取物
│   │   └── particle.js # 粒子系统
│   ├── systems/        # 游戏系统
│   │   ├── audio.js    # Web Audio API 合成音效（支持外部音频文件）
│   │   ├── renderer.js # 背景、UI 条、危险警告、受击特效
│   │   ├── upgrade.js  # 升级和法宝定义，升级界面 UI
│   │   └── buff.js     # Buff道具系统（炸弹、冰冻、护盾、狂暴）
│   └── game.js         # 主循环、输入、暂停、状态面板、初始化
├── assets/             # 游戏资源
├── test-resources.html # 资源加载测试页面
└── AGENTS.md           # 项目文档
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

### 模块化架构
项目采用模块化设计，按功能划分为三个主要文件夹：

1. **core/** - 核心系统
   - 配置管理、事件系统、工具函数
   - 所有模块的基础设施

2. **entities/** - 实体类
   - 游戏中的所有对象：玩家、敌人、子弹等
   - 每个实体都有 `update(dt)` 和 `draw(ctx)` 方法

3. **systems/** - 游戏系统
   - 音频、渲染、升级、Buff等游戏逻辑系统
   - `upgrade.js` 负责升级和法宝（永久道具）系统
   - `buff.js` 负责Buff道具（临时效果）系统

### 事件系统
使用事件系统解耦模块间通信，减少直接依赖。

### 全局命名空间模式
所有代码都在 `var ArcSurvivors = ArcSurvivors || {};` 下——每个文件都以此开头。
不使用 ES6 模块（`import`/`export`），因为它们在 `file://` 协议下会失败。

### 脚本加载顺序（必须严格遵守）
在 `index.html` 中定义，依赖关系从上到下：
1. `core/config.js` — 必须最先加载，定义命名空间、全局状态、工具函数
2. `core/resource-loader.js` — 资源加载器（依赖 config.js 的命名空间）
3. `core/game-config.js` — 游戏数值配置（依赖 config.js 的命名空间）
4. `core/strings.js` — 文案配置（依赖 config.js 的命名空间）
5. `core/event.js` — 事件系统
6. `core/utils.js` — 纯函数，无依赖
7. `entities/particle.js`、`entities/gem.js`、`entities/bullet.js` — 实体类
8. `entities/enemy.js` — 依赖 bullet.js（EnemyBullet）、particle.js、config
9. `entities/player.js` — 依赖 bullet.js、enemy.js（碰撞）、upgrade
10. `systems/audio.js` — IIFE，自包含音频引擎（支持外部音频文件）
11. `systems/buff.js` — 依赖 player.js、config
12. `systems/upgrade.js` — 依赖 player.js
13. `systems/renderer.js` — 依赖所有实体进行绘制
14. `game.js` — 主循环，必须最后加载

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
主循环在 `game.js` 中调用这些方法，然后过滤死亡实体。

### 全局数组（在 config.js 中定义）
- `ArcSurvivors.enemies` — 活跃的敌人
- `ArcSurvivors.bullets` — 玩家子弹 + 激光
- `ArcSurvivors.enemyBullets` — Boss/投射物子弹
- `ArcSurvivors.gems` — 经验宝石
- `ArcSurvivors.particles` — 视觉粒子（上限 300）
- `ArcSurvivors.itemPickups` — 法宝拾取物（Boss掉落）
- `ArcSurvivors.buffPickups` — Buff道具拾取物（敌人掉落）

### 游戏物品系统（重要区分）

游戏有两种完全不同的物品系统，**切勿混淆**：

#### 1. 法宝（Items）- 永久性道具，Boss掉落
- **定义位置**: `systems/upgrade.js` 中的 `ArcSurvivors.ITEMS` 数组
- **文案位置**: `core/strings.js` 中的 `STRINGS.ITEMS` 对象
- **掉落机制**: Boss死亡时调用 `ArcSurvivors.trySpawnItem()`，掉落统一法宝物品
- **获取方式**: 玩家拾取后进入选择界面，从3个随机法宝中选择1个
- **效果**: 永久生效，通过 `item.apply(player)` 设置玩家属性
- **显示**: 在状态面板"法宝"区域显示
- **示例**: 破势、心眼、吸血鬼面具、冰霜新星等

#### 2. Buff道具 - 临时效果，敌人掉落
- **定义位置**: `core/game-config.js` 中的 `BUFF_ITEMS.TYPES` 配置
- **文案位置**: `core/strings.js` 中的 `STRINGS.BUFF_ITEMS` 对象
- **掉落机制**: `ArcSurvivors.trySpawnBuffItem()` 根据 `BUFF_ITEMS.DROP_CHANCE` 概率掉落
- **获取方式**: 拾取后立即生效
- **效果**: 临时生效，有持续时间或一次性效果
- **显示**: 在屏幕左下角显示计时器图标
- **示例**: 炸弹、冰块、护盾、狂暴、漩涡、鸡腿

具体添加流程请参考 `.opencode/skills/game-development-guide/SKILL.md`

## 资源系统

### 资源加载器
项目包含一个资源加载器 (`core/resource-loader.js`)，支持加载精灵图和音频文件。

### 资源回退机制
所有实体绘制方法都支持资源回退：
1. 如果资源文件存在，使用精灵图绘制
2. 如果资源文件不存在，回退到原有的Canvas绘制
3. 这允许逐步替换资源，无需一次性完成所有资源

## 配置系统

### 统一配置管理
所有游戏数值和文案都分散在 `core/` 文件夹的多个文件中，方便调整：

#### GAME_CONFIG - 游戏数值配置（core/game-config.js）
包含画布尺寸、玩家属性、敌人类型配置、生成系统、子弹系统等所有游戏数值。

#### STRINGS - 文案配置（core/strings.js，支持格式化）
包含升级、道具、UI文案，支持 `{变量}` 格式化。

#### 格式化函数（core/config.js）
使用 `ArcSurvivors.formatString(template, data)` 函数格式化文案。

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
| 升级基础经验 | `PLAYER.BASE_EXP_TO_LEVEL` | 100, ×1.5/级 |
| Boss 生成 | `SPAWN.BOSS_INTERVAL` / `BOSS_MIN_TIME` | 45秒/30秒后 |
| 粒子上限 | `PARTICLE.MAX_COUNT` | 300 |
| 难度增长 | `DIFFICULTY` | 基础1，每45秒+0.2 |
| Buff掉落概率 | `BUFF_ITEMS.DROP_CHANCE` | 5% |
| 冰霜效果 | `FROST.SLOW_FACTOR` / `SLOW_DURATION` | 0.5 / 1.5秒 |

## 常见陷阱

- **脚本顺序很重要**：先加载 `player.js` 再加载 `bullet.js` 会导致问题
- **`var` 作用域**：`var` 是函数作用域，不是块作用域——在循环中使用闭包
- **Canvas 坐标系**：原点在左上角，Y 轴向下增大
- **`Set` 使用**：Bullet 中的 `hitEnemies` 使用 ES6 Set——作为项目中唯一的 ES6 特性，可以接受
- **配置引用时机**：确保在访问 `GAME_CONFIG` 或 `STRINGS` 时对应的配置文件已加载完成（config.js → game-config.js → strings.js）
- **Buff叠加问题**：Buff道具（狂暴、护盾）重复拾取时只延长计时器，不重复叠加效果
- **事件系统使用**：事件系统是解耦模块的关键，应该优先使用事件而不是直接函数调用
- **资源加载时机**：资源加载器需要在游戏初始化前加载，确保 `resource-loader.js` 在 `config.js` 之后加载
- **资源回退机制**：所有绘制方法都支持资源回退，确保游戏在没有资源文件时仍能正常运行
- **音频资源格式**：外部音频文件支持 MP3 和 OGG 格式，推荐使用 MP3 以获得更好的兼容性

## 架构改进说明

### 新增功能
1. **事件系统** (`core/event.js`)
   - 支持事件监听、触发、移除
   - 预定义游戏事件常量
   - 解耦模块间通信

2. **资源加载器** (`core/resource-loader.js`)
   - 支持精灵图和音频文件加载
   - 资源回退机制（无资源时使用Canvas绘制和Web Audio合成）
   - 加载进度回调和完成回调
   - 支持动态添加新资源

3. **模块化文件夹结构**
   - `core/` - 核心系统
   - `entities/` - 实体类
   - `systems/` - 游戏系统

### 设计原则
1. **单一职责**：每个模块只负责一个功能
2. **低耦合**：通过事件系统减少模块间直接依赖
3. **高内聚**：相关功能组织在同一模块中
4. **易于扩展**：新功能可以独立添加，不影响现有代码

## 开发指南

具体操作步骤请参考 `.opencode/skills/game-development-guide/SKILL.md`，包含：
- 修改游戏指南（添加敌人、升级、道具、音效等）
- 资源系统操作（添加资源、测试加载）
- 音频系统详细说明
- 扩展建议