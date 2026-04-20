/**
 * bosses/skills/active/reflect.js - 反伤
 * 激活反伤状态，反弹部分伤害给玩家，Phase 2提高反弹比例
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.reflect = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.REFLECT;

    return {
        name: 'reflect',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: SC.PHASE || 0,
        castDuration: 0.3, // 短暂施法
        _reflectActive: false,
        _reflectTimer: 0,
        _reflectPercent: 0,

        onCastStart: function(boss) {
            this._reflectTimer = SC.DURATION;
            this._reflectPercent = boss.bossPhase >= 2 ? SC.REFLECT_PERCENT_PHASE2 : SC.REFLECT_PERCENT;

            boss.reflecting = true;
            boss.reflectPercent = this._reflectPercent;
            boss.reflectDamageCap = SC.DAMAGE_CAP;
            this._reflectActive = true;

            // 反伤激活特效
            ArcSurvivors.spawnParticles(boss.x, boss.y, 15, 'rgb(255, 100, 100)', 6, 3);
            ArcSurvivors.Audio.hit();
        },

        updateCast: function(boss, dt) {
            this._reflectTimer -= dt;

            // 反伤状态粒子效果（红色尖刺效果）
            if (Math.random() < 0.3) {
                var angle = Math.random() * Math.PI * 2;
                var px = boss.x + Math.cos(angle) * (boss.radius + 10);
                var py = boss.y + Math.sin(angle) * (boss.radius + 10);
                ArcSurvivors.spawnParticles(px, py, 2, 'rgb(255, 50, 50)', 4, 2);
            }

            if (this._reflectTimer <= 0) {
                this._deactivateReflect(boss);
            }
        },

        onCastEnd: function(boss) {
            this._deactivateReflect(boss);
        },

        _deactivateReflect: function(boss) {
            boss.reflecting = false;
            boss.reflectPercent = 0;
            boss.reflectDamageCap = 0;
            this._reflectActive = false;
        }
    };
};
