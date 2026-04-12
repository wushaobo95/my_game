/**
 * entities/player.js - 玩家角色
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Player = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var PC = CFG.PLAYER;

    this.x = CFG.CANVAS_WIDTH / 2;
    this.y = CFG.CANVAS_HEIGHT / 2;
    this.radius = PC.RADIUS;
    this.hp = PC.HP;
    this.maxHp = PC.HP;
    this.speed = PC.SPEED;
    this.baseSpeed = PC.SPEED;
    this.attackPower = PC.ATTACK_POWER;
    this.attackCooldown = PC.ATTACK_COOLDOWN;
    this.baseAttackCooldown = PC.ATTACK_COOLDOWN;
    this.attackTimer = 0;
    this.bulletSpeed = PC.BULLET_SPEED;
    this.baseBulletSpeed = PC.BULLET_SPEED;
    this.bulletSize = PC.BULLET_SIZE;
    this.bulletPenetration = PC.BULLET_PENETRATION;
    this.pickupRange = PC.PICKUP_RANGE;
    this.level = 1;
    this.exp = 0;
    this.expToLevel = PC.BASE_EXP_TO_LEVEL;
    this.extraProjectiles = 0;
    this.regenRate = 0;
    this.regenTimer = 0;
    this.criticalChance = 0; // 暴击率

    this.wallBounces = 0;
    this.hasFrostSlow = false;
    this.lightningChainCount = 0; // 闪电链连锁数
    this.hasReviveStone = false;

    this.runeAngle = 0;
    this.invulnerable = false;
    this.invulnerableTimer = 0;
    this.pulseEffect = 0;
    this.acquiredUpgrades = [];
};

ArcSurvivors.Player.prototype.update = function(dt) {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var PC = CFG.PLAYER;
    var keys = ArcSurvivors.keys;
    var dx = 0, dy = 0;

    if (keys['w'] || keys['arrowup']) dy -= 1;
    if (keys['s'] || keys['arrowdown']) dy += 1;
    if (keys['a'] || keys['arrowleft']) dx -= 1;
    if (keys['d'] || keys['arrowright']) dx += 1;

    if (dx !== 0 || dy !== 0) {
        var len = Math.sqrt(dx * dx + dy * dy);
        dx /= len; dy /= len;
        this.x += dx * this.speed * dt * 60;
        this.y += dy * this.speed * dt * 60;
    }

    this.x = Math.max(this.radius, Math.min(CFG.CANVAS_WIDTH - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(CFG.CANVAS_HEIGHT - this.radius, this.y));

    this.attackTimer -= dt;
    if (this.attackTimer <= 0) {
        this.shoot();
        this.attackTimer = this.attackCooldown;
    }

    if (this.regenRate > 0) {
        this.regenTimer += dt;
        if (this.regenTimer >= 1) {
            this.hp = Math.min(this.maxHp, this.hp + this.regenRate);
            this.regenTimer = 0;
            ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.PLAYER_HEAL, this.regenRate);
        }
    }

    if (this.invulnerable) {
        this.invulnerableTimer -= dt;
        if (this.invulnerableTimer <= 0) this.invulnerable = false;
    }

    this.runeAngle += dt * PC.RUNE_ROTATE_SPEED;
    if (this.pulseEffect > 0) this.pulseEffect -= dt * PC.PULSE_DECAY_SPEED;
};

ArcSurvivors.Player.prototype.shoot = function() {
    var PC = ArcSurvivors.GAME_CONFIG.PLAYER;
    var enemies = ArcSurvivors.enemies;
    var closestEnemy = null, closestDist = Infinity;

    for (var i = 0; i < enemies.length; i++) {
        var dist = ArcSurvivors.Utils.distance(enemies[i].x, enemies[i].y, this.x, this.y);
        if (dist < closestDist) { closestDist = dist; closestEnemy = enemies[i]; }
    }

    if (closestEnemy) {
        var angle = Math.atan2(closestEnemy.y - this.y, closestEnemy.x - this.x);
        var totalProjectiles = 1 + this.extraProjectiles;
        for (var j = 0; j < totalProjectiles; j++) {
            var offset = (j - (totalProjectiles - 1) / 2) * PC.PROJECTILE_SPREAD_ANGLE * Math.PI / 180;
            var damageMult = Math.pow(PC.PROJECTILE_DAMAGE_DECAY, this.extraProjectiles);
            this.createBullet(angle + offset, this.attackPower * damageMult);
        }
    } else {
        this.createBullet(Math.random() * Math.PI * 2, this.attackPower);
    }
};

ArcSurvivors.Player.prototype.createBullet = function(angle, damage) {
    var finalDamage = damage || this.attackPower;
    var isCritical = Math.random() < this.criticalChance;
    
    if (isCritical) {
        finalDamage *= 2; // 暴击伤害翻倍
    }
    
    var bullet = new ArcSurvivors.Bullet(
        this.x, this.y, angle, this.bulletSpeed,
        finalDamage, this.bulletSize, this.bulletPenetration, isCritical
    );
    ArcSurvivors.bullets.push(bullet);
    ArcSurvivors.Audio.shoot();
    
    ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.BULLET_FIRE, bullet);
};

ArcSurvivors.Player.prototype.takeDamage = function(damage) {
    if (this.invulnerable) return;

    var HE = ArcSurvivors.GAME_CONFIG.HIT_EFFECTS;
    this.hp -= damage;
    this.invulnerable = true;
    this.invulnerableTimer = ArcSurvivors.GAME_CONFIG.PLAYER.INVULNERABLE_DURATION;
    ArcSurvivors.screenShake.intensity = HE.SCREEN_SHAKE_INTENSITY;
    ArcSurvivors.screenShake.duration = HE.SCREEN_SHAKE_DURATION;
    ArcSurvivors.Audio.playerHurt();
    
    ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.PLAYER_HURT, damage, this.hp);

    if (this.hp <= 0) {
        this.hp = 0;
        
        // 复活石逻辑
        if (this.hasReviveStone) {
            this.revive();
            return;
        }
        
        ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.PLAYER_DIE);
        ArcSurvivors.gameOver();
    }
};

ArcSurvivors.Player.prototype.revive = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var RS = CFG.REVIVE_STONE;
    
    this.hp = this.maxHp * RS.HEAL_PERCENT;
    this.invulnerable = true;
    this.invulnerableTimer = RS.INVULNERABLE_DURATION;
    this.hasReviveStone = false;
    
    // 从已获取道具中移除复活石
    for (var i = this.acquiredUpgrades.length - 1; i >= 0; i--) {
        if (this.acquiredUpgrades[i].id === 108) {
            this.acquiredUpgrades.splice(i, 1);
            break;
        }
    }
    
    // 复活特效
    ArcSurvivors.spawnParticles(this.x, this.y, RS.PARTICLE_COUNT, 'rgb(255, 215, 0)', RS.PARTICLE_SIZE, RS.PARTICLE_SPEED);
    ArcSurvivors.screenShake.intensity = 2;
    ArcSurvivors.screenShake.duration = 0.3;
    
    // 播放复活音效（可以复用升级音效）
    ArcSurvivors.Audio.levelUp();
    
    ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.PLAYER_REVIVE);
};

ArcSurvivors.Player.prototype.gainExp = function(amount) {
    var PC = ArcSurvivors.GAME_CONFIG.PLAYER;
    this.exp += amount;
    while (this.exp >= this.expToLevel) {
        this.exp -= this.expToLevel;
        this.level++;
        this.expToLevel = Math.floor(this.expToLevel * PC.EXP_GROWTH_RATE);
        ArcSurvivors.Audio.levelUp();
        ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.PLAYER_LEVEL_UP, this.level);
        ArcSurvivors.showUpgradeScreen();
    }
};

ArcSurvivors.Player.prototype.draw = function(ctx) {
    var PC = ArcSurvivors.GAME_CONFIG.PLAYER;
    ctx.save();

    if (this.invulnerable && !this.hasShieldBuff && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }

    if (this.pulseEffect > 0) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + PC.PULSE_RADIUS_EXTRA * this.pulseEffect, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 50, 255, ' + (this.pulseEffect * 0.3) + ')';
        ctx.fill();
    }

    if (this.hasShieldBuff) {
        var shieldAlpha = 0.4 + Math.sin(Date.now() / 200) * 0.2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 15, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 255, 136, ' + shieldAlpha + ')';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = 'rgba(0, 255, 136, ' + (shieldAlpha * 0.3) + ')';
        ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    var gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    gradient.addColorStop(0, PC.COLORS.INNER);
    gradient.addColorStop(1, PC.COLORS.OUTER);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = PC.COLORS.RUNE;
    ctx.lineWidth = PC.COLORS.RUNE_WIDTH;
    for (var i = 0; i < 3; i++) {
        var angle = this.runeAngle + (i * Math.PI * 2 / 3);
        ctx.beginPath();
        ctx.arc(this.x + Math.cos(angle) * (this.radius + 10), this.y + Math.sin(angle) * (this.radius + 10), 5, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.restore();
};