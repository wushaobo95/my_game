/**
 * bosses/skills/active/homing-missiles.js - 追踪弹幕
 * 发射追踪弹，持续追踪玩家一段时间后变为直线飞行
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.homingMissiles = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.HOMING_MISSILES;

    return {
        name: 'homing_missiles',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: 0,
        execute: function(boss, dt) {
            var player = ArcSurvivors.player;
            var baseAngle = Math.atan2(player.y - boss.y, player.x - boss.x);

            for (var i = 0; i < SC.MISSILE_COUNT; i++) {
                // 扇形散布发射
                var spreadAngle = (i - (SC.MISSILE_COUNT - 1) / 2) * 0.3;
                var angle = baseAngle + spreadAngle;

                ArcSurvivors.enemyBullets.push(new ArcSurvivors.EnemyBullet(
                    boss.x, boss.y,
                    angle,
                    SC.MISSILE_SPEED,
                    boss.damage * 0.5,
                    SC.TRACK_DURATION,
                    SC.TURN_SPEED
                ));
            }
        }
    };
};
