/**
 * entities/bosses/boss-default.js - 默认Boss
 * 根据等级自动装配技能
 *
 * BossRegistry: 管理所有Boss类型的创建
 */
var ArcSurvivors = ArcSurvivors || {};

// ============================================================
// Boss技能配置表 - 每个Boss的独特技能组合
// ============================================================
ArcSurvivors.BOSS_SKILL_CONFIGS = [
    // Boss 1: 绒角羚兽 - 基础
    { skills: ['bulletStorm', 'homingMissiles'] },
    // Boss 2: 雪山灵狐 - 敏捷
    { skills: ['spiralBarrage', 'homingScatter', 'teleport'] },
    // Boss 3: 沐光仙鹿 - 辅助
    { skills: ['bulletStorm', 'auraBuff'] },
    // Boss 4: 云翼苍鹰 - 速度
    { skills: ['focusFire', 'scatterShot', 'chainLightning'] },
    // Boss 5: 翠鳞幽蛇 - 持续伤害
    { skills: ['poisonFog', 'iceBreath'] },
    // Boss 6: 荒林顽豚 - 坦克+dot
    { skills: ['shield', 'rockArmor', 'poisonFog'] },
    // Boss 7: 风原狂狼 - 领袖（分裂型）
    { skills: ['splitBoss', 'auraBuff', 'berserk'] },
    // Boss 8: 驰风骏驹 - 速度
    { skills: ['spiralBarrage', 'charge'] },
    // Boss 9: 岩脊蛮牛 - 力量
    { skills: ['charge', 'knockback', 'rockArmor'] },
    // Boss 10: 暗夜疾豹 - 爆发
    { skills: ['focusFire', 'homingScatter', 'teleport', 'darknessField'] },
    // Boss 11: 渊水巨鳄 - 控制
    { skills: ['iceBreath', 'knockback', 'scatterShot', 'timeSlow'] },
    // Boss 12: 深林绒熊 - 坦克
    { skills: ['stunRoar', 'reflect', 'berserk'] },
    // Boss 13: 金鬃狮灵 - 领袖
    { skills: ['summonElites', 'laserMatrix', 'auraBuff'] },
    // Boss 14: 烈风玄虎 - 爆发
    { skills: ['stunRoar', 'berserk', 'charge', 'lifeSteal'] },
    // Boss 15: 磐岩犀兽 - 坦克+爆发
    { skills: ['shield', 'reflect', 'berserk'] },
    // Boss 16: 古森巨象 - 终极
    { skills: ['laserMatrix', 'concentricRings', 'iceBreath', 'splitShot', 'timeSlow'] }
];

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

    // 获取该Boss的专属技能配置
    var skillConfig = ArcSurvivors.BOSS_SKILL_CONFIGS[(bossIndex - 1) % 16];

    if (skillConfig && skillConfig.skills) {
        // 装配专属技能
        for (var i = 0; i < skillConfig.skills.length; i++) {
            var skillName = skillConfig.skills[i];
            if (ArcSurvivors.Skills.Active[skillName]) {
                this.addSkill(ArcSurvivors.Skills.Active[skillName]());
            }
        }
    }

    // 被动技能：根据boss序号解锁（所有Boss通用）
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
