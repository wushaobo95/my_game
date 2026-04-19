var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.EnemyBullet = function(x, y, angle, speed, damage, homingDuration, turnSpeed) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.damage = damage;
    this.radius = 6;
    this.active = true;
    this.homingDuration = homingDuration || 0;
    this.homingTimer = homingDuration || 0;
    this.turnSpeed = turnSpeed || 3;
};

ArcSurvivors.EnemyBullet.prototype.update = function(dt) {
    if (this.homingTimer > 0) {
        this.homingTimer -= dt;
        var player = ArcSurvivors.player;
        var targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
        var diff = targetAngle - this.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        var maxTurn = this.turnSpeed * dt;
        if (Math.abs(diff) < maxTurn) {
            this.angle = targetAngle;
        } else {
            this.angle += (diff > 0 ? 1 : -1) * maxTurn;
        }
    }

    this.x += Math.cos(this.angle) * this.speed * dt * 60;
    this.y += Math.sin(this.angle) * this.speed * dt * 60;

    var CFG = ArcSurvivors.GAME_CONFIG;
    if (this.x < -20 || this.x > CFG.CANVAS_WIDTH + 20 ||
        this.y < -20 || this.y > CFG.CANVAS_HEIGHT + 20) {
        this.active = false;
        return;
    }

    var player = ArcSurvivors.player;
    if (ArcSurvivors.Utils.distance(this.x, this.y, player.x, player.y) < this.radius + player.radius) {
        player.takeDamage(this.damage);
        this.active = false;
    }
};

ArcSurvivors.EnemyBullet.prototype.draw = function(ctx) {
    var RL = ArcSurvivors.ResourceLoader;

    if (RL && RL.hasSprite('enemy_bullet')) {
        var sprite = RL.getSprite('enemy_bullet');
        var drawWidth = this.radius * 2;
        var drawHeight = this.radius * 2;
        ctx.drawImage(sprite,
            this.x - this.radius,
            this.y - this.radius,
            drawWidth,
            drawHeight);
    } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        var grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        grad.addColorStop(0, '#ff88ff');
        grad.addColorStop(1, '#ff0044');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
};