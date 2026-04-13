/**
 * entities/bullet.js - 子弹与激光
 */
var ArcSurvivors = ArcSurvivors || {};

// 普通子弹
ArcSurvivors.Bullet = function(x, y, angle, speed, damage, size, penetration, isCritical) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.damage = damage;
    this.size = size;
    this.penetration = penetration;
    this.active = true;
    this.trail = [];
    this.hitEnemies = new Set();
    this.isCritical = isCritical || false;
};

ArcSurvivors.Bullet.prototype.update = function(dt) {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var BC = CFG.BULLET;
    var FR = CFG.FROST;

    this.trail.push({ x: this.x, y: this.y, alpha: 1 });
    if (this.trail.length > BC.TRAIL_LENGTH) this.trail.shift();
    for (var i = 0; i < this.trail.length; i++) {
        this.trail[i].alpha = i / this.trail.length;
    }

    this.x += Math.cos(this.angle) * this.speed * dt * 60;
    this.y += Math.sin(this.angle) * this.speed * dt * 60;

    var bounced = false;
    if (this.x < 0) { this.x = 0; this.angle = Math.PI - this.angle; bounced = true; }
    else if (this.x > CFG.CANVAS_WIDTH) { this.x = CFG.CANVAS_WIDTH; this.angle = Math.PI - this.angle; bounced = true; }
    if (this.y < 0) { this.y = 0; this.angle = -this.angle; bounced = true; }
    else if (this.y > CFG.CANVAS_HEIGHT) { this.y = CFG.CANVAS_HEIGHT; this.angle = -this.angle; bounced = true; }

    if (bounced) {
        this.bounceCount = (this.bounceCount || 0) + 1;
        if (this.bounceCount > ArcSurvivors.player.wallBounces) {
            this.active = false;
        }
    }

    var enemies = ArcSurvivors.enemies;
    var player = ArcSurvivors.player;

    for (var j = 0; j < enemies.length; j++) {
        var enemy = enemies[j];
        if (!this.hitEnemies.has(enemy)) {
            var dist = ArcSurvivors.Utils.distance(enemy.x, enemy.y, this.x, this.y);
            if (dist < enemy.radius + this.size) {
                this.hitEnemies.add(enemy);
                enemy.takeDamage(this.damage);
                this.penetration--;
                ArcSurvivors.Audio.hit();
                
                ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.BULLET_HIT, this, enemy);

                // 负面效果：霸体敌人免疫
                if (!enemy.superArmor) {
                    // 冰霜减速
                    if (player.hasFrostSlow) {
                        if (!enemy.slowed) {
                            enemy.speed = enemy.speed * FR.SLOW_FACTOR;
                        }
                        enemy.slowed = true;
                        enemy.slowedTimer = FR.SLOW_DURATION;
                        ArcSurvivors.spawnParticles(enemy.x, enemy.y, 5, 'rgb(136,255,255)', 4, 2);
                    }
                    
                    // 击退效果
                    if (player.hasKnockback) {
                        this.applyKnockback(enemy);
                    }
                }
                
                // 神锋无影（伤害效果，不受霸体影响）
                if (player.lightningChainCount > 0) {
                    this.triggerLightningChain(enemy);
                }

                if (this.penetration <= 0) {
                    this.active = false;
                }
                break;
            }
        }
    }
};

ArcSurvivors.Bullet.prototype.applyKnockback = function(enemy) {
    var KB = ArcSurvivors.GAME_CONFIG.KNOCKBACK;
    var player = ArcSurvivors.player;
    
    // 计算击退方向（从玩家指向敌人）
    var dx = enemy.x - player.x;
    var dy = enemy.y - player.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 0) {
        // 应用击退位移
        var knockbackX = (dx / dist) * KB.DISTANCE;
        var knockbackY = (dy / dist) * KB.DISTANCE;
        
        // 限制在画布范围内
        var CFG = ArcSurvivors.GAME_CONFIG;
        enemy.x = Math.max(enemy.radius, Math.min(CFG.CANVAS_WIDTH - enemy.radius, enemy.x + knockbackX));
        enemy.y = Math.max(enemy.radius, Math.min(CFG.CANVAS_HEIGHT - enemy.radius, enemy.y + knockbackY));
        
        // 击退特效
        ArcSurvivors.spawnParticles(enemy.x, enemy.y, KB.PARTICLE_COUNT, 'rgb(255, 200, 100)', KB.PARTICLE_SIZE, KB.PARTICLE_SPEED);
    }
};

ArcSurvivors.Bullet.prototype.triggerLightningChain = function(hitEnemy) {
    var LC = ArcSurvivors.GAME_CONFIG.LIGHTNING_CHAIN;
    var player = ArcSurvivors.player;
    var enemies = ArcSurvivors.enemies;
    var chained = [hitEnemy];
    var current = hitEnemy;
    
    // 连锁伤害
    for (var i = 0; i < player.lightningChainCount; i++) {
        var closest = null;
        var closestDist = LC.CHAIN_RANGE;
        
        // 找最近的未连锁敌人
        for (var j = 0; j < enemies.length; j++) {
            var enemy = enemies[j];
            if (enemy.active && chained.indexOf(enemy) === -1) {
                var dist = ArcSurvivors.Utils.distance(current.x, current.y, enemy.x, enemy.y);
                if (dist < closestDist) {
                    closestDist = dist;
                    closest = enemy;
                }
            }
        }
        
        if (closest) {
            chained.push(closest);
            closest.takeDamage(this.damage * LC.DAMAGE_SCALE);
            
            // 连锁特效
            ArcSurvivors.spawnParticles(closest.x, closest.y, LC.PARTICLE_COUNT, 'rgb(255, 255, 0)', LC.PARTICLE_SIZE, LC.PARTICLE_SPEED);
            
            current = closest;
        } else {
            break;
        }
    }
};

ArcSurvivors.Bullet.prototype.draw = function(ctx) {
    var BC = ArcSurvivors.GAME_CONFIG.BULLET;
    var RL = ArcSurvivors.ResourceLoader;

    // 检查是否有精灵图资源
    var spriteName = this.isCritical ? 'bullet_critical' : 'bullet_normal';
    if (RL && RL.hasSprite(spriteName)) {
        // 使用精灵图绘制
        var sprite = RL.getSprite(spriteName);
        var drawWidth = this.size * 2;
        var drawHeight = this.size * 2;
        
        // 绘制拖尾效果（仍然使用Canvas）
        for (var i = 0; i < this.trail.length; i++) {
            var point = this.trail[i];
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.size * BC.TRAIL_SIZE_SCALE * point.alpha, 0, Math.PI * 2);
            ctx.fillStyle = BC.COLORS.TRAIL.replace('{alpha}', point.alpha * BC.TRAIL_ALPHA_SCALE);
            ctx.fill();
        }
        
        // 绘制精灵图
        ctx.drawImage(sprite, 
            this.x - this.size, 
            this.y - this.size, 
            drawWidth, 
            drawHeight);
    } else {
        // 回退到原有Canvas绘制
        for (var i = 0; i < this.trail.length; i++) {
            var point = this.trail[i];
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.size * BC.TRAIL_SIZE_SCALE * point.alpha, 0, Math.PI * 2);
            ctx.fillStyle = BC.COLORS.TRAIL.replace('{alpha}', point.alpha * BC.TRAIL_ALPHA_SCALE);
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        var gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, BC.COLORS.CORE);
        gradient.addColorStop(0.5, BC.COLORS.MID);
        gradient.addColorStop(1, BC.COLORS.OUTER);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 暴击子弹效果
        if (this.isCritical) {
            ctx.strokeStyle = '#ffcc00';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 暴击光晕
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size + 3, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 204, 0, 0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
};

// 激光
ArcSurvivors.Laser = function(x, y, angle, damage) {
    var LC = ArcSurvivors.GAME_CONFIG.LASER;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.damage = damage;
    this.length = LC.LENGTH;
    this.active = true;
    this.lifetime = LC.LIFETIME;
    this.hitEnemies = new Set();
};

ArcSurvivors.Laser.prototype.update = function(dt) {
    this.lifetime -= dt;
    if (this.lifetime <= 0) this.active = false;

    var endX = this.x + Math.cos(this.angle) * this.length;
    var endY = this.y + Math.sin(this.angle) * this.length;
    var enemies = ArcSurvivors.enemies;

    for (var i = 0; i < enemies.length; i++) {
        var enemy = enemies[i];
        if (!this.hitEnemies.has(enemy)) {
            var dist = ArcSurvivors.Utils.pointToLineDistance(
                enemy.x, enemy.y, this.x, this.y, endX, endY
            );
            if (dist < enemy.radius) {
                this.hitEnemies.add(enemy);
                enemy.takeDamage(this.damage);
                ArcSurvivors.hitStop.active = true;
                ArcSurvivors.hitStop.frames = ArcSurvivors.GAME_CONFIG.LASER.HITSTOP_FRAMES;
                ArcSurvivors.Audio.hit();
            }
        }
    }
};

ArcSurvivors.Laser.prototype.draw = function(ctx) {
    var LC = ArcSurvivors.GAME_CONFIG.LASER.COLORS;
    var endX = this.x + Math.cos(this.angle) * this.length;
    var endY = this.y + Math.sin(this.angle) * this.length;

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = LC.OUTER;
    ctx.lineWidth = LC.OUTER_WIDTH;
    ctx.stroke();

    ctx.strokeStyle = LC.CORE;
    ctx.lineWidth = LC.CORE_WIDTH;
    ctx.stroke();
};