## ADDED Requirements

### Requirement: 可重复掉落的多重射击法宝
新增法宝 "分裂弹珠"（id: 113），效果是额外投射物+1，可重复掉落最多4次。

#### Scenario: 法宝掉落检查
- **WHEN** Boss死亡触发 `trySpawnItem()`
- **THEN** 检查玩家拥有 id: 113 的次数
- **AND** 如果次数 < 4，则 id: 113 在可选列表中

#### Scenario: 法宝效果应用
- **WHEN** 玩家拾取 id: 113
- **THEN** player.extraProjectiles += 1

#### Scenario: 达到上限后
- **WHEN** 玩家已拥有4个 id: 113
- **THEN** id: 113 不再出现在可选列表中

## REMOVED Requirements

### Requirement: 多重射击升级选项
**Reason**: 改为法宝掉落机制，控制成长节奏
**Migration**: 多重射击现在通过法宝 "分裂弹珠" 获得

### Requirement: 多重射击伤害衰减
**Reason**: 多重射击改为稀有掉落，不再需要伤害衰减来平衡
**Migration**: PROJECTILE_DAMAGE_DECAY 恢复为 1.0
