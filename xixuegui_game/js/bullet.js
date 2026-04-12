/**
 * bullet.js - 子弹与激光
 */
var ArcSurvivors = ArcSurvivors || {};

// 普通子弹
ArcSurvivors.Bullet = function(x, y, angle, speed, damage, size, penetration) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.damage = damage;
    this.size = size;
    this.penetration = penetration;
    this.active = true;
    this.trail = [];
    this.hitEnemies = new Set();
};

ArcSurvivors.Bullet.prototype.update = function(dt) {
    this.trail.push({ x: this.x, y: this.y, alpha: 1 });
    if (this.trail.length > 10) this.trail.shift();
    for (var i = 0; i < this.trail.length; i++) {
        this.trail[i].alpha = i / this.trail.length;
    }

    this.x += Math.cos(this.angle) * this.speed * dt * 60;
    this.y += Math.sin(this.angle) * this.speed * dt * 60;

    // 墙壁弹射
    var bounced = false;
    if (this.x < 0) { this.x = 0; this.angle = Math.PI - this.angle; bounced = true; }
    else if (this.x > ArcSurvivors.CANVAS_WIDTH) { this.x = ArcSurvivors.CANVAS_WIDTH; this.angle = Math.PI - this.angle; bounced = true; }
    if (this.y < 0) { this.y = 0; this.angle = -this.angle; bounced = true; }
    else if (this.y > ArcSurvivors.CANVAS_HEIGHT) { this.y = ArcSurvivors.CANVAS_HEIGHT; this.angle = -this.angle; bounced = true; }

    if (bounced) {
        this.bounceCount = (this.bounceCount || 0) + 1;
        if (this.bounceCount > (ArcSurvivors.player.wallBounces || 1)) {
            this.active = false;
        }
    }

    var enemies = ArcSurvivors.enemies;
    var player = ArcSurvivors.player;

    for (var j = 0; j < enemies.length; j++) {
        var enemy = enemies[j];
        if (!this.hitEnemies.has(enemy)) {
            var dist = ArcSurvivors.Utils.distance(enemy.x, enemy.y, this.x, this.y);
            if (dist < enemy.radius + this.size) {
                this.hitEnemies.add(enemy);
                enemy.takeDamage(this.damage);
                this.penetration--;
                ArcSurvivors.Audio.hit();

                if (this.penetration <= 0) {
                    this.active = false;
                }

                if (player.hasBouncing && this.penetration > 0) {
                    var closestEnemy = null;
                    var closestDist = Infinity;
                    for (var k = 0; k < enemies.length; k++) {
                        var e = enemies[k];
                        if (e !== enemy && !this.hitEnemies.has(e)) {
                            var d = ArcSurvivors.Utils.distance(e.x, e.y, this.x, this.y);
                            if (d < closestDist) {
                                closestDist = d;
                                closestEnemy = e;
                            }
                        }
                    }
                    if (closestEnemy) {
                        this.angle = Math.atan2(closestEnemy.y - this.y, closestEnemy.x - this.x);
                    }
                }
                break;
            }
        }
    }
};

ArcSurvivors.Bullet.prototype.draw = function(ctx) {
    for (var i = 0; i < this.trail.length; i++) {
        var point = this.trail[i];
        ctx.beginPath();
        ctx.arc(point.x, point.y, this.size * 0.5 * point.alpha, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 50, 255, ' + (point.alpha * 0.5) + ')';
        ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    var gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.5, '#9966ff');
    gradient.addColorStop(1, '#6633ff');
    ctx.fillStyle = gradient;
    ctx.fill();
};

// 激光
ArcSurvivors.Laser = function(x, y, angle, damage) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.damage = damage;
    this.length = 2000;
    this.active = true;
    this.lifetime = 0.2;
    this.hitEnemies = new Set();
};

ArcSurvivors.Laser.prototype.update = function(dt) {
    this.lifetime -= dt;
    if (this.lifetime <= 0) this.active = false;

    var endX = this.x + Math.cos(this.angle) * this.length;
    var endY = this.y + Math.sin(this.angle) * this.length;
    var enemies = ArcSurvivors.enemies;

    for (var i = 0; i < enemies.length; i++) {
        var enemy = enemies[i];
        if (!this.hitEnemies.has(enemy)) {
            var dist = ArcSurvivors.Utils.pointToLineDistance(
                enemy.x, enemy.y, this.x, this.y, endX, endY
            );
            if (dist < enemy.radius) {
                this.hitEnemies.add(enemy);
                enemy.takeDamage(this.damage);
                ArcSurvivors.hitStop.active = true;
                ArcSurvivors.hitStop.frames = 3;
                ArcSurvivors.Audio.hit();
            }
        }
    }
};

ArcSurvivors.Laser.prototype.draw = function(ctx) {
    var endX = this.x + Math.cos(this.angle) * this.length;
    var endY = this.y + Math.sin(this.angle) * this.length;

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
};
