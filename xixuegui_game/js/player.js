/**
 * player.js - 玩家角色
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Player = function() {
    this.x = ArcSurvivors.CANVAS_WIDTH / 2;
    this.y = ArcSurvivors.CANVAS_HEIGHT / 2;
    this.radius = 20;
    this.hp = 100;
    this.maxHp = 100;
    this.speed = 5;
    this.attackPower = 12;
    this.attackCooldown = 0.4;
    this.attackTimer = 0;
    this.bulletSpeed = 8;
    this.bulletSize = 8;
    this.bulletPenetration = 1;
    this.pickupRange = 160;
    this.level = 1;
    this.exp = 0;
    this.expToLevel = 60;
    this.extraProjectiles = 0;
    this.regenRate = 0;
    this.regenTimer = 0;

    this.wallBounces = 1;
    this.hasFrostNova = false;
    this.frostNovaCooldown = 0;
    this.hasKillExplosion = false;
    this.hasAutoLaser = false;
    this.laserTimer = 0;
    this.hasBouncing = false;

    this.runeAngle = 0;
    this.invulnerable = false;
    this.invulnerableTimer = 0;
    this.pulseEffect = 0;
    this.acquiredUpgrades = [];
};

ArcSurvivors.Player.prototype.update = function(dt) {
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

    this.x = Math.max(this.radius, Math.min(ArcSurvivors.CANVAS_WIDTH - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(ArcSurvivors.CANVAS_HEIGHT - this.radius, this.y));

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
        }
    }

    if (this.hasFrostNova && this.frostNovaCooldown > 0) this.frostNovaCooldown -= dt;

    if (this.hasAutoLaser) {
        this.laserTimer += dt;
        if (this.laserTimer >= 10) { this.fireLaser(); this.laserTimer = 0; }
    }

    if (this.invulnerable) {
        this.invulnerableTimer -= dt;
        if (this.invulnerableTimer <= 0) this.invulnerable = false;
    }

    this.runeAngle += dt * 2;
    if (this.pulseEffect > 0) this.pulseEffect -= dt * 3;
};

ArcSurvivors.Player.prototype.shoot = function() {
    var enemies = ArcSurvivors.enemies;
    var closestEnemy = null, closestDist = Infinity;

    for (var i = 0; i < enemies.length; i++) {
        var dist = ArcSurvivors.Utils.distance(enemies[i].x, enemies[i].y, this.x, this.y);
        if (dist < closestDist) { closestDist = dist; closestEnemy = enemies[i]; }
    }

    if (closestEnemy) {
        var angle = Math.atan2(closestEnemy.y - this.y, closestEnemy.x - this.x);
        this.createBullet(angle);
        for (var j = 1; j <= this.extraProjectiles; j++) {
            this.createBullet(angle + (15 * Math.PI / 180) * j);
            this.createBullet(angle - (15 * Math.PI / 180) * j);
        }
    } else {
        this.createBullet(Math.random() * Math.PI * 2);
    }
};

ArcSurvivors.Player.prototype.createBullet = function(angle) {
    ArcSurvivors.bullets.push(new ArcSurvivors.Bullet(
        this.x, this.y, angle, this.bulletSpeed,
        this.attackPower, this.bulletSize, this.bulletPenetration
    ));
    ArcSurvivors.Audio.shoot();
};

ArcSurvivors.Player.prototype.fireLaser = function() {
    var enemies = ArcSurvivors.enemies;
    if (enemies.length === 0) return;

    var highest = enemies[0];
    for (var i = 1; i < enemies.length; i++) {
        if (enemies[i].hp > highest.hp) highest = enemies[i];
    }

    var angle = Math.atan2(highest.y - this.y, highest.x - this.x);
    ArcSurvivors.bullets.push(new ArcSurvivors.Laser(this.x, this.y, angle, this.attackPower * 3));
};

ArcSurvivors.Player.prototype.takeDamage = function(damage) {
    if (this.invulnerable) return;

    this.hp -= damage;
    this.invulnerable = true;
    this.invulnerableTimer = 0.5;
    ArcSurvivors.screenShake.intensity = 0.5;
    ArcSurvivors.screenShake.duration = 0.1;
    ArcSurvivors.Audio.playerHurt();

    if (this.hasFrostNova && this.frostNovaCooldown <= 0) {
        this.triggerFrostNova();
        this.frostNovaCooldown = 8;
    }

    if (this.hp <= 0) {
        this.hp = 0;
        ArcSurvivors.gameOver();
    }
};

ArcSurvivors.Player.prototype.triggerFrostNova = function() {
    var enemies = ArcSurvivors.enemies;
    for (var i = 0; i < enemies.length; i++) {
        var dist = ArcSurvivors.Utils.distance(enemies[i].x, enemies[i].y, this.x, this.y);
        if (dist < 150) {
            enemies[i].frozen = true;
            enemies[i].frozenTimer = 1;
            ArcSurvivors.spawnParticles(enemies[i].x, enemies[i].y, 5, 'rgb(136,255,255)', 5, 4);
        }
    }
};

ArcSurvivors.Player.prototype.gainExp = function(amount) {
    this.exp += amount;
    while (this.exp >= this.expToLevel) {
        this.exp -= this.expToLevel;
        this.level++;
        this.expToLevel = Math.floor(this.expToLevel * 1.3);
        ArcSurvivors.Audio.levelUp();
        ArcSurvivors.showUpgradeScreen();
    }
};

ArcSurvivors.Player.prototype.draw = function(ctx) {
    ctx.save();

    if (this.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }

    if (this.pulseEffect > 0) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 30 * this.pulseEffect, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 50, 255, ' + (this.pulseEffect * 0.3) + ')';
        ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    var gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    gradient.addColorStop(0, '#6633ff');
    gradient.addColorStop(1, '#3311aa');
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = '#9966ff';
    ctx.lineWidth = 3;
    for (var i = 0; i < 3; i++) {
        var angle = this.runeAngle + (i * Math.PI * 2 / 3);
        ctx.beginPath();
        ctx.arc(this.x + Math.cos(angle) * (this.radius + 10), this.y + Math.sin(angle) * (this.radius + 10), 5, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.restore();
};
