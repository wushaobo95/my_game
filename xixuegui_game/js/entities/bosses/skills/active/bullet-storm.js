/**
 * bosses/skills/active/bullet-storm.js - 弹幕风暴
 * 向四周发射子弹，Phase 2增加弹数和速度
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.bulletStorm = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.BULLET_STORM;
    var BC = CFG.ENEMY_TYPES.boss;

    return {
        name: 'bullet_storm',
        cooldown: SC.COOLDOWN,
        timer: SC.COOLDOWN * 0.5,
        phase: 0,
        execute: function(boss, dt) {
            var bulletCount = boss.bossPhase >= 2 ? SC.BULLET_COUNT_PHASE2 : SC.BULLET_COUNT;
            var speed = BC.SHOOT_SPEED;
            var damage = boss.damage * BC.SHOOT_DAMAGE_SCALE;

            // Phase 2 子弹加速
            if (boss.bossPhase >= 2) {
                speed *= 1.2;
            }

            for (var i = 0; i < bulletCount; i++) {
                var angle = (i / bulletCount) * Math.PI * 2;
                ArcSurvivors.enemyBullets.push(new ArcSurvivors.EnemyBullet(
                    boss.x, boss.y,
                    angle,
                    speed,
                    damage
                ));
            }
        }
    };
};
