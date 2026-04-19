/**
 * bosses/skills/active/knockback.js - 击退
 * 将玩家击退并造成眩晕
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.knockback = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.KNOCKBACK;

    return {
        name: 'knockback',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: 0,
        castDuration: 0.4, // 短暂施法时间

        onCastStart: function(boss) {
            var player = ArcSurvivors.player;

            // 计算Boss到玩家的方向
            var dx = player.x - boss.x;
            var dy = player.y - boss.y;
            var dist = Math.sqrt(dx * dx + dy * dy);

            // 只有在范围内才生效
            if (dist <= SC.EFFECT_RADIUS + player.radius + boss.radius && dist > 0) {
                // 归一化方向
                var dirX = dx / dist;
                var dirY = dy / dist;

                // 击退距离
                var knockbackDistance = SC.FORCE;

                // 应用击退
                player.x += dirX * knockbackDistance;
                player.y += dirY * knockbackDistance;

                // 限制在画布内
                player.x = Math.max(player.radius, Math.min(CFG.CANVAS_WIDTH - player.radius, player.x));
                player.y = Math.max(player.radius, Math.min(CFG.CANVAS_HEIGHT - player.radius, player.y));

                // 造成伤害
                var damage = boss.damage * SC.DAMAGE_SCALE;
                player.takeDamage(damage);

                // 眩晕效果
                player.invulnerableTimer = Math.max(player.invulnerableTimer, SC.STUN_DURATION);

                // 击退特效
                ArcSurvivors.spawnParticles(player.x, player.y, 10, 'rgb(255, 255, 255)', 5, 4);
                ArcSurvivors.screenShake.intensity = 2;
                ArcSurvivors.screenShake.duration = 0.2;
                ArcSurvivors.Audio.hit();
            }
        },

        updateCast: function(boss, dt) {
            // 击退是瞬间效果，不需要持续更新
        },

        onCastEnd: function(boss) {
            // 清理
        }
    };
};
