/**
 * enemy.js - 敌人系统
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Enemy = function(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.active = true;
    this.frozen = false;
    this.frozenTimer = 0;
    this.canSplit = false;

    var gs = ArcSurvivors.gameState;
    var df = gs.difficultyFactor;

    switch (type) {
        case 'normal':
            this.radius = 15; this.speed = 2.5;
            this.hp = 15 + df * 8; this.maxHp = this.hp;
            this.damage = 5; this.color = '#ff4444'; this.shape = 'circle';
            break;
        case 'fast':
            this.radius = 12; this.speed = 3.8;
            this.hp = 8 + df * 4; this.maxHp = this.hp;
            this.damage = 8; this.color = '#ffff44'; this.shape = 'triangle';
            break;
        case 'split':
            this.radius = 20; this.speed = 1.8;
            this.hp = 25 + df * 12; this.maxHp = this.hp;
            this.damage = 12; this.color = '#44ff44'; this.shape = 'diamond';
            this.canSplit = true;
            break;
        case 'mini':
            this.radius = 10; this.speed = 3;
            this.hp = 8; this.maxHp = this.hp;
            this.damage = 4; this.color = '#44ff44'; this.shape = 'diamond';
            break;
        case 'boss':
            this.radius = 40; this.speed = 1.5;
            this.hp = 200 + df * 150; this.maxHp = this.hp;
            this.damage = 25; this.color = '#ff00ff'; this.shape = 'boss';
            this.shootTimer = 0;
            this.shootInterval = 2;
            this.bossPhase = 0;
            break;
    }
};

ArcSurvivors.Enemy.prototype.update = function(dt) {
    if (this.frozen) {
        this.frozenTimer -= dt;
        if (this.frozenTimer <= 0) this.frozen = false;
        return;
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
        this.shootTimer += dt;
        // 低血量时加速射击
        var interval = this.hp < this.maxHp * 0.3 ? this.shootInterval * 0.5 : this.shootInterval;
        if (this.shootTimer >= interval) {
            this.shootTimer = 0;
            this.bossShoot();
        }
    }
};

ArcSurvivors.Enemy.prototype.bossShoot = function() {
    var player = ArcSurvivors.player;
    var angle = Math.atan2(player.y - this.y, player.x - this.x);

    // 发射3发子弹散射
    for (var i = -1; i <= 1; i++) {
        ArcSurvivors.bullets.push(new ArcSurvivors.EnemyBullet(
            this.x, this.y,
            angle + i * 0.3,
            4,
            this.damage * 0.6
        ));
    }
};

ArcSurvivors.Enemy.prototype.takeDamage = function(damage) {
    this.hp -= damage;
    if (this.hp <= 0) this.die();
};

ArcSurvivors.Enemy.prototype.die = function() {
    this.active = false;
    ArcSurvivors.gameState.kills++;
    var player = ArcSurvivors.player;
    ArcSurvivors.Audio.enemyDeath();

    if (this.type === 'boss') {
        // Boss掉落：大量宝石 + 直接升级
        for (var i = 0; i < 8; i++) {
            var angle = Math.random() * Math.PI * 2;
            var dist = Math.random() * 50 + 20;
            ArcSurvivors.gems.push(new ArcSurvivors.Gem(
                this.x + Math.cos(angle) * dist,
                this.y + Math.sin(angle) * dist,
                'large'
            ));
        }
        // 直接获得大量经验
        player.gainExp(200);
        // Boss死亡大爆炸
        ArcSurvivors.spawnParticles(this.x, this.y, 30, 'rgb(255,0,255)', 10, 8);
        ArcSurvivors.screenShake.intensity = 3;
        ArcSurvivors.screenShake.duration = 0.3;
        ArcSurvivors.hitStop.active = true;
        ArcSurvivors.hitStop.frames = 5;
        ArcSurvivors.Audio.bossDeath();
    } else {
        var gemType = Math.random() < 0.25 ? 'large' : 'small';
        ArcSurvivors.gems.push(new ArcSurvivors.Gem(this.x, this.y, gemType));
        // 额外掉落一颗宝石
        if (Math.random() < 0.4) {
            var offsetX = (Math.random() - 0.5) * 30;
            var offsetY = (Math.random() - 0.5) * 30;
            ArcSurvivors.gems.push(new ArcSurvivors.Gem(this.x + offsetX, this.y + offsetY, 'small'));
        }
    }

    if (player.hasKillExplosion) {
        var enemies = ArcSurvivors.enemies;
        for (var j = 0; j < enemies.length; j++) {
            var e = enemies[j];
            if (e !== this && e.active) {
                if (ArcSurvivors.Utils.distance(e.x, e.y, this.x, this.y) < 60) {
                    e.takeDamage(player.attackPower * 0.5);
                }
            }
        }
        ArcSurvivors.spawnParticles(this.x, this.y, 10, 'rgb(255,136,68)', 8, 5);
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

    ArcSurvivors.screenShake.intensity = 0.5;
    ArcSurvivors.screenShake.duration = 0.05;
};

ArcSurvivors.Enemy.prototype.hexToRgb = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16) : '255,0,0';
};

ArcSurvivors.Enemy.prototype.draw = function(ctx) {
    ctx.save();

    if (this.frozen) {
        ctx.fillStyle = 'rgba(136, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

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
        case 'boss':
            // Boss形状：六角形 + 内圈
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

    // Boss内圈和脉冲效果
    if (this.type === 'boss') {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.strokeStyle = '#ff88ff';
        ctx.stroke();

        // Boss眼睛
        ctx.beginPath();
        ctx.arc(this.x - 12, this.y - 5, 6, 0, Math.PI * 2);
        ctx.arc(this.x + 12, this.y - 5, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ff0000';
        ctx.fill();

        // Boss血条（更大更明显）
        if (this.hp < this.maxHp) {
            ctx.shadowBlur = 0;
            var barW = this.radius * 2.5;
            var barH = 8;
            var barX = this.x - barW / 2;
            var barY = this.y - this.radius - 20;
            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = '#ff0044';
            ctx.fillRect(barX, barY, (this.hp / this.maxHp) * barW, barH);
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(barX, barY, barW, barH);
            // Boss名称
            ctx.fillStyle = '#ff88ff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('BOSS', this.x, barY - 5);
        }
    } else if (this.hp < this.maxHp) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - this.radius, this.y - this.radius - 10, this.radius * 2, 5);
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(this.x - this.radius, this.y - this.radius - 10, (this.hp / this.maxHp) * this.radius * 2, 5);
    }

    ctx.restore();
};

// 敌人生成
ArcSurvivors.spawnEnemies = function(dt) {
    var time = this.gameState.time;
    // 更快的刷怪节奏：基础1.5，每15秒加速，上限6
    var spawnRate = 1.5 + Math.floor(time / 15) * 0.5;
    spawnRate = Math.min(spawnRate, 6);

    if (Math.random() < spawnRate * dt) {
        var side = Math.floor(Math.random() * 4);
        var x, y;

        switch (side) {
            case 0: x = Math.random() * this.CANVAS_WIDTH; y = -30; break;
            case 1: x = this.CANVAS_WIDTH + 30; y = Math.random() * this.CANVAS_HEIGHT; break;
            case 2: x = Math.random() * this.CANVAS_WIDTH; y = this.CANVAS_HEIGHT + 30; break;
            case 3: x = -30; y = Math.random() * this.CANVAS_HEIGHT; break;
        }

        var type = 'normal';
        if (time > 10 && Math.random() < 0.25) type = 'fast';
        if (time > 20 && Math.random() < 0.2) type = 'split';

        this.enemies.push(new this.Enemy(x, y, type));
    }

    // 额外批量刷怪：每8秒从随机方向涌入一波
    if (Math.random() < dt / 8) {
        var batchSide = Math.floor(Math.random() * 4);
        var count = 3 + Math.floor(time / 30);
        for (var i = 0; i < count; i++) {
            var bx, by;
            switch (batchSide) {
                case 0: bx = Math.random() * this.CANVAS_WIDTH; by = -30 - Math.random() * 50; break;
                case 1: bx = this.CANVAS_WIDTH + 30 + Math.random() * 50; by = Math.random() * this.CANVAS_HEIGHT; break;
                case 2: bx = Math.random() * this.CANVAS_WIDTH; by = this.CANVAS_HEIGHT + 30 + Math.random() * 50; break;
                case 3: bx = -30 - Math.random() * 50; by = Math.random() * this.CANVAS_HEIGHT; break;
            }
            this.enemies.push(new this.Enemy(bx, by, 'normal'));
        }
    }

    // Boss刷新：每45秒刷一个Boss
    if (!this.gameState.bossTimer) this.gameState.bossTimer = 0;
    this.gameState.bossTimer += dt;
    if (this.gameState.bossTimer >= 45 && time > 30) {
        this.gameState.bossTimer = 0;
        this.spawnBoss();
    }
};

// Boss生成（带警告）
ArcSurvivors.spawnBoss = function() {
    var side = Math.floor(Math.random() * 4);
    var x, y;
    switch (side) {
        case 0: x = this.CANVAS_WIDTH / 2; y = -50; break;
        case 1: x = this.CANVAS_WIDTH + 50; y = this.CANVAS_HEIGHT / 2; break;
        case 2: x = this.CANVAS_WIDTH / 2; y = this.CANVAS_HEIGHT + 50; break;
        case 3: x = -50; y = this.CANVAS_HEIGHT / 2; break;
    }

    // 显示警告
    this.showBossWarning();

    var self = this;
    setTimeout(function() {
        self.enemies.push(new self.Enemy(x, y, 'boss'));
        self.Audio.init && self.Audio.pause();
    }, 1500);
};

ArcSurvivors.showBossWarning = function() {
    var el = document.getElementById('bossWarning');
    el.style.display = 'block';
    this.Audio.bossWarning();
    setTimeout(function() {
        el.style.display = 'none';
    }, 1500);
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

    // 出界销毁
    if (this.x < -20 || this.x > ArcSurvivors.CANVAS_WIDTH + 20 ||
        this.y < -20 || this.y > ArcSurvivors.CANVAS_HEIGHT + 20) {
        this.active = false;
        return;
    }

    // 命中玩家
    var player = ArcSurvivors.player;
    if (ArcSurvivors.Utils.distance(this.x, this.y, player.x, player.y) < this.radius + player.radius) {
        player.takeDamage(this.damage);
        this.active = false;
    }
};

ArcSurvivors.EnemyBullet.prototype.draw = function(ctx) {
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
};
