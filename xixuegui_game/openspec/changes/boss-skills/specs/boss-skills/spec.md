# Boss技能详细规格

## 概述
本文档定义15个新Boss技能的详细规格，包括配置参数、效果描述和实现要点。

---

## 技能索引

| 序号 | 技能名称 | 文件名 | 类型 | 解锁等级 |
|-----|---------|--------|------|---------|
| 1 | 螺旋弹幕 | spiral-barrage.js | 特殊弹幕 | 8 |
| 2 | 聚焦弹 | focus-fire.js | 特殊弹幕 | 9 |
| 3 | 散射弹幕 | scatter-shot.js | 特殊弹幕 | 10 |
| 4 | 同心圆波次 | concentric-rings.js | 特殊弹幕 | 11 |
| 5 | 追踪散射 | homing-scatter.js | 特殊弹幕 | 12 |
| 6 | 精英召唤 | summon-elites.js | 召唤 | 13 |
| 7 | 狂暴 | berserk.js | 增益 | 14 |
| 8 | 鼓舞领域 | aura-buff.js | 增益 | 8 |
| 9 | 护盾 | shield.js | 防御 | 6 |
| 10 | 反伤 | reflect.js | 防御 | 10 |
| 11 | 岩石装甲 | rock-armor.js | 防御 | 12 |
| 12 | 击退 | knockback.js | 控制 | 5 |
| 13 | 冰冻吐息 | ice-breath.js | 控制 | 8 |
| 14 | 眩晕咆哮 | stun-roar.js | 控制 | 11 |
| 15 | 激光矩阵 | laser-matrix.js | 终极 | 13 |

---

## 技能规格

### 1. 螺旋弹幕 (Spiral Barrage)

```javascript
// 配置
SPIRAL_BARRAGE: {
    COOLDOWN: 3,           // 冷却3秒
    BULLET_COUNT: 8,       // 同时发出8发
    SPIRAL_SPEED: 0.5,     // 螺旋旋转速度 (弧度/秒)
    BULLET_SPEED: 4,       // 子弹速度
    DURATION: 2,           // 持续2秒
    DAMAGE_SCALE: 0.3,    // 伤害比例
    UNLOCK_LEVEL: 8
}

// 效果
// - 发射8发子弹围绕Boss呈螺旋状向外扩散
// - 子弹一边旋转一边向外飞行
// - Phase 2增加子弹数量到12发

// 实现要点
// - 在execute中创建多个子弹，每个带有初始角度偏移
// - 子弹update中angle += SPIRAL_SPEED * dt
// - 需要扩展EnemyBullet或创建新子弹类型支持螺旋轨迹
```

---

### 2. 聚焦弹 (Focus Fire)

```javascript
// 配置
FOCUS_FIRE: {
    COOLDOWN: 2,            // 冷却2秒
    BULLET_COUNT: 5,       // 连发5发
    FIRE_INTERVAL: 0.15,    // 每发间隔0.15秒
    BULLET_SPEED: 8,        // 高速
    DAMAGE_SCALE: 0.4,     // 单发伤害比例
    UNLOCK_LEVEL: 9
}

// 效果
// - 快速连续向玩家发射5发高速子弹
// - 瞄准玩家当前位置，每发有轻微预判
// - Phase 2增加连发数到7发，间隔缩短到0.12秒

// 实现要点
// - 使用castDuration实现多段发射
// - onCastStart记录目标位置
// - updateCast中按FIRE_INTERVAL发射
```

---

### 3. 散射弹幕 (Scatter Shot)

```javascript
// 配置
SCATTER_SHOT: {
    COOLDOWN: 4,
    WAVE_COUNT: 3,          // 3波
    WAVE_INTERVAL: 0.5,     // 波次间隔0.5秒
    BULLETS_PER_WAVE: 8,     // 每波8发
    SPREAD_ANGLE: 120,       // 散射角度120度
    SPEED: 3.5,
    DAMAGE_SCALE: 0.25,
    UNLOCK_LEVEL: 10
}

// 效果
// - 分3波向扇形区域散射弹幕
// - 每波间隔0.5秒
// - Phase 2增加波次数到4波

// 实现要点
// - 使用castDuration实现波次发射
// - 每波计算角度范围：centerAngle ± SPREAD_ANGLE/2
```

---

### 4. 同心圆波次 (Concentric Rings)

```javascript
// 配置
CONCENTRIC_RINGS: {
    COOLDOWN: 5,
    RING_COUNT: 3,          // 3圈
    RING_INTERVAL: 0.3,     // 间隔0.3秒
    BULLETS_PER_RING: 16,   // 每圈16发
    SPEED: 2.5,
    DAMAGE_SCALE: 0.2,
    UNLOCK_LEVEL: 11
}

// 效果
// - 从内到外发出3圈同心圆子弹
// - 每圈间隔0.3秒
// - Phase 2圈数增加到4圈

// 实现要点
// - 圆形均匀分布：angle = (i / count) * PI * 2
// - updateCast中按RING_INTERVAL发射每圈
```

---

### 5. 追踪散射 (Homing Scatter)

```javascript
// 配置
HOMING_SCATTER: {
    COOLDOWN: 4,
    BULLET_COUNT: 6,
    HOMING_DURATION: 1.5,   // 追踪1.5秒
    SPEED: 3,
    TURN_SPEED: 2,
    DAMAGE_SCALE: 0.35,
    UNLOCK_LEVEL: 12
}

// 效果
// - 发射6发散射的追踪弹
// - 前1.5秒追踪玩家，之后直线飞行
// - Phase 2增加子弹数到8发

// 实现要点
// - 使用EnemyBullet的homingDuration参数
// - 初始角度随机分布
// - 直接复用现有EnemyBullet类
```

---

### 6. 精英召唤 (Summon Elites)

```javascript
// 配置
SUMMON_ELITES: {
    COOLDOWN: 20,
    COUNT: 2,
    SPAWN_RADIUS: 120,
    ELITE_HP_SCALE: 2,      // 2倍生命
    ELITE_DAMAGE_SCALE: 1.5, // 1.5倍伤害
    UNLOCK_LEVEL: 13
}

// 效果
// - 在Boss周围召唤2只精英小怪
// - 精英小怪具有更高血量和伤害
// - Phase 2召唤数量增加到3只

// 实现要点
// - 使用enemyTypes中的elite类型（需新增）
// - 临时修改elite enemy的属性
// - 召唤位置：boss周围圆形分布
```

---

### 7. 狂暴 (Berserk)

```javascript
// 配置
BERSERK: {
    COOLDOWN: 15,
    DURATION: 5,
    SPEED_MULT: 1.5,
    DAMAGE_MULT: 1.8,
    ATTACK_COOLDOWN_SCALE: 0.7,
    VISUAL_EFFECT: 'red_glow',
    UNLOCK_LEVEL: 14
}

// 效果
// - Boss进入狂暴状态持续5秒
// - 移速x1.5，伤害x1.8，攻速(技能cd)x0.7
// - 身体发红光
// - Phase 2持续时间增加到7秒

// 实现要点
// - 设置boss.berserked = true
// - 在boss.update中根据状态调整属性
// - onCastEnd中恢复属性
// - draw中绘制红色光晕
```

---

### 8. 鼓舞领域 (Aura Buff)

```javascript
// 配置
AURA_BUFF: {
    COOLDOWN: 10,
    RADIUS: 200,
    DURATION: 8,
    ENEMY_SPEED_BONUS: 1.3,
    ENEMY_DAMAGE_BONUS: 1.2,
    EFFECT_COLOR: 'rgba(255, 200, 0, 0.2)',
    UNLOCK_LEVEL: 8
}

// 效果
// - 释放金色光环，增强范围内小怪
// - 小怪速度x1.3，伤害x1.2
// - 持续8秒
// - Phase 2范围扩大到250

// 实现要点
// - 设置boss.auraActive = true
// - 在boss.update中遍历范围内enemies并应用增益
// - draw中绘制金色圆形区域
// - onCastEnd清除增益效果
```

---

### 9. 护盾 (Shield)

```javascript
// 配置
SHIELD: {
    COOLDOWN: 12,
    DURATION: 3,
    HP_ABSORB: 0.3,
    VISUAL: 'blue_bubble',
    UNLOCK_LEVEL: 6
}

// 效果
// - 生成蓝色护盾，持续3秒
// - 护盾可吸收30%最大HP的伤害
// - 护盾被击破后消失
// - Phase 2持续时间增加到4秒

// 实现要点
// - 设置boss.shieldHp = boss.maxHp * HP_ABSORB
// - 在takeDamage中优先扣除shieldHp
// - draw中绘制蓝色圆形护盾
```

---

### 10. 反伤 (Reflect)

```javascript
// 配置
REFLECT: {
    COOLDOWN: 15,
    DURATION: 4,
    REFLECT_PERCENT: 0.4,
    DAMAGE_CAP: 50,
    VISUAL: 'red_spikes',
    UNLOCK_LEVEL: 10
}

// 效果
// - 激活反伤状态4秒
// - 受伤时反弹40%的伤害给玩家
// - 单次反弹上限50
// - Phase 2反弹比例提高到50%

// 实现要点
// - 设置boss.reflecting = true
// - 在takeDamage中计算反射伤害
// - 调用player.takeDamage进行反弹
// - draw中绘制红色尖刺效果
```

---

### 11. 岩石装甲 (Rock Armor)

```javascript
// 配置
ROCK_ARMOR: {
    COOLDOWN: 20,
    DURATION: 6,
    DAMAGE_REDUCTION: 0.6,
    SLOW_ATTACKERS: true,
    SLOW_FACTOR: 0.5,
    SLOW_DURATION: 1,
    VISUAL: 'brown_shards',
    UNLOCK_LEVEL: 12
}

// 效果
// - 激活岩石装甲6秒
// - 减少60%受到的伤害
// - 攻击Boss的玩家被减速50%持续1秒
// - Phase 2减伤比例提高到70%

// 实现要点
// - 设置boss.rockArmored = true
// - 在takeDamage中应用DAMAGE_REDUCTION
// - 攻���时设置player.slowed状态
// - draw中绘制棕色碎片护甲
```

---

### 12. 击退 (Knockback)

```javascript
// 配置
KNOCKBACK: {
    COOLDOWN: 6,
    FORCE: 300,
    DAMAGE_SCALE: 0.3,
    STUN_DURATION: 0.3,
    EFFECT_RADIUS: 100,
    UNLOCK_LEVEL: 5
}

// 效果
// - 将玩家击退
// - 击退距离基于FORCE
// - 击退后眩晕0.3秒
// - 同时造成伤害

// 实现要点
// - 使用castDuration实现击退动作
// - 计算玩家到Boss的方向向量
// - 修改player位置
// - 设置player.invulnerableTimer
```

---

### 13. 冰冻吐息 (Ice Breath)

```javascript
// 配置
ICE_BREATH: {
    COOLDOWN: 8,
    WARNING_DURATION: 1.5,
    BEAM_DURATION: 1,
    BEAM_WIDTH: 60,
    BEAM_LENGTH: 400,
    DAMAGE_SCALE: 0.5,
    SLOW_FACTOR: 0.3,
    SLOW_DURATION: 2,
    UNLOCK_LEVEL: 8
}

// 效果
// - 预警1.5秒后发射冰霜吐息
// - 直线扇形攻击
// - 击中玩家造成伤害并减速
// - Phase 2宽度增加

// 实现要点
// - 使用castDuration实现预警+吐息
// - warning阶段绘制预警线
// - updateCast中检测碰撞
// - 应用减速效果到player
```

---

### 14. 眩晕咆哮 (Stun Roar)

```javascript
// 配置
STUN_ROAR: {
    COOLDOWN: 15,
    RADIUS: 250,
    DURATION: 1.5,
    DAMAGE_SCALE: 0.4,
    WARNING_TIME: 0.5,
    VISUAL: 'shockwave',
    UNLOCK_LEVEL: 11
}

// 效果
// - 预警0.5秒后全屏眩晕
// - 范围250内的所有单位眩晕1.5秒
// - 同时造成伤害
// - Phase 2范围扩大到300

// 实现要点
// - 使用castDuration实现
// - warningTime显示预警动画
// - onCastEnd中遍历范围内的player
// - 设置player.invulnerableTimer和stunTimer
// - draw中绘制圆形冲击波
```

---

### 15. 激光矩阵 (Laser Matrix)

```javascript
// 配置
LASER_MATRIX: {
    COOLDOWN: 30,
    LASER_COUNT: 5,
    WARNING_DURATION: 2,
    SWEEP_DURATION: 2,
    BEAM_WIDTH: 15,
    BEAM_LENGTH: 1500,
    ROTATION_SPEED: 0.3,
    DAMAGE_PER_TICK: 0.15,
    UNLOCK_LEVEL: 13
}

// 效果
// - 预警2秒后开始扫射
// - 5条激光同时围绕Boss旋转
// - 持续2秒扫射
// - 激光经过处造成伤害
// - Phase 2激光数增加到7条

// 实现要点
// - 使用castDuration实现
// - warning阶段锁定多条激光角度
// - 保持laserState机制扩展支持多条激光
// - updateCast中遍历所有激光检测碰撞
```

---

## 实现优先级

1. **第一优先级**: 击退、护盾、散射弹幕 - 基础控制技能
2. **第二优先级**: 螺旋弹幕、追踪散射、精英召唤 - 进阶弹幕/召唤
3. **第三优先级**: 狂暴、岩石装甲、反伤 - 防御增益
4. **第四优先级**: 冰冻吐息、鼓舞领域 - 辅助技能
5. **第五优先级**: 眩晕咆哮、激光矩阵 - 终极技能
6. **第六优先级**: 聚焦弹、同心圆波次 - 特色弹幕