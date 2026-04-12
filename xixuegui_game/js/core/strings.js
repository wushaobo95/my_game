/**
 * core/strings.js - 文案配置，支持 {变量} 格式化
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.STRINGS = {
    // 升级名称和描述
    UPGRADES: {
        1: {
            name: '攻击强化',
            desc: '攻击力+{value}',
            icon: '⚔️'
        },
        2: {
            name: '急速射击',
            desc: '攻击速度+{percent}%',
            icon: '⚡'
        },
        3: {
            name: '弹道加速',
            desc: '子弹速度+{percent}%',
            icon: '💨'
        },
        5: {
            name: '生命强化',
            desc: '最大生命+{value}',
            icon: '❤️'
        },
        7: {
            name: '疾风步',
            desc: '移动速度+{percent}%',
            icon: '👟'
        },
        9: {
            name: '多重射击',
            desc: '额外投射物+1（每个投射物伤害-10%）',
            icon: '🔱'
        },
        10: {
            name: '暴击强化',
            desc: '暴击率+{percent}%（暴击时伤害翻倍）',
            icon: '💥'
        },
        11: {
            name: '闪电链',
            desc: '子弹命中后连锁攻击附近{count}个敌人',
            icon: '⚡'
        }
    },

    // 法宝名称和描述（永久道具）
    ITEMS: {
        101: {
            name: '神秘草药',
            desc: '每秒回复{value}点生命',
            icon: '🌿'
        },
        102: {
            name: '弹射子弹',
            desc: '子弹墙壁弹射{count}次',
            icon: '🧱'
        },
        103: {
            name: '爆炸火花',
            desc: '击杀敌人产生爆炸({percent}%攻击力)',
            icon: '💥'
        },
        104: {
            name: '吸血鬼面具',
            desc: '击杀敌人恢复{value}点生命',
            icon: '🧛'
        },
        105: {
            name: '经验磁力',
            desc: '经验拾取范围+{percent}%',
            icon: '🧲'
        },
        106: {
            name: '冰霜新星',
            desc: '子弹带有减速效果',
            icon: '❄️'
        },
        108: {
            name: '复活石',
            desc: '死亡时自动复活一次，恢复50%生命值',
            icon: '💎'
        }
    },

    // UI 文案
    UI: {
        GAME_TITLE: '弧光幸存者 - 无限模式',
        GAME_OVER_TITLE: '游戏结束',
        FINAL_TIME: '存活时间: {time}s',
        FINAL_KILLS: '击杀数: {kills}',
        FINAL_LEVEL: '等级: {level}',
        RESTART_BTN: '再来一局 (R)',
        PAUSE_TITLE: '暂停',
        RESUME_BTN: '继续游戏 (ESC)',
        STATS_TITLE: '属性',
        SKILLS_TITLE: '技能',
        ITEMS_TITLE: '法宝',
        INSTRUCTIONS: 'WASD 移动 | 自动攻击 | ESC 暂停 | R 重置',
        BOSS_WARNING: 'BOSS 来袭',
        NO_SKILLS: '暂未获得',
        NO_ITEMS: '暂无法宝',
        MAXED_LABEL: '[已满级]',
        ITEM_LABEL: '法宝',
        SKILL_LABEL: '技能',
        MUTE_OFF: '🔇 音乐: 关',
        MUTE_ON: '🔊 音乐: 开',
        LEVEL_PREFIX: 'LV.',
        KILLS_PREFIX: '击杀: ',
        TIME_PREFIX: '存活: ',
        TIME_SUFFIX: 's',
        HP_RECOVERY_SUFFIX: '/s',
        ATTACK_SPEED_SUFFIX: '/s'
    },

    // 属性面板标签
    STATS: {
        ATTACK_POWER: '攻击力',
        ATTACK_SPEED: '攻速',
        BULLET_SPEED: '子弹速度',
        MOVE_SPEED: '移速',
        HP_REGEN: '生命恢复',
        PICKUP_RANGE: '拾取范围',
        CRITICAL: '暴击率'
    },

    // Buff道具文案（临时效果）
    BUFF_ITEMS: {
        bomb: {
            name: '炸弹',
            desc: '对全屏造成{damage}点伤害',
            icon: '💣'
        },
        ice: {
            name: '冰块',
            desc: '冻结全屏敌人{duration}秒',
            icon: '🧊'
        },
        shield: {
            name: '护盾',
            desc: '无敌{duration}秒',
            icon: '🛡️'
        },
        rage: {
            name: '狂暴',
            desc: '攻速和伤害翻倍，持续{duration}秒',
            icon: '🔥'
        }
    }
};
