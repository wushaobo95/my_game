/**
 * entities/bosses/boss-duck.js - 酱板鸭Boss
 * 特殊Boss：无技能、无伤害、低血量、死亡后为玩家回血
 */
var ArcSurvivors = ArcSurvivors || {};

// ============================================================
// 酱板鸭Boss构造函数
// ============================================================
ArcSurvivors.BossDuck = function(x, y, foxMaxHp) {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var BC = CFG.ENEMY_TYPES.boss;

    // 调用基类构造函数
    ArcSurvivors.BossBase.call(this, x, y, BC);

    // 设置酱板鸭特性
    this.radius = BC.RADIUS * 0.8; // 稍微小一点
    this.color = '#8B4513'; // 酱板鸭颜色
    this.bossType = 'duck';
    
    // 血量是狐狸的70%（传入的foxMaxHp）
    this.maxHp = foxMaxHp * 0.7;
    this.hp = this.maxHp;
    
    // 无伤害
    this.damage = 0;
    
    // 移速较慢
    this.speed = BC.SPEED * 0.6;
    
    // 空技能数组（无技能）
    this.skills = [];
    
    // 标记为酱板鸭
    this.isDuck = true;
};

ArcSurvivors.BossDuck.prototype = Object.create(ArcSurvivors.BossBase.prototype);
ArcSurvivors.BossDuck.prototype.constructor = ArcSurvivors.BossDuck;

// ============================================================
// update覆写 - 简化版，不执行技能
// ============================================================
ArcSurvivors.BossDuck.prototype.update = function(dt) {
    var player = ArcSurvivors.player;
    var dx = player.x - this.x;
    var dy = player.y - this.y;
    var dist = Math.sqrt(dx * dx + dy * dy);

    // 只是慢慢向玩家移动，但不造成伤害
    if (dist > 0) {
        this.x += (dx / dist) * this.speed * dt * 60;
        this.y += (dy / dist) * this.speed * dt * 60;
    }
    
    // 酱板鸭不更新阶段和技能
};

// ============================================================
// takeDamage覆写 - 正常受伤
// ============================================================
ArcSurvivors.BossDuck.prototype.takeDamage = function(damage, attacker) {
    this.hp -= damage;
    ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.ENEMY_HURT, this, damage);
    if (this.hp <= 0) this.die();
};

// ============================================================
// die覆写 - 为玩家回复所有生命值
// ============================================================
ArcSurvivors.BossDuck.prototype.die = function() {
    var player = ArcSurvivors.player;
    var CFG = ArcSurvivors.GAME_CONFIG;
    
    this.active = false;
    ArcSurvivors.gameState.kills++;
    
    // 播放音效
    ArcSurvivors.Audio.enemyDeath && ArcSurvivors.Audio.enemyDeath();
    
    ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.ENEMY_DIE, this);
    
    // 掉落少量宝石
    for (var i = 0; i < 5; i++) {
        var angle = Math.random() * Math.PI * 2;
        var dist = Math.random() * 30 + 20;
        ArcSurvivors.gems.push(new ArcSurvivors.Gem(
            this.x + Math.cos(angle) * dist,
            this.y + Math.sin(angle) * dist,
            'large',
            1
        ));
    }
    
    // 为玩家回复所有生命值
    if (player) {
        var healAmount = player.maxHp - player.hp;
        player.hp = player.maxHp;
        
        // 显示回血粒子效果
        ArcSurvivors.spawnParticles(this.x, this.y, 50, 'rgb(255, 100, 100)', 10, 8);
        ArcSurvivors.spawnParticles(player.x, player.y, 30, 'rgb(100, 255, 100)', 8, 5);
        
        // 显示回血文字提示
        ArcSurvivors.showHealText && ArcSurvivors.showHealText(player.x, player.y, healAmount);
    }
    
    // 屏幕震动效果（较小的震动）
    ArcSurvivors.screenShake.intensity = 1;
    ArcSurvivors.screenShake.duration = 0.2;
    
    // 粒子效果
    ArcSurvivors.spawnParticles(this.x, this.y, 20, 'rgb(139, 69, 19)', 8, 4);
};

// ============================================================
// draw覆写 - 使用图片资源或默认绘制
// ============================================================
ArcSurvivors.BossDuck.prototype.draw = function(ctx) {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var BC = CFG.RENDERER.BOSS;
    var RL = ArcSurvivors.ResourceLoader;

    ctx.save();

    // 尝试使用酱板鸭图片
    if (RL && RL.hasSprite('boss_duck')) {
        var sprite = RL.getSprite('boss_duck');
        var drawRadius = this.radius * 1.5;
        ctx.drawImage(
            sprite,
            this.x - drawRadius,
            this.y - drawRadius,
            drawRadius * 2,
            drawRadius * 2
        );
    } else {
        // 默认绘制 - 椭圆形的酱板鸭形状
        ctx.shadowColor = '#8B4513';
        ctx.shadowBlur = 10;
        
        // 身体（椭圆形）
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.radius * 1.2, this.radius * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#5D3A1A';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 鸭头
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.8, this.y - this.radius * 0.3, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 鸭腿
        ctx.strokeStyle = '#D2691E';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.x + this.radius * 0.3, this.y + this.radius * 0.6);
        ctx.lineTo(this.x + this.radius * 0.4, this.y + this.radius * 1.0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.x - this.radius * 0.3, this.y + this.radius * 0.6);
        ctx.lineTo(this.x - this.radius * 0.4, this.y + this.radius * 1.0);
        ctx.stroke();
        
        // 翅膀
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.ellipse(this.x + this.radius * 0.2, this.y, this.radius * 0.6, this.radius * 0.3, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    // 绘制血条
    this._drawDuckHpBar(ctx, BC);

    ctx.restore();
};

// ============================================================
// 酱板鸭专用血条绘制
// ============================================================
ArcSurvivors.BossDuck.prototype._drawDuckHpBar = function(ctx, BC) {
    ctx.shadowBlur = 0;
    var barW = this.radius * 2;
    var barH = 6;
    var barX = this.x - barW / 2;
    var barY = this.y - this.radius - 15;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = '#4CAF50'; // 绿色血条
    ctx.fillRect(barX, barY, (this.hp / this.maxHp) * barW, barH);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(barX, barY, barW, barH);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('酱板鸭', this.x, barY - 5);
};

// ============================================================
// 注册到BossRegistry
// ============================================================
if (ArcSurvivors.BossRegistry) {
    ArcSurvivors.BossRegistry.register('duck', ArcSurvivors.BossDuck);
}
