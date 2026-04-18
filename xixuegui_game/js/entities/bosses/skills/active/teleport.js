/**
 * bosses/skills/active/teleport.js - 瞬移技能
 */
var ArcSurvivors = ArcSurvivors || {};
ArcSurvivors.Skills = ArcSurvivors.Skills || {};
ArcSurvivors.Skills.Active = ArcSurvivors.Skills.Active || {};

ArcSurvivors.Skills.Active.teleport = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var TP = CFG.BOSS_SKILLS.ACTIVE.TELEPORT;
    
    return {
        name: 'teleport',
        cooldown: TP.COOLDOWN,
        timer: 0,
        phase: 0,
        execute: function(boss, dt) {
            var player = ArcSurvivors.player;
            
            // 计算瞬移位置（玩家附近随机位置）
            var angle = Math.random() * Math.PI * 2;
            var distance = TP.MIN_DISTANCE + Math.random() * (TP.MAX_DISTANCE - TP.MIN_DISTANCE);
            var newX = player.x + Math.cos(angle) * distance;
            var newY = player.y + Math.sin(angle) * distance;
            
            // 限制在画布范围内
            newX = Math.max(boss.radius, Math.min(CFG.CANVAS_WIDTH - boss.radius, newX));
            newY = Math.max(boss.radius, Math.min(CFG.CANVAS_HEIGHT - boss.radius, newY));
            
            // 原位置特效
            ArcSurvivors.spawnParticles(boss.x, boss.y, 15, 'rgb(200, 0, 255)', 5, 4);
            
            // 瞬移
            boss.x = newX;
            boss.y = newY;
            
            // 新位置特效
            ArcSurvivors.spawnParticles(boss.x, boss.y, 15, 'rgb(200, 0, 255)', 5, 4);
            
            // 瞬移后立即攻击
            var dist = ArcSurvivors.Utils.distance(boss.x, boss.y, player.x, player.y);
            if (dist < boss.radius + player.radius) {
                player.takeDamage(boss.damage * 0.5);
            }
            
            ArcSurvivors.Audio.hit();
        }
    };
};
