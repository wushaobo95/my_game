## Why

上一轮调整后，第1分钟体验正常，但从第2个Boss开始敌人太弱，Boss被快速秒杀。根本原因是：
1. **多重射击无伤害衰减**：`PROJECTILE_DAMAGE_DECAY = 1.0` 导致每个额外投射物都有完整伤害，3个额外投射物 = 4倍DPS
2. **敌人HP成长不够高**：虽然Boss HP从200提高到500，但仍不足以应对多重射击带来的DPS爆炸

需要重新平衡，让后期Boss战有挑战性。

## What Changes

### 伤害衰减机制
- **PROJECTILE_DAMAGE_DECAY**: 从 1.0 改为 **0.65**
  - 每个额外投射物伤害为前一个的65%
  - 3个额外投射物时，总伤害倍数 = 1 + 0.65 + 0.42 + 0.27 = 2.34（而不是4.0）

### Boss HP大幅提升
- **boss.HP_SCALE**: 从 500 改为 **1500**
- **BOSS_HP_SCALE_PER_LEVEL**: 从 0.15 改为 **0.20**

### 普通敌人HP适当提高
- **ENEMY_LEVEL.HP_SCALE_PER_LEVEL**: 从 0.06 改为 **0.10**

### 敌人伤害适当提高（增加压力）
- **ENEMY_LEVEL.DAMAGE_SCALE_PER_LEVEL**: 从 0.03 改为 **0.04**
- **BOSS_DAMAGE_SCALE_PER_LEVEL**: 从 0.03 改为 **0.05**

## Capabilities

### New Capabilities
- `balance-v2`: 修复后期太弱问题，考虑多重射击等成长维度

## Impact

- **受影响文件**：`js/core/game-config.js`
- **受影响系统**：
  - 多重射击伤害计算
  - Boss战斗难度
  - 敌人威胁度
