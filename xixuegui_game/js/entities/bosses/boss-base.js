/**
 * entities/bosses/boss-base.js - Boss基类
 * 继承自Enemy，包含通用Boss逻辑和技能系统
 *
 * 技能对象结构：
 *   {
 *       name: '技能名',
 *       cooldown: 2,          // 冷却时间（秒）
 *       timer: 0,             // 当前计时器
 *       phase: 0,             // 最低阶段要求（0/1/2）
 *       execute: function(boss, dt) { ... },
 *       // 可选：施法类技能
 *       castDuration: 3,
 *       onCastStart: function(boss) { ... },
 *       updateCast: function(boss, dt) { ... },
 *       onCastEnd: function(boss) { ... }
 *   }
 */
var ArcSurvivors = ArcSurvivors || {};

// ============================================================
// 技能命名空间
// ============================================================
ArcSurvivors.Skills = ArcSurvivors.Skills || {};
ArcSurvivors.Skills.Active = ArcSurvivors.Skills.Active || {};
ArcSurvivors.Skills.Passive = ArcSurvivors.Skills.Passive || {};

// ============================================================
// BossBase 构造函数
// ============================================================
ArcSurvivors.BossBase = function(x, y, bossConfig) {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var EL = CFG.ENEMY_LEVEL;

    ArcSurvivors.Enemy.call(this, x, y, 'boss');

    var playerLevel = ArcSurvivors.player ? ArcSurvivors.player.level : 1;
    var df = ArcSurvivors.gameState.difficultyFactor;

    this.bossConfig = bossConfig || CFG.ENEMY_TYPES.boss;
    var BC = this.bossConfig;

    this.radius = BC.RADIUS;
    this.color = BC.COLOR;

    // Boss序号（从0开始）
    var bossIndex = ArcSurvivors.BossRegistry ? ArcSurvivors.BossRegistry.spawnCount - 1 : 0;
    var scaling = EL.BOSS_SCALING;
    
    // 计算血量和伤害倍率 - 平滑成长曲线
    var hpMultiplier = 1;  // 基础倍率
    if (bossIndex === 0) hpMultiplier = 0.7;      // 第1个稍弱（新手友好）
    if (bossIndex === 1) hpMultiplier = 0.85;     // 第2个正常偏易
    if (bossIndex >= 3) hpMultiplier = scaling.HP_MULTIPLIER;  // 第4个后提高
    if (bossIndex >= 4) hpMultiplier += (bossIndex - 3) * 0.3; // 逐步增加
    
    var damageMultiplier = 1;
    if (bossIndex >= 3) damageMultiplier = scaling.DAMAGE_MULTIPLIER;
    if (bossIndex >= 5) damageMultiplier += (bossIndex - 4) * 0.1;

    var bossLevelScale = 1 + (playerLevel - 1) * EL.BOSS_HP_SCALE_PER_LEVEL;
    this.hp = (BC.HP_BASE * bossLevelScale + df * BC.HP_SCALE) * hpMultiplier;
    this.maxHp = this.hp;
    this.damage = BC.DAMAGE * (1 + (playerLevel - 1) * EL.BOSS_DAMAGE_SCALE_PER_LEVEL) * damageMultiplier;
    this.speed = BC.SPEED;

    // Boss阶段和技能
    this.bossPhase = 0;
    this.skills = [];
    this.castingSkill = null;
    this.castingTimer = 0;

    // 被动效果标记
    this.damageReduction = false;

    // 激光状态
    this.laserState = 'idle'; // idle, warning, sweeping
    this.laserTimer = 0;
    this.laserAngle = 0;
    this.laserStartAngle = 0;

    // 冲刺状态
    this.chargeState = 'idle'; // idle, charging, stunned
    this.chargeTimer = 0;
    this.chargeAngle = 0;
    this.chargeTrail = [];

    this._updatePhase();
};

ArcSurvivors.BossBase.prototype = Object.create(ArcSurvivors.Enemy.prototype);
ArcSurvivors.BossBase.prototype.constructor = ArcSurvivors.BossBase;

// ============================================================
// 阶段管理
// ============================================================

ArcSurvivors.BossBase.prototype._updatePhase = function() {
    var hpPercent = this.hp / this.maxHp;
    if (hpPercent > 0.9) {
        this.bossPhase = 0;  // 100%-90%
    } else if (hpPercent > 0.7) {
        this.bossPhase = 1;  // 90%-70%
    } else if (hpPercent > 0.5) {
        this.bossPhase = 2;  // 70%-50%
    } else {
        this.bossPhase = 3;  // 50%-0%
        // Phase 4 濒死狂暴 - 触发一次
        if (!this.berserkTriggered) {
            this.berserkTriggered = true;
            this._triggerDesperationBerserk();
        }
    }
};

// Phase 3 濒死狂暴
ArcSurvivors.BossBase.prototype._triggerDesperationBerserk = function() {
    var self = this;
    var originalSpeed = this.speed;
    var originalAttackCooldown = this.attackCooldown || 2.5;
    
    // 狂暴效果：攻速+50%，移速+30%
    this.speed *= 1.3;
    this.attackCooldown = originalAttackCooldown * 0.5;
    this.berserked = true;
    
    // 红色光晕特效
    ArcSurvivors.spawnParticles(this.x, this.y, 30, 'rgb(255, 0, 0)', 10, 6);
    
    // 5秒后恢复
    setTimeout(function() {
        if (self.active) {
            self.speed = originalSpeed;
            self.attackCooldown = originalAttackCooldown;
            self.berserked = false;
        }
    }, 5000);
};

// ============================================================
// 技能系统
// ============================================================

ArcSurvivors.BossBase.prototype.addSkill = function(skill) {
    this.skills.push(skill);
};

ArcSurvivors.BossBase.prototype.updateSkills = function(dt) {
    // 施法中：更新施法技能
    if (this.castingSkill) {
        this.castingTimer -= dt;
        if (this.castingSkill.updateCast) {
            this.castingSkill.updateCast(this, dt);
        }
        if (this.castingTimer <= 0) {
            if (this.castingSkill.onCastEnd) {
                this.castingSkill.onCastEnd(this);
            }
            this.castingSkill = null;
        }
        return;
    }

    // 正常技能执行
    for (var i = 0; i < this.skills.length; i++) {
        var skill = this.skills[i];
        skill.timer += dt;

        if (skill.timer >= skill.cooldown && this.bossPhase >= skill.phase) {
            skill.timer = 0;
            if (skill.castDuration) {
                // 施法类技能
                this.castingSkill = skill;
                this.castingTimer = skill.castDuration;
                if (skill.onCastStart) {
                    skill.onCastStart(this);
                }
            } else {
                // 瞬发技能
                skill.execute(this, dt);
            }
        }
    }
};

// ============================================================
// takeDamage 覆写（支持护盾、反伤、岩石装甲、伤害减免被动）
// ============================================================

ArcSurvivors.BossBase.prototype.takeDamage = function(damage, attacker) {
    // 护盾：优先吸收伤害
    if (this.shieldActive && this.shieldHp > 0) {
        var shieldAbsorb = Math.min(damage, this.shieldHp);
        this.shieldHp -= shieldAbsorb;
        damage -= shieldAbsorb;

        // 护盾破裂特效
        if (this.shieldHp <= 0) {
            ArcSurvivors.spawnParticles(this.x, this.y, 15, 'rgb(100, 150, 255)', 6, 3);
        }

        if (damage <= 0) return;
    }

    // 岩石装甲：减少伤害
    if (this.rockArmored && this.rockArmorReduction > 0) {
        damage *= (1 - this.rockArmorReduction);

        // 减速攻击者
        if (attacker && SC.SLOW_ATTACKERS) {
            attacker.slowed = true;
            attacker.slowedTimer = Math.max(attacker.slowedTimer || 0, SC.SLOW_DURATION);
            attacker.speed = attacker.baseSpeed * SC.SLOW_FACTOR;
        }
    }

    // 伤害减免被动
    if (this.damageReduction) {
        var maxDamage = this.maxHp * ArcSurvivors.GAME_CONFIG.BOSS_SKILLS.PASSIVE.DAMAGE_REDUCTION.MAX_HP_PERCENT;
        damage = Math.min(damage, maxDamage);
    }

    // 反伤：反弹伤害给攻击者
    if (this.reflecting && attacker && this.reflectPercent > 0) {
        var reflectDamage = Math.min(damage * this.reflectPercent, this.reflectDamageCap);
        if (attacker.takeDamage) {
            attacker.takeDamage(reflectDamage);
        }
    }

    this.hp -= damage;
    ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.ENEMY_HURT, this, damage);
    if (this.hp <= 0) this.die();
};

// ============================================================
// update 覆写
// ============================================================

ArcSurvivors.BossBase.prototype.update = function(dt) {
    var CFG = ArcSurvivors.GAME_CONFIG;

    if (this.frozen) {
        this.frozenTimer -= dt;
        if (this.frozenTimer <= 0) this.frozen = false;
        return;
    }

    if (this.slowed) {
        this.slowedTimer -= dt;
        if (this.slowedTimer <= 0) {
            this.slowed = false;
            this.speed = this.baseSpeed;
        }
    }

    // 冲刺中
    if (this.chargeState === 'charging') {
        this.updateCharge(dt);
        this.updateChargeTrail(dt);
        return;
    }

    // 眩晕中不动，但轨迹仍需更新
    if (this.chargeState === 'stunned') {
        this.chargeTimer -= dt;
        if (this.chargeTimer <= 0) {
            this.chargeState = 'idle';
        }
        this.updateChargeTrail(dt);
        return;
    }

    var player = ArcSurvivors.player;
    var dx = player.x - this.x;
    var dy = player.y - this.y;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
        this.x += (dx / dist) * this.speed * dt * 60;
        this.y += (dy / dist) * this.speed * dt * 60;
    }

    this._updatePhase();
    this.updateSkills(dt);
    this.updateChargeTrail(dt);
    
    // 更新毒雾
    if (ArcSurvivors.updatePoisonFog) {
        ArcSurvivors.updatePoisonFog(this, dt);
    }
};

// ============================================================
// 冲刺更新（由 charge 技能使用）
// ============================================================

ArcSurvivors.BossBase.prototype.updateCharge = function(dt) {
    this.chargeTimer -= dt;

    // 移动
    var CFG = ArcSurvivors.GAME_CONFIG;
    var CH = CFG.BOSS_SKILLS.ACTIVE.CHARGE;
    this.x += Math.cos(this.chargeAngle) * CH.CHARGE_SPEED * dt * 60;
    this.y += Math.sin(this.chargeAngle) * CH.CHARGE_SPEED * dt * 60;

    // 记录轨迹点
    this.chargeTrail.push({ x: this.x, y: this.y, timer: CH.TRAIL_DURATION });

    // 碰撞伤害
    var player = ArcSurvivors.player;
    if (ArcSurvivors.Utils.distance(this.x, this.y, player.x, player.y) < this.radius + player.radius) {
        var damage = this.damage * 1.5;
        player.takeDamage(damage);
        
        // 处理吸血攻击
        if (this.lifeStealActive && ArcSurvivors.processLifeSteal) {
            ArcSurvivors.processLifeSteal(this, damage);
        }
    }

    // 冲刺结束
    if (this.chargeTimer <= 0) {
        this.chargeState = 'stunned';
        this.chargeTimer = CH.STUN_DURATION;
    }

    // 阶段和技能仍然更新
    this._updatePhase();
    this.updateSkills(dt);
};

// ============================================================
// die 覆写
// ============================================================

ArcSurvivors.BossBase.prototype.die = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var BC = CFG.ENEMY_TYPES.boss;

    this.active = false;
    ArcSurvivors.gameState.kills++;
    var player = ArcSurvivors.player;
    ArcSurvivors.Audio.enemyDeath();

    ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.ENEMY_DIE, this);

    // 掉落宝石
    for (var i = 0; i < BC.GEM_COUNT; i++) {
        var angle = Math.random() * Math.PI * 2;
        var dist = Math.random() * (BC.GEM_DIST_MAX - BC.GEM_DIST_MIN) + BC.GEM_DIST_MIN;
        ArcSurvivors.gems.push(new ArcSurvivors.Gem(
            this.x + Math.cos(angle) * dist,
            this.y + Math.sin(angle) * dist,
            'large',
            this.level
        ));
    }

    var expReward = Math.floor(BC.EXP_REWARD * (1 + (this.level - 1) * 0.2));
    player.gainExp(expReward);

    var item = ArcSurvivors.trySpawnItem();
    if (item) {
        ArcSurvivors.itemPickups.push(new ArcSurvivors.ItemPickup(this.x, this.y, item));
    }

    ArcSurvivors.spawnParticles(this.x, this.y, BC.DEATH_PARTICLES, 'rgb(255,0,255)', BC.DEATH_PARTICLE_SIZE, BC.DEATH_PARTICLE_SPEED);
    ArcSurvivors.screenShake.intensity = BC.SHAKE_INTENSITY;
    ArcSurvivors.screenShake.duration = BC.SHAKE_DURATION;
    ArcSurvivors.hitStop.active = true;
    ArcSurvivors.hitStop.frames = BC.HITSTOP_FRAMES;
    ArcSurvivors.Audio.bossDeath();

    ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.BOSS_DIE, this);

    if (player.hasKillExplosion) {
        var KE = CFG.KILL_EXPLOSION;
        var enemies = ArcSurvivors.enemies;
        for (var j = 0; j < enemies.length; j++) {
            var e = enemies[j];
            if (e !== this && e.active) {
                if (ArcSurvivors.Utils.distance(e.x, e.y, this.x, this.y) < KE.RADIUS) {
                    e.takeDamage(player.attackPower * KE.DAMAGE_SCALE);
                }
            }
        }
        ArcSurvivors.spawnParticles(this.x, this.y, KE.PARTICLE_COUNT, 'rgb(255,136,68)', 8, 5);
    }

    ArcSurvivors.spawnParticles(this.x, this.y, 8, 'rgb(' + this.hexToRgb(this.color) + ')', 5, 3);
};

// ============================================================
// draw 覆写（包含激光和冲刺轨迹绘制）
// ============================================================

ArcSurvivors.BossBase.prototype.draw = function(ctx) {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var FR = CFG.FROST;
    var RC = CFG.RENDERER;
    var BC = RC.BOSS;
    var RL = ArcSurvivors.ResourceLoader;

    ctx.save();

    // 冰冻/减速效果
    if (this.frozen) {
        ctx.fillStyle = FR.FROST_COLOR;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + FR.FROST_RADIUS_EXTRA, 0, Math.PI * 2);
        ctx.fill();
    }
    if (this.slowed) {
        ctx.fillStyle = FR.SLOW_COLOR;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + FR.SLOW_RADIUS_EXTRA, 0, Math.PI * 2);
        ctx.fill();
        if (Math.random() < FR.PARTICLE_CHANCE) {
            ArcSurvivors.spawnParticles(this.x, this.y, 1, 'rgb(136,255,255)', 1, 1);
        }
    }

    // 冲刺轨迹绘制
    this.drawChargeTrail(ctx);

    // 激光绘制
    this.drawLaser(ctx);

    // Boss本体绘制 - 支持16种Boss外观
    var bossType = this.bossType || 'goat';
    var spriteInfo = null;
    
    // Boss精灵图映射 (16种)
    var BOSS_SPRITE_MAP = {
        'goat':    { sheet: 'bosses', row: 0, col: 0 },
        'fox':     { sheet: 'bosses', row: 0, col: 1 },
        'deer':    { sheet: 'bosses', row: 0, col: 2 },
        'eagle':   { sheet: 'bosses', row: 0, col: 3 },
        'snake':   { sheet: 'bosses', row: 1, col: 0 },
        'boar':    { sheet: 'bosses', row: 1, col: 1 },
        'wolf':    { sheet: 'bosses', row: 1, col: 2 },
        'horse':   { sheet: 'bosses', row: 1, col: 3 },
        'cow':     { sheet: 'bosses', row: 2, col: 0 },
        'leopard': { sheet: 'bosses', row: 2, col: 1 },
        'croc':    { sheet: 'bosses', row: 2, col: 2 },
        'bear':    { sheet: 'bosses', row: 2, col: 3 },
        'lion':    { sheet: 'bosses', row: 3, col: 0 },
        'tiger':   { sheet: 'bosses', row: 3, col: 1 },
        'rhino':   { sheet: 'bosses', row: 3, col: 2 },
        'elephant':{ sheet: 'bosses', row: 3, col: 3 }
    };
    
    // 使用合图精灵
    if (RL && RL.hasSpriteSheet('bosses')) {
        var map = BOSS_SPRITE_MAP[bossType];
        if (map) {
            var sheet = RL.getSpriteSheets ? RL.getSpriteSheets().bosses : null;
            if (sheet) {
                var cfg = sheet.config || { cellWidth: 256, cellHeight: 256 };
                spriteInfo = {
                    image: sheet.image,
                    sx: map.col * cfg.cellWidth,
                    sy: map.row * cfg.cellHeight,
                    sw: cfg.cellWidth,
                    sh: cfg.cellHeight
                };
            }
        }
    }
    
    if (spriteInfo) {
        // Boss比小怪大50%
        var drawRadius = this.radius * 1.5;
        ctx.drawImage(
            spriteInfo.image,
            spriteInfo.sx, spriteInfo.sy,
            spriteInfo.sw, spriteInfo.sh,
            this.x - drawRadius,
            this.y - drawRadius,
            drawRadius * 2,
            drawRadius * 2);
        // Boss总是显示血条
        this._drawHpBar(ctx, BC);
    } else {
        ctx.shadowColor = this.color;
        ctx.shadowBlur = RC.SHADOW_BLUR;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = RC.LINE_WIDTH;

        ctx.beginPath();
        for (var k = 0; k < 6; k++) {
            var a = (k / 6) * Math.PI * 2 - Math.PI / 2;
            var bx = this.x + Math.cos(a) * this.radius;
            var by = this.y + Math.sin(a) * this.radius;
            if (k === 0) ctx.moveTo(bx, by);
            else ctx.lineTo(bx, by);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * BC.INNER_RADIUS_SCALE, 0, Math.PI * 2);
        ctx.fillStyle = BC.INNER_COLOR;
        ctx.fill();
        ctx.strokeStyle = BC.INNER_BORDER;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x - BC.EYE_OFFSET_X, this.y - BC.EYE_OFFSET_Y, BC.EYE_RADIUS, 0, Math.PI * 2);
        ctx.arc(this.x + BC.EYE_OFFSET_X, this.y - BC.EYE_OFFSET_Y, BC.EYE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = BC.EYE_COLOR;
        ctx.fill();

        // Boss总是显示血条
        this._drawHpBar(ctx, BC);
    }

    // 护盾：绘制蓝色护盾
    if (this.shieldActive && this.shieldHp > 0) {
        var shieldAlpha = 0.3 + (this.shieldHp / (this.maxHp * 0.3)) * 0.3;
        ctx.fillStyle = 'rgba(100, 150, 255, ' + shieldAlpha + ')';
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    // 反伤：绘制红色尖刺
    if (this.reflecting) {
        ctx.strokeStyle = 'rgba(255, 50, 50, 0.8)';
        ctx.lineWidth = 2;
        for (var i = 0; i < 8; i++) {
            var angle = (i / 8) * Math.PI * 2 + Date.now() / 500;
            var innerR = this.radius + 5;
            var outerR = this.radius + 15;
            ctx.beginPath();
            ctx.moveTo(this.x + Math.cos(angle) * innerR, this.y + Math.sin(angle) * innerR);
            ctx.lineTo(this.x + Math.cos(angle) * outerR, this.y + Math.sin(angle) * outerR);
            ctx.stroke();
        }
    }

    // 岩石装甲：绘制棕色碎片
    if (this.rockArmored) {
        ctx.fillStyle = 'rgba(139, 90, 43, 0.6)';
        for (var j = 0; j < 6; j++) {
            var rAngle = (j / 6) * Math.PI * 2;
            var rx = this.x + Math.cos(rAngle) * (this.radius + 8);
            var ry = this.y + Math.sin(rAngle) * (this.radius + 8);
            ctx.beginPath();
            ctx.arc(rx, ry, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 狂暴：绘制红色光晕
    if (this.berserked) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // 鼓舞领域：绘制金色光环
    if (this.auraActive) {
        var SC = ArcSurvivors.GAME_CONFIG.BOSS_SKILLS.ACTIVE.AURA_BUFF;
        var radius = this.bossPhase >= 2 ? SC.RADIUS_PHASE2 : SC.RADIUS;
        ctx.fillStyle = SC.EFFECT_COLOR;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 200, 0, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // 激光矩阵：绘制激光
    if (this.laserMatrixActive && this.laserMatrixAngles) {
        this._drawLaserMatrix(ctx);
    }

    // 伤害减免被动：绘制护盾标记
    if (this.damageReduction) {
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
    }

    // 绘制毒雾
    if (ArcSurvivors.drawPoisonFog) {
        ArcSurvivors.drawPoisonFog(ctx, this);
    }

    // 绘制黑暗领域
    if (ArcSurvivors.drawDarknessField) {
        ArcSurvivors.drawDarknessField(ctx, this);
    }

    // 绘制时间缓速领域
    if (ArcSurvivors.drawTimeSlowField) {
        ArcSurvivors.drawTimeSlowField(ctx, this);
    }

    ctx.restore();
};

// ============================================================
// 激光绘制
// ============================================================

ArcSurvivors.BossBase.prototype.drawLaser = function(ctx) {
    if (this.laserState === 'idle') return;

    var CFG = ArcSurvivors.GAME_CONFIG;
    var LS = CFG.BOSS_SKILLS.ACTIVE.LASER_SWEEP;

    if (this.laserState === 'warning') {
        // 预警线：虚线
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
            this.x + Math.cos(this.laserAngle) * LS.BEAM_LENGTH,
            this.y + Math.sin(this.laserAngle) * LS.BEAM_LENGTH
        );
        ctx.stroke();
        ctx.setLineDash([]);
    } else if (this.laserState === 'sweeping') {
        // 激光束
        var outerWidth = LS.BEAM_WIDTH;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.laserAngle);

        // 外层光晕
        var grad = ctx.createLinearGradient(0, 0, LS.BEAM_LENGTH, 0);
        grad.addColorStop(0, 'rgba(255, 50, 50, 0.9)');
        grad.addColorStop(0.5, 'rgba(255, 100, 50, 0.6)');
        grad.addColorStop(1, 'rgba(255, 50, 50, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, -outerWidth / 2, LS.BEAM_LENGTH, outerWidth);

        // 内层亮芯
        var innerGrad = ctx.createLinearGradient(0, 0, LS.BEAM_LENGTH, 0);
        innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        innerGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = innerGrad;
        ctx.fillRect(0, -3, LS.BEAM_LENGTH, 6);

        ctx.restore();
    }
};

// ============================================================
// 冲刺轨迹更新（timer递减 + 玩家碰撞检测）
// ============================================================

ArcSurvivors.BossBase.prototype.updateChargeTrail = function(dt) {
    if (this.chargeTrail.length === 0) return;

    var CH = ArcSurvivors.GAME_CONFIG.BOSS_SKILLS.ACTIVE.CHARGE;
    var player = ArcSurvivors.player;
    var trailRadius = CH.TRAIL_WIDTH / 2;

    for (var i = this.chargeTrail.length - 1; i >= 0; i--) {
        var point = this.chargeTrail[i];
        point.timer -= dt;

        // 过期移除
        if (point.timer <= 0) {
            this.chargeTrail.splice(i, 1);
            continue;
        }

        // 玩家碰撞检测
        if (player && player.invulnerableTimer <= 0) {
            var dist = ArcSurvivors.Utils.distance(point.x, point.y, player.x, player.y);
            if (dist < trailRadius + player.radius) {
                player.takeDamage(this.damage * CH.TRAIL_DAMAGE_SCALE);
            }
        }
    }
};

// ============================================================
// 冲刺轨迹绘制
// ============================================================

ArcSurvivors.BossBase.prototype.drawChargeTrail = function(ctx) {
    if (this.chargeTrail.length === 0) return;

    var CH = ArcSurvivors.GAME_CONFIG.BOSS_SKILLS.ACTIVE.CHARGE;

    for (var i = 0; i < this.chargeTrail.length; i++) {
        var point = this.chargeTrail[i];
        var alpha = point.timer / CH.TRAIL_DURATION;
        ctx.fillStyle = 'rgba(255, 50, 50, ' + (alpha * 0.5) + ')';
        ctx.beginPath();
        ctx.arc(point.x, point.y, CH.TRAIL_WIDTH / 2 * alpha, 0, Math.PI * 2);
        ctx.fill();
    }
};

// ============================================================
// HP条绘制
// ============================================================

ArcSurvivors.BossBase.prototype._drawHpBar = function(ctx, BC) {
    ctx.shadowBlur = 0;
    var barW = this.radius * BC.HP_BAR_SCALE;
    var barH = BC.HP_BAR_HEIGHT;
    var barX = this.x - barW / 2;
    var barY = this.y - this.radius - BC.HP_BAR_OFFSET_Y;
    ctx.fillStyle = BC.HP_BG_COLOR;
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = BC.HP_FILL_COLOR;
    ctx.fillRect(barX, barY, (this.hp / this.maxHp) * barW, barH);
    ctx.strokeStyle = BC.HP_BORDER_COLOR;
    ctx.strokeRect(barX, barY, barW, barH);

    ctx.fillStyle = BC.NAME_COLOR;
    ctx.font = BC.NAME_FONT;
    ctx.textAlign = 'center';
    var bossIndex = ArcSurvivors.BossRegistry ? ArcSurvivors.BossRegistry.spawnCount - 1 : 0;
    var bossName = BC.getName ? BC.getName(bossIndex) : '兽王';
    ctx.fillText(bossName, this.x, barY - 5);
};

// ============================================================
// 激光矩阵绘制
// ============================================================

ArcSurvivors.BossBase.prototype._drawLaserMatrix = function(ctx) {
    var SC = ArcSurvivors.GAME_CONFIG.BOSS_SKILLS.ACTIVE.LASER_MATRIX;
    var angles = this.laserMatrixAngles;
    var phase = this.laserMatrixPhase;

    if (!angles || angles.length === 0) return;

    ctx.save();

    for (var i = 0; i < angles.length; i++) {
        var angle = angles[i];

        if (phase === 'warning') {
            // 预警阶段：虚线
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(
                this.x + Math.cos(angle) * SC.BEAM_LENGTH,
                this.y + Math.sin(angle) * SC.BEAM_LENGTH
            );
            ctx.stroke();
            ctx.setLineDash([]);
        } else if (phase === 'sweeping') {
            // 扫射阶段：实体激光
            ctx.translate(this.x, this.y);
            ctx.rotate(angle);

            // 外层光晕
            var grad = ctx.createLinearGradient(0, 0, SC.BEAM_LENGTH, 0);
            grad.addColorStop(0, 'rgba(255, 50, 50, 0.9)');
            grad.addColorStop(0.3, 'rgba(255, 100, 50, 0.6)');
            grad.addColorStop(1, 'rgba(255, 50, 50, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, -SC.BEAM_WIDTH / 2, SC.BEAM_LENGTH, SC.BEAM_WIDTH);

            // 内层亮芯
            var innerGrad = ctx.createLinearGradient(0, 0, SC.BEAM_LENGTH, 0);
            innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            innerGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = innerGrad;
            ctx.fillRect(0, -2, SC.BEAM_LENGTH, 4);

            ctx.rotate(-angle);
            ctx.translate(-this.x, -this.y);
        }
    }

    ctx.restore();
};
