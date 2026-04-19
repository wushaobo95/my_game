# Boss技能开发设计文档

## 背景

当前游戏Boss仅有7个基础技能（弹幕风暴、追踪弹、激光扫射、冲刺撞击、毒雾、召唤小怪、瞬移）和1个被动技能（伤害减免）。随着Boss数量达到16个，需要扩展技能系统以增加战斗多样性。

## 目标

- 新增15个Boss技能
- 覆盖5大类：特殊弹幕、召唤/增益、防御/反制、控制、终极技能
- 每个Boss拥有独特的技能组合
- 技能随Boss序号逐步解锁

## 设计原则

### 1. 技能类型平衡
- **进攻型技能**: 50% - 螺旋弹幕、聚焦弹、散射弹幕等
- **防御型技能**: 20% - 护盾、反伤、岩石装甲
- **控制型技能**: 20% - 击退、冰冻吐息、眩晕咆哮
- **辅助型技能**: 10% - 精英召唤、狂暴、鼓舞领域

### 2. 解锁节奏
- 前3个Boss: 基础技能
- 4-8个Boss: 逐步解锁进阶技能
- 9-12个Boss: 解锁高级技能
- 13-16个Boss: 解锁终极技能

### 3. Boss特色定位
每个Boss根据其动物原型设计专属技能组合：

| Boss | 定位 | 核心技能 |
|-----|------|---------|
| 绒角羚兽 | 基础 | 弹幕风暴、追踪弹 |
| 幻彩灵狐 | 敏捷 | 螺旋弹幕、追踪散射、瞬移 |
| 沐光仙鹿 | 辅助 | 弹幕、鼓舞领域 |
| 云翼苍鹰 | 速度 | 聚焦弹、散射弹幕 |
| 翠鳞幽蛇 | 持续伤害 | 毒雾、冰冻吐息 |
| 荒林顽豚 | 坦克 | 护盾、反伤、岩石装甲 |
| 风原狂狼 | 领袖 | 召唤小怪、精英召唤、鼓舞 |
| 驰风骏驹 | 速度 | 螺旋弹幕、冲刺 |
| 岩脊蛮牛 | 力量 | 冲刺、击退、岩石装甲 |
| 暗夜疾豹 | 爆发 | 聚焦弹、追踪散射、瞬移 |
| 渊水巨鳄 | 控制 | 冰冻吐息、击退、散射弹幕 |
| 深林绒熊 | 坦克 | 眩晕咆哮、反伤、狂暴 |
| 金鬃狮灵 | 领袖 | 精英召唤、激光矩阵、鼓舞 |
| 烈风玄虎 | 爆发 | 眩晕咆哮、狂暴、冲刺 |
| 磐岩犀牛 | 坦克 | 护盾、反伤、岩石装甲 |
| 古森巨象 | 终极 | 激光矩阵、同心圆波次、冰冻吐息 |

## 技能系统架构

### 技能对象结构
```javascript
{
    name: 'skill_name',
    cooldown: 5,           // 冷却时间（秒）
    timer: 0,              // 当前计时
    phase: 0,              // 最低阶段要求
    execute: function(boss, dt) { ... },  // 瞬发技能
    // 施法类技能（可选）
    castDuration: 3,
    onCastStart: function(boss) { ... },
    updateCast: function(boss, dt) { ... },
    onCastEnd: function(boss) { ... }
}
```

### 状态标记
Boss对象扩展属性：
- `boss.shieldHp` - 护盾值
- `boss.reflecting` - 反伤状态
- `boss.rockArmored` - 岩石装甲状态
- `boss.berserked` - 狂暴状态
- `boss.auraActive` - 鼓舞领域状态
- `boss.lasers[]` - 激光矩阵数组

## 文件结构

```
js/entities/bosses/skills/active/
├── bullet-storm.js      (已有)
├── homing-missiles.js   (已有)
├── laser-sweep.js       (已有)
├── charge.js            (已有)
├── poison-fog.js        (已有)
├── summon-minions.js    (已有)
├── teleport.js          (已有)
├── spiral-barrage.js    (新增)
├── focus-fire.js        (新增)
├── scatter-shot.js      (新增)
├── concentric-rings.js  (新增)
├── homing-scatter.js    (新增)
├── summon-elites.js     (新增)
├── berserk.js           (新增)
├── aura-buff.js         (新增)
├── shield.js            (新增)
├── reflect.js           (新增)
├── rock-armor.js        (新增)
├── knockback.js         (新增)
├── ice-breath.js        (新增)
├── stun-roar.js         (新增)
└── laser-matrix.js      (新增)
```

## 兼容性

- 所有新技能使用现有EnemyBullet系统
- 复用现有的laserState和chargeState机制
- 保持向后兼容，不修改现有技能行为
- 配置参数支持后续调整