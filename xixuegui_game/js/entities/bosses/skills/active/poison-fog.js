/**
 * bosses/skills/active/poison-fog.js - 毒雾领域技能
 */
var ArcSurvivors = ArcSurvivors || {};
ArcSurvivors.Skills = ArcSurvivors.Skills || {};
ArcSurvivors.Skills.Active = ArcSurvivors.Skills.Active || {};

ArcSurvivors.Skills.Active.poisonFog = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var PF = CFG.BOSS_SKILLS.ACTIVE.POISON_FOG;
    
    return {
        name: 'poison_fog',
        cooldown: PF.COOLDOWN,
        timer: 0,
        phase: 0,
        execute: function(boss, dt) {
            var player = ArcSurvivors.player;
            
            // 在Boss位置创建毒雾区域
            boss.poisonFog = {
                x: boss.x,
                y: boss.y,
                radius: PF.RADIUS,
                duration: PF.DURATION,
                timer: 0,
                damageTimer: 0
            };
            
            // 毒雾生成特效
            ArcSurvivors.spawnParticles(boss.x, boss.y, 15, 'rgb(0, 200, 0)', 5, 3);
            ArcSurvivors.Audio.hit();
        }
    };
};

// 毒雾更新函数（在boss-base.js的update中调用）
ArcSurvivors.updatePoisonFog = function(boss, dt) {
    if (!boss.poisonFog) return;
    
    var PF = ArcSurvivors.GAME_CONFIG.BOSS_SKILLS.ACTIVE.POISON_FOG;
    var player = ArcSurvivors.player;
    var fog = boss.poisonFog;
    
    fog.timer += dt;
    fog.damageTimer += dt;
    
    // 检查持续时间
    if (fog.timer >= fog.duration) {
        boss.poisonFog = null;
        return;
    }
    
    // 每0.5秒造成一次伤害
    if (fog.damageTimer >= 0.5) {
        fog.damageTimer = 0;
        
        var dist = ArcSurvivors.Utils.distance(fog.x, fog.y, player.x, player.y);
        if (dist < fog.radius + player.radius) {
            var damage = boss.damage * PF.DAMAGE_PER_SECOND_SCALE * 0.5;
            player.takeDamage(damage);
            
            // 减速效果
            if (!player.slowed) {
                player.baseSpeed = player.speed;
                player.speed *= PF.SLOW_FACTOR;
                player.slowed = true;
            }
            player.slowedTimer = 0.5;
        }
    }
};

// 毒雾绘制函数（在boss-base.js的draw中调用）
ArcSurvivors.drawPoisonFog = function(ctx, boss) {
    if (!boss.poisonFog) return;
    
    var fog = boss.poisonFog;
    var alpha = 0.3 * (1 - fog.timer / fog.duration);
    
    // 绘制毒雾区域
    ctx.beginPath();
    ctx.arc(fog.x, fog.y, fog.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 200, 0, ' + alpha + ')';
    ctx.fill();
    
    // 绘制毒雾边缘
    ctx.strokeStyle = 'rgba(0, 255, 0, ' + (alpha * 2) + ')';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 绘制毒雾气泡效果
    var time = fog.timer * 3;
    var bubbleCount = 10;
    
    for (var i = 0; i < bubbleCount; i++) {
        var angle = (i / bubbleCount) * Math.PI * 2 + time * 0.5;
        var dist = fog.radius * (0.3 + Math.sin(time + i) * 0.2);
        var x = fog.x + Math.cos(angle) * dist;
        var y = fog.y + Math.sin(angle) * dist;
        var size = 3 + Math.sin(time * 2 + i) * 2;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 0, ' + (alpha * 1.5) + ')';
        ctx.fill();
    }
};
