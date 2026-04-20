/**
 * bosses/skills/active/rock-armor.js - 岩石装甲
 * 激活岩石装甲，减少受到的伤害并减速攻击者，Phase 2提高减伤比例
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.rockArmor = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.ROCK_ARMOR;

    return {
        name: 'rock_armor',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: SC.PHASE || 0,
        castDuration: 0.5, // 施法时间
        _armorActive: false,
        _armorTimer: 0,
        _damageReduction: 0,

        onCastStart: function(boss) {
            this._armorTimer = SC.DURATION;
            this._damageReduction = boss.bossPhase >= 2 ? SC.DAMAGE_REDUCTION_PHASE2 : SC.DAMAGE_REDUCTION;

            boss.rockArmored = true;
            boss.rockArmorReduction = this._damageReduction;
            this._armorActive = true;

            // 岩石装甲生成特效
            for (var i = 0; i < 12; i++) {
                var angle = (i / 12) * Math.PI * 2;
                var px = boss.x + Math.cos(angle) * boss.radius;
                var py = boss.y + Math.sin(angle) * boss.radius;
                ArcSurvivors.spawnParticles(px, py, 3, 'rgb(139, 90, 43)', 5, 2);
            }
            ArcSurvivors.Audio.hit();
        },

        updateCast: function(boss, dt) {
            this._armorTimer -= dt;

            // 岩石装甲粒子效果（棕色碎片）
            if (Math.random() < 0.2) {
                var angle = Math.random() * Math.PI * 2;
                var dist = boss.radius + Math.random() * 5;
                var px = boss.x + Math.cos(angle) * dist;
                var py = boss.y + Math.sin(angle) * dist;
                ArcSurvivors.spawnParticles(px, py, 1, 'rgb(139, 90, 43)', 3, 1);
            }

            if (this._armorTimer <= 0) {
                this._deactivateArmor(boss);
            }
        },

        onCastEnd: function(boss) {
            this._deactivateArmor(boss);
        },

        _deactivateArmor: function(boss) {
            boss.rockArmored = false;
            boss.rockArmorReduction = 0;
            this._armorActive = false;

            // 装甲破裂特效
            ArcSurvivors.spawnParticles(boss.x, boss.y, 15, 'rgb(139, 90, 43)', 6, 3);
        }
    };
};
