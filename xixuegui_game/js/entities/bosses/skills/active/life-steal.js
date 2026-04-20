/**
 * bosses/skills/active/life-steal.js - 吸血攻击
 * Boss进入吸血状态，造成伤害时恢复自身生命
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.lifeSteal = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.LIFE_STEAL;

    return {
        name: 'life_steal',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: SC.PHASE || 0,
        castDuration: SC.DURATION,
        _isActive: false,
        _stealTimer: 0,
        _healPercent: 0,

        onCastStart: function(boss) {
            var duration = boss.bossPhase >= 2 ? SC.DURATION_PHASE2 : SC.DURATION;
            this._healPercent = boss.bossPhase >= 2 ? SC.HEAL_PERCENT_PHASE2 : SC.HEAL_PERCENT;
            
            this._stealTimer = duration;
            this._isActive = true;
            
            boss.lifeStealActive = true;
            boss.lifeStealPercent = this._healPercent;
            
            // 攻速提升
            if (boss.attackCooldown) {
                boss.originalAttackCooldown = boss.attackCooldown;
                boss.attackCooldown *= SC.ATTACK_SPEED_BONUS;
            }
            
            // 吸血状态特效
            ArcSurvivors.spawnParticles(boss.x, boss.y, 15, 'rgb(180, 0, 0)', 6, 3);
            ArcSurvivors.Audio.hit();
        },

        updateCast: function(boss, dt) {
            this._stealTimer -= dt;
            
            // 吸血粒子效果（红色血滴）
            if (Math.random() < 0.4) {
                var angle = Math.random() * Math.PI * 2;
                var dist = Math.random() * boss.radius;
                var px = boss.x + Math.cos(angle) * dist;
                var py = boss.y + Math.sin(angle) * dist;
                ArcSurvivors.spawnParticles(px, py, 1, 'rgb(200, 0, 0)', 3, 1);
            }
            
            if (this._stealTimer <= 0) {
                this._deactivate(boss);
            }
        },

        onCastEnd: function(boss) {
            this._deactivate(boss);
        },

        _deactivate: function(boss) {
            boss.lifeStealActive = false;
            
            // 恢复攻速
            if (boss.originalAttackCooldown) {
                boss.attackCooldown = boss.originalAttackCooldown;
                boss.originalAttackCooldown = null;
            }
            
            this._isActive = false;
        }
    };
};

// 处理吸血（在Boss造成伤害时调用）
ArcSurvivors.processLifeSteal = function(boss, damageDealt) {
    if (!boss.lifeStealActive || !boss.lifeStealPercent) return;
    
    var healAmount = damageDealt * boss.lifeStealPercent;
    var oldHp = boss.hp;
    boss.hp = Math.min(boss.maxHp, boss.hp + healAmount);
    
    var actualHeal = boss.hp - oldHp;
    if (actualHeal > 0) {
        // 吸血特效
        ArcSurvivors.spawnParticles(boss.x, boss.y, 3, 'rgb(255, 0, 100)', 4, 2);
        
        // 可以在这里添加治疗数字显示
        console.log('Boss吸血: +' + Math.floor(actualHeal));
    }
};
