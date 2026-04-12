/**
 * core/config.js - 游戏常量、配置与全局状态
 */
var ArcSurvivors = ArcSurvivors || {};

// ============================================================
// 游戏配置 - 所有可调数值集中管理
// ============================================================
ArcSurvivors.GAME_CONFIG = {
    // 画布
    CANVAS_WIDTH: 1280,
    CANVAS_HEIGHT: 720,

    // 玩家基础属性
    PLAYER: {
        RADIUS: 20,
        HP: 100,
        SPEED: 5,
        ATTACK_POWER: 12,
        ATTACK_COOLDOWN: 0.4,
        BULLET_SPEED: 8,
        BULLET_SIZE: 8,
        BULLET_PENETRATION: 1,
        PICKUP_RANGE: 160,
        BASE_EXP_TO_LEVEL: 80,
        EXP_GROWTH_RATE: 1.5,
        INVULNERABLE_DURATION: 0.5,
        RUNE_ROTATE_SPEED: 2,
        PULSE_DECAY_SPEED: 3,
        PULSE_RADIUS_EXTRA: 30,
        PROJECTILE_SPREAD_ANGLE: 15,  // 度
        PROJECTILE_DAMAGE_DECAY: 0.9,  // 额外投射物伤害衰减
        COLORS: {
            INNER: '#6633ff',
            OUTER: '#3311aa',
            RUNE: '#9966ff',
            RUNE_WIDTH: 3
        }
    },

    // 敌人类型配置
    ENEMY_TYPES: {
        normal: {
            RADIUS: 15,
            SPEED: 2.5,
            HP_BASE: 15,
            HP_SCALE: 12,
            DAMAGE: 5,
            COLOR: '#ff4444',
            SHAPE: 'circle'
        },
        fast: {
            RADIUS: 12,
            SPEED: 3.8,
            HP_BASE: 8,
            HP_SCALE: 6,
            DAMAGE: 8,
            COLOR: '#ffff44',
            SHAPE: 'triangle'
        },
        split: {
            RADIUS: 20,
            SPEED: 1.8,
            HP_BASE: 25,
            HP_SCALE: 18,
            DAMAGE: 12,
            COLOR: '#44ff44',
            SHAPE: 'diamond',
            CAN_SPLIT: true
        },
        mini: {
            RADIUS: 10,
            SPEED: 3,
            HP_BASE: 8,
            HP_SCALE: 0,
            DAMAGE: 4,
            COLOR: '#44ff44',
            SHAPE: 'diamond'
        },
        ranged: {
            RADIUS: 14,
            SPEED: 1.5,
            HP_BASE: 12,
            HP_SCALE: 8,
            DAMAGE: 6,
            COLOR: '#ff8800',
            SHAPE: 'square',
            SHOOT_INTERVAL: 2.5,
            SHOOT_SPEED: 4,
            SHOOT_RANGE: 300,
            SHOOT_DAMAGE_SCALE: 0.5
        },
        boss: {
            RADIUS: 40,
            SPEED: 1.5,
            HP_BASE: 200,
            HP_SCALE: 200,
            DAMAGE: 25,
            COLOR: '#ff00ff',
            SHAPE: 'boss',
            SHOOT_INTERVAL: 2,
            LOW_HP_THRESHOLD: 0.3,     // 低血量阈值比例
            LOW_HP_SPEEDUP: 0.5,       // 低血量射速倍率
            SHOOT_COUNT: 3,            // 弹幕数
            SHOOT_SPREAD: 0.3,         // 散射角度
            SHOOT_SPEED: 4,            // 子弹速度
            SHOOT_DAMAGE_SCALE: 0.6,   // 子弹伤害比例
            GEM_COUNT: 8,              // 掉落宝石数
            GEM_DIST_MIN: 20,          // 宝石散落最小距离
            GEM_DIST_MAX: 50,          // 宝石散落最大距离
            EXP_REWARD: 200,           // 击杀经验
            DEATH_PARTICLES: 30,       // 死亡粒子数
            DEATH_PARTICLE_SIZE: 10,
            DEATH_PARTICLE_SPEED: 8,
            SHAKE_INTENSITY: 3,
            SHAKE_DURATION: 0.3,
            HITSTOP_FRAMES: 5,
            LARGE_GEM_CHANCE: 0.25,    // 大宝石掉率
            EXTRA_GEM_CHANCE: 0.4,     // 额外宝石掉率
            REVIVE_STONE_CHANCE: 0.15  // 复活石掉率15%
        }
    },

    // 生成系统
    SPAWN: {
        BASE_RATE: 1.5,               // 基础生成速率
        RATE_INCREASE_INTERVAL: 10,   // 加速间隔(秒)
        RATE_INCREASE_AMOUNT: 0.7,    // 每次加速量
        MAX_RATE: 6,                  // 最大生成速率
        SPAWN_OFFSET: 30,             // 屏幕外偏移
        FAST_ENEMY_TIME: 10,          // fast敌人出现时间
        FAST_ENEMY_CHANCE: 0.25,      // fast敌人概率
        SPLIT_ENEMY_TIME: 20,         // split敌人出现时间
        SPLIT_ENEMY_CHANCE: 0.2,      // split敌人概率
        RANGED_ENEMY_TIME: 25,        // ranged敌人出现时间
        RANGED_ENEMY_CHANCE: 0.15,    // ranged敌人概率
        BATCH_INTERVAL: 8,            // 批量生成间隔
        BATCH_COUNT_BASE: 3,          // 批量基础数量
        BATCH_COUNT_SCALE: 20,        // 批量数量增长间隔
        BATCH_OFFSET_MIN: 30,         // 批量偏移最小
        BATCH_OFFSET_MAX: 50,         // 批量偏移最大
        BOSS_INTERVAL: 45,            // Boss刷新间隔
        BOSS_MIN_TIME: 30,            // Boss最早出现时间
        BOSS_WARNING_DURATION: 1500,  // Boss警告持续时间
        BOSS_OFFSET: 50               // Boss出现偏移
    },

    // 子弹系统
    BULLET: {
        TRAIL_LENGTH: 10,
        TRAIL_SIZE_SCALE: 0.5,
        TRAIL_ALPHA_SCALE: 0.5,
        COLORS: {
            CORE: '#ffffff',
            MID: '#9966ff',
            OUTER: '#6633ff',
            TRAIL: 'rgba(100, 50, 255, {alpha})'
        }
    },

    // 激光系统
    LASER: {
        LENGTH: 2000,
        LIFETIME: 0.2,
        HITSTOP_FRAMES: 3,
        COLORS: {
            OUTER: '#ff00ff',
            OUTER_WIDTH: 5,
            CORE: '#ffffff',
            CORE_WIDTH: 2
        }
    },

    // 经验宝石
    GEM: {
        LARGE_VALUE: 50,
        SMALL_VALUE: 15,
        LARGE_COLOR: '#aa44ff',
        SMALL_COLOR: '#4488ff',
        LARGE_RADIUS: 10,
        SMALL_RADIUS: 6,
        ATTRACT_SPEED: 5,
        LINE_WIDTH: 1,
        BORDER_COLOR: '#ffffff'
    },

    // 道具拾取
    ITEM_PICKUP: {
        RADIUS: 15,
        BOB_HEIGHT: 5,
        BOB_SPEED: 3,
        PARTICLE_COUNT: 15,
        PARTICLE_SIZE: 5,
        PARTICLE_SPEED: 4,
        GLOW_COLOR: '#ffcc00',
        GLOW_BLUR: 20,
        ICON_FONT_SIZE: 24,
        BORDER_WIDTH: 2
    },

    // 粒子系统
    PARTICLE: {
        MAX_COUNT: 300
    },

    // 冰霜效果
    FROST: {
        SLOW_FACTOR: 0.5,
        SLOW_DURATION: 1.5,
        FROST_COLOR: 'rgba(136, 255, 255, 0.3)',
        FROST_RADIUS_EXTRA: 5,
        SLOW_COLOR: 'rgba(136, 255, 255, 0.2)',
        SLOW_RADIUS_EXTRA: 3,
        PARTICLE_CHANCE: 0.1
    },

    // 升级时效果
    UPGRADE_EFFECT: {
        PULSE_STRENGTH: 1,
        SLOW_FACTOR: 0.5,
        SLOW_DURATION: 200,
        SLOW_RECOVERY: 2
    },

    // 受击效果
    HIT_EFFECTS: {
        SCREEN_SHAKE_INTENSITY: 0.5,
        SCREEN_SHAKE_DURATION: 0.1,
        NORMAL_SHAKE_INTENSITY: 0.5,
        NORMAL_SHAKE_DURATION: 0.05
    },

    // 状态面板更新间隔
    PANEL_UPDATE_INTERVAL: 0.2,

    // 难度系统
    DIFFICULTY: {
        BASE: 1,
        INCREASE_INTERVAL: 45,
        INCREASE_AMOUNT: 0.2
    },

    // 最大帧间隔
    MAX_DT: 0.05,

    // 渲染配置
    RENDERER: {
        UI_BAR_HEIGHT: 40,
        HP_BAR: {
            X: 10,
            Y: 8,
            WIDTH: 200,
            HEIGHT: 20,
            BG_COLOR: '#333',
            BORDER_COLOR: '#666',
            GRADIENT_START: '#ff4444',
            GRADIENT_END: '#ff8888'
        },
        EXP_BAR: {
            X: 220,
            Y: 8,
            WIDTH: 200,
            HEIGHT: 20,
            BG_COLOR: '#333',
            BORDER_COLOR: '#666',
            GRADIENT_START: '#4444ff',
            GRADIENT_END: '#aa44ff'
        },
        TEXT: {
            FONT: '14px sans-serif',
            COLOR: '#ffffff',
            LEVEL_X: 430,
            LEVEL_Y: 24,
            KILLS_X: 500,
            KILLS_Y: 24,
            TIME_X: 600,
            TIME_Y: 24
        },
        BACKGROUND: {
            COLOR: '#0a0a15',
            GRID_COLOR: 'rgba(50, 50, 100, 0.3)',
            GRID_SIZE: 50
        },
        UI_OVERLAY: {
            COLOR: 'rgba(0, 0, 0, 0.5)'
        },
        DANGER_WARNING: {
            PULSE_SPEED: 10,
            PULSE_MIN: 0.3,
            PULSE_MAX: 0.8,
            MARGIN: 10,
            SAFE_MARGIN: 100,
            RADIUS: 8,
            COLOR: 'rgba(255, 0, 0, {alpha})'
        },
        HIT_OVERLAY: {
            FLASH_SPEED: 50,
            MAX_ALPHA: 0.3,
            COLOR: 'rgba(255, 0, 0, {alpha})'
        },
        BOSS: {
            INNER_RADIUS_SCALE: 0.5,
            INNER_COLOR: '#000',
            INNER_BORDER: '#ff88ff',
            EYE_OFFSET_X: 12,
            EYE_OFFSET_Y: 5,
            EYE_RADIUS: 6,
            EYE_COLOR: '#ff0000',
            HP_BAR_SCALE: 2.5,
            HP_BAR_HEIGHT: 8,
            HP_BAR_OFFSET_Y: 20,
            HP_BG_COLOR: '#333',
            HP_FILL_COLOR: '#ff0044',
            HP_BORDER_COLOR: '#fff',
            NAME_COLOR: '#ff88ff',
            NAME_FONT: 'bold 12px sans-serif',
            NAME_LABEL: 'BOSS'
        },
        ENEMY_HP_BAR: {
            OFFSET_Y: 10,
            HEIGHT: 5,
            BG_COLOR: '#333',
            FILL_COLOR: '#ff4444'
        },
        SHADOW_BLUR: 10,
        LINE_WIDTH: 2
    },

    // 音频配置
    AUDIO: {
        MASTER_VOLUME: 0.5,
        BGM_VOLUME: 0.3,
        SFX_VOLUME: 0.6,
        NOISE_FILTER_FREQ: 800,
        BGM: {
            DRONE_FREQ: 55,
            DRONE2_FREQ: 82.5,
            BEAT_FREQ1: 40,
            BEAT_VOL1: 0.15,
            BEAT_WAVE1: 'sine',
            BEAT_GAIN1: 0.25,
            BEAT_FREQ2: 60,
            BEAT_VOL2: 0.1,
            BEAT_WAVE2: 'square',
            BEAT_GAIN2: 0.05,
            MELODY: [220, 247, 262, 294, 330, 294, 262, 247],
            MELODY_VOL: 0.3,
            MELODY_WAVE: 'triangle',
            MELODY_GAIN: 0.06
        }
    },

    // 升级系统
    UPGRADES: {
        ATTACK_POWER_BONUS: 8,
        ATTACK_SPEED_BONUS: 0.97,
        ATTACK_SPEED_LIMIT: 0.5,      // 相对于基础值的极限
        BULLET_SPEED_BONUS: 1.05,
        BULLET_SPEED_LIMIT: 1.5,
        MAX_HP_BONUS: 10,
        MOVE_SPEED_BONUS: 1.05,
        MOVE_SPEED_LIMIT: 1.5,
        MAX_EXTRA_PROJECTILES: 5,
        REGEN_RATE_BONUS: 1,
        PICKUP_RANGE_BONUS: 1.4,
        CRITICAL_CHANCE_BONUS: 0.1,    // 暴击率每次升级增加10%
        CRITICAL_MAX: 0.5,            // 暴击率上限50%
        LIGHTNING_CHAIN_BONUS: 1,     // 闪电链每次升级增加1个连锁数
        LIGHTNING_CHAIN_MAX: 5,       // 闪电链最大连锁数
        UPGRADE_CHOICES: 3
    },

    // 吸血鬼面具
    VAMPIRE_MASK: {
        HEAL_AMOUNT: 1
    },
    
    // 闪电连锁
    LIGHTNING_CHAIN: {
        MAX_CHAINS: 5,           // 最大连锁数
        CHAIN_RANGE: 100,        // 连锁范围
        DAMAGE_SCALE: 0.5,       // 连锁伤害比例
        PARTICLE_COUNT: 3,       // 连锁粒子数
        PARTICLE_SIZE: 3,        // 粒子大小
        PARTICLE_SPEED: 2        // 粒子速度
    },
    
    // 复活石
    REVIVE_STONE: {
        HEAL_PERCENT: 0.5,       // 复活时恢复生命百分比
        INVULNERABLE_DURATION: 2, // 复活后无敌时间(秒)
        PARTICLE_COUNT: 20,      // 复活粒子数
        PARTICLE_SIZE: 6,        // 粒子大小
        PARTICLE_SPEED: 5        // 粒子速度
    },

    // 爆炸火花
    KILL_EXPLOSION: {
        RADIUS: 60,
        DAMAGE_SCALE: 0.5,
        PARTICLE_COUNT: 10
    },

    // 随机临时道具
    BUFF_ITEMS: {
        DROP_CHANCE: 0.05,           // 5%掉落概率
        PICKUP_RADIUS: 25,           // 拾取范围
        ICON_SIZE: 20,               // 图标大小
        GLOW_COLOR: '#ffcc00',       // 发光颜色
        GLOW_BLUR: 15,               // 发光模糊
        PARTICLE_COUNT: 10,          // 拾取粒子数
        PARTICLE_SIZE: 4,            // 粒子大小
        PARTICLE_SPEED: 3,           // 粒子速度
        TYPES: {
            bomb: {
                DAMAGE: 500,         // 全屏伤害
                COLOR: '#ff4400'     // 炸弹颜色
            },
            ice: {
                DURATION: 5,         // 冻结持续时间(秒)
                COLOR: '#88ffff'     // 冰块颜色
            },
            shield: {
                DURATION: 10,        // 护盾持续时间(秒)
                COLOR: '#00ff88'     // 护盾颜色
            },
            rage: {
                DURATION: 5,         // 狂暴持续时间(秒)
                ATTACK_MULT: 2,      // 攻击力倍率
                SPEED_MULT: 2,       // 攻速倍率
                COLOR: '#ff00ff'     // 狂暴颜色
            }
        }
    }
};

// ============================================================
// 文案配置 - 支持 {变量} 格式化
// ============================================================
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

    // 道具名称和描述
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
        ITEMS_TITLE: '道具',
        INSTRUCTIONS: 'WASD 移动 | 自动攻击 | ESC 暂停 | R 重置',
        BOSS_WARNING: 'BOSS 来袭',
        NO_SKILLS: '暂未获得',
        NO_ITEMS: '暂未获得',
        MAXED_LABEL: '[已满级]',
        ITEM_LABEL: '道具',
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
        PICKUP_RANGE: '拾取范围'
    },

    // 随机临时道具文案
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

// ============================================================
// 工具函数：格式化文案
// ============================================================
ArcSurvivors.formatString = function(template, data) {
    if (!template) return '';
    return template.replace(/\{(\w+)\}/g, function(match, key) {
        return data[key] !== undefined ? data[key] : match;
    });
};

// ============================================================
// 全局状态与实体数组
// ============================================================
ArcSurvivors.CANVAS_WIDTH = ArcSurvivors.GAME_CONFIG.CANVAS_WIDTH;
ArcSurvivors.CANVAS_HEIGHT = ArcSurvivors.GAME_CONFIG.CANVAS_HEIGHT;

ArcSurvivors.gameState = {
    running: true,
    paused: false,
    time: 0,
    kills: 0,
    difficultyFactor: 1
};

ArcSurvivors.keys = {};

ArcSurvivors.player = null;
ArcSurvivors.enemies = [];
ArcSurvivors.bullets = [];
ArcSurvivors.enemyBullets = [];
ArcSurvivors.gems = [];
ArcSurvivors.particles = [];

ArcSurvivors.screenShake = { intensity: 0, duration: 0 };
ArcSurvivors.hitStop = { active: false, frames: 0 };
ArcSurvivors.itemPickups = [];
ArcSurvivors.buffPickups = [];