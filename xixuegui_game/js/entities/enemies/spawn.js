var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.spawnEnemies = function(dt) {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.SPAWN;
    var time = this.gameState.time;

    var spawnRate = SC.BASE_RATE + Math.floor(time / SC.RATE_INCREASE_INTERVAL) * SC.RATE_INCREASE_AMOUNT;
    spawnRate = Math.min(spawnRate, SC.MAX_RATE);

    if (Math.random() < spawnRate * dt) {
        var side = Math.floor(Math.random() * 4);
        var x, y;

        switch (side) {
            case 0: x = Math.random() * CFG.CANVAS_WIDTH; y = -SC.SPAWN_OFFSET; break;
            case 1: x = CFG.CANVAS_WIDTH + SC.SPAWN_OFFSET; y = Math.random() * CFG.CANVAS_HEIGHT; break;
            case 2: x = Math.random() * CFG.CANVAS_WIDTH; y = CFG.CANVAS_HEIGHT + SC.SPAWN_OFFSET; break;
            case 3: x = -SC.SPAWN_OFFSET; y = Math.random() * CFG.CANVAS_HEIGHT; break;
        }

        var type = 'normal';
        if (time > SC.FAST_ENEMY_TIME && Math.random() < SC.FAST_ENEMY_CHANCE) type = 'fast';
        if (time > SC.SPLIT_ENEMY_TIME && Math.random() < SC.SPLIT_ENEMY_CHANCE) type = 'split';
        if (time > SC.RANGED_ENEMY_TIME && Math.random() < SC.RANGED_ENEMY_CHANCE) type = 'ranged';

        var newEnemies = ['butterfly', 'ant', 'ladybug', 'rat', 'cockroach', 'mantis', 'fly', 'dragonfly', 'mosquito', 'hedgehog', 'gecko'];
        var spawnTime = CFG.ENEMY_SPAWN_TIME;
        var spawnChance = CFG.ENEMY_SPAWN_CHANCE;

        for (var ne = 0; ne < newEnemies.length; ne++) {
            var nType = newEnemies[ne];
            var nTime = spawnTime[nType] || 60;
            var nChance = spawnChance[nType] || 0.1;
            if (time > nTime && Math.random() < nChance) {
                type = nType;
                break;
            }
        }

        this.enemies.push(new this.Enemy(x, y, type));
    }

    if (Math.random() < dt / SC.BATCH_INTERVAL) {
        var batchSide = Math.floor(Math.random() * 4);
        var count = SC.BATCH_COUNT_BASE + Math.floor(time / SC.BATCH_COUNT_SCALE);
        for (var i = 0; i < count; i++) {
            var bx, by;
            var offset = Math.random() * (SC.BATCH_OFFSET_MAX - SC.BATCH_OFFSET_MIN) + SC.BATCH_OFFSET_MIN;
            switch (batchSide) {
                case 0: bx = Math.random() * CFG.CANVAS_WIDTH; by = -SC.SPAWN_OFFSET - offset; break;
                case 1: bx = CFG.CANVAS_WIDTH + SC.SPAWN_OFFSET + offset; by = Math.random() * CFG.CANVAS_HEIGHT; break;
                case 2: bx = Math.random() * CFG.CANVAS_WIDTH; by = CFG.CANVAS_HEIGHT + SC.SPAWN_OFFSET + offset; break;
                case 3: bx = -SC.SPAWN_OFFSET - offset; by = Math.random() * CFG.CANVAS_HEIGHT; break;
            }
            this.enemies.push(new this.Enemy(bx, by, 'normal'));
        }
    }

    if (Math.random() < dt * 0.5) {
        var groupTypes = ['ant'];
        for (var gt = 0; gt < groupTypes.length; gt++) {
            var gType = groupTypes[gt];
            var gTime = CFG.ENEMY_SPAWN_TIME[gType] || 60;
            if (time > gTime && Math.random() < 0.3) {
                var groupCount = 5 + Math.floor(Math.random() * 4);
                var gx, gy;
                var side = Math.floor(Math.random() * 4);
                switch (side) {
                    case 0: gx = Math.random() * CFG.CANVAS_WIDTH; gy = -SC.SPAWN_OFFSET; break;
                    case 1: gx = CFG.CANVAS_WIDTH + SC.SPAWN_OFFSET; gy = Math.random() * CFG.CANVAS_HEIGHT; break;
                    case 2: gx = Math.random() * CFG.CANVAS_WIDTH; gy = CFG.CANVAS_HEIGHT + SC.SPAWN_OFFSET; break;
                    case 3: gx = -SC.SPAWN_OFFSET; gy = Math.random() * CFG.CANVAS_HEIGHT; break;
                }
                for (var gc = 0; gc < groupCount; gc++) {
                    var offsetX = (Math.random() - 0.5) * 60;
                    var offsetY = (Math.random() - 0.5) * 60;
                    this.enemies.push(new this.Enemy(gx + offsetX, gy + offsetY, 'ant'));
                }
                break;
            }
        }
    }

    if (!this.gameState.bossTimer) this.gameState.bossTimer = 0;
    this.gameState.bossTimer += dt;
    if (this.gameState.bossTimer >= SC.BOSS_INTERVAL && time > SC.BOSS_MIN_TIME) {
        this.gameState.bossTimer = 0;
        this.spawnBoss();
    }
};

ArcSurvivors.spawnBoss = function(bossType) {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.SPAWN;
    var side = Math.floor(Math.random() * 4);
    var x, y;
    switch (side) {
        case 0: x = CFG.CANVAS_WIDTH / 2; y = -SC.BOSS_OFFSET; break;
        case 1: x = CFG.CANVAS_WIDTH + SC.BOSS_OFFSET; y = CFG.CANVAS_HEIGHT / 2; break;
        case 2: x = CFG.CANVAS_WIDTH / 2; y = CFG.CANVAS_HEIGHT + SC.BOSS_OFFSET; break;
        case 3: x = -SC.BOSS_OFFSET; y = CFG.CANVAS_HEIGHT / 2; break;
    }

    var self = this;
    var bossIndex = ArcSurvivors.BossRegistry ? ArcSurvivors.BossRegistry.spawnCount : 0;
    this.showBossWarning(bossIndex);
    var bossTypes = ['goat', 'fox', 'deer', 'eagle', 'snake', 'boar', 'wolf', 'horse', 
                 'cow', 'leopard', 'croc', 'bear', 'lion', 'tiger', 'rhino', 'elephant'];
    var bossTypeName = bossTypes[bossIndex % 16];  // 循环使用16种
    
    var type = bossType || bossTypeName;
    setTimeout(function() {
        var boss = ArcSurvivors.BossRegistry.create(type, x, y);
        boss.bossType = bossTypeName;  // 保存外观类型
        self.enemies.push(boss);
        self.Audio.init && self.Audio.pause();
        ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.BOSS_SPAWN, boss);
    }, SC.BOSS_WARNING_DURATION);
};

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