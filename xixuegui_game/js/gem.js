/**
 * gem.js - 经验宝石
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Gem = function(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.value = type === 'large' ? 50 : 15;
    this.color = type === 'large' ? '#aa44ff' : '#4488ff';
    this.radius = type === 'large' ? 10 : 6;
    this.active = true;
};

ArcSurvivors.Gem.prototype.update = function(dt) {
    var player = ArcSurvivors.player;
    var dist = ArcSurvivors.Utils.distance(this.x, this.y, player.x, player.y);

    if (dist < player.pickupRange) {
        var dx = player.x - this.x;
        var dy = player.y - this.y;
        var speed = 5 * (1 - dist / player.pickupRange);
        this.x += (dx / dist) * speed * dt * 60;
        this.y += (dy / dist) * speed * dt * 60;
    }

    if (dist < player.radius + this.radius) {
        player.gainExp(this.value);
        this.active = false;
        ArcSurvivors.Audio.pickup();
    }
};

ArcSurvivors.Gem.prototype.draw = function(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
};
