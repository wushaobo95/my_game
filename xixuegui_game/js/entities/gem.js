/**
 * entities/gem.js - 经验宝石
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Gem = function(x, y, type) {
    var GC = ArcSurvivors.GAME_CONFIG.GEM;
    this.x = x;
    this.y = y;
    this.type = type;
    this.value = type === 'large' ? GC.LARGE_VALUE : GC.SMALL_VALUE;
    this.color = type === 'large' ? GC.LARGE_COLOR : GC.SMALL_COLOR;
    this.radius = type === 'large' ? GC.LARGE_RADIUS : GC.SMALL_RADIUS;
    this.active = true;
};

ArcSurvivors.Gem.prototype.update = function(dt) {
    var GC = ArcSurvivors.GAME_CONFIG.GEM;
    var player = ArcSurvivors.player;
    var dist = ArcSurvivors.Utils.distance(this.x, this.y, player.x, player.y);

    if (dist < player.pickupRange) {
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

ArcSurvivors.ItemPickup = function(x, y, item) {
    var IC = ArcSurvivors.GAME_CONFIG.ITEM_PICKUP;
    this.x = x;
    this.y = y;
    this.item = item;
    this.radius = IC.RADIUS;
    this.active = true;
    this.bobTimer = 0;
    this.bobHeight = IC.BOB_HEIGHT;
};

ArcSurvivors.ItemPickup.prototype.update = function(dt) {
    var IC = ArcSurvivors.GAME_CONFIG.ITEM_PICKUP;
    this.bobTimer += dt * IC.BOB_SPEED;
    var bobOffset = Math.sin(this.bobTimer) * this.bobHeight;
    this.drawY = this.y + bobOffset;

    var player = ArcSurvivors.player;
    var dist = ArcSurvivors.Utils.distance(this.x, this.y, player.x, player.y);

    if (dist < player.radius + this.radius) {
        this.applyItem();
        this.active = false;
        ArcSurvivors.Audio.pickup();
    }
};

ArcSurvivors.ItemPickup.prototype.applyItem = function() {
    var IC = ArcSurvivors.GAME_CONFIG.ITEM_PICKUP;
    var player = ArcSurvivors.player;
    this.item.apply(player);
    player.acquiredUpgrades.push(this.item);
    ArcSurvivors.spawnParticles(this.x, this.y, IC.PARTICLE_COUNT, 'rgb(255,215,0)', IC.PARTICLE_SIZE, IC.PARTICLE_SPEED);

    ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.ITEM_PICKUP, this.item);
    ArcSurvivors.showItemDescription(this.item);
};

ArcSurvivors.ItemPickup.prototype.draw = function(ctx) {
    var IC = ArcSurvivors.GAME_CONFIG.ITEM_PICKUP;
    var display = ArcSurvivors.getItemDisplay(this.item);
    var RL = ArcSurvivors.ResourceLoader;

    ctx.save();

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