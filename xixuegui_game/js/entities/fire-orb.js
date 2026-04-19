/**
 * entities/fire-orb.js - 火球护身技能
 * 环绕玩家旋转的火焰子弹
 */
var ArcSurvivors = ArcSurvivors || {};

// 火球护身管理器
ArcSurvivors.FireOrbManager = function(player) {
    this.player = player;
    this.orbs = [];
    this.lastLevel = 0;
};

ArcSurvivors.FireOrbManager.prototype.update = function(dt) {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var FO = CFG.FIRE_ORB;
    var player = this.player;
    var currentLevel = player.fireOrbLevel || 0;

    // 等级变化时重新生成火球
    if (currentLevel !== this.lastLevel) {
        this.regenerateOrbs(currentLevel);
        this.lastLevel = currentLevel;
    }

    // 更新每个火球
    for (var i = 0; i < this.orbs.length; i++) {
        this.orbs[i].update(dt, player, i, this.orbs.length);
    }
};

ArcSurvivors.FireOrbManager.prototype.regenerateOrbs = function(level) {
    this.orbs = [];
    if (level <= 0) return;

    var CFG = ArcSurvivors.GAME_CONFIG;
    var FO = CFG.FIRE_ORB;
    var orbitRadius = FO.BASE_ORBIT_RADIUS + (level - 1) * FO.ORBIT_RADIUS_PER_LEVEL;

    for (var i = 0; i < level; i++) {
        this.orbs.push(new ArcSurvivors.FireOrb(i, orbitRadius));
    }
};

ArcSurvivors.FireOrbManager.prototype.draw = function(ctx) {
    for (var i = 0; i < this.orbs.length; i++) {
        this.orbs[i].draw(ctx);
    }
};

// 单个火球
ArcSurvivors.FireOrb = function(index, orbitRadius) {
    this.index = index;
    this.orbitRadius = orbitRadius;
    this.angle = (index / 1) * Math.PI * 2; // 初始均匀分布
    this.x = 0;
    this.y = 0;
    this.trail = [];
    this.hitCooldowns = new Map(); // 敌人伤害冷却: enemy -> cooldownTime
};

ArcSurvivors.FireOrb.prototype.update = function(dt, player, index, totalOrbs) {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var FO = CFG.FIRE_ORB;

    // 计算当前角度（均匀分布）
    var targetAngle = (index / totalOrbs) * Math.PI * 2 + this.angle;
    this.angle += FO.ROTATION_SPEED * dt * Math.PI / 180;

    // 计算位置
    this.x = player.x + Math.cos(targetAngle) * this.orbitRadius;
    this.y = player.y + Math.sin(targetAngle) * this.orbitRadius;

    // 更新轨迹
    this.trail.push({ x: this.x, y: this.y, alpha: 1 });
    if (this.trail.length > FO.TRAIL_LENGTH) {
        this.trail.shift();
    }
    for (var i = 0; i < this.trail.length; i++) {
        this.trail[i].alpha = i / this.trail.length;
    }

    // 更新伤害冷却
    this.updateCooldowns(dt);

    // 碰撞检测和伤害
    this.checkCollisions(player, FO);
};

ArcSurvivors.FireOrb.prototype.updateCooldowns = function(dt) {
    var keysToDelete = [];
    this.hitCooldowns.forEach(function(cooldown, enemy) {
        cooldown -= dt;
        if (cooldown <= 0) {
            keysToDelete.push(enemy);
        } else {
            this.hitCooldowns.set(enemy, cooldown);
        }
    }, this);

    for (var i = 0; i < keysToDelete.length; i++) {
        this.hitCooldowns.delete(keysToDelete[i]);
    }
};

ArcSurvivors.FireOrb.prototype.checkCollisions = function(player, FO) {
    var enemies = ArcSurvivors.enemies;
    var damage = player.attackPower * FO.DAMAGE_SCALE;
    var orbSize = FO.ORB_SIZE;

    for (var i = 0; i < enemies.length; i++) {
        var enemy = enemies[i];
        if (!this.hitCooldowns.has(enemy)) {
            var dist = ArcSurvivors.Utils.distance(this.x, this.y, enemy.x, enemy.y);
            if (dist < enemy.radius + orbSize) {
                // 造成伤害
                enemy.takeDamage(damage);
                this.hitCooldowns.set(enemy, FO.DAMAGE_INTERVAL);

                // 生成击中粒子
                ArcSurvivors.spawnParticles(
                    this.x, this.y,
                    FO.PARTICLE_COUNT,
                    FO.COLOR,
                    FO.PARTICLE_SIZE,
                    FO.PARTICLE_SPEED
                );

                ArcSurvivors.Audio.hit();
            }
        }
    }
};

ArcSurvivors.FireOrb.prototype.draw = function(ctx) {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var FO = CFG.FIRE_ORB;

    ctx.save();

    // 绘制轨迹
    for (var i = 0; i < this.trail.length; i++) {
        var point = this.trail[i];
        var size = (FO.ORB_SIZE * 0.5) * (point.alpha * 0.5);
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 100, 0, ' + (point.alpha * 0.3) + ')';
        ctx.fill();
    }

    // 绘制火球光晕
    var gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, FO.ORB_SIZE * 1.5
    );
    gradient.addColorStop(0, 'rgba(255, 200, 50, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 80, 0, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');

    ctx.beginPath();
    ctx.arc(this.x, this.y, FO.ORB_SIZE * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // 绘制火球核心
    ctx.beginPath();
    ctx.arc(this.x, this.y, FO.ORB_SIZE * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = FO.CORE_COLOR;
    ctx.fill();

    // 绘制高光
    ctx.beginPath();
    ctx.arc(this.x - 2, this.y - 2, FO.ORB_SIZE * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();

    ctx.restore();
};
