var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Enemy = function(x, y, type) {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var EC = CFG.ENEMY_TYPES[type] || {};
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
    this.superArmor = EC.SUPER_ARMOR || false;

    var gs = ArcSurvivors.gameState;
    var df = gs.difficultyFactor;
    var playerLevel = ArcSurvivors.player ? ArcSurvivors.player.level : 1;
    this.level = playerLevel;

    this.radius = EC.RADIUS || 12;
    this.speed = (EC.SPEED || 2) * (1 + (this.level - 1) * EL.SPEED_SCALE_PER_LEVEL);
    this.baseSpeed = this.speed;
    this.hp = ((EC.HP_BASE || 10) + df * (EC.HP_SCALE || 5)) * (1 + (this.level - 1) * EL.HP_SCALE_PER_LEVEL);
    this.maxHp = this.hp;
    this.damage = (EC.DAMAGE || 5) * (1 + (this.level - 1) * EL.DAMAGE_SCALE_PER_LEVEL);
    this.color = EC.COLOR || '#888888';
    this.shape = EC.SHAPE || 'circle';

    if (type === 'ranged') {
        this.shootTimer = 0;
        this.shootInterval = EC.SHOOT_INTERVAL;
    }

    this.specialEffect = EC.SPECIAL_EFFECT || null;
    this.evadeTimer = 0;
    this.confused = false;
    this.confuseTimer = 0;
    this.poisoned = false;
    this.poisonTimer = 0;
    this.charging = false;
    this.chargeTimer = 0;
    this.orbitAngle = Math.random() * Math.PI * 2;
    this.dashing = false;
    this.dashTimer = 0;
    this.escaping = false;
    this.escapeTimer = 0;
    this.reflected = false;

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

    if (this.confused) {
        this.confuseTimer -= dt;
        if (this.confuseTimer <= 0) {
            this.confused = false;
        }
    }

    if (this.charging) {
        this.chargeTimer -= dt;
        if (this.chargeTimer <= 0) {
            this.charging = false;
        }
    }

    if (this.dashing) {
        this.dashTimer -= dt;
    }

    if (this.escaping) {
        this.escapeTimer -= dt;
        if (this.escapeTimer <= 0) {
            this.escaping = false;
        }
    }

    var player = ArcSurvivors.player;
    var dx = player.x - this.x;
    var dy = player.y - this.y;

    if (this.confused) {
        dx = -dx + (Math.random() - 0.5) * 100;
        dy = -dy + (Math.random() - 0.5) * 100;
    }

    if (this.type === 'fly') {
        this.orbitAngle += dt * 2;
        var orbitDist = 80;
        var targetX = player.x + Math.cos(this.orbitAngle) * orbitDist;
        var targetY = player.y + Math.sin(this.orbitAngle) * orbitDist;
        dx = targetX - this.x;
        dy = targetY - this.y;
    }

    var dist = Math.sqrt(dx * dx + dy * dy);

    var moveSpeed = this.speed;
    if (this.charging) {
        moveSpeed = this.speed * 2.5;
    }
    if (this.dashing) {
        moveSpeed = this.speed * 3;
    }

    if (dist > 0) {
        this.x += (dx / dist) * moveSpeed * dt * 60;
        this.y += (dy / dist) * moveSpeed * dt * 60;
    }

    if (this.dashing && this.dashTimer <= 0) {
        this.dashing = false;
    }

    var collisionDist = ArcSurvivors.Utils.distance(this.x, this.y, player.x, player.y);
    if (collisionDist < this.radius + player.radius) {
        var actualDamage = this.damage;
        if (this.charging) {
            actualDamage *= 1.5;
        }
        player.takeDamage(actualDamage);

        if (this.type === 'hedgehog' && !this.reflected) {
            this.reflected = true;
            var reflectDmg = this.damage * 0.3;
            player.takeDamage(reflectDmg);
            ArcSurvivors.spawnParticles(this.x, this.y, 5, 'rgb(255,100,0)', 3, 3);
        }

        if (this.type === 'mosquito') {
            player.poisoned = true;
            player.poisonTimer = 3;
            player.poisonDamage = 2;
        }

        if (this.type === 'mantis' && !this.charging) {
            this.charging = true;
            this.chargeTimer = 0.5;
        }

        if (this.type === 'dragonfly' && !this.dashing) {
            this.dashing = true;
            this.dashTimer = 0.3;
        }
    }

    if (this.type === 'gecko' && this.hp / this.maxHp < 0.3 && !this.escaping) {
        this.escaping = true;
        this.escapeTimer = 2;
        this.x += (Math.random() - 0.5) * 100;
        this.y += (Math.random() - 0.5) * 100;
    }

    if (this.type === 'ranged') {
        var RC = CFG.ENEMY_TYPES.ranged;
        var dist = ArcSurvivors.Utils.distance(this.x, this.y, player.x, player.y);

        if (dist < RC.SHOOT_RANGE * 0.5) {
            this.x -= (dx / dist) * this.speed * dt * 60;
            this.y -= (dy / dist) * this.speed * dt * 60;
        }

        if (dist < RC.SHOOT_RANGE) {
            this.shootTimer += dt;
            if (this.shootTimer >= this.shootInterval) {
                this.shootTimer = 0;
                this.rangedShoot();
            }
        }
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
    var CFG = ArcSurvivors.GAME_CONFIG;
    var EC = CFG.ENEMY_TYPES[this.type];

    if (this.type === 'cockroach' && EC && EC.EVADE_CHANCE) {
        if (Math.random() < EC.EVADE_CHANCE) {
            ArcSurvivors.spawnParticles(this.x, this.y, 3, 'rgb(100,100,100)', 2, 2);
            return;
        }
    }

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

    var EC = CFG.ENEMY_TYPES[this.type];
    var gemType = 'small';
    var extraGems = 0;

    if (this.type === 'ladybug' && EC && EC.LARGE_GEM_CHANCE === 1.0) {
        gemType = 'large';
        extraGems = 2;
        ArcSurvivors.gems.push(new ArcSurvivors.Gem(this.x, this.y, 'large', this.level));

        if (Math.random() < EC.DROP_ITEM_CHANCE) {
            ArcSurvivors.trySpawnBuffItem(this.x, this.y);
        }
    } else if (this.type === 'butterfly') {
        var player = ArcSurvivors.player;
        player.confused = true;
        player.confuseTimer = 1.5;
        ArcSurvivors.spawnParticles(this.x, this.y, 8, 'rgb(200,100,255)', 3, 3);
        gemType = 'small';
    } else {
        gemType = Math.random() < BC.LARGE_GEM_CHANCE ? 'large' : 'small';
    }

    ArcSurvivors.gems.push(new ArcSurvivors.Gem(this.x, this.y, gemType, this.level));
    for (var eg = 0; eg < extraGems; eg++) {
        var offsetX = (Math.random() - 0.5) * 30;
        var offsetY = (Math.random() - 0.5) * 30;
        ArcSurvivors.gems.push(new ArcSurvivors.Gem(this.x + offsetX, this.y + offsetY, 'small', this.level));
    }
    if (Math.random() < BC.EXTRA_GEM_CHANCE) {
        var offsetX = (Math.random() - 0.5) * 30;
        var offsetY = (Math.random() - 0.5) * 30;
        ArcSurvivors.gems.push(new ArcSurvivors.Gem(this.x + offsetX, this.y + offsetY, 'small', this.level));
    }
    ArcSurvivors.trySpawnBuffItem(this.x, this.y);

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