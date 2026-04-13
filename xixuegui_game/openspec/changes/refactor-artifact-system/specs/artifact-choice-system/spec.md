## ADDED Requirements

### Requirement: 统一法宝物品掉落
系统 SHALL 在Boss死亡时掉落统一法宝物品，而不是特定法宝物品。

#### Scenario: Boss死亡掉落统一法宝物品
- **WHEN** Boss敌人死亡
- **THEN** 系统创建统一法宝物品（ItemPickup with isUnifiedItem=true）

### Requirement: 法宝选择界面
系统 SHALL 在玩家拾取统一法宝物品时显示选择界面，从3个法宝中选择一个。

#### Scenario: 拾取统一法宝物品显示选择界面
- **WHEN** 玩家拾取统一法宝物品
- **THEN** 系统暂停游戏并显示法宝选择界面

#### Scenario: 显示3个法宝选项
- **WHEN** 法宝选择界面显示
- **THEN** 系统从可用法宝池中随机选择3个法宝显示（如果可用法宝不足3个，显示实际数量）

#### Scenario: 玩家必须选择一个法宝
- **WHEN** 法宝选择界面显示
- **THEN** 玩家必须点击一个法宝选项，不能跳过

### Requirement: 法宝池不放回抽取
系统 SHALL 确保每个法宝只能被选择一次。

#### Scenario: 选择后移除法宝
- **WHEN** 玩家选择一个法宝
- **THEN** 该法宝从可用法宝池中移除，不再出现在后续选择中

#### Scenario: 法宝池耗尽不再掉落
- **WHEN** 所有法宝都已被选择（可用法宝池为空）
- **THEN** Boss死亡时不再掉落法宝物品

### Requirement: 法宝效果应用
系统 SHALL 在玩家选择法宝后应用法宝效果。

#### Scenario: 应用法宝效果
- **WHEN** 玩家选择一个法宝
- **THEN** 系统应用法宝效果到玩家，并显示法宝描述

#### Scenario: 法宝效果持久化
- **WHEN** 法宝效果被应用
- **THEN** 法宝效果持续到游戏结束（永久效果）
