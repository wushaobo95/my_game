/**
 * bosses/skills/active/ice-breath.js - 冰冻吐息
 * 预警后发射冰霜吐息，击中玩家造成伤害并减速，Phase 2增加宽度
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.iceBreath = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.ICE_BREATH;

    return {
        name: 'ice_breath',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: 0,
        castDuration: SC.WARNING_DURATION + SC.BEAM_DURATION,
        _phase: 'warning', // 'warning' or 'beam'
        _phaseTimer: 0,
        _beamAngle: 0,
        _beamWidth: 0,

        onCastStart: function(boss) {
            var player = ArcSurvivors.player;

            this._phase = 'warning';
            this._phaseTimer = SC.WARNING_DURATION;
            // 锁定朝向玩家的角度
            this._beamAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
            this._beamWidth = boss.bossPhase >= 2 ? SC.BEAM_WIDTH_PHASE2 : SC.BEAM_WIDTH;
        },

        updateCast: function(boss, dt) {
            var player = ArcSurvivors.player;
            this._phaseTimer -= dt;

            if (this._phase === 'warning') {
                // 预警阶段
                if (this._phaseTimer <= 0) {
                    this._phase = 'beam';
                    this._phaseTimer = SC.BEAM_DURATION;
                    ArcSurvivors.Audio.hit();
                }
            } else if (this._phase === 'beam') {
                // 吐息阶段 - 检测碰撞
                this._checkBeamCollision(boss, player);

                // 吐息粒子效果
                if (Math.random() < 0.5) {
                    var dist = Math.random() * SC.BEAM_LENGTH;
                    var angleOffset = (Math.random() - 0.5) * (this._beamWidth / SC.BEAM_LENGTH) * 2;
                    var px = boss.x + Math.cos(this._beamAngle + angleOffset) * dist;
                    var py = boss.y + Math.sin(this._beamAngle + angleOffset) * dist;
                    ArcSurvivors.spawnParticles(px, py, 1, 'rgb(136, 255, 255)', 3, 1);
                }

                if (this._phaseTimer <= 0) {
                    // 吐息结束
                }
            }
        },

        _checkBeamCollision: function(boss, player) {
            // 计算玩家到Boss的距离和角度
            var dx = player.x - boss.x;
            var dy = player.y - boss.y;
            var dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > SC.BEAM_LENGTH) return;

            // 计算玩家相对于吐息方向的角度
            var playerAngle = Math.atan2(dy, dx);
            var angleDiff = playerAngle - this._beamAngle;

            // 标准化角度差到 [-PI, PI]
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

            // 检查是否在扇形范围内
            var halfWidth = Math.atan2(this._beamWidth / 2, dist);
            if (Math.abs(angleDiff) <= halfWidth) {
                // 在吐息范围内，造成伤害和减速
                if (player.invulnerableTimer <= 0) {
                    var damage = boss.damage * SC.DAMAGE_SCALE;
                    player.takeDamage(damage);

                    // 应用减速
                    player.slowed = true;
                    player.slowedTimer = Math.max(player.slowedTimer || 0, SC.SLOW_DURATION);
                    player.speed = player.baseSpeed * SC.SLOW_FACTOR;

                    // 冰冻粒子效果
                    ArcSurvivors.spawnParticles(player.x, player.y, 3, 'rgb(136, 255, 255)', 4, 2);
                }
            }
        },

        onCastEnd: function(boss) {
            this._phase = 'warning';
        }
    };
};
