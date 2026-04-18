/**
 * bosses/skills/active/summon-minions.js - 召唤小怪技能
 */
var ArcSurvivors = ArcSurvivors || {};
ArcSurvivors.Skills = ArcSurvivors.Skills || {};
ArcSurvivors.Skills.Active = ArcSurvivors.Skills.Active || {};

ArcSurvivors.Skills.Active.summonMinions = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SM = CFG.BOSS_SKILLS.ACTIVE.SUMMON_MINIONS;
    
    return {
        name: 'summon_minions',
        cooldown: SM.COOLDOWN,
        timer: 0,
        phase: 0,
        execute: function(boss, dt) {
            // 在Boss周围召唤小怪
            for (var i = 0; i < SM.COUNT; i++) {
                var angle = (i / SM.COUNT) * Math.PI * 2;
                var x = boss.x + Math.cos(angle) * SM.SPAWN_RADIUS;
                var y = boss.y + Math.sin(angle) * SM.SPAWN_RADIUS;
                
                // 限制在画布范围内
                x = Math.max(20, Math.min(CFG.CANVAS_WIDTH - 20, x));
                y = Math.max(20, Math.min(CFG.CANVAS_HEIGHT - 20, y));
                
                // 创建小怪
                var minion = new ArcSurvivors.Enemy(x, y, 'fast');
                minion.speed *= 1.2; // 小怪速度稍快
                ArcSurvivors.enemies.push(minion);
                
                // 召唤特效
                ArcSurvivors.spawnParticles(x, y, 5, 'rgb(255, 100, 255)', 4, 2);
            }
            
            // Boss召唤特效
            ArcSurvivors.spawnParticles(boss.x, boss.y, 10, 'rgb(255, 0, 255)', 5, 3);
            ArcSurvivors.Audio.hit();
        }
    };
};
