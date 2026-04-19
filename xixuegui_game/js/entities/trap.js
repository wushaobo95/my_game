/**
 * entities/trap.js - 陷阱类
 */
var ArcSurvivors = ArcSurvivors || {};

// 陷阱基类
ArcSurvivors.Trap = function(x, y, config) {
    this.x = x;
    this.y = y;
    this.radius = config.radius || 30;
    this.damage = config.damage || 10;
    this.duration = config.duration || 5;
    this.damageInterval = config.damageInterval || 0.5;
    this.color = config.color || 'rgba(0, 255, 0, 0.3)';
    this.borderColor = config.borderColor || 'rgba(0, 255, 0, 0.8)';
    this.active = true;
    this.timer = 0;
    this.damageTimer = 0;
    this.hitEnemies = new Set();
};

ArcSurvivors.Trap.prototype.update = function(dt) {
    this.timer += dt;
    this.damageTimer += dt;

    // 检查持续时间
    if (this.timer >= this.duration) {
        this.active = false;
        return;
    }

    // 检查伤害间隔
    if (this.damageTimer >= this.damageInterval) {
        this.damageTimer = 0;
        this.hitEnemies.clear(); // 清空已命中敌人集合，允许再次造成伤害
        this.applyDamage();
    }
};

ArcSurvivors.Trap.prototype.applyDamage = function() {
    var enemies = ArcSurvivors.enemies;
    
    for (var i = 0; i < enemies.length; i++) {
        var enemy = enemies[i];
        if (enemy.active && !this.hitEnemies.has(enemy)) {
            var dist = ArcSurvivors.Utils.distance(enemy.x, enemy.y, this.x, this.y);
            if (dist < this.radius + enemy.radius) {
                this.hitEnemies.add(enemy);
                enemy.takeDamage(this.damage);
            }
        }
    }
};

ArcSurvivors.Trap.prototype.draw = function(ctx) {
    var remainingRatio = 1 - (this.timer / this.duration);
    var alpha = 0.2 + remainingRatio * 0.2;

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    
    ctx.globalAlpha = alpha + 0.1;
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();

    this.drawBubbles(ctx);
};

ArcSurvivors.Trap.prototype.drawBubbles = function(ctx) {
    var time = this.timer * 2;
    var bubbleCount = 4;
    
    ctx.save();
    for (var i = 0; i < bubbleCount; i++) {
        var angle = (i / bubbleCount) * Math.PI * 2 + time;
        var dist = this.radius * 0.4 + Math.sin(time + i) * this.radius * 0.2;
        var x = this.x + Math.cos(angle) * dist;
        var y = this.y + Math.sin(angle) * dist;
        var size = 2 + Math.sin(time * 2 + i) * 1.5;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 160, 0, 0.4)';
        ctx.fill();
    }
    ctx.restore();
};


