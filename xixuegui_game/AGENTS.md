# AGENTS.md - 卡皮巴拉冒险

## 项目概述

单人吸血鬼幸存者风格 HTML5 Canvas 游戏。直接在浏览器打开 `index.html` 或通过 HTTP 服务器提供服务。

## 文件结构

```
xixuegui_game/
├── index.html              # 入口文件，按顺序加载脚本
├── css/style.css           # 所有样式
├── build.js                # 构建脚本
├── js/
│   ├── core/               # 核心系统
│   │   ├── config.js       # 命名空间、全局状态、工具函数
│   │   ├── resource-loader.js
│   │   ├── game-config.js # 游戏数值配置
│   │   ├── strings.js     # 文案配置
│   │   ├── event.js       # 事件系统
│   │   └── utils.js        # 数学工具函数
│   ├── entities/          # 实体类
│   │   ├── player.js      # 玩家角色
│   │   ├── enemies/       # 敌人系统
│   │   │   ├── base.js    # 敌人基类
│   │   │   ├── types.js   # 敌人类型定义
│   │   │   ├── spawn.js   # 生成逻辑
│   │   │   └── bullets.js # 敌人子弹
│   │   ├── bosses/         # Boss系统
│   │   │   ├── boss-base.js      # Boss基类
│   │   │   ├── boss-default.js   # 默认Boss实现
│   │   │   └── skills/
│   │   │       ├── active/        # 主动技能
│   │   │       │   ├── laser-matrix.js
│   │   │       │   ├── stun-roar.js
│   │   │       │   ├── ice-breath.js
│   │   │       │   ├── knockback.js
│   │   │       │   ├── rock-armor.js
│   │   │       │   ├── reflect.js
│   │   │       │   ├── shield.js
│   │   │       │   ├── aura-buff.js
│   │   │       │   ├── berserk.js
│   │   │       │   ├── summon-elites.js
│   │   │       │   ├── homing-scatter.js
│   │   │       │   ├── concentric-rings.js
│   │   │       │   ├── scatter-shot.js
│   │   │       │   ├── focus-fire.js
│   │   │       │   ├── spiral-barrage.js
│   │   │       │   ├── charge.js
│   │   │       │   ├── homing-missiles.js
│   │   │       │   ├── laser-sweep.js
│   │   │       │   ├── bullet-storm.js
│   │   │       │   ├── poison-fog.js
│   │   │       │   ├── summon-minions.js
│   │   │       │   └── teleport.js
│   │   │       └── passive/         # 被动技能
│   │   │           └── damage-reduction.js
│   │   ├── bullet.js       # 玩家子弹 + 激光
│   │   ├── gem.js         # 经验宝石
│   │   ├── particle.js    # 粒子系统
│   │   ├── trap.js        # 陷阱
│   │   └── fire-orb.js   # 火球
│   ├── systems/           # 游戏系统
│   │   ├── audio.js      # 音频系统
│   │   ├── renderer.js  # 渲染系统
│   │   ├── upgrade.js   # 升级和法宝
│   │   └── buff.js     # Buff道具
│   └── game.js         # 主循环
└── assets/             # 游戏资源
```

## 运行游戏

直接在浏览器打开 `index.html`，或：
```bash
python -m http.server 8000
```

## 架构设计

### 全局命名空间
所有代码在 `var ArcSurvivors = ArcSurvivors || {}` 下，不用 ES6 模块（`file://` 协议不兼容）。

### 脚本加载顺序
严格按 `index.html` 中的顺序加载：

1. `core/config.js` → 2. `resource-loader.js` → 3. `game-config.js` → 4. `strings.js`
5. `core/event.js` → 6. `core/utils.js`
7. 实体: `particle.js` → `gem.js` → `bullet.js` → `trap.js` → `fire-orb.js`
8. 敌人: `enemies/base.js` → `enemies/types.js` → `enemies/spawn.js` → `enemies/bullets.js`
9. Boss: `boss-base.js` → 各技能按文件名排序 → `boss-default.js`
10. `player.js`
11. `systems/audio.js` → `buff.js` → `upgrade.js` → `renderer.js`
12. `game.js`

### 全局数组
- `ArcSurvivors.enemies` / `ArcSurvivors.bosses`
- `ArcSurvivors.bullets` / `ArcSurvivors.enemyBullets`
- `ArcSurvivors.gems` / `ArcSurvivors.particles`
- `ArcSurvivors.itemPickups` / `ArcSurvivors.buffPickups`
- `ArcSurvivors.traps` / `ArcSurvivors.fireOrbs`

### 物品系统

| 类型 | 定义位置 | 掉落来源 | 生效方式 |
|------|----------|----------|----------|
| 法宝 | `systems/upgrade.js` | Boss 死亡 | 永久 |
| Buff | `core/game-config.js` | 敌人掉落 | 临时 |

## Boss 技能系统

### 结构
- `boss-base.js`: Boss 基类，定义 `update()`、`draw()`、`takeDamage()`、`activateSkill()`
- `skills/active/*.js`: 22 个主动技能（激光矩阵、眩晕咆哮、冰息、击退、石甲、反射、护盾、光环、狂暴、召唤精英、散射追踪、同心圆环、聚焦火力和螺旋弹幕等）
- `skills/passive/*.js`: 被动技能（减伤）

### 添加新技能
1. 在 `skills/active/` 创建 `my-skill.js`
2. 在 `boss-default.js` 注册：`ArcSurvivors.BOSS_SKILLS.active.push('my-skill')`

## 代码风格

- 分号、4 空格缩进
- `var` 而非 `let`/`const`
- 构造函数 + 原型方法
- 中文用于 UI 标签，代码用英文

## 关键配置

| 配置项 | 默认值 |
|--------|--------|
| 画布尺寸 | 1280 × 720 |
| 玩家生命 | 100 |
| Boss 间隔 | 45 秒 |

## 常见陷阱

- 脚本顺序必须严格遵守
- `var` 是函数作用域
- 敌人 `enemies/` 在 Boss `bosses/` 之前加载

具体操作参考 `.opencode/skills/game-development-guide/SKILL.md`