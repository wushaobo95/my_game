/**
 * bosses/skills/active/berserk.js - 狂暴
 * Boss进入狂暴状态，提升移速、伤害和攻速，Phase 2增加持续时间
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.berserk = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.BERSERK;

    return {
        name: 'berserk',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: SC.PHASE || 0,
        castDuration: 0.5, // 短暂施法时间
        _isActive: false,
        _originalSpeed: 0,
        _originalDamage: 0,
        _berserkTimer: 0,

        onCastStart: function(boss) {
            // 保存原始属性
            this._originalSpeed = boss.speed;
            this._originalDamage = boss.damage;

            var duration = boss.bossPhase >= 2 ? SC.DURATION_PHASE2 : SC.DURATION;
            this._berserkTimer = duration;
            this._isActive = true;

            // 应用狂暴效果
            boss.speed *= SC.SPEED_MULT;
            boss.damage *= SC.DAMAGE_MULT;
            boss.berserked = true;

            // 狂暴特效
            ArcSurvivors.spawnParticles(boss.x, boss.y, 20, 'rgb(255, 0, 0)', 8, 5);
            ArcSurvivors.Audio.hit();
        },

        updateCast: function(boss, dt) {
            // 狂暴期间持续更新计时器
            this._berserkTimer -= dt;

            // 持续生成红色粒子效果
            if (Math.random() < 0.3) {
                ArcSurvivors.spawnParticles(boss.x, boss.y, 2, 'rgb(255, 0, 0)', 4, 2);
            }

            if (this._berserkTimer <= 0) {
                // 狂暴结束，恢复属性
                boss.speed = this._originalSpeed;
                boss.damage = this._originalDamage;
                boss.berserked = false;
                this._isActive = false;
            }
        },

        onCastEnd: function(boss) {
            // 确保狂暴状态被清理
            if (this._isActive) {
                boss.speed = this._originalSpeed;
                boss.damage = this._originalDamage;
                boss.berserked = false;
                this._isActive = false;
            }
        }
    };
};
