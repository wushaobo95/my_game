/**
 * systems/buff.js - Buff道具系统（临时效果）
 */
var ArcSurvivors = ArcSurvivors || {};

// Buff道具拾取物
ArcSurvivors.BuffPickup = function(x, y, type) {
    var BC = ArcSurvivors.GAME_CONFIG.BUFF_ITEMS;
    this.x = x;
    this.y = y;
    this.type = type;
    this.radius = BC.PICKUP_RADIUS;
    this.active = true;
    this.bobTimer = 0;
    this.lifetime = 10;
};

ArcSurvivors.BuffPickup.prototype.update = function(dt) {
    this.bobTimer += dt * 3;
    this.lifetime -= dt;
    if (this.lifetime <= 0) {
        this.active = false;
        return;
    }

    var player = ArcSurvivors.player;
    var dist = ArcSurvivors.Utils.distance(this.x, this.y, player.x, player.y);

    if (dist < player.radius + this.radius) {
        this.activate();
        this.active = false;
    }
};

ArcSurvivors.BuffPickup.prototype.activate = function() {
    var BC = ArcSurvivors.GAME_CONFIG.BUFF_ITEMS;
    var STR = ArcSurvivors.STRINGS.BUFF_ITEMS[this.type];
    var player = ArcSurvivors.player;

    ArcSurvivors.spawnParticles(this.x, this.y, BC.PARTICLE_COUNT, BC.TYPES[this.type].COLOR, BC.PARTICLE_SIZE, BC.PARTICLE_SPEED);
    ArcSurvivors.Audio.pickup();

    switch (this.type) {
        case 'bomb':
            var damage = BC.TYPES.bomb.DAMAGE;
            var enemies = ArcSurvivors.enemies;
            for (var i = 0; i < enemies.length; i++) {
                if (enemies[i].active && enemies[i].type !== 'boss') {
                    enemies[i].takeDamage(damage);
                }
            }
            ArcSurvivors.screenShake.intensity = 5;
            ArcSurvivors.screenShake.duration = 0.3;
            break;

        case 'ice':
            var duration = BC.TYPES.ice.DURATION;
            var enemies = ArcSurvivors.enemies;
            for (var i = 0; i < enemies.length; i++) {
                // 霸体敌人免疫冰冻
                if (enemies[i].active && !enemies[i].superArmor) {
                    enemies[i].frozen = true;
                    enemies[i].frozenTimer = duration;
                }
            }
            break;

        case 'shield':
            var duration = BC.TYPES.shield.DURATION;
            if (player.hasShieldBuff) {
                player.shieldBuffTimer += duration;
                player.invulnerableTimer += duration;
            } else {
                player.invulnerable = true;
                player.invulnerableTimer = duration;
                player.hasShieldBuff = true;
                player.shieldBuffTimer = duration;
            }
            break;

        case 'rage':
            var duration = BC.TYPES.rage.DURATION;
            var config = BC.TYPES.rage;
            if (player.hasRageBuff) {
                player.rageBuffTimer += duration;
            } else {
                player.attackPower *= config.ATTACK_MULT;
                player.attackCooldown /= config.SPEED_MULT;
                player.hasRageBuff = true;
                player.rageBuffTimer = duration;
                player.rageAttackMult = config.ATTACK_MULT;
                player.rageSpeedMult = config.SPEED_MULT;
            }
            break;

        case 'vortex':
            var duration = BC.TYPES.vortex.DURATION;
            var config = BC.TYPES.vortex;
            if (player.hasVortexBuff) {
                player.vortexBuffTimer += duration;
            } else {
                player.hasVortexBuff = true;
                player.vortexBuffTimer = duration;
                player.vortexAttractSpeed = config.ATTRACT_SPEED;
            }
            break;

        case 'chicken':
            var config = BC.TYPES.chicken;
            var healAmount = player.maxHp * config.HEAL_PERCENT;
            player.hp = Math.min(player.maxHp, player.hp + healAmount);
            ArcSurvivors.spawnParticles(player.x, player.y, 8, 'rgb(255, 170, 0)', 4, 3);
            break;
    }
};

ArcSurvivors.BuffPickup.prototype.draw = function(ctx) {
    var BC = ArcSurvivors.GAME_CONFIG.BUFF_ITEMS;
    var STR = ArcSurvivors.STRINGS.BUFF_ITEMS[this.type];
    var typeConfig = BC.TYPES[this.type];

    var bobOffset = Math.sin(this.bobTimer) * 5;
    var drawY = this.y + bobOffset;

    ctx.save();

    ctx.shadowColor = typeConfig.COLOR;
    ctx.shadowBlur = BC.GLOW_BLUR;

    ctx.font = BC.ICON_SIZE + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(STR.icon, this.x, drawY);

    ctx.beginPath();
    ctx.arc(this.x, drawY, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = typeConfig.COLOR;
    ctx.lineWidth = 2;
    ctx.stroke();

    if (this.lifetime < 3) {
        ctx.globalAlpha = 0.3 + Math.sin(this.bobTimer * 10) * 0.3;
    }

    ctx.restore();
};

// 随机掉落Buff道具
ArcSurvivors.trySpawnBuffItem = function(enemyX, enemyY) {
    var BC = ArcSurvivors.GAME_CONFIG.BUFF_ITEMS;
    if (Math.random() < BC.DROP_CHANCE) {
        var types = Object.keys(BC.TYPES);
        var type = types[Math.floor(Math.random() * types.length)];
        this.buffPickups.push(new this.BuffPickup(enemyX, enemyY, type));
    }
};

// 更新玩家buff计时器
ArcSurvivors.updatePlayerBuffs = function(dt) {
    var player = this.player;
    if (!player) return;

    if (player.hasShieldBuff) {
        player.shieldBuffTimer -= dt;
        if (player.shieldBuffTimer <= 0) {
            player.hasShieldBuff = false;
            player.invulnerable = false;
            player.invulnerableTimer = 0;
        }
    }

    if (player.hasRageBuff) {
        player.rageBuffTimer -= dt;
        if (player.rageBuffTimer <= 0) {
            player.hasRageBuff = false;
            player.attackPower /= player.rageAttackMult;
            player.attackCooldown *= player.rageSpeedMult;
        }
    }

    if (player.hasVortexBuff) {
        player.vortexBuffTimer -= dt;
        if (player.vortexBuffTimer <= 0) {
            player.hasVortexBuff = false;
        }
    }
};

// 绘制buff状态指示器
ArcSurvivors.drawBuffIndicators = function(ctx) {
    var player = this.player;
    if (!player) return;

    var x = 20;
    var y = 700;
    var size = 30;
    var spacing = 40;

    if (player.hasShieldBuff) {
        var STR = this.STRINGS.BUFF_ITEMS.shield;
        ctx.save();
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 10;
        ctx.font = size + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(STR.icon, x, y);
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(Math.ceil(player.shieldBuffTimer) + 's', x, y + 20);
        ctx.restore();
        x += spacing;
    }

    if (player.hasRageBuff) {
        var STR = this.STRINGS.BUFF_ITEMS.rage;
        ctx.save();
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 10;
        ctx.font = size + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(STR.icon, x, y);
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(Math.ceil(player.rageBuffTimer) + 's', x, y + 20);
        ctx.restore();
        x += spacing;
    }

    if (player.hasVortexBuff) {
        var STR = this.STRINGS.BUFF_ITEMS.vortex;
        ctx.save();
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
        ctx.font = size + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(STR.icon, x, y);
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(Math.ceil(player.vortexBuffTimer) + 's', x, y + 20);
        ctx.restore();
    }
};