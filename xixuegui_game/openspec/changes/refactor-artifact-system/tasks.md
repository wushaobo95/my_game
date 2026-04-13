## 1. 配置和文案修改

- [ ] 1.1 在 `core/game-config.js` 的 `ITEM_PICKUP` 中添加统一法宝物品配置（图标、颜色等）
- [ ] 1.2 在 `core/strings.js` 的 `UI` 中添加法宝选择界面相关文案

## 2. ItemPickup 类修改

- [ ] 2.1 修改 `js/entities/gem.js` 中的 `ItemPickup` 构造函数，添加 `isUnifiedItem` 参数
- [ ] 2.2 修改 `ItemPickup.prototype.update` 方法，统一法宝物品拾取时触发选择界面
- [ ] 2.3 修改 `ItemPickup.prototype.draw` 方法，统一法宝物品显示特殊图标

## 3. 法宝池管理修改

- [ ] 3.1 修改 `js/systems/upgrade.js` 中的 `trySpawnItem` 函数，返回统一法宝物品或null
- [ ] 3.2 在 `js/systems/upgrade.js` 中添加 `showItemChoiceScreen` 函数，实现法宝选择界面
- [ ] 3.3 修改 `js/systems/upgrade.js` 中的 `showItemDescription` 函数，支持统一法宝物品

## 4. Boss掉落逻辑修改

- [ ] 4.1 修改 `js/entities/enemy.js` 中的Boss死亡逻辑，创建统一法宝物品
- [ ] 4.2 确保法宝池耗尽时Boss不再掉落法宝物品

## 5. 测试和验证

- [ ] 5.1 测试统一法宝物品掉落和拾取
- [ ] 5.2 测试法宝选择界面显示和交互
- [ ] 5.3 测试法宝池不放回抽取逻辑
- [ ] 5.4 测试法宝池耗尽后的表现
