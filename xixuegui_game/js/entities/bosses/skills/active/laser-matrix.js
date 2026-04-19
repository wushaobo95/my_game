/**
 * bosses/skills/active/laser-matrix.js - 激光矩阵
 * 预警后5条激光围绕Boss旋转扫射，Phase 2增加到7条
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.laserMatrix = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.LASER_MATRIX;

    return {
        name: 'laser_matrix',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: 0,
        castDuration: SC.WARNING_DURATION + SC.SWEEP_DURATION,
        _phase: 'warning',
        _phaseTimer: 0,
        _laserCount: 0,
        _laserAngles: [],
        _sweepProgress: 0,

        onCastStart: function(boss) {
            this._phase = 'warning';
            this._phaseTimer = SC.WARNING_DURATION;
            this._laserCount = boss.bossPhase >= 2 ? SC.LASER_COUNT_PHASE2 : SC.LASER_COUNT;
            this._laserAngles = [];
            this._sweepProgress = 0;

            // 初始化激光角度（均匀分布）
            for (var i = 0; i < this._laserCount; i++) {
                this._laserAngles.push((i / this._laserCount) * Math.PI * 2);
            }

            // 保存到boss对象供draw使用
            boss.laserMatrixActive = true;
            boss.laserMatrixAngles = this._laserAngles;
            boss.laserMatrixPhase = 'warning';
        },

        updateCast: function(boss, dt) {
            this._phaseTimer -= dt;

            if (this._phase === 'warning') {
                // 预警阶段 - 激光角度缓慢旋转
                for (var i = 0; i < this._laserAngles.length; i++) {
                    this._laserAngles[i] += SC.ROTATION_SPEED * 0.1 * dt;
                }
                boss.laserMatrixAngles = this._laserAngles;

                // 预警视觉效果
                if (Math.random() < 0.3) {
                    for (var j = 0; j < this._laserAngles.length; j++) {
                        var dist = Math.random() * 100;
                        var px = boss.x + Math.cos(this._laserAngles[j]) * dist;
                        var py = boss.y + Math.sin(this._laserAngles[j]) * dist;
                        ArcSurvivors.spawnParticles(px, py, 1, 'rgba(255, 50, 50, 0.5)', 3, 1);
                    }
                }

                if (this._phaseTimer <= 0) {
                    this._phase = 'sweeping';
                    this._phaseTimer = SC.SWEEP_DURATION;
                    boss.laserMatrixPhase = 'sweeping';
                    ArcSurvivors.Audio.hit();
                }
            } else if (this._phase === 'sweeping') {
                // 扫射阶段 - 激光旋转并造成伤害
                this._sweepProgress += dt / SC.SWEEP_DURATION;

                // 旋转激光
                for (var k = 0; k < this._laserAngles.length; k++) {
                    this._laserAngles[k] += SC.ROTATION_SPEED * dt;
                }
                boss.laserMatrixAngles = this._laserAngles;

                // 检测碰撞
                this._checkLaserCollisions(boss);

                if (this._phaseTimer <= 0) {
                    // 扫射结束
                    this._deactivate(boss);
                }
            }
        },

        _checkLaserCollisions: function(boss) {
            var player = ArcSurvivors.player;
            var damage = boss.damage * SC.DAMAGE_PER_TICK_SCALE;

            for (var i = 0; i < this._laserAngles.length; i++) {
                var angle = this._laserAngles[i];

                // 计算玩家到激光线的距离
                var laserEndX = boss.x + Math.cos(angle) * SC.BEAM_LENGTH;
                var laserEndY = boss.y + Math.sin(angle) * SC.BEAM_LENGTH;

                // 使用点到线距离公式
                var dist = this._pointToLineDistance(
                    player.x, player.y,
                    boss.x, boss.y,
                    laserEndX, laserEndY
                );

                // 如果在激光范围内且无敌时间已过
                if (dist <= SC.BEAM_WIDTH / 2 + player.radius && player.invulnerableTimer <= 0) {
                    // 检查玩家是否在激光的前方（从Boss向外）
                    var dx = player.x - boss.x;
                    var dy = player.y - boss.y;
                    var playerDist = Math.sqrt(dx * dx + dy * dy);
                    var playerAngle = Math.atan2(dy, dx);

                    // 标准化角度差
                    var angleDiff = playerAngle - angle;
                    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

                    if (Math.abs(angleDiff) < 0.1) {
                        player.takeDamage(damage);
                        // 激光击中特效
                        ArcSurvivors.spawnParticles(player.x, player.y, 2, 'rgb(255, 100, 100)', 3, 2);
                    }
                }
            }
        },

        _pointToLineDistance: function(px, py, x1, y1, x2, y2) {
            var A = px - x1;
            var B = py - y1;
            var C = x2 - x1;
            var D = y2 - y1;

            var dot = A * C + B * D;
            var lenSq = C * C + D * D;
            var param = -1;

            if (lenSq !== 0) {
                param = dot / lenSq;
            }

            var xx, yy;

            if (param < 0) {
                xx = x1;
                yy = y1;
            } else if (param > 1) {
                xx = x2;
                yy = y2;
            } else {
                xx = x1 + param * C;
                yy = y1 + param * D;
            }

            var dx = px - xx;
            var dy = py - yy;

            return Math.sqrt(dx * dx + dy * dy);
        },

        onCastEnd: function(boss) {
            this._deactivate(boss);
        },

        _deactivate: function(boss) {
            boss.laserMatrixActive = false;
            boss.laserMatrixAngles = [];
            boss.laserMatrixPhase = 'idle';
            this._phase = 'warning';
        }
    };
};
