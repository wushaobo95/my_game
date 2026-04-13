## 1. 恢复伤害衰减

- [x] 1.1 修改 `PLAYER.PROJECTILE_DAMAGE_DECAY` 从 0.65 改为 1.0

## 2. 新增法宝

- [x] 2.1 在 `UPGRADES.ITEMS` 数组中添加 id: 113 "分裂弹珠"
- [x] 2.2 在 `strings.js` 的 `ITEMS` 中添加 id: 113 的文案
- [x] 2.3 在 `upgrade.js` 的 `getItemDisplay` 中添加 id: 113 的格式化逻辑

## 3. 修改掉落逻辑

- [x] 3.1 修改 `trySpawnItem` 函数，对 id: 113 允许重复掉落（最多4次）

## 4. 移除多重射击升级

- [x] 4.1 从 `UPGRADES` 数组中移除 id: 9（多重射击）
- [x] 4.2 从 `game.js` 的 `getSkillMaxLevel` 中移除 id: 9
- [x] 4.3 从 `game.js` 的 `getSkillCurrentLevel` 中移除相关逻辑
