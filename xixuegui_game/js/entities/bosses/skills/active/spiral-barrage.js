/**
 * bosses/skills/active/spiral-barrage.js - 螺旋弹幕
 * 发射螺旋状向外扩散的弹幕，Phase 2增加子弹数量
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.spiralBarrage = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.SPIRAL_BARRAGE;

    return {
        name: 'spiral_barrage',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: 0,
        castDuration: SC.DURATION,
        _elapsed: 0,
        _bullets: [],

        onCastStart: function(boss) {
            var bulletCount = boss.bossPhase >= 2 ? SC.BULLET_COUNT_PHASE2 : SC.BULLET_COUNT;
            this._elapsed = 0;
            this._bullets = [];

            // 创建螺旋子弹，每个带有初始角度偏移
            for (var i = 0; i < bulletCount; i++) {
                var baseAngle = (i / bulletCount) * Math.PI * 2;
                var bullet = {
                    angle: baseAngle,
                    speed: SC.BULLET_SPEED,
                    spawned: false
                };
                this._bullets.push(bullet);
            }
        },

        updateCast: function(boss, dt) {
            this._elapsed += dt;
            var damage = boss.damage * SC.DAMAGE_SCALE;

            // 每帧更新并发射螺旋子弹
            for (var i = 0; i < this._bullets.length; i++) {
                var bullet = this._bullets[i];

                // 螺旋旋转
                bullet.angle += SC.SPIRAL_SPEED * dt;

                // 发射未生成的子弹
                if (!bullet.spawned) {
                    ArcSurvivors.enemyBullets.push(new ArcSurvivors.EnemyBullet(
                        boss.x, boss.y,
                        bullet.angle,
                        bullet.speed,
                        damage,
                        0, 0  // 非追踪弹
                    ));
                    bullet.spawned = true;
                }
            }
        },

        onCastEnd: function(boss) {
            this._bullets = [];
        }
    };
};
