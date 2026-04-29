/**
 * entities/gem.js - 经验宝石
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Gem = function(x, y, type, enemyLevel) {
    var GC = ArcSurvivors.GAME_CONFIG.GEM;
    this.x = x;
    this.y = y;
    this.type = type;
    var baseValue = type === 'large' ? GC.LARGE_VALUE : GC.SMALL_VALUE;
    var level = enemyLevel || 1;
    this.value = Math.floor(baseValue * (1 + (level - 1) * GC.EXP_SCALE_PER_LEVEL));
    this.color = type === 'large' ? GC.LARGE_COLOR : GC.SMALL_COLOR;
    this.radius = type === 'large' ? GC.LARGE_RADIUS : GC.SMALL_RADIUS;
    this.active = true;
};

ArcSurvivors.Gem.prototype.update = function(dt) {
    var GC = ArcSurvivors.GAME_CONFIG.GEM;
    var player = ArcSurvivors.player;
    var dist = ArcSurvivors.Utils.distance(this.x, this.y, player.x, player.y);

    // 漩涡效果：全屏吸引
    if (player.hasVortexBuff) {
        var dx = player.x - this.x;
        var dy = player.y - this.y;
        if (dist > 0) {
            this.x += (dx / dist) * player.vortexAttractSpeed * dt * 60;
            this.y += (dy / dist) * player.vortexAttractSpeed * dt * 60;
        }
    } else if (dist < player.pickupRange) {
        var dx = player.x - this.x;
        var dy = player.y - this.y;
        var speed = GC.ATTRACT_SPEED * (1 - dist / player.pickupRange);
        this.x += (dx / dist) * speed * dt * 60;
        this.y += (dy / dist) * speed * dt * 60;
    }

    if (dist < player.radius + this.radius) {
        player.gainExp(this.value);
        this.active = false;
        ArcSurvivors.Audio.pickup();
    }
};

ArcSurvivors.Gem.prototype.draw = function(ctx) {
    var GC = ArcSurvivors.GAME_CONFIG.GEM;
    var RL = ArcSurvivors.ResourceLoader;
    
    // 检查是否有精灵图资源
    var spriteName = this.type === 'large' ? 'gem_large' : 'gem_small';
    if (RL && RL.hasSprite(spriteName)) {
        // 使用精灵图绘制
        var sprite = RL.getSprite(spriteName);
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
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = GC.BORDER_COLOR;
        ctx.lineWidth = GC.LINE_WIDTH;
        ctx.stroke();
    }
};

ArcSurvivors.ItemPickup = function(x, y, item, isUnifiedItem) {
    var IC = ArcSurvivors.GAME_CONFIG.ITEM_PICKUP;
    this.x = x;
    this.y = y;
    this.item = item;
    this.radius = IC.RADIUS;
    this.active = true;
    this.bobTimer = 0;
    this.bobHeight = IC.BOB_HEIGHT;
    // 支持通过item.isUnified属性设置统一法宝物品
    this.isUnifiedItem = isUnifiedItem || (item && item.isUnified) || false;
};

ArcSurvivors.ItemPickup.prototype.update = function(dt) {
    var IC = ArcSurvivors.GAME_CONFIG.ITEM_PICKUP;
    this.bobTimer += dt * IC.BOB_SPEED;
    var bobOffset = Math.sin(this.bobTimer) * this.bobHeight;
    this.drawY = this.y + bobOffset;

    var player = ArcSurvivors.player;
    var dist = ArcSurvivors.Utils.distance(this.x, this.y, player.x, player.y);

    if (dist < player.radius + this.radius) {
        if (this.isUnifiedItem) {
            // 统一法宝物品，随机选择并自动应用
            ArcSurvivors.autoApplyRandomItem();
        } else {
            // 普通法宝物品，应用效果
            this.applyItem();
        }
        this.active = false;
        ArcSurvivors.Audio.pickup();
    }
};

ArcSurvivors.ItemPickup.prototype.applyItem = function() {
    if (this.isUnifiedItem) {
        // 统一法宝物品不应该调用此方法
        return;
    }
    var IC = ArcSurvivors.GAME_CONFIG.ITEM_PICKUP;
    var player = ArcSurvivors.player;
    this.item.apply(player);
    player.acquiredUpgrades.push(this.item);
    ArcSurvivors.spawnParticles(this.x, this.y, IC.PARTICLE_COUNT, 'rgb(255,215,0)', IC.PARTICLE_SIZE, IC.PARTICLE_SPEED);

    ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.ITEM_PICKUP, this.item);
    // 显示浮动文字提示，不暂停游戏
    var display = ArcSurvivors.getItemDisplay(this.item);
    ArcSurvivors.showFloatingText('+' + display.icon + ' ' + display.name, 'rgb(255,215,0)');
};

ArcSurvivors.ItemPickup.prototype.draw = function(ctx) {
    var IC = ArcSurvivors.GAME_CONFIG.ITEM_PICKUP;
    var RL = ArcSurvivors.ResourceLoader;

    ctx.save();

    // 获取具体图标显示信息
    var display = ArcSurvivors.getItemDisplay(this.item);
    
    // 检查是否有精灵图资源
    if (RL && RL.hasSprite('item_pickup')) {
        // 使用精灵图绘制
        var sprite = RL.getSprite('item_pickup');
        var drawWidth = this.radius * 2;
        var drawHeight = this.radius * 2;
        ctx.drawImage(sprite, 
            this.x - this.radius, 
            this.drawY - this.radius, 
            drawWidth,
            drawHeight);
    } else {
        // 回退到原有Canvas绘制
        ctx.shadowColor = IC.GLOW_COLOR;
        ctx.shadowBlur = IC.GLOW_BLUR;

        ctx.font = IC.ICON_FONT_SIZE + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(display.icon, this.x, this.drawY);

        ctx.beginPath();
        ctx.arc(this.x, this.drawY, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = IC.GLOW_COLOR;
        ctx.lineWidth = IC.BORDER_WIDTH;
        ctx.stroke();
    }

    ctx.restore();
};

// 技能拾取物品类
ArcSurvivors.SkillPickup = function(x, y, upgrade) {
    var SC = ArcSurvivors.GAME_CONFIG.SKILL_PICKUP;
    this.x = x;
    this.y = y;
    this.upgrade = upgrade;
    this.radius = SC.RADIUS;
    this.active = true;
    this.bobTimer = Math.random() * Math.PI * 2;
    this.bobHeight = SC.BOB_HEIGHT;
    this.drawY = this.y;
};

ArcSurvivors.SkillPickup.prototype.update = function(dt) {
    var SC = ArcSurvivors.GAME_CONFIG.SKILL_PICKUP;
    this.bobTimer += dt * SC.BOB_SPEED;
    var bobOffset = Math.sin(this.bobTimer) * this.bobHeight;
    this.drawY = this.y + bobOffset;

    var player = ArcSurvivors.player;
    var dist = ArcSurvivors.Utils.distance(this.x, this.y, player.x, player.y);

    if (dist < player.pickupRange) {
        var dx = player.x - this.x;
        var dy = player.y - this.y;
        var speed = 200 * (1 - dist / player.pickupRange);
        this.x += (dx / dist) * speed * dt;
        this.y += (dy / dist) * speed * dt;
    }

    if (dist < player.radius + this.radius) {
        this.active = false;
        ArcSurvivors.Audio.pickup();
        this.applyUpgrade();
    }
};

ArcSurvivors.SkillPickup.prototype.applyUpgrade = function() {
    var SC = ArcSurvivors.GAME_CONFIG.SKILL_PICKUP;
    var player = ArcSurvivors.player;
    var upgrade = this.upgrade;

    // 检查技能是否还能升级
    if (upgrade.canAppear && !upgrade.canAppear(player)) {
        // 技能已满级，显示提示
        ArcSurvivors.showFloatingText('技能已满级', 'rgb(255,100,100)');
        return;
    }

    // 应用技能效果
    upgrade.apply(player);
    player.acquiredUpgrades.push(upgrade);
    player.pulseEffect = 0.3;

    ArcSurvivors.spawnParticles(this.x, this.y, SC.PARTICLE_COUNT, 'rgb(100,180,255)', SC.PARTICLE_SIZE, SC.PARTICLE_SPEED);

    // 显示获得的技能信息
    var display = ArcSurvivors.getUpgradeDisplay(upgrade);
    ArcSurvivors.showFloatingText('+' + display.icon + ' ' + display.name, '#66bbff');

    ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.UPGRADE_SELECT, upgrade);

    // 减速效果
    var UE = ArcSurvivors.GAME_CONFIG.UPGRADE_EFFECT;
    var enemies = ArcSurvivors.enemies;
    for (var k = 0; k < enemies.length; k++) {
        enemies[k].speed *= UE.SLOW_FACTOR;
        (function(e) {
            setTimeout(function() {
                if (e.active) e.speed *= UE.SLOW_RECOVERY;
            }, UE.SLOW_DURATION);
        })(enemies[k]);
    }
};

ArcSurvivors.SkillPickup.prototype.draw = function(ctx) {
    var SC = ArcSurvivors.GAME_CONFIG.SKILL_PICKUP;
    var display = ArcSurvivors.getUpgradeDisplay(this.upgrade);

    ctx.save();

    // 蓝色发光效果
    ctx.shadowColor = SC.GLOW_COLOR;
    ctx.shadowBlur = SC.GLOW_BLUR;

    // 绘制技能图标
    ctx.font = SC.ICON_FONT_SIZE + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = SC.UNIFIED_SKILL.COLOR;
    ctx.fillText(display.icon, this.x, this.drawY);

    // 绘制边框
    ctx.beginPath();
    ctx.arc(this.x, this.drawY, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = SC.UNIFIED_SKILL.COLOR;
    ctx.lineWidth = SC.BORDER_WIDTH;
    ctx.stroke();

    ctx.restore();
};