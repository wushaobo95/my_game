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
│   │   ├── upgrade.js  # 升级和道具定义，升级界面 UI
│   │   └── buff.js     # Buff道具系统（炸弹、冰冻、护盾、狂暴）
│   └── game.js         # 主循环、输入、暂停、状态面板、初始化
├── assets/             # 游戏资源
│   ├── sprites/        # 精灵图资源
│   │   ├── player/     # 玩家精灵图
│   │   ├── enemies/    # 敌人精灵图
│   │   ├── bullets/    # 子弹特效
│   │   ├── items/      # 道具图标
│   │   ├── effects/    # 粒子特效
│   │   └── background/ # 背景图片
│   ├── audio/          # 音频资源
│   │   ├── sfx/        # 音效文件
│   │   └── music/      # 背景音乐
│   └── 资源规格文档.md # 资源规格说明文档
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
   - 负责处理游戏的各种功能

### 事件系统
使用事件系统解耦模块间通信，减少直接依赖：
```js
// 注册事件监听器
ArcSurvivors.EventSystem.on(ArcSurvivors.Events.PLAYER_DIE, function() {
    console.log('Player died');
});

// 触发事件
ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.PLAYER_DIE);
```

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
- `ArcSurvivors.buffPickups` — Buff道具拾取物

## 资源系统

### 资源加载器
项目包含一个资源加载器 (`core/resource-loader.js`)，支持加载精灵图和音频文件：
```js
// 初始化资源加载器
ArcSurvivors.ResourceLoader.init(
    function(loaded, total) {
        console.log('加载进度: ' + loaded + '/' + total);
    },
    function() {
        console.log('所有资源加载完成');
    }
);

// 检查资源是否已加载
if (ArcSurvivors.ResourceLoader.hasSprite('player_normal')) {
    var sprite = ArcSurvivors.ResourceLoader.getSprite('player_normal');
    ctx.drawImage(sprite, x, y, width, height);
}

// 播放音频资源
if (ArcSurvivors.ResourceLoader.hasAudio('sfx_shoot')) {
    ArcSurvivors.ResourceLoader.playAudio('sfx_shoot', 1.0);
}
```

### 资源回退机制
所有实体绘制方法都支持资源回退：
1. 如果资源文件存在，使用精灵图绘制
2. 如果资源文件不存在，回退到原有的Canvas绘制
3. 这允许逐步替换资源，无需一次性完成所有资源

### 资源规格文档
详细的资源规格请参考 `assets/资源规格文档.md`，包含：
- 所有需要的精灵图规格（尺寸、格式、风格）
- 所有需要的音频文件规格（时长、格式、风格）
- 文件命名规范和目录结构
- 颜色参考和技术规格

### 添加新资源
1. 将资源文件放入对应的 `assets/` 文件夹
2. 在 `core/resource-loader.js` 的清单中添加资源路径
3. 修改对应的绘制方法以支持新资源

### 测试资源加载
使用 `test-resources.html` 页面测试资源加载状态：
- 显示所有资源的加载状态
- 提供测试功能验证资源加载器
- 实时日志输出便于调试

## 配置系统

### 统一配置管理
所有游戏数值和文案都分散在 `core/` 文件夹的多个文件中，方便调整：

#### GAME_CONFIG - 游戏数值配置（core/game-config.js）
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

#### STRINGS - 文案配置（core/strings.js，支持格式化）
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

#### 格式化函数（core/config.js）
```js
// 使用示例
ArcSurvivors.formatString('攻击力+{value}', { value: 10 });
// 输出: '攻击力+10'

ArcSurvivors.formatString('存活: {time}s', { time: 120 });
// 输出: '存活: 120s'
```

### 添加新配置
1. **新数值**：在 `core/game-config.js` 的 `GAME_CONFIG` 对应分类下添加
2. **新文案**：在 `core/strings.js` 的 `STRINGS` 对应分类下添加，使用 `{变量}` 格式化
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
| 升级基础经验 | `PLAYER.BASE_EXP_TO_LEVEL` | 80, ×1.5/级 |
| Boss 生成 | `SPAWN.BOSS_INTERVAL` / `BOSS_MIN_TIME` | 45秒/30秒后 |
| 粒子上限 | `PARTICLE.MAX_COUNT` | 300 |
| 难度增长 | `DIFFICULTY` | 基础1，每45秒+0.2 |
| Buff掉落概率 | `BUFF_ITEMS.DROP_CHANCE` | 5% |
| 冰霜效果 | `FROST.SLOW_FACTOR` / `SLOW_DURATION` | 0.5 / 1.5秒 |

## 修改游戏指南

### 1. 添加新敌人类型
1. 在 `core/game-config.js` 的 `ENEMY_TYPES` 中添加配置
2. 在 `entities/enemy.js` 的 `draw()` 方法中添加对应的绘制形状

### 2. 添加新升级/道具
1. 在 `core/strings.js` 的 `STRINGS.UPGRADES` 或 `STRINGS.ITEMS` 中添加文案
2. 在 `systems/upgrade.js` 的 `UPGRADES` 或 `ITEMS` 数组中添加定义
3. 使用 `formatString()` 格式化描述中的动态数值

### 2.1 添加新Buff道具
1. 在 `core/game-config.js` 的 `BUFF_ITEMS.TYPES` 中添加配置（DURATION、COLOR等）
2. 在 `core/strings.js` 的 `STRINGS.BUFF_ITEMS` 中添加文案（name、desc、icon）
3. 在 `systems/buff.js` 的 `activate()` 函数中添加对应的 case 逻辑
4. 在 `systems/buff.js` 的 `updatePlayerBuffs()` 函数中添加计时器更新逻辑
5. 在 `systems/buff.js` 的 `drawBuffIndicators()` 函数中添加UI显示逻辑

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

## 音频系统

音频系统支持两种模式：
1. **Web Audio API 合成**：默认模式，无需外部音频文件
2. **外部音频文件**：支持 MP3/OGG 格式的音频文件

音频上下文需要用户手势才能启动；`game.js` 在首次点击画布时初始化。
播放前调用 `ArcSurvivors.Audio.init()` 然后 `resume()`。

### 音频资源优先级
1. 如果外部音频文件存在，优先使用外部文件
2. 如果外部文件不存在，回退到 Web Audio API 合成
3. 这允许逐步替换音频资源，无需一次性完成所有音频

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

### 扩展建议
1. 添加新功能时，优先使用事件系统进行通信
2. 新实体类放在 `entities/` 文件夹
3. 新游戏系统放在 `systems/` 文件夹
4. 添加新资源时，先更新资源加载器清单，再修改绘制方法
4. 配置和工具函数放在 `core/` 文件夹