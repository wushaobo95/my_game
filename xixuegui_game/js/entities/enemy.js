/**
 * entities/enemy.js - 敌人系统（仅普通敌人）
 * Boss逻辑已移至entities/bosses/boss-base.js
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
    this.superArmor = EC.SUPER_ARMOR || false;

    var gs = ArcSurvivors.gameState;
    var df = gs.difficultyFactor;
    var playerLevel = ArcSurvivors.player ? ArcSurvivors.player.level : 1;
    this.level = playerLevel;

    this.radius = EC.RADIUS;
    this.speed = EC.SPEED * (1 + (this.level - 1) * EL.SPEED_SCALE_PER_LEVEL);
    this.baseSpeed = this.speed;
    this.hp = (EC.HP_BASE + df * EC.HP_SCALE) * (1 + (this.level - 1) * EL.HP_SCALE_PER_LEVEL);
    this.maxHp = this.hp;
    this.damage = EC.DAMAGE * (1 + (this.level - 1) * EL.DAMAGE_SCALE_PER_LEVEL);
    this.color = EC.COLOR;
    this.shape = EC.SHAPE;

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

    // 普通敌人掉落
    var gemType = Math.random() < BC.LARGE_GEM_CHANCE ? 'large' : 'small';
    ArcSurvivors.gems.push(new ArcSurvivors.Gem(this.x, this.y, gemType, this.level));
    if (Math.random() < BC.EXTRA_GEM_CHANCE) {
        var offsetX = (Math.random() - 0.5) * 30;
        var offsetY = (Math.random() - 0.5) * 30;
        ArcSurvivors.gems.push(new ArcSurvivors.Gem(this.x + offsetX, this.y + offsetY, 'small', this.level));
    }
    ArcSurvivors.trySpawnBuffItem(this.x, this.y);

    // 吸血鬼面具
    if (player.hasVampireMask) {
        player.hp = Math.min(player.maxHp, player.hp + CFG.VAMPIRE_MASK.HEAL_AMOUNT);
        ArcSurvivors.spawnParticles(player.x, player.y, 3, 'rgb(255,0,0)', 3, 2);
    }

    // 爆炸火花
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

    // 检查是否有合图资源
    var spriteInfo = null;
    if (RL && RL.hasSpriteSheet('enemies')) {
        spriteInfo = RL.getSpriteFromSheet(this.type);
    }
    
    // 如果没有合图，回退到旧版精灵图检测
    if (!spriteInfo) {
        var spriteName = 'enemy_' + this.type;
        if (RL && RL.hasSprite(spriteName)) {
            var oldSprite = RL.getSprite(spriteName);
            if (oldSprite) {
                spriteInfo = {
                    image: oldSprite,
                    sx: 0,
                    sy: 0,
                    sw: oldSprite.width,
                    sh: oldSprite.height
                };
            }
        }
    }
    
    if (spriteInfo) {
        // 使用精灵图/合图绘制，放大一倍
        var drawWidth = this.radius * 4;
        var drawHeight = this.radius * 4;

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

        // 绘制精灵图（从合图切取或完整精灵图），放大一倍
        ctx.drawImage(
            spriteInfo.image,
            spriteInfo.sx, spriteInfo.sy,
            spriteInfo.sw, spriteInfo.sh,
            this.x - this.radius * 2,
            this.y - this.radius * 2,
            drawWidth,
            drawHeight
        );

        // 普通敌人血条
        if (this.hp < this.maxHp && this.hp > 0) {
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

        var r = this.radius;
        var x = this.x;
        var y = this.y;

        switch (this.type) {
            case 'normal':
                this.drawSpider(ctx, x, y, r);
                break;
            case 'fast':
                this.drawBat(ctx, x, y, r);
                break;
            case 'split':
                this.drawCaterpillar(ctx, x, y, r);
                break;
            case 'mini':
                this.drawLarva(ctx, x, y, r);
                break;
            case 'ranged':
                this.drawBee(ctx, x, y, r);
                break;
            default:
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
        }

        // 普通敌人血条
        if (this.hp < this.maxHp && this.hp > 0) {
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

// 林间毒蜘蛛 - 两节身体+8条腿（静态）
ArcSurvivors.Enemy.prototype.drawSpider = function(ctx, x, y, r) {
    var legCount = 8;

    ctx.save();
    ctx.translate(x, y);

    // 8条腿（4对）
    for (var i = 0; i < legCount; i++) {
        var side = i < 4 ? -1 : 1;
        var pair = i % 4;

        // 大腿（第一段）
        var hipX = side * r * 0.5;
        var hipY = -r * 0.1 + pair * r * 0.2;
        var kneeX = hipX + side * r * 0.7;
        var kneeY = hipY - r * 0.3;
        // 小腿（第二段）
        var footX = kneeX + side * r * 0.6;
        var footY = kneeY + r * 0.4;

        // 大腿
        ctx.strokeStyle = '#aa2222';
        ctx.lineWidth = 3 - pair * 0.3;
        ctx.beginPath();
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(kneeX, kneeY);
        ctx.stroke();

        // 小腿
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2 - pair * 0.2;
        ctx.beginPath();
        ctx.moveTo(kneeX, kneeY);
        ctx.lineTo(footX, footY);
        ctx.stroke();

        // 脚尖
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(footX, footY, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // 腹部（椭圆，较大）
    ctx.beginPath();
    ctx.ellipse(0, r * 0.35, r * 0.65, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 腹部花纹（沙漏形）
    ctx.fillStyle = 'rgba(180,0,0,0.6)';
    ctx.beginPath();
    ctx.moveTo(0, r * 0.1);
    ctx.lineTo(-r * 0.15, r * 0.35);
    ctx.lineTo(0, r * 0.6);
    ctx.lineTo(r * 0.15, r * 0.35);
    ctx.closePath();
    ctx.fill();

    // 胸部（圆形，较小）
    ctx.beginPath();
    ctx.arc(0, -r * 0.25, r * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#cc3333';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 头部（半圆形，接在胸部前方）
    ctx.beginPath();
    ctx.arc(0, -r * 0.55, r * 0.35, Math.PI, 0);
    ctx.fillStyle = '#dd4444';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 8只眼睛（两排）
    var eyeRows = [
        { y: -r * 0.6, spread: r * 0.25, size: r * 0.07 },
        { y: -r * 0.72, spread: r * 0.18, size: r * 0.055 }
    ];
    for (var row = 0; row < eyeRows.length; row++) {
        var ey = eyeRows[row];
        var eyeCount = row === 0 ? 4 : 4;
        for (var ei = 0; ei < eyeCount; ei++) {
            var ex = (ei - (eyeCount - 1) / 2) * ey.spread;
            ctx.fillStyle = '#ffee00';
            ctx.beginPath();
            ctx.arc(ex, ey.y, ey.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(ex, ey.y, ey.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 毒牙（两颗弯曲尖牙）
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.1, -r * 0.5);
    ctx.quadraticCurveTo(-r * 0.2, -r * 0.2, -r * 0.15, -r * 0.05);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.1, -r * 0.5);
    ctx.quadraticCurveTo(r * 0.2, -r * 0.2, r * 0.15, -r * 0.05);
    ctx.stroke();

    // 毒牙尖端
    ctx.fillStyle = '#aaff00';
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.05, 2, 0, Math.PI * 2);
    ctx.arc(r * 0.15, -r * 0.05, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
};

// 树洞小蝙蝠 - V形翅膀+椭圆身体
ArcSurvivors.Enemy.prototype.drawBat = function(ctx, x, y, r) {
    var t = Date.now() / 200;
    var wingFlap = Math.sin(t) * 0.4;

    ctx.save();
    ctx.translate(x, y);

    // 翅膀
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;

    // 左翅膀
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.2);
    ctx.quadraticCurveTo(-r * 1.8, -r * 1.2 + wingFlap * r, -r * 1.5, r * 0.3);
    ctx.quadraticCurveTo(-r * 1.0, r * 0.1, -r * 0.4, r * 0.2);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 右翅膀
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.2);
    ctx.quadraticCurveTo(r * 1.8, -r * 1.2 + wingFlap * r, r * 1.5, r * 0.3);
    ctx.quadraticCurveTo(r * 1.0, r * 0.1, r * 0.4, r * 0.2);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 身体
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.5, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // 耳朵
    ctx.beginPath();
    ctx.moveTo(-r * 0.35, -r * 0.5);
    ctx.lineTo(-r * 0.5, -r * 1.0);
    ctx.lineTo(-r * 0.15, -r * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.35, -r * 0.5);
    ctx.lineTo(r * 0.5, -r * 1.0);
    ctx.lineTo(r * 0.15, -r * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 眼睛
    ctx.fillStyle = '#ff0';
    ctx.beginPath();
    ctx.arc(-r * 0.2, -r * 0.2, r * 0.12, 0, Math.PI * 2);
    ctx.arc(r * 0.2, -r * 0.2, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(-r * 0.2, -r * 0.2, r * 0.06, 0, Math.PI * 2);
    ctx.arc(r * 0.2, -r * 0.2, r * 0.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
};

// 大蚱蜢母体 - 长条身体+弹跳腿+翅膀
ArcSurvivors.Enemy.prototype.drawCaterpillar = function(ctx, x, y, r) {
    var t = Date.now() / 300;
    var hop = Math.abs(Math.sin(t)) * r * 0.3;

    ctx.save();
    ctx.translate(x, y - hop);

    // 后腿（粗壮弹跳腿）
    ctx.strokeStyle = '#2d7a2d';
    ctx.lineWidth = 2.5;
    // 左后腿
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, r * 0.5);
    ctx.lineTo(-r * 1.0, r * 0.2);
    ctx.lineTo(-r * 1.3, r * 0.8);
    ctx.stroke();
    // 右后腿
    ctx.beginPath();
    ctx.moveTo(r * 0.3, r * 0.5);
    ctx.lineTo(r * 1.0, r * 0.2);
    ctx.lineTo(r * 1.3, r * 0.8);
    ctx.stroke();

    // 前腿
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, r * 0.1);
    ctx.lineTo(-r * 0.6, r * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.2, r * 0.1);
    ctx.lineTo(r * 0.6, r * 0.5);
    ctx.stroke();

    // 腹部（长条形）
    ctx.beginPath();
    ctx.ellipse(0, r * 0.3, r * 0.35, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 腹部条纹
    ctx.fillStyle = 'rgba(0,80,0,0.4)';
    for (var si = 0; si < 3; si++) {
        ctx.beginPath();
        ctx.ellipse(0, r * 0.05 + si * r * 0.22, r * 0.33, r * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // 胸部
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.3, r * 0.4, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#3da03d';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // 头部
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.7, r * 0.3, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#4db84d';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // 触须
    ctx.strokeStyle = '#2d7a2d';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.1, -r * 0.9);
    ctx.quadraticCurveTo(-r * 0.4, -r * 1.3, -r * 0.7, -r * 1.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.1, -r * 0.9);
    ctx.quadraticCurveTo(r * 0.4, -r * 1.3, r * 0.7, -r * 1.1);
    ctx.stroke();

    // 复眼
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(-r * 0.2, -r * 0.7, r * 0.12, 0, Math.PI * 2);
    ctx.arc(r * 0.2, -r * 0.7, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(-r * 0.18, -r * 0.7, r * 0.05, 0, Math.PI * 2);
    ctx.arc(r * 0.22, -r * 0.7, r * 0.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
};

// 小蚱蜢 - 简化版蚱蜢，体型更小
ArcSurvivors.Enemy.prototype.drawLarva = function(ctx, x, y, r) {
    var t = Date.now() / 250;
    var hop = Math.abs(Math.sin(t)) * r * 0.4;

    ctx.save();
    ctx.translate(x, y - hop);

    // 后腿
    ctx.strokeStyle = '#2d7a2d';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, r * 0.3);
    ctx.lineTo(-r * 0.9, r * 0.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.3, r * 0.3);
    ctx.lineTo(r * 0.9, r * 0.6);
    ctx.stroke();

    // 身体
    ctx.beginPath();
    ctx.ellipse(0, r * 0.1, r * 0.35, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 头部
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.4, r * 0.25, r * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#4db84d';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // 触须
    ctx.strokeStyle = '#2d7a2d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-r * 0.08, -r * 0.55);
    ctx.lineTo(-r * 0.4, -r * 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.08, -r * 0.55);
    ctx.lineTo(r * 0.4, -r * 0.9);
    ctx.stroke();

    // 眼睛
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.4, r * 0.08, 0, Math.PI * 2);
    ctx.arc(r * 0.15, -r * 0.4, r * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
};

// 花丛大黄蜂 - 圆胖身体+透明翅膀+条纹
ArcSurvivors.Enemy.prototype.drawBee = function(ctx, x, y, r) {
    var t = Date.now() / 150;
    var wingFlap = Math.sin(t) * 0.3;

    ctx.save();
    ctx.translate(x, y);

    // 翅膀（半透明）
    ctx.fillStyle = 'rgba(200,200,255,0.35)';
    ctx.strokeStyle = 'rgba(150,150,200,0.5)';
    ctx.lineWidth = 1;

    // 上翅膀
    ctx.beginPath();
    ctx.ellipse(-r * 0.5, -r * 0.6 + wingFlap * r, r * 0.7, r * 0.4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(r * 0.5, -r * 0.6 + wingFlap * r, r * 0.7, r * 0.4, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 身体 - 黄色底
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.6, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 黑色条纹
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.15, r * 0.58, r * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, r * 0.25, r * 0.52, r * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // 头部
    ctx.beginPath();
    ctx.arc(0, -r * 0.7, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // 眼睛
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.75, r * 0.12, 0, Math.PI * 2);
    ctx.arc(r * 0.15, -r * 0.75, r * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // 触须
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.1, -r * 1.0);
    ctx.quadraticCurveTo(-r * 0.3, -r * 1.4, -r * 0.15, -r * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.1, -r * 1.0);
    ctx.quadraticCurveTo(r * 0.3, -r * 1.4, r * 0.15, -r * 1.5);
    ctx.stroke();

    // 触须末端
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 1.5, r * 0.06, 0, Math.PI * 2);
    ctx.arc(r * 0.15, -r * 1.5, r * 0.06, 0, Math.PI * 2);
    ctx.fill();

    // 尾部毒针
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.75);
    ctx.lineTo(0, r * 1.2);
    ctx.stroke();
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.moveTo(0, r * 1.2);
    ctx.lineTo(-r * 0.08, r * 1.05);
    ctx.lineTo(r * 0.08, r * 1.05);
    ctx.closePath();
    ctx.fill();

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

// Boss生成（通过BossRegistry创建）
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

// 敌方子弹
ArcSurvivors.EnemyBullet = function(x, y, angle, speed, damage, homingDuration, turnSpeed) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.damage = damage;
    this.radius = 6;
    this.active = true;
    this.homingDuration = homingDuration || 0;
    this.homingTimer = homingDuration || 0;
    this.turnSpeed = turnSpeed || 3;
};

ArcSurvivors.EnemyBullet.prototype.update = function(dt) {
    // 追踪行为
    if (this.homingTimer > 0) {
        this.homingTimer -= dt;
        var player = ArcSurvivors.player;
        var targetAngle = Math.atan2(player.y - this.y, player.x - this.x);
        var diff = targetAngle - this.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        var maxTurn = this.turnSpeed * dt;
        if (Math.abs(diff) < maxTurn) {
            this.angle = targetAngle;
        } else {
            this.angle += (diff > 0 ? 1 : -1) * maxTurn;
        }
    }

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

    if (RL && RL.hasSprite('enemy_bullet')) {
        var sprite = RL.getSprite('enemy_bullet');
        var drawWidth = this.radius * 2;
        var drawHeight = this.radius * 2;
        ctx.drawImage(sprite,
            this.x - this.radius,
            this.y - this.radius,
            drawWidth,
            drawHeight);
    } else {
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
