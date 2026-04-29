/**
 * core/game-config.js - 游戏数值配置
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.GAME_CONFIG = {
    // 画布
    CANVAS_WIDTH: 1280,
    CANVAS_HEIGHT: 720,

    // 玩家基础属性
    PLAYER: {
        RADIUS: 35,
        HP: 100,
        SPEED: 5,
        ATTACK_POWER: 50,
        ATTACK_COOLDOWN: 0.4,
        BULLET_SPEED: 8,
        BULLET_SIZE: 8,
        BULLET_PENETRATION: 1,
        PICKUP_RANGE: 160,
        BASE_EXP_TO_LEVEL: 50,
        EXP_GROWTH_RATE: 1.3,
        MAX_EXP_PER_LEVEL: 8000,
        INVULNERABLE_DURATION: 0.5,
        DODGE_CHANCE: 0,
        RUNE_ROTATE_SPEED: 2,
        PULSE_DECAY_SPEED: 3,
        PULSE_RADIUS_EXTRA: 30,
        PROJECTILE_SPREAD_ANGLE: 15,
        PROJECTILE_DAMAGE_DECAY: 1.0,
        COLORS: {
            INNER: '#5d8c3a',
            OUTER: '#3d5c2a',
            RUNE: '#ff8800',
            RUNE_WIDTH: 3
        }
    },

    // 伤害计算配置
    DAMAGE_CONFIG: {
        // 暴击伤害倍数
        CRITICAL_MULTIPLIER: 2.0,
        // 破势法宝配置
        PO_SHI: {
            HP_THRESHOLD: 0.7,  // 生命值阈值
            DAMAGE_BONUS: 0.4   // 额外伤害比例
        },
        // 心眼法宝配置
        XIN_YAN: {
            HP_LOSS_STEP: 0.15,     // 每损失生命值比例
            DAMAGE_PER_STEP: 0.1,   // 每步伤害提升
            MAX_DAMAGE_BONUS: 0.6   // 最高伤害提升
        }
    },

    // 敌人类型配置 - 怪物主题颜色
    ENEMY_TYPES: {
        normal: {
            RADIUS: 15,
            SPEED: 2.3,
            HP_BASE: 15,
            HP_SCALE: 10,
            DAMAGE: 5,
            COLOR: '#8B4513',
            SHAPE: 'circle'
        },
        fast: {
            RADIUS: 15,
            SPEED: 3.8,
            HP_BASE: 8,
            HP_SCALE: 6,
            DAMAGE: 8,
            COLOR: '#556B2F',
            SHAPE: 'triangle'
        },
        split: {
            RADIUS: 15,
            SPEED: 1.8,
            HP_BASE: 25,
            HP_SCALE: 18,
            DAMAGE: 12,
            COLOR: '#228B22',
            SHAPE: 'diamond',
            CAN_SPLIT: true
        },
        mini: {
            RADIUS: 15,
            SPEED: 3,
            HP_BASE: 8,
            HP_SCALE: 0,
            DAMAGE: 4,
            COLOR: '#32CD32',
            SHAPE: 'diamond'
        },
        ranged: {
            RADIUS: 15,
            SPEED: 1.5,
            HP_BASE: 12,
            HP_SCALE: 8,
            DAMAGE: 6,
            COLOR: '#FFD700',
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
            HP_SCALE: 3000,
            DAMAGE: 10,
            COLOR: '#4B0082',
            SHAPE: 'boss',
            SHOOT_INTERVAL: 2.5,
            LOW_HP_THRESHOLD: 0.3,
            LOW_HP_SPEEDUP: 0.5,
            SHOOT_COUNT: 3,
            SHOOT_SPREAD: 0.3,
            SHOOT_SPEED: 4,
            SHOOT_DAMAGE_SCALE: 0.6,
            GEM_COUNT: 12,
            GEM_DIST_MIN: 20,
            GEM_DIST_MAX: 50,
            EXP_REWARD: 300,
            DEATH_PARTICLES: 30,
            DEATH_PARTICLE_SIZE: 10,
            DEATH_PARTICLE_SPEED: 8,
            SHAKE_INTENSITY: 3,
            SHAKE_DURATION: 0.3,
            HITSTOP_FRAMES: 5,
            LARGE_GEM_CHANCE: 0.25,
            EXTRA_GEM_CHANCE: 0.4,
            SUPER_ARMOR: true
        },
        butterfly: {
            RADIUS: 15,
            SPEED: 2.0,
            HP_BASE: 10,
            HP_SCALE: 7,
            DAMAGE: 4,
            COLOR: '#9932CC',
            SHAPE: 'polygon',
            SPECIAL_EFFECT: 'confuse',
            CONFUSE_DURATION: 1.5
        },
        ant: {
            RADIUS: 15,
            SPEED: 2.5,
            HP_BASE: 5,
            HP_SCALE: 4,
            DAMAGE: 3,
            COLOR: '#8B0000',
            SHAPE: 'circle',
            SPECIAL_EFFECT: 'swarm',
            SWARM_COUNT: 6
        },
        ladybug: {
            RADIUS: 15,
            SPEED: 1.5,
            HP_BASE: 20,
            HP_SCALE: 12,
            DAMAGE: 0,
            COLOR: '#DC143C',
            SHAPE: 'circle',
            SPECIAL_EFFECT: 'lucky',
            LARGE_GEM_CHANCE: 1.0,
            DROP_ITEM_CHANCE: 0.5
        },
        cockroach: {
            RADIUS: 15,
            SPEED: 1.8,
            HP_BASE: 18,
            HP_SCALE: 12,
            DAMAGE: 8,
            COLOR: '#4A4A4A',
            SHAPE: 'circle',
            SPECIAL_EFFECT: 'evade',
            EVADE_CHANCE: 0.7
        },
        mantis: {
            RADIUS: 15,
            SPEED: 4.5,
            HP_BASE: 12,
            HP_SCALE: 8,
            DAMAGE: 15,
            COLOR: '#228B22',
            SHAPE: 'triangle',
            SPECIAL_EFFECT: 'charge',
            CHARGE_DAMAGE_SCALE: 1.5
        },
        fly: {
            RADIUS: 15,
            SPEED: 4.0,
            HP_BASE: 4,
            HP_SCALE: 3,
            DAMAGE: 2,
            COLOR: '#1a1a1a',
            SHAPE: 'circle',
            SPECIAL_EFFECT: 'orbit'
        },
        rat: {
            RADIUS: 15,
            SPEED: 2.8,
            HP_BASE: 10,
            HP_SCALE: 7,
            DAMAGE: 5,
            COLOR: '#8B4513',
            SHAPE: 'ellipse'
        },
        dragonfly: {
            RADIUS: 15,
            SPEED: 5.5,
            HP_BASE: 8,
            HP_SCALE: 6,
            DAMAGE: 10,
            COLOR: '#00CED1',
            SHAPE: 'polygon',
            SPECIAL_EFFECT: 'dash',
            DASH_RANGE: 150
        },
        mosquito: {
            RADIUS: 15,
            SPEED: 3.2,
            HP_BASE: 5,
            HP_SCALE: 4,
            DAMAGE: 4,
            COLOR: '#800080',
            SHAPE: 'circle',
            SPECIAL_EFFECT: 'poison',
            POISON_DURATION: 3,
            POISON_DAMAGE: 2
        },
        hedgehog: {
            RADIUS: 15,
            SPEED: 1.2,
            HP_BASE: 30,
            HP_SCALE: 20,
            DAMAGE: 10,
            COLOR: '#8B4513',
            SHAPE: 'circle',
            SPECIAL_EFFECT: 'reflect',
            REFLECT_DAMAGE: 0.3
        },
        gecko: {
            RADIUS: 15,
            SPEED: 2.2,
            HP_BASE: 15,
            HP_SCALE: 10,
            DAMAGE: 6,
            COLOR: '#6B8E23',
            SHAPE: 'polygon',
            SPECIAL_EFFECT: 'escape',
            ESCAPE_HP_RATIO: 0.3,
            ESCAPE_DURATION: 2
        }
    },

    ENEMY_SPAWN_TIME: {
        butterfly: 55,
        ant: 70,
        ladybug: 85,
        rat: 95,
        cockroach: 105,
        mantis: 115,
        fly: 125,
        dragonfly: 135,
        mosquito: 145,
        hedgehog: 160,
        gecko: 175
    },

    ENEMY_SPAWN_CHANCE: {
        butterfly: 0.12,
        ant: 0.1,
        ladybug: 0.05,
        rat: 0.08,
        cockroach: 0.1,
        mantis: 0.08,
        fly: 0.1,
        dragonfly: 0.08,
        mosquito: 0.1,
        hedgehog: 0.08,
        gecko: 0.08
    },

    ENEMY_BOSS_HP_SCALE: 50,
    ENEMY_BOSS_DAMAGE_SCALE: 3,

    ENEMY_LEVEL: {
        SPEED_SCALE_PER_LEVEL: 0.05,
        HP_SCALE_PER_LEVEL: 0.15,
        DAMAGE_SCALE_PER_LEVEL: 0.1
    },

    ENEMY_BUFF_CHANCE: 0.03,

    ENEMY_SPLIT_CHANCE: 0.3,

    ENEMY_TEMPLATES: {
        fast: {
            RADIUS: 15,
            SPEED: 3.8,
            HP_BASE: 5,
            HP_SCALE: 4,
            DAMAGE: 4,
            COLOR: '#800080',
            SHAPE: 'circle',
            SPECIAL_EFFECT: 'poison',
            POISON_DURATION: 3,
            POISON_DAMAGE: 2
        },
        hedgehog: {
            RADIUS: 15,
            SPEED: 1.2,
            HP_BASE: 30,
            HP_SCALE: 20,
            DAMAGE: 10,
            COLOR: '#8B4513',
            SHAPE: 'circle',
            SPECIAL_EFFECT: 'reflect',
            REFLECT_DAMAGE: 0.3
        },
        gecko: {
            RADIUS: 15,
            SPEED: 2.2,
            HP_BASE: 15,
            HP_SCALE: 10,
            DAMAGE: 6,
            COLOR: '#6B8E23',
            SHAPE: 'polygon',
            SPECIAL_EFFECT: 'escape',
            ESCAPE_HP_RATIO: 0.3,
            ESCAPE_DURATION: 2
        }
    },

    // 生成系统
    SPAWN: {
        // 基础刷怪率
        BASE_RATE: 2.25,
        RATE_INCREASE_INTERVAL: 10,
        RATE_INCREASE_AMOUNT: 0.5,
        MAX_RATE: 5,
        SPAWN_OFFSET: 30,
        
        // 分阶段设计
        PHASES: {
            EARLY: { start: 0, end: 60, name: '萌芽期' },
            MID: { start: 60, end: 180, name: '成长期' },
            LATE: { start: 180, end: Infinity, name: '巅峰期' }
        },
        
        // 各阶段解锁的敌人类型
        PHASE_ENEMIES: {
            EARLY: ['fast', 'split', 'ranged'],  // 0-60秒基础敌人
            MID: ['butterfly', 'ant', 'ladybug', 'rat', 'cockroach', 'mantis'],  // 60-180秒
            LATE: ['fly', 'dragonfly', 'mosquito', 'hedgehog', 'gecko']  // 180秒后
        },
        
        // 阶段特殊机制
        PHASE_MECHANICS: {
            EARLY: { batchEnabled: false, swarmEnabled: false },
            MID: { batchEnabled: true, swarmEnabled: true, eliteChance: 0.05 },
            LATE: { batchEnabled: true, swarmEnabled: true, eliteChance: 0.15, superEliteChance: 0.03 }
        },
        
        // 难度软上限 - 超过后转为属性提升
        SOFT_CAP_TIME: 120,
        SOFT_CAP_RATE: 4,
        ATTRIBUTE_SCALE_PER_MINUTE: 0.1,  // 每分钟血量和速度提升10%
        
        // 动态平衡
        DPS_ADJUSTMENT: {
            ENABLED: true,
            CHECK_INTERVAL: 10,  // 每10秒计算一次DPS
            MIN_SPAWN_RATE: 0.8,
            MAX_SPAWN_RATE: 6,
            HIGH_DPS_THRESHOLD: 150,  // DPS超过此值增加刷怪
            LOW_DPS_THRESHOLD: 50,    // DPS低于此值减少刷怪
            ADJUSTMENT_FACTOR: 0.2    // 调整幅度
        },
        
        // 精英系统
        ELITE: {
            CHANCE_BASE: 0.05,
            CHANCE_SCALE_PER_MINUTE: 0.02,
            MAX_CHANCE: 0.25,
            HP_MULTIPLIER: 2.5,
            DAMAGE_MULTIPLIER: 1.5,
            SPEED_MULTIPLIER: 1.2,
            EXP_MULTIPLIER: 3,
            COLOR: '#FFD700',  // 金色
            SIZE_MULTIPLIER: 1.3
        },
        
        SUPER_ELITE: {
            CHANCE_BASE: 0.02,
            CHANCE_SCALE_PER_MINUTE: 0.01,
            MAX_CHANCE: 0.1,
            HP_MULTIPLIER: 5,
            DAMAGE_MULTIPLIER: 2.5,
            SPEED_MULTIPLIER: 1.5,
            EXP_MULTIPLIER: 8,
            COLOR: '#FF4500',  // 橙红色
            SIZE_MULTIPLIER: 1.6,
            SPECIAL_TRAITS: ['lifeSteal', 'explosive', 'teleport']
        },
        
        // 休息窗口
        REST_WINDOW: {
            ENABLED: false,
            DURATION: 8,  // Boss战后8秒
            SPAWN_RATE_MULTIPLIER: 0.3,
            NO_BATCH_SPAWN: true,
            NO_ELITE: true
        },
        
        // 旧配置保留兼容
        FAST_ENEMY_TIME: 15,
        FAST_ENEMY_CHANCE: 0.25,
        SPLIT_ENEMY_TIME: 30,
        SPLIT_ENEMY_CHANCE: 0.2,
        RANGED_ENEMY_TIME: 40,
        RANGED_ENEMY_CHANCE: 0.15,
        BATCH_INTERVAL: 10,
        BATCH_COUNT_BASE: 3,
        BATCH_COUNT_SCALE: 25,
        BATCH_OFFSET_MIN: 30,
        BATCH_OFFSET_MAX: 50,
        BOSS_INTERVAL: 5,
        BOSS_MIN_TIME: 5,
        BOSS_WARNING_DURATION: 1500,
        BOSS_OFFSET: 0
    },

    // 子弹系统
    BULLET: {
        TRAIL_LENGTH: 10,
        TRAIL_SIZE_SCALE: 0.5,
        TRAIL_ALPHA_SCALE: 0.5,
        COLORS: {
            CORE: '#ffffff',
            MID: '#ff8800',
            OUTER: '#cc5500',
            TRAIL: 'rgba(204, 85, 0, {alpha})'
        }
    },

    // 激光系统
    LASER: {
        LENGTH: 2000,
        LIFETIME: 0.2,
        HITSTOP_FRAMES: 3,
        COLORS: {
            OUTER: '#ff8800',
            OUTER_WIDTH: 5,
            CORE: '#ffffff',
            CORE_WIDTH: 2
        }
    },

    // 经验宝石 - 自然风颜色
    GEM: {
        LARGE_VALUE: 50,
        SMALL_VALUE: 15,
        LARGE_COLOR: '#ffca28',
        SMALL_COLOR: '#81c784',
        LARGE_RADIUS: 10,
        SMALL_RADIUS: 6,
        ATTRACT_SPEED: 5,
        LINE_WIDTH: 1,
        BORDER_COLOR: '#ffffff',
        EXP_SCALE_PER_LEVEL: 0.1 // 每级增加10%经验
    },

    // 道具拾取 - 自然风颜色
    ITEM_PICKUP: {
        RADIUS: 15,
        BOB_HEIGHT: 5,
        BOB_SPEED: 3,
        PARTICLE_COUNT: 15,
        PARTICLE_SIZE: 5,
        PARTICLE_SPEED: 4,
        GLOW_COLOR: '#ff8800',
        GLOW_BLUR: 20,
        ICON_FONT_SIZE: 36,
        BORDER_WIDTH: 2,
        UNIFIED_ITEM: {
            ICON: '?',
            COLOR: '#ffcc00',
            GLOW_COLOR: '#ffaa00'
        }
    },

    // 技能拾取 - 蓝色
    SKILL_PICKUP: {
        RADIUS: 15,
        BOB_HEIGHT: 5,
        BOB_SPEED: 3,
        PARTICLE_COUNT: 15,
        PARTICLE_SIZE: 5,
        PARTICLE_SPEED: 4,
        GLOW_COLOR: '#4488ff',
        GLOW_BLUR: 20,
        ICON_FONT_SIZE: 36,
        BORDER_WIDTH: 2,
        UNIFIED_SKILL: {
            ICON: '✦',
            COLOR: '#66bbff',
            GLOW_COLOR: '#4488ff'
        }
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

    // 怪物等级系统
    ENEMY_LEVEL: {
        HP_SCALE_PER_LEVEL: 0.05, // 每级增加5%生命
        DAMAGE_SCALE_PER_LEVEL: 0.04, // 每级增加4%伤害
        SPEED_SCALE_PER_LEVEL: 0, // 取消移速成长
        BOSS_HP_SCALE_PER_LEVEL: 0.20, // Boss每级增加20%生命
        BOSS_DAMAGE_SCALE_PER_LEVEL: 0.03, // Boss每级增加3%伤害
        BOSS_SCALING: {
            THRESHOLD: 3, // 第3个boss后开始大幅成长
            HP_MULTIPLIER: 2.0, // 血量倍率（减少20%）
            DAMAGE_MULTIPLIER: 1.5 // 伤害倍率
        }
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
            GRADIENT_START: '#ff8800',
            GRADIENT_END: '#a5d6a7'
        },
        EXP_BAR: {
            X: 220,
            Y: 8,
            WIDTH: 200,
            HEIGHT: 20,
            BG_COLOR: '#333',
            BORDER_COLOR: '#666',
            GRADIENT_START: '#ffca28',
            GRADIENT_END: '#ffe082'
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
            COLOR: '#2d5a1e',
            GRID_COLOR: 'rgba(30, 80, 20, 0.25)',
            GRID_SIZE: 50,
            GRASS_COUNT: 200
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
            INNER_BORDER: '#ff8800',
            EYE_OFFSET_X: 12,
            EYE_OFFSET_Y: 5,
            EYE_RADIUS: 6,
            EYE_COLOR: '#ff0000',
            HP_BAR_SCALE: 2.5,
            HP_BAR_HEIGHT: 8,
            HP_BAR_OFFSET_Y: 20,
            HP_BG_COLOR: '#333',
            HP_FILL_COLOR: '#ff8800',
            HP_BORDER_COLOR: '#fff',
            NAME_COLOR: '#ff8800',
            NAME_FONT: 'bold 12px sans-serif',
            // Boss名称根据击杀序号显示
            getName: function(bossIndex) {
                var names = ["熊猫假面愚者", "棕毛窥魂幼兽", "社畜摸鱼执行官", "橘猫摆烂领主",
                    "干饭躺平之王", "熊猫热血狂战士", "赤狐伪笑守护者", "柴犬歪头欺诈师",
                    "牛头暴躁督军", "白熊点赞之神", "奶猫怯战幼帝", "金毛已老实囚徒",
                    "橘猫大眼惊魂使", "柴犬歪嘴邪尊", "白猫鼻息凝视者", "柴犬假笑霸主", "烈焰凤凰"];
                return names[bossIndex % 17] || '兽王';
            }
        },
        ENEMY_HP_BAR: {
            OFFSET_Y: 10,
            HEIGHT: 5,
            BG_COLOR: '#333',
            FILL_COLOR: '#8B4513'
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
        ATTACK_POWER_BONUS: 10,
        ATTACK_SPEED_BONUS: 0.97,
        ATTACK_SPEED_LIMIT: 0.5,
        BULLET_SPEED_BONUS: 1.05,
        BULLET_SPEED_LIMIT: 1.5,
        MAX_HP_BONUS: 10,
        MOVE_SPEED_BONUS: 1.05,
        MOVE_SPEED_LIMIT: 1.5,
        MAX_EXTRA_PROJECTILES: 7,
        REGEN_RATE_BONUS: 1,
        PICKUP_RANGE_BONUS: 1.4,
        CRITICAL_CHANCE_BONUS: 0.1,
        CRITICAL_MAX: 0.5,
        LIGHTNING_CHAIN_BONUS: 1,
        LIGHTNING_CHAIN_MAX: 5,
        UPGRADE_CHOICES: 3
    },

    // 吸血鬼面具
    VAMPIRE_MASK: {
        HEAL_AMOUNT: 1
    },
    
    // 神锋无影
    LIGHTNING_CHAIN: {
        MAX_CHAINS: 5,
        CHAIN_RANGE: 100,
        DAMAGE_SCALE: 0.5,
        PARTICLE_COUNT: 8,
        PARTICLE_SIZE: 4,
        PARTICLE_SPEED: 3
    },
    
    // 闪电风暴
    LIGHTNING_STORM: {
        INTERVAL: 2,
        DAMAGE_SCALE: 1.0,
        HIT_RADIUS: 30,
        PARTICLE_COUNT: 10,
        PARTICLE_SIZE: 5,
        PARTICLE_SPEED: 4
    },
    
    // 火球护身 - 环绕玩家的火焰子弹
    FIRE_ORB: {
        // 轨道半径随等级增加
        BASE_ORBIT_RADIUS: 80,
        ORBIT_RADIUS_PER_LEVEL: 15,
        // 旋转速度 (度/秒)
        ROTATION_SPEED: 200,
        // 子弹大小
        ORB_SIZE: 12,
        // 伤害配置
        DAMAGE_SCALE: 0.5,  // 每颗子弹50%攻击力
        DAMAGE_INTERVAL: 0.4,  // 每0.4秒同一敌人可被同一颗火球伤害一次
        // 视觉效果
        COLOR: 'rgb(255, 80, 0)',
        CORE_COLOR: 'rgb(255, 200, 50)',
        TRAIL_LENGTH: 6,
        PARTICLE_COUNT: 3,
        PARTICLE_SIZE: 3,
        PARTICLE_SPEED: 2
    },
    
    // 复活石
    REVIVE_STONE: {
        HEAL_PERCENT: 0.5,
        INVULNERABLE_DURATION: 2,
        PARTICLE_COUNT: 20,
        PARTICLE_SIZE: 6,
        PARTICLE_SPEED: 5
    },

    // 爆炸火花
    KILL_EXPLOSION: {
        RADIUS: 60,
        DAMAGE_SCALE: 0.5,
        PARTICLE_COUNT: 10
    },

    // 击退效果
    KNOCKBACK: {
        DISTANCE: 30,
        PARTICLE_COUNT: 3,
        PARTICLE_SIZE: 3,
        PARTICLE_SPEED: 2
    },

    // 翅膀法宝
    WINGS: {
        DODGE_BONUS: 0.25
    },

    // 极速之靴法宝
    SPEED_BOOTS: {
        SPEED_BONUS: 1.25
    },

    // Boss技能配置
    BOSS_SKILLS: {
        // 主动技能
        ACTIVE: {
            BULLET_STORM: {
                COOLDOWN: 2,
                COOLDOWN_PHASE2: 1.5,
                BULLET_COUNT: 12,
                BULLET_COUNT_PHASE2: 16,
                UNLOCK_LEVEL: 1
            },
            HOMING_MISSILES: {
                COOLDOWN: 3,
                MISSILE_COUNT: 3,
                MISSILE_SPEED: 3,
                TRACK_DURATION: 2,
                TURN_SPEED: 3,
                UNLOCK_LEVEL: 2
            },
            LASER_SWEEP: {
                COOLDOWN: 5,
                WARNING_DURATION: 2,
                SWEEP_ANGLE: 120,
                SWEEP_DURATION: 1,
                SWEEP_SPEED: 4,
                DAMAGE_PER_TICK_SCALE: 0.3,
                BEAM_WIDTH: 20,
                BEAM_LENGTH: 1500,
                UNLOCK_LEVEL: 3
            },
            CHARGE: {
                COOLDOWN: 4,
                CHARGE_SPEED: 10,
                CHARGE_DURATION: 0.4,
                TRAIL_DURATION: 1,
                TRAIL_DAMAGE_SCALE: 0.4,
                TRAIL_WIDTH: 30,
                STUN_DURATION: 0.3,
                UNLOCK_LEVEL: 4
            },
            POISON_FOG: {
                COOLDOWN: 8,
                RADIUS: 150,
                DURATION: 4,
                DAMAGE_PER_SECOND_SCALE: 0.2,
                SLOW_FACTOR: 0.5,
                UNLOCK_LEVEL: 5
            },
            SUMMON_MINIONS: {
                COOLDOWN: 8,
                COUNT: 3,
                SPAWN_RADIUS: 100,
                UNLOCK_LEVEL: 6
            },
            TELEPORT: {
                COOLDOWN: 6,
                MIN_DISTANCE: 150,
                MAX_DISTANCE: 300,
                UNLOCK_LEVEL: 7
            },
            // === 新增Boss技能 ===
            SPIRAL_BARRAGE: {
                COOLDOWN: 3,
                BULLET_COUNT: 8,
                BULLET_COUNT_PHASE2: 12,
                SPIRAL_SPEED: 0.5,
                BULLET_SPEED: 4,
                DURATION: 2,
                DAMAGE_SCALE: 0.3,
                UNLOCK_LEVEL: 8
            },
            FOCUS_FIRE: {
                COOLDOWN: 2,
                BULLET_COUNT: 5,
                BULLET_COUNT_PHASE2: 7,
                FIRE_INTERVAL: 0.15,
                FIRE_INTERVAL_PHASE2: 0.12,
                BULLET_SPEED: 8,
                DAMAGE_SCALE: 0.4,
                UNLOCK_LEVEL: 9
            },
            SCATTER_SHOT: {
                COOLDOWN: 4,
                WAVE_COUNT: 3,
                WAVE_COUNT_PHASE2: 4,
                WAVE_INTERVAL: 0.5,
                BULLETS_PER_WAVE: 8,
                SPREAD_ANGLE: 120,
                SPEED: 3.5,
                DAMAGE_SCALE: 0.25,
                UNLOCK_LEVEL: 10
            },
            CONCENTRIC_RINGS: {
                COOLDOWN: 5,
                RING_COUNT: 3,
                RING_COUNT_PHASE2: 4,
                RING_INTERVAL: 0.3,
                BULLETS_PER_RING: 16,
                SPEED: 2.5,
                DAMAGE_SCALE: 0.2,
                UNLOCK_LEVEL: 11
            },
            HOMING_SCATTER: {
                COOLDOWN: 4,
                BULLET_COUNT: 6,
                BULLET_COUNT_PHASE2: 8,
                HOMING_DURATION: 1.5,
                SPEED: 3,
                TURN_SPEED: 2,
                DAMAGE_SCALE: 0.35,
                UNLOCK_LEVEL: 12
            },
            SUMMON_ELITES: {
                COOLDOWN: 8,
                COUNT: 2,
                COUNT_PHASE2: 3,
                SPAWN_RADIUS: 120,
                ELITE_HP_SCALE: 2,
                ELITE_DAMAGE_SCALE: 1.5,
                UNLOCK_LEVEL: 13
            },
            BERSERK: {
                COOLDOWN: 8,
                DURATION: 5,
                DURATION_PHASE2: 7,
                SPEED_MULT: 1.5,
                DAMAGE_MULT: 1.8,
                ATTACK_COOLDOWN_SCALE: 0.7,
                UNLOCK_LEVEL: 14
            },
            AURA_BUFF: {
                COOLDOWN: 8,
                RADIUS: 200,
                RADIUS_PHASE2: 250,
                DURATION: 8,
                ENEMY_SPEED_BONUS: 1.3,
                ENEMY_DAMAGE_BONUS: 1.2,
                EFFECT_COLOR: 'rgba(255, 200, 0, 0.2)',
                UNLOCK_LEVEL: 8
            },
            SHIELD: {
                COOLDOWN: 8,
                DURATION: 3,
                DURATION_PHASE2: 4,
                HP_ABSORB: 0.3,
                UNLOCK_LEVEL: 6
            },
            REFLECT: {
                COOLDOWN: 8,
                DURATION: 4,
                REFLECT_PERCENT: 0.4,
                REFLECT_PERCENT_PHASE2: 0.5,
                DAMAGE_CAP: 50,
                UNLOCK_LEVEL: 10
            },
            ROCK_ARMOR: {
                COOLDOWN: 10,
                DURATION: 6,
                DAMAGE_REDUCTION: 0.6,
                DAMAGE_REDUCTION_PHASE2: 0.7,
                SLOW_ATTACKERS: true,
                SLOW_FACTOR: 0.5,
                SLOW_DURATION: 1,
                UNLOCK_LEVEL: 12
            },
            KNOCKBACK: {
                COOLDOWN: 6,
                FORCE: 300,
                DAMAGE_SCALE: 0.3,
                STUN_DURATION: 0.3,
                EFFECT_RADIUS: 100,
                UNLOCK_LEVEL: 5
            },
            ICE_BREATH: {
                COOLDOWN: 8,
                WARNING_DURATION: 1.5,
                BEAM_DURATION: 1,
                BEAM_WIDTH: 60,
                BEAM_WIDTH_PHASE2: 80,
                BEAM_LENGTH: 400,
                DAMAGE_SCALE: 0.5,
                SLOW_FACTOR: 0.3,
                SLOW_DURATION: 2,
                UNLOCK_LEVEL: 8
            },
            STUN_ROAR: {
                COOLDOWN: 8,
                RADIUS: 250,
                RADIUS_PHASE2: 300,
                DURATION: 1.5,
                DAMAGE_SCALE: 0.4,
                WARNING_TIME: 0.5,
                UNLOCK_LEVEL: 11
            },
            LASER_MATRIX: {
                COOLDOWN: 8,
                LASER_COUNT: 5,
                LASER_COUNT_PHASE2: 7,
                WARNING_DURATION: 2,
                SWEEP_DURATION: 2,
                BEAM_WIDTH: 15,
                BEAM_LENGTH: 1500,
                ROTATION_SPEED: 0.3,
                DAMAGE_PER_TICK_SCALE: 0.15,
                UNLOCK_LEVEL: 13
            },
            // === 新增Boss技能配置 ===
            SPLIT_SHOT: {
                COOLDOWN: 4,
                BULLET_COUNT: 5,
                BULLET_COUNT_PHASE2: 7,
                SPLIT_COUNT: 3,
                SPLIT_ANGLE: 30,
                SPEED: 4,
                DAMAGE_SCALE: 0.35,
                UNLOCK_LEVEL: 10
            },
            DARKNESS_FIELD: {
                COOLDOWN: 10,
                DURATION: 6,
                DURATION_PHASE2: 8,
                RADIUS: 180,
                RADIUS_PHASE2: 220,
                PLAYER_HIT_CHANCE: 0.5,
                UNLOCK_LEVEL: 12
            },
            LIFE_STEAL: {
                COOLDOWN: 6,
                DURATION: 4,
                DURATION_PHASE2: 5,
                HEAL_PERCENT: 0.3,
                HEAL_PERCENT_PHASE2: 0.4,
                ATTACK_SPEED_BONUS: 1.3,
                UNLOCK_LEVEL: 11
            },
            TIME_SLOW: {
                COOLDOWN: 10,
                DURATION: 5,
                DURATION_PHASE2: 6,
                RADIUS: 200,
                RADIUS_PHASE2: 250,
                SLOW_FACTOR: 0.4,
                UNLOCK_LEVEL: 14
            },
            CHAIN_LIGHTNING: {
                COOLDOWN: 6,
                CHAIN_COUNT: 4,
                CHAIN_COUNT_PHASE2: 6,
                CHAIN_RANGE: 150,
                DAMAGE_SCALE: 0.4,
                DAMAGE_DECAY: 0.2,
                UNLOCK_LEVEL: 9
            },
            ROAR_WAVE: {
                COOLDOWN: 6,
                WAVE_COUNT: 3,
                WAVE_COUNT_PHASE2: 5,
                WAVE_INTERVAL: 0.3,
                RADIUS: 300,
                DAMAGE_SCALE: 0.35,
                SPEED: 4,
                UNLOCK_LEVEL: 13
            },
            SPIN_SLASH: {
                COOLDOWN: 5,
                SLASH_COUNT: 6,
                SLASH_COUNT_PHASE2: 8,
                DURATION: 1.5,
                DAMAGE_SCALE: 0.3,
                RADIUS: 180,
                SLOW_FACTOR: 0.5,
                SLOW_DURATION: 2,
                UNLOCK_LEVEL: 14
            },
            HORN_BLAST: {
                COOLDOWN: 7,
                RADIUS: 250,
                RADIUS_PHASE3: 320,
                DAMAGE_SCALE: 0.4,
                KNOCKBACK_FORCE: 200,
                WARNING_DURATION: 1,
                UNLOCK_LEVEL: 15
            },
            SPLIT_BOSS: {
                HP_PERCENT: 0.7,        // 继承70%血量
                DAMAGE_PERCENT: 0.7,    // 继承70%伤害
                SIZE_PERCENT: 0.8,      // 继承80%体型
                SPLIT_THRESHOLD: 0.5,   // 50%血量时分裂
                UNLOCK_LEVEL: 1
            }
        },
        // 被动技能
        PASSIVE: {
            DAMAGE_REDUCTION: {
                MAX_HP_PERCENT: 0.1,
                UNLOCK_LEVEL: 4
            }
        }
    },

    // Buff道具（临时效果）
    BUFF_ITEMS: {
        DROP_CHANCE: 0.10,
        PICKUP_RADIUS: 25,
        ICON_SIZE: 20,
        GLOW_COLOR: '#ff8800',
        GLOW_BLUR: 15,
        PARTICLE_COUNT: 10,
        PARTICLE_SIZE: 4,
        PARTICLE_SPEED: 3,
        TYPES: {
            bomb: {
                DAMAGE: 500,
                COLOR: '#4fc3f7'
            },
            ice: {
                DURATION: 5,
                COLOR: '#81d4fa'
            },
            shield: {
                DURATION: 4,
                COLOR: '#ff8800'
            },
            rage: {
                DURATION: 4,
                ATTACK_MULT: 2,
                SPEED_MULT: 2,
                COLOR: '#ffca28'
            },
            vortex: {
                ATTRACT_SPEED: 20,
                DURATION: 3,
                COLOR: '#42a5f5'
            },
            chicken: {
                HEAL_PERCENT: 0.2,
                COLOR: '#ffa726'
            }
        }
    }
};
