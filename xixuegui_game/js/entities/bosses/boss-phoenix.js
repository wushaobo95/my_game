/**
 * entities/bosses/boss-phoenix.js - 凤凰Boss
 * 终极Boss：超高血量、所有技能随机使用、用于终结游戏
 */
var ArcSurvivors = ArcSurvivors || {};

// ============================================================
// 凤凰Boss构造函数
// ============================================================
ArcSurvivors.BossPhoenix = function(x, y) {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var BC = CFG.ENEMY_TYPES.boss;

    // 调用基类构造函数
    ArcSurvivors.BossBase.call(this, x, y, BC);

    // 设置凤凰特性
    this.radius = BC.RADIUS * 1.5; // 更大的体型
    this.color = '#FF4500'; // 凤凰红橙色
    this.bossType = 'phoenix';
    
    // 超高血量：几乎杀不死
    var playerLevel = ArcSurvivors.player ? ArcSurvivors.player.level : 1;
    var df = ArcSurvivors.gameState.difficultyFactor;
    var bossLevelScale = 1 + (playerLevel - 1) * 0.2;
    
    // 基础血量是正常Boss的100倍
    this.maxHp = (BC.HP_BASE * bossLevelScale + df * BC.HP_SCALE) * 100;
    this.hp = this.maxHp;
    
    // 高伤害
    this.damage = 40;
    
    // 较快的移速
    this.speed = BC.SPEED * 1.2;
    
    // 标记为凤凰
    this.isPhoenix = true;
    
    // 施加凤凰诅咒：无限持续掉血，屏蔽回血
    this._applyPhoenixCurse(); // 暂时屏蔽
    
    // 装配所有技能
    this._equipAllSkills();
};

ArcSurvivors.BossPhoenix.prototype = Object.create(ArcSurvivors.BossBase.prototype);
ArcSurvivors.BossPhoenix.prototype.constructor = ArcSurvivors.BossPhoenix;

// ============================================================
// 施加凤凰诅咒
// ============================================================
ArcSurvivors.BossPhoenix.prototype._applyPhoenixCurse = function() {
    var player = ArcSurvivors.player;
    if (!player) return;
    
    // 凤凰诅咒：每秒掉血，屏蔽回血
    player.phoenixCursed = true;
    player.phoenixCurseDamage = 2; // 每秒掉2血
    player.phoenixCurseTimer = 0;
    
    // 屏蔽回血效果
    player.hasVampireHeal = false;
    player.hasLifeSteal = false;
    player.hasHealingCircle = false;
    player.hasHolyWater = false;
    
    // 显示诅咒特效
    ArcSurvivors.spawnParticles(player.x, player.y, 20, 'rgb(255, 69, 0)', 8, 5);
    
    // 在UI上显示警告
    var warningEl = document.getElementById('boss-warning');
    if (warningEl) {
        warningEl.textContent = '⚠ 凤凰诅咒：持续掉血且无法回血！ ⚠';
        warningEl.style.display = 'block';
        warningEl.style.color = '#FF4500';
        warningEl.style.fontSize = '24px';
        setTimeout(function() {
            if (warningEl) warningEl.style.display = 'none';
        }, 5000);
    }
};

// ============================================================
// 更新凤凰诅咒（每帧调用）
// ============================================================
ArcSurvivors.BossPhoenix.prototype._updatePhoenixCurse = function(dt) {
    var player = ArcSurvivors.player;
    if (!player || !player.phoenixCursed) return;
    
    player.phoenixCurseTimer += dt;
    if (player.phoenixCurseTimer >= 1) {
        player.phoenixCurseTimer = 0;
        player.hp -= player.phoenixCurseDamage;
        
        // 显示掉血粒子
        ArcSurvivors.spawnParticles(player.x, player.y, 3, 'rgb(255, 0, 0)', 3, 2);
        
        // 检查死亡
        if (player.hp <= 0) {
            player.hp = 0;
            ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.PLAYER_DIE);
            ArcSurvivors.gameOver();
        }
    }
};

// ============================================================
// 装备所有技能（随机选择使用）
// ============================================================
ArcSurvivors.BossPhoenix.prototype._equipAllSkills = function() {
    var AC = ArcSurvivors.GAME_CONFIG.BOSS_SKILLS.ACTIVE;
    var Skills = ArcSurvivors.Skills;
    
    // 所有可用的主动技能列表
    var allSkillNames = [
        'bulletStorm', 'homingMissiles', 'laserSweep', 'charge', 'poisonFog',
        'summonMinions', 'teleport', 'spiralBarrage', 'focusFire', 'scatterShot',
        'concentricRings', 'homingScatter', 'summonElites', 'berserk', 'auraBuff',
        'shield', 'reflect', 'rockArmor', 'knockback', 'iceBreath', 'stunRoar',
        'laserMatrix', 'splitShot', 'darknessField', 'lifeSteal', 'timeSlow',
        'chainLightning'
    ];
    
    // 为凤凰添加所有技能（但每个技能有独立的冷却）
    this.allSkills = [];
    
    for (var i = 0; i < allSkillNames.length; i++) {
        var skillName = allSkillNames[i];
        if (Skills.Active[skillName]) {
            var skill = Skills.Active[skillName]();
            // 为凤凰调整技能冷却（更快）
            if (skill.cooldown) {
                skill.cooldown = skill.cooldown * 0.7; // 冷却减少30%
            }
            skill.timer = Math.random() * skill.cooldown; // 随机初始计时器
            this.allSkills.push(skill);
        }
    }
    
    // 设置主技能数组（用于updateSkills）
    this.skills = this.allSkills;
    
    // 添加伤害减免被动
    ArcSurvivors.Skills.Passive.damageReduction(this);
};

// ============================================================
// update覆写 - 增强版，可能同时使用多个技能
// ============================================================
ArcSurvivors.BossPhoenix.prototype.update = function(dt) {
    // 更新凤凰诅咒
    // this._updatePhoenixCurse(dt); // 暂时屏蔽
    
    var player = ArcSurvivors.player;
    var dx = player.x - this.x;
    var dy = player.y - this.y;
    var dist = Math.sqrt(dx * dx + dy * dy);

    // 冲刺中
    if (this.chargeState === 'charging') {
        this.updateCharge(dt);
        this.updateChargeTrail(dt);
        // 凤凰在冲刺时也能使用其他技能
        this.updateSkills(dt);
        return;
    }

    // 眩晕中
    if (this.chargeState === 'stunned') {
        this.chargeTimer -= dt;
        if (this.chargeTimer <= 0) {
            this.chargeState = 'idle';
        }
        this.updateChargeTrail(dt);
        return;
    }

    // 正常移动
    if (dist > 0) {
        this.x += (dx / dist) * this.speed * dt * 60;
        this.y += (dy / dist) * this.speed * dt * 60;
    }

    // 更新阶段和技能
    this._updatePhase();
    this.updateSkills(dt);
    this.updateChargeTrail(dt);
    
    // 更新毒雾
    if (ArcSurvivors.updatePoisonFog) {
        ArcSurvivors.updatePoisonFog(this, dt);
    }
};

// ============================================================
// updateSkills覆写 - 凤凰可以同时触发多个技能
// ============================================================
ArcSurvivors.BossPhoenix.prototype.updateSkills = function(dt) {
    // 施法中
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
        // 凤凰在施法时也能触发瞬发技能
        this._triggerInstantSkills(dt);
        return;
    }

    // 正常技能执行
    for (var i = 0; i < this.skills.length; i++) {
        var skill = this.skills[i];
        skill.timer += dt;

        // 凤凰有几率无视阶段限制使用技能
        var phaseRequirement = skill.phase || 0;
        var canUse = this.bossPhase >= phaseRequirement || Math.random() < 0.3;

        if (skill.timer >= skill.cooldown && canUse) {
            skill.timer = 0;
            if (skill.castDuration) {
                // 施法类技能
                if (!this.castingSkill) {
                    this.castingSkill = skill;
                    this.castingTimer = skill.castDuration;
                    if (skill.onCastStart) {
                        skill.onCastStart(this);
                    }
                }
            } else {
                // 瞬发技能
                skill.execute(this, dt);
            }
        }
    }
};

// ============================================================
// 触发瞬发技能（在施法时使用）
// ============================================================
ArcSurvivors.BossPhoenix.prototype._triggerInstantSkills = function(dt) {
    for (var i = 0; i < this.skills.length; i++) {
        var skill = this.skills[i];
        // 只触发瞬发技能
        if (skill.castDuration) continue;
        
        skill.timer += dt;
        if (skill.timer >= skill.cooldown) {
            skill.timer = 0;
            skill.execute(this, dt);
        }
    }
};

// ============================================================
// _updatePhase覆写 - 凤凰有5个阶段
// ============================================================
ArcSurvivors.BossPhoenix.prototype._updatePhase = function() {
    var hpPercent = this.hp / this.maxHp;
    
    if (hpPercent > 0.8) {
        this.bossPhase = 0;
    } else if (hpPercent > 0.6) {
        this.bossPhase = 1;
    } else if (hpPercent > 0.4) {
        this.bossPhase = 2;
    } else if (hpPercent > 0.2) {
        this.bossPhase = 3;
    } else {
        this.bossPhase = 4; // 凤凰独有第5阶段
        if (!this.phoenixFinalForm) {
            this.phoenixFinalForm = true;
            this._enterFinalForm();
        }
    }
};

// ============================================================
// 进入最终形态
// ============================================================
ArcSurvivors.BossPhoenix.prototype._enterFinalForm = function() {
    // 最终形态：速度和伤害大幅提升
    this.speed *= 1.5;
    this.damage *= 1.5;
    
    // 红色光晕特效
    ArcSurvivors.spawnParticles(this.x, this.y, 50, 'rgb(255, 69, 0)', 15, 8);
    
    // 播放特殊音效
    ArcSurvivors.Audio.bossWarning && ArcSurvivors.Audio.bossWarning();
};

// ============================================================
// die覆写 - 凤凰死亡时游戏结束（胜利）
// ============================================================
ArcSurvivors.BossPhoenix.prototype.die = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var BC = CFG.ENEMY_TYPES.boss;

    this.active = false;
    ArcSurvivors.gameState.kills++;
    ArcSurvivors.Audio.bossDeath && ArcSurvivors.Audio.bossDeath();

    ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.ENEMY_DIE, this);
    ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.BOSS_DIE, this);
    ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.PHOENIX_DEFEATED, this);

    // 大量宝石
    for (var i = 0; i < BC.GEM_COUNT * 3; i++) {
        var angle = Math.random() * Math.PI * 2;
        var dist = Math.random() * (BC.GEM_DIST_MAX - BC.GEM_DIST_MIN) + BC.GEM_DIST_MIN;
        ArcSurvivors.gems.push(new ArcSurvivors.Gem(
            this.x + Math.cos(angle) * dist,
            this.y + Math.sin(angle) * dist,
            'large',
            this.level
        ));
    }

    // 掉落多个法宝
    for (var j = 0; j < 5; j++) {
        var item = ArcSurvivors.trySpawnItem();
        if (item) {
            var angle = Math.random() * Math.PI * 2;
            var dist = Math.random() * 100 + 50;
            ArcSurvivors.itemPickups.push(new ArcSurvivors.ItemPickup(
                this.x + Math.cos(angle) * dist,
                this.y + Math.sin(angle) * dist,
                item
            ));
        }
    }

    // 巨大的粒子效果
    ArcSurvivors.spawnParticles(this.x, this.y, BC.DEATH_PARTICLES * 3, 'rgb(255,69,0)', BC.DEATH_PARTICLE_SIZE * 2, BC.DEATH_PARTICLE_SPEED * 1.5);
    ArcSurvivors.spawnParticles(this.x, this.y, 100, 'rgb(255,215,0)', 15, 10);
    
    // 强烈屏幕震动
    ArcSurvivors.screenShake.intensity = BC.SHAKE_INTENSITY * 2;
    ArcSurvivors.screenShake.duration = BC.SHAKE_DURATION * 2;
    ArcSurvivors.hitStop.active = true;
    ArcSurvivors.hitStop.frames = BC.HITSTOP_FRAMES * 2;
    
    // 触发游戏胜利
    if (ArcSurvivors.triggerVictory) {
        setTimeout(function() {
            ArcSurvivors.triggerVictory();
        }, 1000);
    }
};

// ============================================================
// draw覆写 - 凤凰的特殊外观
// ============================================================
ArcSurvivors.BossPhoenix.prototype.draw = function(ctx) {
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

    // 冲刺轨迹
    this.drawChargeTrail(ctx);

    // 激光
    this.drawLaser(ctx);

    // 尝试使用凤凰图片
    if (RL && RL.hasSprite('boss_phoenix')) {
        var sprite = RL.getSprite('boss_phoenix');
        var drawRadius = this.radius * 1.8;
        
        // 添加发光效果
        ctx.shadowColor = '#FF4500';
        ctx.shadowBlur = 30;
        
        ctx.drawImage(
            sprite,
            this.x - drawRadius,
            this.y - drawRadius,
            drawRadius * 2,
            drawRadius * 2
        );
        
        // 重置阴影状态
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    } else {
        // 默认绘制 - 凤凰形状
        var t = Date.now() / 200;
        var wingFlap = Math.sin(t) * 0.2;
        
        // 外层光晕
        var glowRadius = this.radius * 1.5 + Math.sin(t * 2) * 5;
        var glowGrad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowRadius);
        glowGrad.addColorStop(0, 'rgba(255, 69, 0, 0.4)');
        glowGrad.addColorStop(0.5, 'rgba(255, 140, 0, 0.2)');
        glowGrad.addColorStop(1, 'rgba(255, 69, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // 左翼
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-0.3 + wingFlap);
        ctx.fillStyle = '#FF4500';
        ctx.shadowColor = '#FF6347';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-this.radius * 2, -this.radius * 1.5, -this.radius * 2.5, 0);
        ctx.quadraticCurveTo(-this.radius * 2, this.radius * 0.5, 0, 0);
        ctx.fill();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        
        // 右翼
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(0.3 - wingFlap);
        ctx.fillStyle = '#FF4500';
        ctx.shadowColor = '#FF6347';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(this.radius * 2, -this.radius * 1.5, this.radius * 2.5, 0);
        ctx.quadraticCurveTo(this.radius * 2, this.radius * 0.5, 0, 0);
        ctx.fill();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        
        // 身体
        ctx.fillStyle = '#FF6347';
        ctx.shadowColor = '#FF4500';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.radius * 0.8, this.radius * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 头部
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.radius * 0.8, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 眼睛
        ctx.fillStyle = '#FFD700';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.2, this.y - this.radius * 0.9, 5, 0, Math.PI * 2);
        ctx.arc(this.x + this.radius * 0.2, this.y - this.radius * 0.9, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // 尾羽
        for (var i = 0; i < 5; i++) {
            var angle = (i - 2) * 0.3;
            ctx.save();
            ctx.translate(this.x, this.y + this.radius * 0.8);
            ctx.rotate(angle);
            ctx.fillStyle = i % 2 === 0 ? '#FF4500' : '#FFD700';
            ctx.beginPath();
            ctx.ellipse(0, this.radius * 0.8, this.radius * 0.2, this.radius * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // 绘制血条
    this._drawPhoenixHpBar(ctx, BC);

    // 护盾
    if (this.shieldActive && this.shieldHp > 0) {
        var shieldAlpha = 0.3 + (this.shieldHp / (this.maxHp * 0.3)) * 0.3;
        ctx.fillStyle = 'rgba(100, 150, 255, ' + shieldAlpha + ')';
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    // 狂暴状态
    if (this.berserked || this.phoenixFinalForm) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // 激光矩阵
    if (this.laserMatrixActive && this.laserMatrixAngles) {
        this._drawLaserMatrix(ctx);
    }

    // 绘制毒雾
    if (ArcSurvivors.drawPoisonFog) {
        ArcSurvivors.drawPoisonFog(ctx, this);
    }

    // 绘制黑暗领域
    if (ArcSurvivors.drawDarknessField) {
        ArcSurvivors.drawDarknessField(ctx, this);
    }

    ctx.restore();
};

// ============================================================
// 凤凰专用血条绘制
// ============================================================
ArcSurvivors.BossPhoenix.prototype._drawPhoenixHpBar = function(ctx, BC) {
    ctx.shadowBlur = 0;
    var barW = this.radius * 3;
    var barH = 10;
    var barX = this.x - barW / 2;
    var barY = this.y - this.radius * 2 - 20;
    
    // 背景
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);
    
    // 血量渐变
    var hpPercent = this.hp / this.maxHp;
    var grad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
    grad.addColorStop(0, '#FF4500');
    grad.addColorStop(0.5, '#FFD700');
    grad.addColorStop(1, '#FF4500');
    ctx.fillStyle = grad;
    ctx.fillRect(barX, barY, hpPercent * barW, barH);
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barW, barH);

    // 名称
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#FF4500';
    ctx.shadowBlur = 5;
    ctx.fillText('★ 烈焰凤凰 ★', this.x, barY - 8);
    
    // 显示血量百分比
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText((hpPercent * 100).toFixed(1) + '%', this.x, barY + barH + 15);
};

// ============================================================
// 注册到BossRegistry
// ============================================================
if (ArcSurvivors.BossRegistry) {
    ArcSurvivors.BossRegistry.register('phoenix', ArcSurvivors.BossPhoenix);
}