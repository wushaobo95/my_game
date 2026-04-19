/**
 * bosses/skills/active/focus-fire.js - 聚焦弹
 * 快速连续向玩家发射高速子弹，Phase 2增加连发数和缩短间隔
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.focusFire = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.FOCUS_FIRE;

    return {
        name: 'focus_fire',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: 0,
        castDuration: SC.BULLET_COUNT * SC.FIRE_INTERVAL + 0.1,
        _shotsFired: 0,
        _lastFireTime: 0,
        _targetX: 0,
        _targetY: 0,

        onCastStart: function(boss) {
            var player = ArcSurvivors.player;
            this._shotsFired = 0;
            this._lastFireTime = 0;
            // 记录玩家位置作为瞄准目标
            this._targetX = player.x;
            this._targetY = player.y;
        },

        updateCast: function(boss, dt) {
            var bulletCount = boss.bossPhase >= 2 ? SC.BULLET_COUNT_PHASE2 : SC.BULLET_COUNT;
            var fireInterval = boss.bossPhase >= 2 ? SC.FIRE_INTERVAL_PHASE2 : SC.FIRE_INTERVAL;

            this._lastFireTime += dt;

            // 按间隔发射子弹
            while (this._lastFireTime >= fireInterval && this._shotsFired < bulletCount) {
                var damage = boss.damage * SC.DAMAGE_SCALE;

                // 计算瞄准角度（带轻微预判偏移）
                var baseAngle = Math.atan2(this._targetY - boss.y, this._targetX - boss.x);
                var randomOffset = (Math.random() - 0.5) * 0.1; // 轻微随机偏移
                var angle = baseAngle + randomOffset;

                ArcSurvivors.enemyBullets.push(new ArcSurvivors.EnemyBullet(
                    boss.x, boss.y,
                    angle,
                    SC.BULLET_SPEED,
                    damage,
                    0, 0  // 非追踪弹
                ));

                this._shotsFired++;
                this._lastFireTime -= fireInterval;
            }
        },

        onCastEnd: function(boss) {
            // 清理状态
        }
    };
};
