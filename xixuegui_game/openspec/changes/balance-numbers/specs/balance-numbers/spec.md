## ADDED Requirements

### Requirement: 玩家攻击力成长调整
玩家每次升级获得的攻击力加成 SHALL 从 +8 降低到 +5。

#### Scenario: 升级时攻击力增长
- **WHEN** 玩家选择"攻击强化"升级
- **THEN** 玩家攻击力增加 5 点（而不是 8 点）

### Requirement: 普通敌人HP成长调整
普通敌人的HP成长系数 SHALL 从 12 降低到 10，每级HP加成 SHALL 从 8% 降低到 6%。

#### Scenario: 普通敌人HP计算
- **WHEN** 生成普通敌人
- **THEN** 敌人HP = (15 + 难度因子 × 10) × (1 + (等级-1) × 0.06)

### Requirement: Boss HP成长调整
Boss的基础HP成长系数 SHALL 从 200 提高到 500，每级HP加成 SHALL 从 10% 提高到 15%。

#### Scenario: Boss HP计算
- **WHEN** 生成Boss
- **THEN** Boss HP = 200 × (1 + (等级-1) × 0.15) + 难度因子 × 500

### Requirement: 敌人生成率调整
基础生成率 SHALL 从 2.0 只/秒降低到 1.5 只/秒，最大生成率 SHALL 从 6 只/秒降低到 5 只/秒。

#### Scenario: 前期生成率
- **WHEN** 游戏开始
- **THEN** 初始生成率为 1.5 只/秒

#### Scenario: 后期生成率上限
- **WHEN** 游戏时间超过 60 秒
- **THEN** 生成率不超过 5 只/秒

### Requirement: 批量生成调整
批量生成间隔 SHALL 从 8 秒延长到 10 秒，批量数量成长 SHALL 从 20 秒增加到 25 秒。

#### Scenario: 批量生成触发
- **WHEN** 每过 10 秒
- **THEN** 触发批量生成

#### Scenario: 批量数量计算
- **WHEN** 计算批量生成数量
- **THEN** 数量 = 3 + floor(游戏时间 / 25)
