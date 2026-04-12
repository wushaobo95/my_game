/**
 * entities/particle.js - 粒子系统
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Particle = function(x, y, vx, vy, lifetime, color, size) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.lifetime = lifetime;
    this.maxLifetime = lifetime;
    this.color = color;
    this.size = size;
    this.active = true;
};

ArcSurvivors.Particle.prototype.update = function(dt) {
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    this.lifetime -= dt;
    if (this.lifetime <= 0) this.active = false;
};

ArcSurvivors.Particle.prototype.draw = function(ctx) {
    var alpha = this.lifetime / this.maxLifetime;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
    ctx.fillStyle = this.color.replace(')', ', ' + alpha + ')').replace('rgb', 'rgba');
    ctx.fill();
};

ArcSurvivors.spawnParticles = function(x, y, count, color, size, speed) {
    for (var i = 0; i < count; i++) {
        var angle = Math.random() * Math.PI * 2;
        var s = Math.random() * speed + 1;
        this.particles.push(new this.Particle(
            x, y,
            Math.cos(angle) * s,
            Math.sin(angle) * s,
            0.5, color, size
        ));
    }
};