/**
 * core/strings.js - 文案配置，支持 {变量} 格式化
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.STRINGS = {
    // 升级名称和描述（卡皮巴拉自然风）
    UPGRADES: {
        1: {
            name: '力量强化',
            desc: '攻击力+{value}',
            icon: '💪'
        },
        2: {
            name: '快速啃咬',
            desc: '攻击速度+{percent}%',
            icon: '🌿'
        },
        3: {
            name: '喷射种子',
            desc: '子弹速度+{percent}%',
            icon: '🌱'
        },
        5: {
            name: '生命强化',
            desc: '最大生命+{value}',
            icon: '❤️'
        },
        7: {
            name: '灵活滚动',
            desc: '移动速度+{percent}%',
            icon: '🐾'
        },
        9: {
            name: '多重喷射',
            desc: '额外投射物+1',
            icon: '🔱'
        },
        10: {
            name: '暴击啃咬',
            desc: '暴击率+{percent}%（暴击时伤害翻倍）',
            icon: '💥'
        },
        11: {
            name: '神锋无影',
            desc: '子弹命中后连锁攻击附近{count}个敌人',
            icon: '⚡'
        },
        12: {
            name: '闪电风暴',
            desc: '每{interval}秒落下{count}道闪电攻击敌人',
            icon: '⛈️'
        },
        13: {
            name: '火球护身',
            desc: '{count}颗火球环绕自身旋转，触碰敌人造成伤害',
            icon: '🔥'
        }
    },

    // 法宝名称和描述（永久道具）- 卡皮巴拉自然风
    ITEMS: {
        101: {
            name: '神奇草药',
            desc: '每秒回复{value}点生命',
            icon: '🌿'
        },
        102: {
            name: '弹跳种子',
            desc: '子弹墙壁弹射{count}次',
            icon: '🌰'
        },
        103: {
            name: '爆裂果实',
            desc: '击杀敌人产生爆炸({percent}%攻击力)',
            icon: '💥'
        },
        104: {
            name: '吸血花蜜',
            desc: '击杀敌人恢复{value}点生命',
            icon: '🍯'
        },
        105: {
            name: '磁力蘑菇',
            desc: '经验拾取范围+{percent}%',
            icon: '🧲'
        },
        106: {
            name: '冰冻露珠',
            desc: '攻击附带减速效果',
            icon: '💧'
        },
        108: {
            name: '复活种子',
            desc: '死亡时自动复活一次，恢复50%生命值',
            icon: '🌱'
        },
        109: {
            name: '昏昏倒地',
            desc: '子弹具有击退效果，将敌人击退{distance}像素',
            icon: '💨'
        },
        110: {
            name: '轻盈羽毛',
            desc: '闪避率+{percent}%',
            icon: '🪶'
        },
        111: {
            name: '破势',
            desc: '对生命值高于{threshold}%的单位，造成额外{bonus}%伤害',
            icon: '🗡️'
        },
        112: {
            name: '心眼',
            desc: '目标每损失{step}%生命值，伤害提升{per_step}%，最高{max}%增伤',
            icon: '👁️'
        },
        114: {
            name: '迅捷爪子',
            desc: '移动速度+{percent}%',
            icon: '🐾'
        },
        115: {
            name: '幸运四叶草',
            desc: '暴击率提升至50%（暴击时伤害翻倍）',
            icon: '🍀'
        }
    },

    // UI 文案 - 卡皮巴拉自然风
    UI: {
        GAME_TITLE: '卡皮巴拉冒险',
        GAME_OVER_TITLE: '游戏结束啦',
        FINAL_TIME: '坚守时间: {time}秒',
        FINAL_KILLS: '打败怪物: {kills}只',
        FINAL_LEVEL: '成长等级: {level}级',
        RESTART_BTN: '再来一局 (R)',
        PAUSE_TITLE: '休息一下',
        RESUME_BTN: '继续游戏 (ESC)',
        STATS_TITLE: '我的能力',
        SKILLS_TITLE: '技能',
        ITEMS_TITLE: '宝物',
        SKILL_CHOICE_TITLE: '选择技能',
        ITEM_CHOICE_TITLE: '选择法宝',
        INSTRUCTIONS: 'WASD 移动 | ESC 暂停',
        BOSS_WARNING: 'BOSS 来袭',
        BOSS_NAMES: [
            '熊猫假面愚者', '棕毛窥魂幼兽', '社畜摸鱼执行官', '橘猫摆烂领主',
            '干饭躺平之王', '熊猫热血狂战士', '赤狐伪笑守护者', '柴犬歪头欺诈师',
            '牛头暴躁督军', '白熊点赞之神', '奶猫怯战幼帝', '金毛已老实囚徒',
            '橘猫大眼惊魂使', '柴犬歪嘴邪尊', '白猫鼻息凝视者', '柴犬假笑霸主', '烈焰凤凰'
        ],
        NO_SKILLS: '还没学会',
        NO_ITEMS: '还没有宝物',
        MAXED_LABEL: '[已满级]',
        ITEM_LABEL: '宝物',
        SKILL_LABEL: '技能',
        MUTE_OFF: '🔇 音乐: 关',
        MUTE_ON: '🔊 音乐: 开',
        LEVEL_PREFIX: 'LV.',
        KILLS_PREFIX: '击败敌人: ',
        TIME_PREFIX: '时间: ',
        TIME_SUFFIX: '秒',
        HP_RECOVERY_SUFFIX: '/秒',
        ATTACK_SPEED_SUFFIX: '/秒',
        ITEM_CHOICE_TITLE: '选择一个宝物',
        ITEM_CHOICE_DESC: '这些宝物可以帮助你更好地保护花园'
    },

    // 属性面板标签 - 卡皮巴拉风格
    STATS: {
        ATTACK_POWER: '攻击力',
        ATTACK_SPEED: '攻速',
        BULLET_SPEED: '子弹速度',
        MOVE_SPEED: '奔跑速度',
        HP_REGEN: '生命恢复',
        PICKUP_RANGE: '拾取范围',
        CRITICAL: '暴击率',
        DODGE: '闪避率'
    },

    // Buff道具文案（临时效果）- 卡皮巴拉自然风
    BUFF_ITEMS: {
        bomb: {
            name: '炸弹',
            desc: '对全屏造成{damage}点伤害',
            icon: '💣'
        },
        ice: {
            name: '冰晶',
            desc: '冻结全屏敌人{duration}秒',
            icon: '❄️'
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
        },
        vortex: {
            name: '吸铁石',
            desc: '快速拾取全屏幕经验宝石',
            icon: '🧲'
        },
        chicken: {
            name: '胡萝卜',
            desc: '恢复最大生命值{percent}%的生命',
            icon: '🥕'
        }
    }
};
