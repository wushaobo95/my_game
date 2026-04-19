/**
 * bosses/skills/active/concentric-rings.js - 同心圆波次
 * 从内到外发出多圈同心圆子弹，Phase 2增加圈数
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.concentricRings = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.CONCENTRIC_RINGS;

    return {
        name: 'concentric_rings',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: 0,
        castDuration: (SC.RING_COUNT - 1) * SC.RING_INTERVAL + 0.5,
        _ringsFired: 0,
        _lastRingTime: 0,

        onCastStart: function(boss) {
            this._ringsFired = 0;
            this._lastRingTime = 0;
        },

        updateCast: function(boss, dt) {
            var ringCount = boss.bossPhase >= 2 ? SC.RING_COUNT_PHASE2 : SC.RING_COUNT;

            this._lastRingTime += dt;

            // 按间隔发射每圈
            while (this._lastRingTime >= SC.RING_INTERVAL && this._ringsFired < ringCount) {
                var damage = boss.damage * SC.DAMAGE_SCALE;

                // 圆形均匀分布
                for (var i = 0; i < SC.BULLETS_PER_RING; i++) {
                    var angle = (i / SC.BULLETS_PER_RING) * Math.PI * 2;

                    ArcSurvivors.enemyBullets.push(new ArcSurvivors.EnemyBullet(
                        boss.x, boss.y,
                        angle,
                        SC.SPEED,
                        damage,
                        0, 0  // 非追踪弹
                    ));
                }

                this._ringsFired++;
                this._lastRingTime -= SC.RING_INTERVAL;
            }
        },

        onCastEnd: function(boss) {
            // 清理状态
        }
    };
};
