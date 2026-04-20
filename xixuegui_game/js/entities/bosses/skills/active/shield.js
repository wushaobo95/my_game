/**
 * bosses/skills/active/shield.js - 护盾
 * 生成可吸收伤害的护盾，Phase 2增加持续时间
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.shield = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.SHIELD;

    return {
        name: 'shield',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: SC.PHASE || 0,
        castDuration: 0.3, // 短暂施法
        _shieldActive: false,
        _shieldTimer: 0,
        _maxShieldHp: 0,

        onCastStart: function(boss) {
            var duration = boss.bossPhase >= 2 ? SC.DURATION_PHASE2 : SC.DURATION;

            this._shieldTimer = duration;
            this._maxShieldHp = boss.maxHp * SC.HP_ABSORB;
            boss.shieldHp = this._maxShieldHp;
            boss.shieldActive = true;
            this._shieldActive = true;

            // 护盾生成特效
            ArcSurvivors.spawnParticles(boss.x, boss.y, 15, 'rgb(100, 150, 255)', 6, 3);
            ArcSurvivors.Audio.hit();
        },

        updateCast: function(boss, dt) {
            this._shieldTimer -= dt;

            // 护盾粒子效果
            if (Math.random() < 0.2) {
                var angle = Math.random() * Math.PI * 2;
                var px = boss.x + Math.cos(angle) * boss.radius * 1.2;
                var py = boss.y + Math.sin(angle) * boss.radius * 1.2;
                ArcSurvivors.spawnParticles(px, py, 1, 'rgb(100, 150, 255)', 3, 1);
            }

            // 护盾被打破或时间到
            if (boss.shieldHp <= 0 || this._shieldTimer <= 0) {
                // 护盾破裂特效
                if (boss.shieldHp <= 0) {
                    ArcSurvivors.spawnParticles(boss.x, boss.y, 20, 'rgb(100, 150, 255)', 8, 5);
                }
                this._deactivateShield(boss);
            }
        },

        onCastEnd: function(boss) {
            this._deactivateShield(boss);
        },

        _deactivateShield: function(boss) {
            boss.shieldHp = 0;
            boss.shieldActive = false;
            this._shieldActive = false;
        }
    };
};
