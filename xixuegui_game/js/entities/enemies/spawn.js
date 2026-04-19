var ArcSurvivors = ArcSurvivors || {};

// ==================== 刷怪系统 v2.0 ====================
// 1. 分阶段设计 2. 难度软上限 3. 动态平衡 4. 精英化 5. 休息窗口

ArcSurvivors.spawnEnemies = function(dt) {
    var self = this;
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.SPAWN;
    var time = this.gameState.time;
    
    // 初始化刷怪系统状态
    if (!this.spawnSystem) {
        this.spawnSystem = {
            dpsHistory: [],
            lastDpsCheck: 0,
            currentSpawnMultiplier: 1,
            eliteMultiplier: 1,
            restWindowEnd: 0
        };
    }
    
    var spawnSys = this.spawnSystem;
    
    // ===== 计算当前阶段 =====
    var phase = this.getCurrentPhase(time);
    var phaseCfg = SC.PHASE_MECHANICS[phase];
    
    // ===== 休息窗口检查 =====
    var inRestWindow = time < spawnSys.restWindowEnd;
    var restMultiplier = inRestWindow ? SC.REST_WINDOW.SPAWN_RATE_MULTIPLIER : 1;
    
    // ===== 动态平衡 - 根据DPS调整 =====
    if (SC.DPS_ADJUSTMENT.ENABLED && time - spawnSys.lastDpsCheck >= SC.DPS_ADJUSTMENT.CHECK_INTERVAL) {
        this.adjustSpawnRateByDPS(time);
        spawnSys.lastDpsCheck = time;
    }
    
    // ===== 计算当前刷怪率 =====
    var baseRate = this.calculateSpawnRate(time, phase);
    var adjustedRate = baseRate * spawnSys.currentSpawnMultiplier * restMultiplier;
    
    // ===== 常规刷怪 =====
    if (Math.random() < adjustedRate * dt) {
        var enemyType = this.selectEnemyType(time, phase);
        var isElite = this.shouldSpawnElite(time, inRestWindow, phaseCfg);
        var isSuperElite = isElite && this.shouldSpawnSuperElite(time);
        
        var pos = this.getRandomSpawnPosition();
        var enemy = this.createEnemyWithModifiers(pos.x, pos.y, enemyType, {
            isElite: isElite,
            isSuperElite: isSuperElite,
            phase: phase,
            gameTime: time
        });
        
        this.enemies.push(enemy);
    }
    
    // ===== 批量刷怪（休息窗口禁用）=====
    if (!inRestWindow && phaseCfg.batchEnabled && Math.random() < dt / SC.BATCH_INTERVAL) {
        this.spawnBatch(time, phase, adjustedRate);
    }
    
    // ===== 成群刷怪（休息窗口禁用）=====
    if (!inRestWindow && phaseCfg.swarmEnabled && Math.random() < dt * 0.5) {
        this.spawnSwarm(time, phase, adjustedRate);
    }
    
    // ===== Boss刷出 =====
    this.updateBossTimer(dt, time);
};

// 获取当前游戏阶段
ArcSurvivors.getCurrentPhase = function(time) {
    var PHASES = ArcSurvivors.GAME_CONFIG.SPAWN.PHASES;
    if (time < PHASES.EARLY.end) return 'EARLY';
    if (time < PHASES.MID.end) return 'MID';
    return 'LATE';
};

// 计算当前刷怪率（考虑软上限）
ArcSurvivors.calculateSpawnRate = function(time, phase) {
    var SC = ArcSurvivors.GAME_CONFIG.SPAWN;
    
    // 软上限：超过120秒后，不再增加刷怪率，转而提升敌人属性
    if (time >= SC.SOFT_CAP_TIME) {
        return SC.SOFT_CAP_RATE;
    }
    
    var rate = SC.BASE_RATE + Math.floor(time / SC.RATE_INCREASE_INTERVAL) * SC.RATE_INCREASE_AMOUNT;
    return Math.min(rate, SC.MAX_RATE);
};

// 根据DPS动态调整刷怪率
ArcSurvivors.adjustSpawnRateByDPS = function(time) {
    var spawnSys = this.spawnSystem;
    var DPS = ArcSurvivors.GAME_CONFIG.SPAWN.DPS_ADJUSTMENT;
    
    // 计算最近10秒的DPS
    var recentDPS = this.calculatePlayerDPS(10);
    spawnSys.dpsHistory.push({ time: time, dps: recentDPS });
    if (spawnSys.dpsHistory.length > 6) spawnSys.dpsHistory.shift();
    
    // 根据DPS调整
    if (recentDPS > DPS.HIGH_DPS_THRESHOLD) {
        // 玩家输出高，增加刷怪提供挑战
        spawnSys.currentSpawnMultiplier = Math.min(
            DPS.MAX_SPAWN_RATE / ArcSurvivors.GAME_CONFIG.SPAWN.MAX_RATE,
            spawnSys.currentSpawnMultiplier + DPS.ADJUSTMENT_FACTOR
        );
    } else if (recentDPS < DPS.LOW_DPS_THRESHOLD) {
        // 玩家输出低，减少刷怪给予喘息
        spawnSys.currentSpawnMultiplier = Math.max(
            DPS.MIN_SPAWN_RATE / ArcSurvivors.GAME_CONFIG.SPAWN.BASE_RATE,
            spawnSys.currentSpawnMultiplier - DPS.ADJUSTMENT_FACTOR
        );
    } else {
        // 逐渐回归正常
        var targetMultiplier = 1;
        spawnSys.currentSpawnMultiplier += (targetMultiplier - spawnSys.currentSpawnMultiplier) * 0.1;
    }
};

// 计算玩家DPS
ArcSurvivors.calculatePlayerDPS = function(seconds) {
    // 通过统计玩家击杀和伤害来估算DPS
    // 简化版本：基于玩家等级和武器估计
    var player = this.player;
    if (!player) return 50;
    
    var baseDPS = player.attackPower / player.attackCooldown;
    var levelBonus = player.level * 5;
    var upgradeBonus = player.extraProjectiles * 10 + player.lightningChainCount * 15;
    
    return baseDPS + levelBonus + upgradeBonus;
};

// 选择敌人类型
ArcSurvivors.selectEnemyType = function(time, phase) {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.SPAWN;
    var phaseEnemies = SC.PHASE_ENEMIES[phase];
    
    // 检查阶段专属敌人
    if (phaseEnemies && phaseEnemies.length > 0) {
        for (var i = 0; i < phaseEnemies.length; i++) {
            var enemyId = phaseEnemies[i];
            var unlockTime = CFG.ENEMY_SPAWN_TIME[enemyId] || 0;
            var chance = CFG.ENEMY_SPAWN_CHANCE[enemyId] || 0.1;
            
            if (time >= unlockTime && Math.random() < chance) {
                return enemyId;
            }
        }
    }
    
    // 检查所有已解锁的敌人
    var allEnemyTypes = Object.keys(CFG.ENEMY_SPAWN_TIME);
    for (var j = 0; j < allEnemyTypes.length; j++) {
        var type = allEnemyTypes[j];
        var typeTime = CFG.ENEMY_SPAWN_TIME[type];
        var typeChance = CFG.ENEMY_SPAWN_CHANCE[type];
        
        if (time >= typeTime && Math.random() < typeChance) {
            return type;
        }
    }
    
    // 默认返回基础类型
    return 'normal';
};

// 判断是否生成精英
ArcSurvivors.shouldSpawnElite = function(time, inRestWindow, phaseCfg) {
    if (inRestWindow && ArcSurvivors.GAME_CONFIG.SPAWN.REST_WINDOW.NO_ELITE) {
        return false;
    }
    
    var ELITE = ArcSurvivors.GAME_CONFIG.SPAWN.ELITE;
    var minutesPassed = time / 60;
    var eliteChance = ELITE.CHANCE_BASE + minutesPassed * ELITE.CHANCE_SCALE_PER_MINUTE;
    eliteChance = Math.min(eliteChance, ELITE.MAX_CHANCE);
    eliteChance *= (phaseCfg.eliteChance || 1);
    
    return Math.random() < eliteChance;
};

// 判断是否生成超级精英
ArcSurvivors.shouldSpawnSuperElite = function(time) {
    var SUPER = ArcSurvivors.GAME_CONFIG.SPAWN.SUPER_ELITE;
    var minutesPassed = time / 60;
    var chance = SUPER.CHANCE_BASE + minutesPassed * SUPER.CHANCE_SCALE_PER_MINUTE;
    chance = Math.min(chance, SUPER.MAX_CHANCE);
    
    return Math.random() < chance;
};

// 创建带修正的敌人
ArcSurvivors.createEnemyWithModifiers = function(x, y, type, modifiers) {
    var enemy = new this.Enemy(x, y, type);
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.SPAWN;
    
    // 软上限属性提升
    if (modifiers.gameTime >= SC.SOFT_CAP_TIME) {
        var minutesPastCap = (modifiers.gameTime - SC.SOFT_CAP_TIME) / 60;
        var scaleMultiplier = 1 + minutesPastCap * SC.ATTRIBUTE_SCALE_PER_MINUTE;
        
        enemy.maxHp *= scaleMultiplier;
        enemy.hp *= scaleMultiplier;
        enemy.speed *= (1 + minutesPastCap * SC.ATTRIBUTE_SCALE_PER_MINUTE * 0.5);
    }
    
    // 精英化修正
    if (modifiers.isSuperElite) {
        this.applySuperEliteModifiers(enemy);
    } else if (modifiers.isElite) {
        this.applyEliteModifiers(enemy);
    }
    
    return enemy;
};

// 应用精英修正
ArcSurvivors.applyEliteModifiers = function(enemy) {
    var ELITE = ArcSurvivors.GAME_CONFIG.SPAWN.ELITE;
    
    enemy.isElite = true;
    enemy.maxHp *= ELITE.HP_MULTIPLIER;
    enemy.hp *= ELITE.HP_MULTIPLIER;
    enemy.speed *= ELITE.SPEED_MULTIPLIER;
    enemy.damage = Math.floor(enemy.damage * ELITE.DAMAGE_MULTIPLIER);
    enemy.expValue = Math.floor((enemy.expValue || 10) * ELITE.EXP_MULTIPLIER);
    enemy.radius *= ELITE.SIZE_MULTIPLIER;
    enemy.color = ELITE.COLOR;
};

// 应用超级精英修正
ArcSurvivors.applySuperEliteModifiers = function(enemy) {
    var SUPER = ArcSurvivors.GAME_CONFIG.SPAWN.SUPER_ELITE;
    
    enemy.isSuperElite = true;
    enemy.maxHp *= SUPER.HP_MULTIPLIER;
    enemy.hp *= SUPER.HP_MULTIPLIER;
    enemy.speed *= SUPER.SPEED_MULTIPLIER;
    enemy.damage = Math.floor(enemy.damage * SUPER.DAMAGE_MULTIPLIER);
    enemy.expValue = Math.floor((enemy.expValue || 10) * SUPER.EXP_MULTIPLIER);
    enemy.radius *= SUPER.SIZE_MULTIPLIER;
    enemy.color = SUPER.COLOR;
    
    // 随机特殊特性
    var traits = SUPER.SPECIAL_TRAITS;
    enemy.specialTrait = traits[Math.floor(Math.random() * traits.length)];
};

// 批量刷怪
ArcSurvivors.spawnBatch = function(time, phase, spawnRate) {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.SPAWN;
    
    var batchSide = Math.floor(Math.random() * 4);
    var count = SC.BATCH_COUNT_BASE + Math.floor(time / SC.BATCH_COUNT_SCALE);
    
    // 休息窗口禁用批量
    if (time < this.spawnSystem.restWindowEnd) return;
    
    for (var i = 0; i < count; i++) {
        var offset = Math.random() * (SC.BATCH_OFFSET_MAX - SC.BATCH_OFFSET_MIN) + SC.BATCH_OFFSET_MIN;
        var pos = this.getSpawnPositionOnSide(batchSide, offset);
        
        var enemyType = this.selectEnemyType(time, phase);
        var enemy = this.createEnemyWithModifiers(pos.x, pos.y, enemyType, {
            isElite: false,
            isSuperElite: false,
            phase: phase,
            gameTime: time
        });
        
        this.enemies.push(enemy);
    }
};

// 成群刷怪
ArcSurvivors.spawnSwarm = function(time, phase, spawnRate) {
    var CFG = ArcSurvivors.GAME_CONFIG;
    
    // 可成群敌人类型
    var swarmTypes = ['ant', 'fly'];
    
    for (var i = 0; i < swarmTypes.length; i++) {
        var type = swarmTypes[i];
        var unlockTime = CFG.ENEMY_SPAWN_TIME[type] || 60;
        
        if (time >= unlockTime && Math.random() < 0.3) {
            var groupCount = 4 + Math.floor(Math.random() * 4);  // 4-7只
            var pos = this.getRandomSpawnPosition();
            
            for (var j = 0; j < groupCount; j++) {
                var offsetX = (Math.random() - 0.5) * 60;
                var offsetY = (Math.random() - 0.5) * 60;
                var enemy = this.createEnemyWithModifiers(
                    pos.x + offsetX, 
                    pos.y + offsetY, 
                    type, 
                    { isElite: false, isSuperElite: false, phase: phase, gameTime: time }
                );
                this.enemies.push(enemy);
            }
            break;
        }
    }
};

// 获取随机刷怪位置
ArcSurvivors.getRandomSpawnPosition = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.SPAWN;
    var side = Math.floor(Math.random() * 4);
    return this.getSpawnPositionOnSide(side, SC.SPAWN_OFFSET);
};

// 在指定边获取位置
ArcSurvivors.getSpawnPositionOnSide = function(side, offset) {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var x, y;
    
    switch (side) {
        case 0: x = Math.random() * CFG.CANVAS_WIDTH; y = -offset; break;
        case 1: x = CFG.CANVAS_WIDTH + offset; y = Math.random() * CFG.CANVAS_HEIGHT; break;
        case 2: x = Math.random() * CFG.CANVAS_WIDTH; y = CFG.CANVAS_HEIGHT + offset; break;
        case 3: x = -offset; y = Math.random() * CFG.CANVAS_HEIGHT; break;
    }
    
    return { x: x, y: y };
};

// Boss计时器
ArcSurvivors.updateBossTimer = function(dt, time) {
    var SC = ArcSurvivors.GAME_CONFIG.SPAWN;
    
    if (!this.gameState.bossTimer) this.gameState.bossTimer = 0;
    this.gameState.bossTimer += dt;
    
    if (this.gameState.bossTimer >= SC.BOSS_INTERVAL && time > SC.BOSS_MIN_TIME) {
        this.gameState.bossTimer = 0;
        this.spawnBoss();
        
        // 激活休息窗口
        if (SC.REST_WINDOW.ENABLED) {
            this.spawnSystem.restWindowEnd = time + SC.REST_WINDOW.DURATION;
        }
    }
};

// Boss生成
ArcSurvivors.spawnBoss = function(bossType) {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.SPAWN;
    var self = this;
    
    var side = Math.floor(Math.random() * 4);
    var x, y;
    switch (side) {
        case 0: x = CFG.CANVAS_WIDTH / 2; y = -SC.BOSS_OFFSET; break;
        case 1: x = CFG.CANVAS_WIDTH + SC.BOSS_OFFSET; y = CFG.CANVAS_HEIGHT / 2; break;
        case 2: x = CFG.CANVAS_WIDTH / 2; y = CFG.CANVAS_HEIGHT + SC.BOSS_OFFSET; break;
        case 3: x = -SC.BOSS_OFFSET; y = CFG.CANVAS_HEIGHT / 2; break;
    }
    
    var bossIndex = ArcSurvivors.BossRegistry ? ArcSurvivors.BossRegistry.spawnCount : 0;
    this.showBossWarning(bossIndex);
    
    var bossTypes = ['goat', 'fox', 'deer', 'eagle', 'snake', 'boar', 'wolf', 'horse', 
                     'cow', 'leopard', 'croc', 'bear', 'lion', 'tiger', 'rhino', 'elephant'];
    var bossTypeName = bossTypes[bossIndex % 16];
    var type = bossType || bossTypeName;
    
    setTimeout(function() {
        var boss = ArcSurvivors.BossRegistry.create(type, x, y);
        boss.bossType = bossTypeName;
        self.enemies.push(boss);
        self.Audio.init && self.Audio.pause();
        ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.BOSS_SPAWN, boss);
    }, SC.BOSS_WARNING_DURATION);
};

// Boss警告显示
ArcSurvivors.showBossWarning = function(bossIndex) {
    var SC = ArcSurvivors.GAME_CONFIG.SPAWN;
    var UI = ArcSurvivors.STRINGS ? ArcSurvivors.STRINGS.UI : null;
    var bossNames = (UI && UI.BOSS_NAMES) || ['绒角羚兽', '幻彩灵狐', '沐光仙鹿', '云翼苍鹰', '翠鳞幽蛇', '荒林顽豚', '风原狂狼', '驰风骏驹', '岩脊蛮牛', '暗夜疾豹', '渊水巨鳄', '深林绒熊', '金鬃狮灵', '烈风玄虎', '磐岩犀兽', '古森巨象'];
    
    var bossIndexSafe = typeof bossIndex === 'number' && !isNaN(bossIndex) ? bossIndex : 0;
    var bossName = bossNames[bossIndexSafe % 16] || bossNames[0];
    
    var el = document.getElementById('bossWarning');
    var textEl = document.getElementById('bossWarningText');
    if (textEl && el) {
        textEl.textContent = bossName + '出现！';
        el.style.display = 'block';
        this.Audio.bossWarning();
        setTimeout(function() {
            el.style.display = 'none';
        }, SC.BOSS_WARNING_DURATION);
    }
};
