## ADDED Requirements

### Requirement: 多重射击伤害衰减
额外投射物的伤害 SHALL 有衰减，每个额外投射物伤害为前一个的65%。

#### Scenario: 单个额外投射物
- **WHEN** 玩家有1个额外投射物
- **THEN** 第2个投射物伤害为基础伤害的65%

#### Scenario: 多个额外投射物
- **WHEN** 玩家有3个额外投射物
- **THEN** 总伤害倍数 = 1 + 0.65 + 0.42 + 0.27 = 2.34

### Requirement: Boss HP大幅提升
Boss的基础HP成长系数 SHALL 从 500 提高到 1500，每级HP加成 SHALL 从 15% 提高到 20%。

#### Scenario: Boss HP计算
- **WHEN** 生成Boss
- **THEN** Boss HP = 200 × (1 + (等级-1) × 0.20) + 难度因子 × 1500

### Requirement: 普通敌人HP成长提高
普通敌人的每级HP加成 SHALL 从 6% 提高到 10%。

#### Scenario: 普通敌人HP计算
- **WHEN** 生成普通敌人
- **THEN** 敌人HP = (15 + 难度因子 × 10) × (1 + (等级-1) × 0.10)

### Requirement: 敌人伤害成长提高
普通敌人的每级伤害加成 SHALL 从 3% 提高到 4%，Boss每级伤害加成 SHALL 从 3% 提高到 5%。

#### Scenario: 普通敌人伤害计算
- **WHEN** 普通敌人攻击玩家
- **THEN** 伤害 = 基础伤害 × (1 + (等级-1) × 0.04)

#### Scenario: Boss伤害计算
- **WHEN** Boss攻击玩家
- **THEN** 伤害 = 基础伤害 × (1 + (等级-1) × 0.05)
