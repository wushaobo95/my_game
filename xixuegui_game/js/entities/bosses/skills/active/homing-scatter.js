/**
 * bosses/skills/active/homing-scatter.js - 追踪散射
 * 发射散射的追踪弹，Phase 2增加子弹数量
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.homingScatter = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.HOMING_SCATTER;

    return {
        name: 'homing_scatter',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: 0,
        execute: function(boss, dt) {
            var bulletCount = boss.bossPhase >= 2 ? SC.BULLET_COUNT_PHASE2 : SC.BULLET_COUNT;
            var damage = boss.damage * SC.DAMAGE_SCALE;

            // 发射散射追踪弹
            for (var i = 0; i < bulletCount; i++) {
                // 随机初始角度
                var angle = Math.random() * Math.PI * 2;

                ArcSurvivors.enemyBullets.push(new ArcSurvivors.EnemyBullet(
                    boss.x, boss.y,
                    angle,
                    SC.SPEED,
                    damage,
                    SC.HOMING_DURATION,  // 追踪持续时间
                    SC.TURN_SPEED        // 转向速度
                ));
            }
        }
    };
};
