/**
 * entities/bosses/boss-default.js - 默认Boss
 * 根据等级自动装配技能
 *
 * BossRegistry: 管理所有Boss类型的创建
 */
var ArcSurvivors = ArcSurvivors || {};

// ============================================================
// 默认Boss构造函数
// ============================================================
ArcSurvivors.BossDefault = function(x, y) {
    var BC = ArcSurvivors.GAME_CONFIG.ENEMY_TYPES.boss;

    ArcSurvivors.BossBase.call(this, x, y, BC);

    // 使用boss序号作为解锁条件，而非玩家等级
    var bossIndex = ArcSurvivors.BossRegistry.spawnCount;
    var AC = ArcSurvivors.GAME_CONFIG.BOSS_SKILLS.ACTIVE;
    var PC = ArcSurvivors.GAME_CONFIG.BOSS_SKILLS.PASSIVE;

    // 主动技能：根据boss序号解锁
    if (bossIndex >= AC.BULLET_STORM.UNLOCK_LEVEL) {
        this.addSkill(ArcSurvivors.Skills.Active.bulletStorm());
    }
    if (bossIndex >= AC.HOMING_MISSILES.UNLOCK_LEVEL) {
        this.addSkill(ArcSurvivors.Skills.Active.homingMissiles());
    }
    if (bossIndex >= AC.LASER_SWEEP.UNLOCK_LEVEL) {
        this.addSkill(ArcSurvivors.Skills.Active.laserSweep());
    }
    if (bossIndex >= AC.CHARGE.UNLOCK_LEVEL) {
        this.addSkill(ArcSurvivors.Skills.Active.charge());
    }

    // 被动技能：根据boss序号解锁
    if (bossIndex >= PC.DAMAGE_REDUCTION.UNLOCK_LEVEL) {
        ArcSurvivors.Skills.Passive.damageReduction(this);
    }
};

ArcSurvivors.BossDefault.prototype = Object.create(ArcSurvivors.BossBase.prototype);
ArcSurvivors.BossDefault.prototype.constructor = ArcSurvivors.BossDefault;

// ============================================================
// Boss注册表
// ============================================================
ArcSurvivors.BossRegistry = {
    types: {
        'default': ArcSurvivors.BossDefault
    },
    spawnCount: 0,

    register: function(name, bossConstructor) {
        this.types[name] = bossConstructor;
    },

    create: function(name, x, y) {
        this.spawnCount++;
        var BossType = this.types[name];
        if (BossType) {
            return new BossType(x, y);
        }
        return new ArcSurvivors.BossDefault(x, y);
    },

    getTypeNames: function() {
        var names = [];
        for (var key in this.types) {
            if (this.types.hasOwnProperty(key)) {
                names.push(key);
            }
        }
        return names;
    }
};
