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

    this.showBossWarning();

    var self = this;
    var type = bossType || 'default';
    setTimeout(function() {
        var boss = ArcSurvivors.BossRegistry.create(type, x, y);
        self.enemies.push(boss);
        self.Audio.init && self.Audio.pause();
        ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.BOSS_SPAWN, boss);
    }, SC.BOSS_WARNING_DURATION);
};

ArcSurvivors.showBossWarning = function() {
    var SC = ArcSurvivors.GAME_CONFIG.SPAWN;
    var el = document.getElementById('bossWarning');
    el.style.display = 'block';
    this.Audio.bossWarning();
    setTimeout(function() {
        el.style.display = 'none';
    }, SC.BOSS_WARNING_DURATION);
};