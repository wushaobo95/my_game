/**
 * core/resource-loader.js - 资源加载器
 * 支持精灵图、音频文件的加载与管理
 * 当资源未加载时，游戏回退到原有的Canvas绘制和Web Audio合成
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.ResourceLoader = (function() {
    var sprites = {};
    var spriteSheets = {}; // 合图资源
    var audioBuffers = {};
    var audioContext = null;
    var loadedCount = 0;
    var totalCount = 0;
    var onProgress = null;
    var onComplete = null;
    
    // 合图配置 - 4x4网格，每个格子256x256像素
    var SPRITE_SHEET_CONFIG = {
        'enemies': {
            src: 'assets/sprites/enemies/enemies.png',
            cols: 4,
            rows: 4,
            cellWidth: 256,
            cellHeight: 256
        }
    };
    
    // 敌人合图映射 - 将敌人类型映射到合图位置
    var ENEMY_SPRITE_MAP = {
        'normal': { sheet: 'enemies', row: 0, col: 0 },    // 蜘蛛
        'fast': { sheet: 'enemies', row: 0, col: 1 },      // 蝙蝠
        'split': { sheet: 'enemies', row: 0, col: 2 },     // 蚱蜢
        'mini': { sheet: 'enemies', row: 1, col: 0 },      // 蜜蜂
        'ranged': { sheet: 'enemies', row: 1, col: 1 }     // 蝴蝶
    };
    
    // 资源清单
    var manifest = {
        // 玩家精灵图
        'player_normal': 'assets/sprites/player/player_normal.png',
        'player_invulnerable': 'assets/sprites/player/player_invulnerable.png',
        'player_shield': 'assets/sprites/player/player_shield.png',
        
        // 敌人合图
        'enemies': 'assets/sprites/enemies/enemies.png',
        
        // Boss单独精灵图
        'enemy_boss': 'assets/sprites/enemies/enemy_boss.png',
        
        // 子弹特效
        'bullet_normal': 'assets/sprites/bullets/bullet_normal.png',
        'bullet_critical': 'assets/sprites/bullets/bullet_critical.png',
        'enemy_bullet': 'assets/sprites/bullets/enemy_bullet.png',
        'laser_beam': 'assets/sprites/bullets/laser_beam.png',
        
        // 宝石和道具
        'gem_small': 'assets/sprites/items/gem_small.png',
        'gem_large': 'assets/sprites/items/gem_large.png',
        'item_pickup': 'assets/sprites/items/item_pickup.png',
        'buff_bomb': 'assets/sprites/items/buff_bomb.png',
        'buff_freeze': 'assets/sprites/items/buff_freeze.png',
        'buff_shield': 'assets/sprites/items/buff_shield.png',
        'buff_rage': 'assets/sprites/items/buff_rage.png',
        
        // 粒子效果
        'particle_hit': 'assets/sprites/effects/particle_hit.png',
        'particle_explosion': 'assets/sprites/effects/particle_explosion.png',
        'particle_heal': 'assets/sprites/effects/particle_heal.png',
        
        // 背景
        'background': 'assets/sprites/background/background.png',
        'background_grid': 'assets/sprites/background/grid_overlay.png'
    };
    
    // 音频资源清单
    var audioManifest = {
        // 音效
        'sfx_shoot': 'assets/audio/sfx/shoot.mp3',
        'sfx_hit': 'assets/audio/sfx/hit.mp3',
        'sfx_enemy_death': 'assets/audio/sfx/enemy_death.mp3',
        'sfx_boss_death': 'assets/audio/sfx/boss_death.mp3',
        'sfx_boss_warning': 'assets/audio/sfx/boss_warning.mp3',
        'sfx_level_up': 'assets/audio/sfx/level_up.mp3',
        'sfx_player_hurt': 'assets/audio/sfx/player_hurt.mp3',
        'sfx_pickup': 'assets/audio/sfx/pickup.mp3',
        'sfx_game_over': 'assets/audio/sfx/game_over.mp3',
        'sfx_pause': 'assets/audio/sfx/pause.mp3',
        
        // 背景音乐
        'bgm_main': 'assets/audio/music/bgm_main.mp3',
        'bgm_boss': 'assets/audio/music/bgm_boss.mp3'
    };
    
    function init(onProgressCallback, onCompleteCallback) {
        onProgress = onProgressCallback;
        onComplete = onCompleteCallback;
        
        // 计算总资源数（普通精灵图 + 合图 + 音频）
        totalCount = Object.keys(manifest).length + 
                     Object.keys(SPRITE_SHEET_CONFIG).length +
                     Object.keys(audioManifest).length;
        loadedCount = 0;
        
        // 初始化音频上下文
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('AudioContext not available, audio resources will not be loaded');
        }
        
        // 加载所有资源
        loadSprites();
        loadAudio();
    }
    
    function loadSprites() {
        // 首先加载合图
        var sheetKeys = Object.keys(SPRITE_SHEET_CONFIG);
        for (var i = 0; i < sheetKeys.length; i++) {
            var key = sheetKeys[i];
            var config = SPRITE_SHEET_CONFIG[key];
            loadSpriteSheet(key, config.src);
        }
        
        // 然后加载普通精灵图
        var keys = Object.keys(manifest);
        for (var j = 0; j < keys.length; j++) {
            var spriteKey = keys[j];
            var src = manifest[spriteKey];
            loadImage(spriteKey, src);
        }
    }
    
    function loadSpriteSheet(key, src) {
        var img = new Image();
        var config = SPRITE_SHEET_CONFIG[key];
        
        img.onload = function() {
            spriteSheets[key] = {
                image: img,
                config: config
            };
            resourceLoaded();
        };
        
        img.onerror = function() {
            console.warn('Failed to load sprite sheet: ' + key + ' from ' + src);
            resourceLoaded();
        };
        
        img.src = src;
    }
    
    function loadImage(key, src) {
        var img = new Image();
        
        img.onload = function() {
            sprites[key] = img;
            resourceLoaded();
        };
        
        img.onerror = function() {
            console.warn('Failed to load sprite: ' + key + ' from ' + src);
            resourceLoaded();
        };
        
        img.src = src;
    }
    
    function loadAudio() {
        if (!audioContext) {
            // 如果没有音频上下文，标记所有音频为已加载
            var audioKeys = Object.keys(audioManifest);
            for (var i = 0; i < audioKeys.length; i++) {
                resourceLoaded();
            }
            return;
        }
        
        var audioKeys = Object.keys(audioManifest);
        
        for (var i = 0; i < audioKeys.length; i++) {
            var key = audioKeys[i];
            var src = audioManifest[key];
            
            loadAudioFile(key, src);
        }
    }
    
    function loadAudioFile(key, src) {
        fetch(src)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.arrayBuffer();
            })
            .then(function(arrayBuffer) {
                return audioContext.decodeAudioData(arrayBuffer);
            })
            .then(function(audioBuffer) {
                audioBuffers[key] = audioBuffer;
                resourceLoaded();
            })
            .catch(function(error) {
                console.warn('Failed to load audio: ' + key + ' from ' + src, error);
                resourceLoaded();
            });
    }
    
    function resourceLoaded() {
        loadedCount++;
        
        if (onProgress) {
            onProgress(loadedCount, totalCount);
        }
        
        if (loadedCount >= totalCount && onComplete) {
            onComplete();
        }
    }
    
    function getSprite(name) {
        return sprites[name] || null;
    }
    
    function hasSprite(name) {
        return sprites.hasOwnProperty(name);
    }
    
    function getSpriteFromSheet(spriteName) {
        var map = ENEMY_SPRITE_MAP[spriteName];
        if (!map) return null;
        
        var sheet = spriteSheets[map.sheet];
        if (!sheet) return null;
        
        var cfg = sheet.config;
        var sx = map.col * cfg.cellWidth;
        var sy = map.row * cfg.cellHeight;
        
        return {
            image: sheet.image,
            sx: sx,
            sy: sy,
            sw: cfg.cellWidth,
            sh: cfg.cellHeight
        };
    }
    
    function hasSpriteSheet(name) {
        return spriteSheets.hasOwnProperty(name);
    }
    
    function getSpriteMap() {
        return ENEMY_SPRITE_MAP;
    }
    
    function getAudioBuffer(name) {
        return audioBuffers[name] || null;
    }
    
    function hasAudio(name) {
        return audioBuffers.hasOwnProperty(name);
    }
    
    function playAudio(name, volume, loop) {
        if (!audioContext || !audioBuffers[name]) {
            return null;
        }
        
        var source = audioContext.createBufferSource();
        source.buffer = audioBuffers[name];
        source.loop = loop || false;
        
        var gainNode = audioContext.createGain();
        gainNode.gain.value = volume !== undefined ? volume : 1.0;
        
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        source.start();
        
        return {
            source: source,
            gain: gainNode,
            stop: function() {
                source.stop();
            }
        };
    }
    
    function setAudioVolume(gainNode, volume) {
        if (gainNode) {
            gainNode.gain.value = volume;
        }
    }
    
    function addSprite(name, src) {
        manifest[name] = src;
        loadImage(name, src);
        totalCount++;
    }
    
    function addAudio(name, src) {
        audioManifest[name] = src;
        if (audioContext) {
            loadAudioFile(name, src);
        }
        totalCount++;
    }
    
    function getManifest() {
        return manifest;
    }
    
    function getAudioManifest() {
        return audioManifest;
    }
    
    return {
        init: init,
        getSprite: getSprite,
        hasSprite: hasSprite,
        getSpriteFromSheet: getSpriteFromSheet,
        hasSpriteSheet: hasSpriteSheet,
        getSpriteMap: getSpriteMap,
        getAudioBuffer: getAudioBuffer,
        hasAudio: hasAudio,
        playAudio: playAudio,
        setAudioVolume: setAudioVolume,
        addSprite: addSprite,
        addAudio: addAudio,
        getManifest: getManifest,
        getAudioManifest: getAudioManifest
    };
})();