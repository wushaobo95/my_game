/**
 * bosses/skills/active/summon-elites.js - 精英召唤
 * 在Boss周围召唤精英小怪，Phase 2增加召唤数量
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.summonElites = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.SUMMON_ELITES;

    return {
        name: 'summon_elites',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: 0,
        execute: function(boss, dt) {
            var count = boss.bossPhase >= 2 ? SC.COUNT_PHASE2 : SC.COUNT;

            // 在Boss周围召唤精英小怪
            for (var i = 0; i < count; i++) {
                var angle = (i / count) * Math.PI * 2;
                var x = boss.x + Math.cos(angle) * SC.SPAWN_RADIUS;
                var y = boss.y + Math.sin(angle) * SC.SPAWN_RADIUS;

                // 限制在画布范围内
                x = Math.max(20, Math.min(CFG.CANVAS_WIDTH - 20, x));
                y = Math.max(20, Math.min(CFG.CANVAS_HEIGHT - 20, y));

                // 创建精英小怪（使用精英模板）
                var elite = new ArcSurvivors.Enemy(x, y, 'fast');

                // 精英属性加成
                elite.hp *= SC.ELITE_HP_SCALE;
                elite.maxHp = elite.hp;
                elite.damage *= SC.ELITE_DAMAGE_SCALE;
                elite.radius *= 1.2; // 稍大体积
                elite.color = '#FFD700'; // 金色表示精英
                elite.isElite = true;

                ArcSurvivors.enemies.push(elite);

                // 召唤特效
                ArcSurvivors.spawnParticles(x, y, 8, 'rgb(255, 215, 0)', 5, 3);
            }

            // Boss召唤特效
            ArcSurvivors.spawnParticles(boss.x, boss.y, 15, 'rgb(255, 215, 0)', 6, 4);
            ArcSurvivors.Audio.hit();
        }
    };
};
