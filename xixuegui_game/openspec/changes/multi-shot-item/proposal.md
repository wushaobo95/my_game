## Why

当前多重射击作为升级选项（id:9）过于强力，导致后期DPS爆炸。虽然通过伤害衰减（0.65）进行了平衡，但这种设计让多重射击变得"不爽快"。

更好的设计是：将多重射击改为可重复掉落的法宝，通过随机掉落来控制成长节奏，而不是每次升级都能选到。

## What Changes

### 1. 去掉伤害衰减
- **PROJECTILE_DAMAGE_DECAY**: 从 0.65 改回 **1.0**
- 每个投射物都有完整伤害

### 2. 移除多重射击升级选项
- 从 `UPGRADES` 数组中移除 id: 9（多重射击）
- 从 `getSkillMaxLevel` 和 `getSkillCurrentLevel` 中移除相关逻辑

### 3. 新增可重复掉落的法宝
- 新增法宝 id: 113 "分裂弹珠"
- 效果：extraProjectiles += 1
- 可重复掉落，最多4次（即最多+4额外投射物）
- 需要修改 `trySpawnItem` 逻辑，允许重复掉落

### 4. 添加文案
- 在 `strings.js` 的 `ITEMS` 中添加 id: 113 的文案

## Capabilities

### New Capabilities
- `multi-shot-item`: 将多重射击从升级改为可重复掉落的法宝

## Impact

- **受影响文件**：
  - `js/core/game-config.js` - 恢复伤害衰减
  - `js/systems/upgrade.js` - 移除升级选项，新增法宝，修改掉落逻辑
  - `js/core/strings.js` - 添加文案
  - `js/game.js` - 移除多重射击相关逻辑
