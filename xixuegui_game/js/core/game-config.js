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
        RADIUS: 20,
        HP: 100,
        SPEED: 5,
        ATTACK_POWER: 14,
        ATTACK_COOLDOWN: 0.4,
        BULLET_SPEED: 8,
        BULLET_SIZE: 8,
        BULLET_PENETRATION: 1,
        PICKUP_RANGE: 160,
        BASE_EXP_TO_LEVEL: 100,
        EXP_GROWTH_RATE: 1.4,
        MAX_EXP_PER_LEVEL: 8000,
        INVULNERABLE_DURATION: 0.5,
        DODGE_CHANCE: 0,
        RUNE_ROTATE_SPEED: 2,
        PULSE_DECAY_SPEED: 3,
        PULSE_RADIUS_EXTRA: 30,
        PROJECTILE_SPREAD_ANGLE: 15,
        PROJECTILE_DAMAGE_DECAY: 1.0,
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
            SPEED: 2.3,
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
            LOW_HP_THRESHOLD: 0.3,
            LOW_HP_SPEEDUP: 0.5,
            SHOOT_COUNT: 3,
            SHOOT_SPREAD: 0.3,
            SHOOT_SPEED: 4,
            SHOOT_DAMAGE_SCALE: 0.6,
            GEM_COUNT: 8,
            GEM_DIST_MIN: 20,
            GEM_DIST_MAX: 50,
            EXP_REWARD: 200,
            DEATH_PARTICLES: 30,
            DEATH_PARTICLE_SIZE: 10,
            DEATH_PARTICLE_SPEED: 8,
            SHAKE_INTENSITY: 3,
            SHAKE_DURATION: 0.3,
            HITSTOP_FRAMES: 5,
            LARGE_GEM_CHANCE: 0.25,
            EXTRA_GEM_CHANCE: 0.4,
            SUPER_ARMOR: true
        }
    },

    // 生成系统
    SPAWN: {
        BASE_RATE: 2.0,
        RATE_INCREASE_INTERVAL: 10,
        RATE_INCREASE_AMOUNT: 0.5,
        MAX_RATE: 6,
        SPAWN_OFFSET: 30,
        FAST_ENEMY_TIME: 15,
        FAST_ENEMY_CHANCE: 0.25,
        SPLIT_ENEMY_TIME: 30,
        SPLIT_ENEMY_CHANCE: 0.2,
        RANGED_ENEMY_TIME: 40,
        RANGED_ENEMY_CHANCE: 0.15,
        BATCH_INTERVAL: 8,
        BATCH_COUNT_BASE: 3,
        BATCH_COUNT_SCALE: 20,
        BATCH_OFFSET_MIN: 30,
        BATCH_OFFSET_MAX: 50,
        BOSS_INTERVAL: 45,
        BOSS_MIN_TIME: 30,
        BOSS_WARNING_DURATION: 1500,
        BOSS_OFFSET: 50
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
        BORDER_COLOR: '#ffffff',
        EXP_SCALE_PER_LEVEL: 0.1 // 每级增加10%经验
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
        BORDER_WIDTH: 2,
        UNIFIED_ITEM: {
            ICON: '?',
            COLOR: '#ffcc00',
            GLOW_COLOR: '#ffaa00'
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
        HP_SCALE_PER_LEVEL: 0.08, // 每级增加8%生命
        DAMAGE_SCALE_PER_LEVEL: 0.03, // 每级增加3%伤害
        SPEED_SCALE_PER_LEVEL: 0, // 取消移速成长
        BOSS_HP_SCALE_PER_LEVEL: 0.10, // Boss每级增加10%生命
        BOSS_DAMAGE_SCALE_PER_LEVEL: 0.03 // Boss每级增加3%伤害
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
        ATTACK_SPEED_LIMIT: 0.5,
        BULLET_SPEED_BONUS: 1.05,
        BULLET_SPEED_LIMIT: 1.5,
        MAX_HP_BONUS: 10,
        MOVE_SPEED_BONUS: 1.05,
        MOVE_SPEED_LIMIT: 1.5,
        MAX_EXTRA_PROJECTILES: 5,
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

    // Buff道具（临时效果）
    BUFF_ITEMS: {
        DROP_CHANCE: 0.05,
        PICKUP_RADIUS: 25,
        ICON_SIZE: 20,
        GLOW_COLOR: '#ffcc00',
        GLOW_BLUR: 15,
        PARTICLE_COUNT: 10,
        PARTICLE_SIZE: 4,
        PARTICLE_SPEED: 3,
        TYPES: {
            bomb: {
                DAMAGE: 500,
                COLOR: '#ff4400'
            },
            ice: {
                DURATION: 5,
                COLOR: '#88ffff'
            },
            shield: {
                DURATION: 4,
                COLOR: '#00ff88'
            },
            rage: {
                DURATION: 4,
                ATTACK_MULT: 2,
                SPEED_MULT: 2,
                COLOR: '#ff00ff'
            },
            vortex: {
                ATTRACT_SPEED: 20,
                DURATION: 3,
                COLOR: '#00ffff'
            },
            chicken: {
                HEAL_PERCENT: 0.2,
                COLOR: '#ffaa00'
            }
        }
    }
};
