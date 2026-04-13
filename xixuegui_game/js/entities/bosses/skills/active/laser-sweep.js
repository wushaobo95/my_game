/**
 * bosses/skills/active/laser-sweep.js - 激光扫射
 * 预警线 → 扫射扇形区域，持续伤害
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.laserSweep = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.LASER_SWEEP;

    return {
        name: 'laser_sweep',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: 0,
        castDuration: SC.WARNING_DURATION + SC.SWEEP_DURATION,

        onCastStart: function(boss) {
            var player = ArcSurvivors.player;
            boss.laserState = 'warning';
            boss.laserTimer = 0;
            // 锁定玩家当前方向作为起始角度
            boss.laserAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
            boss.laserStartAngle = boss.laserAngle;
        },

        updateCast: function(boss, dt) {
            boss.laserTimer += dt;

            if (boss.laserTimer < SC.WARNING_DURATION) {
                // 预警阶段：跟随玩家缓慢转动
                boss.laserState = 'warning';
                var player = ArcSurvivors.player;
                var targetAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
                // 缓慢跟随
                var diff = targetAngle - boss.laserAngle;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;
                boss.laserAngle += diff * 0.02;
            } else {
                // 扫射阶段
                boss.laserState = 'sweeping';
                var sweepTime = boss.laserTimer - SC.WARNING_DURATION;
                var sweepProgress = sweepTime / SC.SWEEP_DURATION;
                var sweepRad = (SC.SWEEP_ANGLE * Math.PI / 180);

                // 从起始角度扫到另一侧
                boss.laserAngle = boss.laserStartAngle - sweepRad / 2 + sweepRad * sweepProgress;

                // 碰撞检测
                var player = ArcSurvivors.player;
                var dx = player.x - boss.x;
                var dy = player.y - boss.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                var playerAngle = Math.atan2(dy, dx);

                // 检查玩家是否在激光范围内
                var angleDiff = playerAngle - boss.laserAngle;
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

                // 激光宽度对应的弧度
                var beamArcRad = Math.atan2(SC.BEAM_WIDTH / 2, dist);

                if (dist < SC.BEAM_LENGTH && Math.abs(angleDiff) < beamArcRad) {
                    var damage = boss.damage * SC.DAMAGE_PER_TICK_SCALE * dt;
                    player.takeDamage(damage);
                }
            }
        },

        onCastEnd: function(boss) {
            boss.laserState = 'idle';
            boss.laserTimer = 0;
        }
    };
};
