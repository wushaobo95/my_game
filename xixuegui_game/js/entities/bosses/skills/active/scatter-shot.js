/**
 * bosses/skills/active/scatter-shot.js - 散射弹幕
 * 分多波向扇形区域散射弹幕，Phase 2增加波次数
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.scatterShot = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.SCATTER_SHOT;

    return {
        name: 'scatter_shot',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: 0,
        castDuration: (SC.WAVE_COUNT - 1) * SC.WAVE_INTERVAL + 0.5,
        _wavesFired: 0,
        _lastWaveTime: 0,
        _targetAngle: 0,

        onCastStart: function(boss) {
            var player = ArcSurvivors.player;
            this._wavesFired = 0;
            this._lastWaveTime = 0;
            // 记录朝向玩家的角度
            this._targetAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
        },

        updateCast: function(boss, dt) {
            var waveCount = boss.bossPhase >= 2 ? SC.WAVE_COUNT_PHASE2 : SC.WAVE_COUNT;

            this._lastWaveTime += dt;

            // 按间隔发射波次
            while (this._lastWaveTime >= SC.WAVE_INTERVAL && this._wavesFired < waveCount) {
                var damage = boss.damage * SC.DAMAGE_SCALE;
                var spreadAngleRad = SC.SPREAD_ANGLE * Math.PI / 180;
                var startAngle = this._targetAngle - spreadAngleRad / 2;

                // 发射扇形弹幕
                for (var i = 0; i < SC.BULLETS_PER_WAVE; i++) {
                    var angle = startAngle + (i / (SC.BULLETS_PER_WAVE - 1)) * spreadAngleRad;

                    ArcSurvivors.enemyBullets.push(new ArcSurvivors.EnemyBullet(
                        boss.x, boss.y,
                        angle,
                        SC.SPEED,
                        damage,
                        0, 0  // 非追踪弹
                    ));
                }

                this._wavesFired++;
                this._lastWaveTime -= SC.WAVE_INTERVAL;
            }
        },

        onCastEnd: function(boss) {
            // 清理状态
        }
    };
};
