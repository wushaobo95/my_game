/**
 * entities/enemy.js - 敌人系统
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Enemy = function(x, y, type) {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var EC = CFG.ENEMY_TYPES[type];
    var FR = CFG.FROST;
    var EL = CFG.ENEMY_LEVEL;

    this.x = x;
    this.y = y;
    this.type = type;
    this.active = true;
    this.frozen = false;
    this.frozenTimer = 0;
    this.slowed = false;
    this.slowedTimer = 0;
    this.canSplit = EC.CAN_SPLIT || false;
    this.superArmor = EC.SUPER_ARMOR || false; // 霸体：免疫负面效果

    var gs = ArcSurvivors.gameState;
    var df = gs.difficultyFactor;
    var playerLevel = ArcSurvivors.player ? ArcSurvivors.player.level : 1;
    this.level = playerLevel; // 怪物等级与玩家一致

    this.radius = EC.RADIUS;
    this.speed = EC.SPEED * (1 + (this.level - 1) * EL.SPEED_SCALE_PER_LEVEL);
    this.baseSpeed = this.speed;
    this.hp = (EC.HP_BASE + df * EC.HP_SCALE) * (1 + (this.level - 1) * EL.HP_SCALE_PER_LEVEL);
    this.maxHp = this.hp;
    this.damage = EC.DAMAGE * (1 + (this.level - 1) * EL.DAMAGE_SCALE_PER_LEVEL);
    this.color = EC.COLOR;
    this.shape = EC.SHAPE;

    if (type === 'boss') {
        this.shootTimer = 0;
        this.shootInterval = EC.SHOOT_INTERVAL;
        this.bossPhase = 0;
        
        // Boss属性根据玩家等级调整
        var bossLevelScale = 1 + (this.level - 1) * EL.BOSS_HP_SCALE_PER_LEVEL;
        this.hp = EC.HP_BASE * bossLevelScale + df * EC.HP_SCALE;
        this.maxHp = this.hp;
        this.damage = EC.DAMAGE * (1 + (this.level - 1) * EL.BOSS_DAMAGE_SCALE_PER_LEVEL);
    }
    
    if (type === 'ranged') {
        this.shootTimer = 0;
        this.shootInterval = EC.SHOOT_INTERVAL;
    }
    
    ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.ENEMY_SPAWN, this);
};

ArcSurvivors.Enemy.prototype.update = function(dt) {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var FR = CFG.FROST;

    if (this.frozen) {
        this.frozenTimer -= dt;
        if (this.frozenTimer <= 0) this.frozen = false;
        return;
    }

    if (this.slowed) {
        this.slowedTimer -= dt;
        if (this.slowedTimer <= 0) {
            this.slowed = false;
            this.speed = this.baseSpeed;
        }
    }

    var player = ArcSurvivors.player;
    var dx = player.x - this.x;
    var dy = player.y - this.y;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
        this.x += (dx / dist) * this.speed * dt * 60;
        this.y += (dy / dist) * this.speed * dt * 60;
    }

    if (ArcSurvivors.Utils.distance(this.x, this.y, player.x, player.y) < this.radius + player.radius) {
        player.takeDamage(this.damage);
    }

    // Boss射击行为
    if (this.type === 'boss') {
        var BC = CFG.ENEMY_TYPES.boss;
        this.shootTimer += dt;
        var interval = this.hp < this.maxHp * BC.LOW_HP_THRESHOLD
            ? this.shootInterval * BC.LOW_HP_SPEEDUP
            : this.shootInterval;
        if (this.shootTimer >= interval) {
            this.shootTimer = 0;
            this.bossShoot();
        }
    }
    
    // 远程敌人射击行为
    if (this.type === 'ranged') {
        var RC = CFG.ENEMY_TYPES.ranged;
        var dist = ArcSurvivors.Utils.distance(this.x, this.y, player.x, player.y);
        
        // 如果太近，后退
        if (dist < RC.SHOOT_RANGE * 0.5) {
            this.x -= (dx / dist) * this.speed * dt * 60;
            this.y -= (dy / dist) * this.speed * dt * 60;
        }
        
        // 射击逻辑
        if (dist < RC.SHOOT_RANGE) {
            this.shootTimer += dt;
            if (this.shootTimer >= this.shootInterval) {
                this.shootTimer = 0;
                this.rangedShoot();
            }
        }
    }
};

ArcSurvivors.Enemy.prototype.bossShoot = function() {
    var BC = ArcSurvivors.GAME_CONFIG.ENEMY_TYPES.boss;
    var bulletCount = 12;
    
    for (var i = 0; i < bulletCount; i++) {
        var angle = (i / bulletCount) * Math.PI * 2;
        ArcSurvivors.enemyBullets.push(new ArcSurvivors.EnemyBullet(
            this.x, this.y,
            angle,
            BC.SHOOT_SPEED,
            this.damage * BC.SHOOT_DAMAGE_SCALE
        ));
    }
};

ArcSurvivors.Enemy.prototype.rangedShoot = function() {
    var RC = ArcSurvivors.GAME_CONFIG.ENEMY_TYPES.ranged;
    var player = ArcSurvivors.player;
    var angle = Math.atan2(player.y - this.y, player.x - this.x);
    
    ArcSurvivors.enemyBullets.push(new ArcSurvivors.EnemyBullet(
        this.x, this.y,
        angle,
        RC.SHOOT_SPEED,
        this.damage * RC.SHOOT_DAMAGE_SCALE
    ));
};

ArcSurvivors.Enemy.prototype.takeDamage = function(damage) {
    this.hp -= damage;
    ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.ENEMY_HURT, this, damage);
    if (this.hp <= 0) this.die();
};

ArcSurvivors.Enemy.prototype.die = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var BC = CFG.ENEMY_TYPES.boss;
    var HE = CFG.HIT_EFFECTS;

    this.active = false;
    ArcSurvivors.gameState.kills++;
    var player = ArcSurvivors.player;
    ArcSurvivors.Audio.enemyDeath();
    
    ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.ENEMY_DIE, this);

    if (this.type === 'boss') {
        for (var i = 0; i < BC.GEM_COUNT; i++) {
            var angle = Math.random() * Math.PI * 2;
            var dist = Math.random() * (BC.GEM_DIST_MAX - BC.GEM_DIST_MIN) + BC.GEM_DIST_MIN;
            ArcSurvivors.gems.push(new ArcSurvivors.Gem(
                this.x + Math.cos(angle) * dist,
                this.y + Math.sin(angle) * dist,
                'large',
                this.level
            ));
        }
        var expReward = Math.floor(BC.EXP_REWARD * (1 + (this.level - 1) * 0.2));
        player.gainExp(expReward);

        var item = ArcSurvivors.trySpawnItem();
        if (item) {
            ArcSurvivors.itemPickups.push(new ArcSurvivors.ItemPickup(this.x, this.y, item));
        }
        
        ArcSurvivors.spawnParticles(this.x, this.y, BC.DEATH_PARTICLES, 'rgb(255,0,255)', BC.DEATH_PARTICLE_SIZE, BC.DEATH_PARTICLE_SPEED);
        ArcSurvivors.screenShake.intensity = BC.SHAKE_INTENSITY;
        ArcSurvivors.screenShake.duration = BC.SHAKE_DURATION;
        ArcSurvivors.hitStop.active = true;
        ArcSurvivors.hitStop.frames = BC.HITSTOP_FRAMES;
        ArcSurvivors.Audio.bossDeath();
        
        ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.BOSS_DIE, this);
    } else {
        var gemType = Math.random() < BC.LARGE_GEM_CHANCE ? 'large' : 'small';
        ArcSurvivors.gems.push(new ArcSurvivors.Gem(this.x, this.y, gemType, this.level));
        if (Math.random() < BC.EXTRA_GEM_CHANCE) {
            var offsetX = (Math.random() - 0.5) * 30;
            var offsetY = (Math.random() - 0.5) * 30;
            ArcSurvivors.gems.push(new ArcSurvivors.Gem(this.x + offsetX, this.y + offsetY, 'small', this.level));
        }
        ArcSurvivors.trySpawnBuffItem(this.x, this.y);
    }

    if (player.hasVampireMask) {
        player.hp = Math.min(player.maxHp, player.hp + CFG.VAMPIRE_MASK.HEAL_AMOUNT);
        ArcSurvivors.spawnParticles(player.x, player.y, 3, 'rgb(255,0,0)', 3, 2);
    }

    if (player.hasKillExplosion) {
        var KE = CFG.KILL_EXPLOSION;
        var enemies = ArcSurvivors.enemies;
        for (var j = 0; j < enemies.length; j++) {
            var e = enemies[j];
            if (e !== this && e.active) {
                if (ArcSurvivors.Utils.distance(e.x, e.y, this.x, this.y) < KE.RADIUS) {
                    e.takeDamage(player.attackPower * KE.DAMAGE_SCALE);
                }
            }
        }
        ArcSurvivors.spawnParticles(this.x, this.y, KE.PARTICLE_COUNT, 'rgb(255,136,68)', 8, 5);
    }

    ArcSurvivors.spawnParticles(this.x, this.y, 8, 'rgb(' + this.hexToRgb(this.color) + ')', 5, 3);

    if (this.type === 'split' && this.canSplit) {
        for (var j = 0; j < 2; j++) {
            var angle = Math.random() * Math.PI * 2;
            ArcSurvivors.enemies.push(new ArcSurvivors.Enemy(
                this.x + Math.cos(angle) * 20,
                this.y + Math.sin(angle) * 20,
                'mini'
            ));
        }
    }

    ArcSurvivors.screenShake.intensity = HE.NORMAL_SHAKE_INTENSITY;
    ArcSurvivors.screenShake.duration = HE.NORMAL_SHAKE_DURATION;
};

ArcSurvivors.Enemy.prototype.hexToRgb = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16) : '255,0,0';
};

ArcSurvivors.Enemy.prototype.draw = function(ctx) {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var FR = CFG.FROST;
    var RC = CFG.RENDERER;
    var RL = ArcSurvivors.ResourceLoader;

    ctx.save();

    // 检查是否有精灵图资源
    var spriteName = 'enemy_' + this.type;
    if (RL && RL.hasSprite(spriteName)) {
        // 使用精灵图绘制
        var sprite = RL.getSprite(spriteName);
        var drawWidth = this.radius * 2;
        var drawHeight = this.radius * 2;
        
        // 绘制冰冻/减速效果
        if (this.frozen) {
            ctx.fillStyle = FR.FROST_COLOR;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + FR.FROST_RADIUS_EXTRA, 0, Math.PI * 2);
            ctx.fill();
        }
        
        if (this.slowed) {
            ctx.fillStyle = FR.SLOW_COLOR;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + FR.SLOW_RADIUS_EXTRA, 0, Math.PI * 2);
            ctx.fill();
            if (Math.random() < FR.PARTICLE_CHANCE) {
                ArcSurvivors.spawnParticles(this.x, this.y, 1, 'rgb(136,255,255)', 1, 1);
            }
        }
        
        // 绘制精灵图
        ctx.drawImage(sprite, 
            this.x - this.radius, 
            this.y - this.radius, 
            drawWidth, 
            drawHeight);
        
        // Boss血条和名称
        if (this.type === 'boss' && this.hp < this.maxHp && this.hp > 0) {
            var BC = RC.BOSS;
            ctx.shadowBlur = 0;
            var barW = this.radius * BC.HP_BAR_SCALE;
            var barH = BC.HP_BAR_HEIGHT;
            var barX = this.x - barW / 2;
            var barY = this.y - this.radius - BC.HP_BAR_OFFSET_Y;
            ctx.fillStyle = BC.HP_BG_COLOR;
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = BC.HP_FILL_COLOR;
            ctx.fillRect(barX, barY, (this.hp / this.maxHp) * barW, barH);
            ctx.strokeStyle = BC.HP_BORDER_COLOR;
            ctx.strokeRect(barX, barY, barW, barH);

            ctx.fillStyle = BC.NAME_COLOR;
            ctx.font = BC.NAME_FONT;
            ctx.textAlign = 'center';
            ctx.fillText(BC.NAME_LABEL, this.x, barY - 5);
        } else if (this.hp < this.maxHp && this.hp > 0) {
            var EHB = RC.ENEMY_HP_BAR;
            ctx.shadowBlur = 0;
            ctx.fillStyle = EHB.BG_COLOR;
            ctx.fillRect(this.x - this.radius, this.y - this.radius - EHB.OFFSET_Y, this.radius * 2, EHB.HEIGHT);
            ctx.fillStyle = EHB.FILL_COLOR;
            ctx.fillRect(this.x - this.radius, this.y - this.radius - EHB.OFFSET_Y, (this.hp / this.maxHp) * this.radius * 2, EHB.HEIGHT);
        }
    } else {
        // 回退到原有Canvas绘制
        if (this.frozen) {
            ctx.fillStyle = FR.FROST_COLOR;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + FR.FROST_RADIUS_EXTRA, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.slowed) {
            ctx.fillStyle = FR.SLOW_COLOR;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + FR.SLOW_RADIUS_EXTRA, 0, Math.PI * 2);
            ctx.fill();
            if (Math.random() < FR.PARTICLE_CHANCE) {
                ArcSurvivors.spawnParticles(this.x, this.y, 1, 'rgb(136,255,255)', 1, 1);
            }
        }

        ctx.shadowColor = this.color;
        ctx.shadowBlur = RC.SHADOW_BLUR;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = RC.LINE_WIDTH;

        ctx.beginPath();
        switch (this.shape) {
            case 'circle':
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                break;
            case 'triangle':
                ctx.moveTo(this.x, this.y - this.radius);
                ctx.lineTo(this.x - this.radius, this.y + this.radius);
                ctx.lineTo(this.x + this.radius, this.y + this.radius);
                ctx.closePath();
                break;
            case 'diamond':
                ctx.moveTo(this.x, this.y - this.radius);
                ctx.lineTo(this.x + this.radius, this.y);
                ctx.lineTo(this.x, this.y + this.radius);
                ctx.lineTo(this.x - this.radius, this.y);
                ctx.closePath();
                break;
            case 'square':
                ctx.rect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
                break;
            case 'boss':
                for (var k = 0; k < 6; k++) {
                    var a = (k / 6) * Math.PI * 2 - Math.PI / 2;
                    var bx = this.x + Math.cos(a) * this.radius;
                    var by = this.y + Math.sin(a) * this.radius;
                    if (k === 0) ctx.moveTo(bx, by);
                    else ctx.lineTo(bx, by);
                }
                ctx.closePath();
                break;
        }
        ctx.fill();
        ctx.stroke();

        if (this.type === 'boss') {
            var BC = RC.BOSS;

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * BC.INNER_RADIUS_SCALE, 0, Math.PI * 2);
            ctx.fillStyle = BC.INNER_COLOR;
            ctx.fill();
            ctx.strokeStyle = BC.INNER_BORDER;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(this.x - BC.EYE_OFFSET_X, this.y - BC.EYE_OFFSET_Y, BC.EYE_RADIUS, 0, Math.PI * 2);
            ctx.arc(this.x + BC.EYE_OFFSET_X, this.y - BC.EYE_OFFSET_Y, BC.EYE_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = BC.EYE_COLOR;
            ctx.fill();

            if (this.hp < this.maxHp && this.hp > 0) {
                ctx.shadowBlur = 0;
                var barW = this.radius * BC.HP_BAR_SCALE;
                var barH = BC.HP_BAR_HEIGHT;
                var barX = this.x - barW / 2;
                var barY = this.y - this.radius - BC.HP_BAR_OFFSET_Y;
                ctx.fillStyle = BC.HP_BG_COLOR;
                ctx.fillRect(barX, barY, barW, barH);
                ctx.fillStyle = BC.HP_FILL_COLOR;
                ctx.fillRect(barX, barY, (this.hp / this.maxHp) * barW, barH);
                ctx.strokeStyle = BC.HP_BORDER_COLOR;
                ctx.strokeRect(barX, barY, barW, barH);

                ctx.fillStyle = BC.NAME_COLOR;
                ctx.font = BC.NAME_FONT;
                ctx.textAlign = 'center';
                ctx.fillText(BC.NAME_LABEL, this.x, barY - 5);
            }
        } else if (this.hp < this.maxHp && this.hp > 0) {
            var EHB = RC.ENEMY_HP_BAR;
            ctx.shadowBlur = 0;
            ctx.fillStyle = EHB.BG_COLOR;
            ctx.fillRect(this.x - this.radius, this.y - this.radius - EHB.OFFSET_Y, this.radius * 2, EHB.HEIGHT);
            ctx.fillStyle = EHB.FILL_COLOR;
            ctx.fillRect(this.x - this.radius, this.y - this.radius - EHB.OFFSET_Y, (this.hp / this.maxHp) * this.radius * 2, EHB.HEIGHT);
        }
    }

    ctx.restore();
};

// 敌人生成
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

// Boss生成（带警告）
ArcSurvivors.spawnBoss = function() {
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
    setTimeout(function() {
        var boss = new self.Enemy(x, y, 'boss');
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

// 敌方子弹
ArcSurvivors.EnemyBullet = function(x, y, angle, speed, damage) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.damage = damage;
    this.radius = 6;
    this.active = true;
};

ArcSurvivors.EnemyBullet.prototype.update = function(dt) {
    this.x += Math.cos(this.angle) * this.speed * dt * 60;
    this.y += Math.sin(this.angle) * this.speed * dt * 60;

    var CFG = ArcSurvivors.GAME_CONFIG;
    if (this.x < -20 || this.x > CFG.CANVAS_WIDTH + 20 ||
        this.y < -20 || this.y > CFG.CANVAS_HEIGHT + 20) {
        this.active = false;
        return;
    }

    var player = ArcSurvivors.player;
    if (ArcSurvivors.Utils.distance(this.x, this.y, player.x, player.y) < this.radius + player.radius) {
        player.takeDamage(this.damage);
        this.active = false;
    }
};

ArcSurvivors.EnemyBullet.prototype.draw = function(ctx) {
    var RL = ArcSurvivors.ResourceLoader;
    
    // 检查是否有精灵图资源
    if (RL && RL.hasSprite('enemy_bullet')) {
        // 使用精灵图绘制
        var sprite = RL.getSprite('enemy_bullet');
        var drawWidth = this.radius * 2;
        var drawHeight = this.radius * 2;
        ctx.drawImage(sprite, 
            this.x - this.radius, 
            this.y - this.radius, 
            drawWidth, 
            drawHeight);
    } else {
        // 回退到原有Canvas绘制
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        var grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        grad.addColorStop(0, '#ff88ff');
        grad.addColorStop(1, '#ff0044');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
};