/**
 * bosses/skills/active/stun-roar.js - 眩晕咆哮
 * 预警后全屏眩晕，范围250内的单位眩晕并受到伤害，Phase 2扩大范围
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.stunRoar = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.STUN_ROAR;

    return {
        name: 'stun_roar',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: 0,
        castDuration: SC.WARNING_TIME + 0.3, // 预警 + 爆发
        _phase: 'warning',
        _phaseTimer: 0,
        _roarRadius: 0,
        _alreadyApplied: false,

        onCastStart: function(boss) {
            this._phase = 'warning';
            this._phaseTimer = SC.WARNING_TIME;
            this._roarRadius = boss.bossPhase >= 2 ? SC.RADIUS_PHASE2 : SC.RADIUS;
            this._alreadyApplied = false;
        },

        updateCast: function(boss, dt) {
            this._phaseTimer -= dt;

            if (this._phase === 'warning') {
                // 预警阶段 - 显示蓄力效果
                if (Math.random() < 0.4) {
                    var angle = Math.random() * Math.PI * 2;
                    var dist = Math.random() * this._roarRadius * 0.5;
                    var px = boss.x + Math.cos(angle) * dist;
                    var py = boss.y + Math.sin(angle) * dist;
                    ArcSurvivors.spawnParticles(px, py, 1, 'rgb(255, 200, 100)', 4, 2);
                }

                if (this._phaseTimer <= 0) {
                    this._phase = 'roar';
                    this._applyRoarEffect(boss);
                }
            }
        },

        _applyRoarEffect: function(boss) {
            if (this._alreadyApplied) return;
            this._alreadyApplied = true;

            var player = ArcSurvivors.player;

            // 计算玩家到Boss的距离
            var dx = player.x - boss.x;
            var dy = player.y - boss.y;
            var dist = Math.sqrt(dx * dx + dy * dy);

            // 范围内玩家受到影响
            if (dist <= this._roarRadius) {
                // 造成伤害
                if (player.invulnerableTimer <= 0) {
                    var damage = boss.damage * SC.DAMAGE_SCALE;
                    player.takeDamage(damage);
                }

                // 眩晕效果
                player.invulnerableTimer = Math.max(player.invulnerableTimer, SC.DURATION);

                // 眩晕粒子效果
                ArcSurvivors.spawnParticles(player.x, player.y, 8, 'rgb(255, 200, 100)', 5, 3);
            }

            // 冲击波视觉效果
            for (var i = 0; i < 30; i++) {
                var angle = (i / 30) * Math.PI * 2;
                var px = boss.x + Math.cos(angle) * this._roarRadius;
                var py = boss.y + Math.sin(angle) * this._roarRadius;
                ArcSurvivors.spawnParticles(px, py, 2, 'rgb(255, 200, 50)', 6, 4);
            }

            // 屏幕震动
            ArcSurvivors.screenShake.intensity = 3;
            ArcSurvivors.screenShake.duration = 0.3;
            ArcSurvivors.Audio.hit();
        },

        onCastEnd: function(boss) {
            this._phase = 'warning';
            this._alreadyApplied = false;
        }
    };
};
