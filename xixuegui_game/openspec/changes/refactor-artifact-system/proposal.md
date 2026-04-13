## Why

当前永久法宝系统（ITEMS）在Boss死亡时直接掉落一个特定的法宝物品，玩家拾取后立即获得该法宝。这导致玩家无法根据当前游戏策略选择合适的法宝，且缺少策略性选择。重构为统一法宝物品+选择界面可以增加游戏策略深度，让玩家根据当前情况选择最合适的法宝。

## What Changes

- 修改Boss死亡掉落逻辑，不再掉落特定法宝，改为掉落统一的"法宝"物品
- 拾取统一法宝物品时暂停游戏，显示选择界面，从3个法宝中选择一个（不放回抽取）
- 法宝池耗尽时，Boss不再掉落法宝物品（预留说明注释后续拓展）
- 选择界面必须选择一个法宝，不能跳过
- 当可用法宝不足3个时，显示实际可用数量（2个或1个）

## Capabilities

### New Capabilities
- `artifact-choice-system`: 法宝选择系统，包含统一法宝物品、选择界面、法宝池管理

### Modified Capabilities
（无现有spec）

## Impact

- 修改 `js/entities/gem.js` 中的 `ItemPickup` 类，支持统一法宝物品
- 修改 `js/systems/upgrade.js` 中的 `trySpawnItem` 函数和添加选择界面函数
- 修改 `js/entities/enemy.js` 中的Boss死亡掉落逻辑
- 修改 `core/game-config.js` 和 `core/strings.js` 添加配置和文案
- 可能需要修改 `js/game.js` 初始化法宝池状态
