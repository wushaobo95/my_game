var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Enemy.prototype.draw = function(ctx) {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var FR = CFG.FROST;
    var RC = CFG.RENDERER;
    var RL = ArcSurvivors.ResourceLoader;

    ctx.save();

    var spriteInfo = null;
    if (RL && RL.hasSpriteSheet('enemies')) {
        spriteInfo = RL.getSpriteFromSheet(this.type);
    }
    
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
        var drawWidth = this.radius * 4;
        var drawHeight = this.radius * 4;

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

        ctx.drawImage(
            spriteInfo.image,
            spriteInfo.sx, spriteInfo.sy,
            spriteInfo.sw, spriteInfo.sh,
            this.x - this.radius * 2,
            this.y - this.radius * 2,
            drawWidth,
            drawHeight
        );

        if (this.hp < this.maxHp && this.hp > 0) {
            var EHB = RC.ENEMY_HP_BAR;
            ctx.shadowBlur = 0;
            ctx.fillStyle = EHB.BG_COLOR;
            ctx.fillRect(this.x - this.radius, this.y - this.radius - EHB.OFFSET_Y, this.radius * 2, EHB.HEIGHT);
            ctx.fillStyle = EHB.FILL_COLOR;
            ctx.fillRect(this.x - this.radius, this.y - this.radius - EHB.OFFSET_Y, (this.hp / this.maxHp) * this.radius * 2, EHB.HEIGHT);
        }
    } else {
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
            case 'butterfly':
                this.drawButterfly(ctx, x, y, r);
                break;
            case 'ant':
                this.drawAnt(ctx, x, y, r);
                break;
            case 'ladybug':
                this.drawLadybug(ctx, x, y, r);
                break;
            case 'cockroach':
                this.drawCockroach(ctx, x, y, r);
                break;
            case 'mantis':
                this.drawMantis(ctx, x, y, r);
                break;
            case 'fly':
                this.drawFly(ctx, x, y, r);
                break;
            case 'dragonfly':
                this.drawDragonfly(ctx, x, y, r);
                break;
            case 'mosquito':
                this.drawMosquito(ctx, x, y, r);
                break;
            case 'hedgehog':
                this.drawHedgehog(ctx, x, y, r);
                break;
            case 'gecko':
                this.drawGecko(ctx, x, y, r);
                break;
            case 'rat':
                this.drawRat(ctx, x, y, r);
                break;
            default:
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
        }

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

ArcSurvivors.Enemy.prototype.drawSpider = function(ctx, x, y, r) {
    var legCount = 8;

    ctx.save();
    ctx.translate(x, y);

    for (var i = 0; i < legCount; i++) {
        var side = i < 4 ? -1 : 1;
        var pair = i % 4;

        var hipX = side * r * 0.5;
        var hipY = -r * 0.1 + pair * r * 0.2;
        var kneeX = hipX + side * r * 0.7;
        var kneeY = hipY - r * 0.3;
        var footX = kneeX + side * r * 0.6;
        var footY = kneeY + r * 0.4;

        ctx.strokeStyle = '#aa2222';
        ctx.lineWidth = 3 - pair * 0.3;
        ctx.beginPath();
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(kneeX, kneeY);
        ctx.stroke();

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2 - pair * 0.2;
        ctx.beginPath();
        ctx.moveTo(kneeX, kneeY);
        ctx.lineTo(footX, footY);
        ctx.stroke();

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(footX, footY, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.beginPath();
    ctx.ellipse(0, r * 0.35, r * 0.65, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(180,0,0,0.6)';
    ctx.beginPath();
    ctx.moveTo(0, r * 0.1);
    ctx.lineTo(-r * 0.15, r * 0.35);
    ctx.lineTo(0, r * 0.6);
    ctx.lineTo(r * 0.15, r * 0.35);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -r * 0.25, r * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#cc3333';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -r * 0.55, r * 0.35, Math.PI, 0);
    ctx.fillStyle = '#dd4444';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

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

    ctx.fillStyle = '#aaff00';
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.05, 2, 0, Math.PI * 2);
    ctx.arc(r * 0.15, -r * 0.05, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
};

ArcSurvivors.Enemy.prototype.drawBat = function(ctx, x, y, r) {
    var t = Date.now() / 200;
    var wingFlap = Math.sin(t) * 0.4;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(0, -r * 0.2);
    ctx.quadraticCurveTo(-r * 1.8, -r * 1.2 + wingFlap * r, -r * 1.5, r * 0.3);
    ctx.quadraticCurveTo(-r * 1.0, r * 0.1, -r * 0.4, r * 0.2);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -r * 0.2);
    ctx.quadraticCurveTo(r * 1.8, -r * 1.2 + wingFlap * r, r * 1.5, r * 0.3);
    ctx.quadraticCurveTo(r * 1.0, r * 0.1, r * 0.4, r * 0.2);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.5, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

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

ArcSurvivors.Enemy.prototype.drawCaterpillar = function(ctx, x, y, r) {
    var t = Date.now() / 300;
    var hop = Math.abs(Math.sin(t)) * r * 0.3;

    ctx.save();
    ctx.translate(x, y - hop);

    ctx.strokeStyle = '#2d7a2d';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, r * 0.5);
    ctx.lineTo(-r * 1.0, r * 0.2);
    ctx.lineTo(-r * 1.3, r * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.3, r * 0.5);
    ctx.lineTo(r * 1.0, r * 0.2);
    ctx.lineTo(r * 1.3, r * 0.8);
    ctx.stroke();

    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, r * 0.1);
    ctx.lineTo(-r * 0.6, r * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.2, r * 0.1);
    ctx.lineTo(r * 0.6, r * 0.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, r * 0.3, r * 0.35, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(0,80,0,0.4)';
    for (var si = 0; si < 3; si++) {
        ctx.beginPath();
        ctx.ellipse(0, r * 0.05 + si * r * 0.22, r * 0.33, r * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.beginPath();
    ctx.ellipse(0, -r * 0.3, r * 0.4, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#3da03d';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -r * 0.7, r * 0.3, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#4db84d';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

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

ArcSurvivors.Enemy.prototype.drawLarva = function(ctx, x, y, r) {
    var t = Date.now() / 250;
    var hop = Math.abs(Math.sin(t)) * r * 0.4;

    ctx.save();
    ctx.translate(x, y - hop);

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

    ctx.beginPath();
    ctx.ellipse(0, r * 0.1, r * 0.35, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -r * 0.4, r * 0.25, r * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#4db84d';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

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

    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.4, r * 0.08, 0, Math.PI * 2);
    ctx.arc(r * 0.15, -r * 0.4, r * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
};

ArcSurvivors.Enemy.prototype.drawBee = function(ctx, x, y, r) {
    var t = Date.now() / 150;
    var wingFlap = Math.sin(t) * 0.3;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = 'rgba(200,200,255,0.35)';
    ctx.strokeStyle = 'rgba(150,150,200,0.5)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.ellipse(-r * 0.5, -r * 0.6 + wingFlap * r, r * 0.7, r * 0.4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(r * 0.5, -r * 0.6 + wingFlap * r, r * 0.7, r * 0.4, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.6, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.15, r * 0.58, r * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, r * 0.25, r * 0.52, r * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -r * 0.7, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.75, r * 0.12, 0, Math.PI * 2);
    ctx.arc(r * 0.15, -r * 0.75, r * 0.12, 0, Math.PI * 2);
    ctx.fill();

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

    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 1.5, r * 0.06, 0, Math.PI * 2);
    ctx.arc(r * 0.15, -r * 1.5, r * 0.06, 0, Math.PI * 2);
    ctx.fill();

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

ArcSurvivors.Enemy.prototype.drawButterfly = function(ctx, x, y, r) {
    var t = Date.now() / 200;
    var wingFlap = Math.sin(t) * 0.6;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = 'rgba(200,100,255,0.7)';
    ctx.strokeStyle = '#9932CC';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.ellipse(-r * 0.8, -r * 0.3, r * 0.7, r * 0.5, wingFlap, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(r * 0.8, -r * 0.3, r * 0.7, r * 0.5, -wingFlap, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(-r * 0.5, r * 0.6, r * 0.4, r * 0.3, wingFlap * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(r * 0.5, r * 0.6, r * 0.4, r * 0.3, -wingFlap * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -r * 0.4, r * 0.15, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#333';
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-r * 0.05, -r * 0.45, r * 0.04, 0, Math.PI * 2);
    ctx.arc(r * 0.05, -r * 0.45, r * 0.04, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#9932CC';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.2);
    ctx.lineTo(-r * 0.15, r * 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.2);
    ctx.lineTo(r * 0.15, r * 0.1);
    ctx.stroke();

    ctx.restore();
};

ArcSurvivors.Enemy.prototype.drawAnt = function(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);

    r = r * 1.2;

    ctx.fillStyle = '#8B0000';
    ctx.strokeStyle = '#5c0000';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.ellipse(0, r * 0.5, r * 0.35, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, r * 0.15, r * 0.3, r * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -r * 0.15, r * 0.25, r * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -r * 0.45, r * 0.2, r * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(-r * 0.08, -r * 0.5, r * 0.06, 0, Math.PI * 2);
    ctx.arc(r * 0.08, -r * 0.5, r * 0.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#5c0000';
    ctx.lineWidth = 1.5;

    for (var i = 0; i < 3; i++) {
        var side = i < 1.5 ? -1 : 1;
        var yPos = r * 0.1 - i * r * 0.25;
        ctx.beginPath();
        ctx.moveTo(side * r * 0.15, yPos);
        ctx.lineTo(side * r * 0.4, yPos + r * 0.15);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(side * r * 0.15, yPos);
        ctx.lineTo(side * r * 0.4, yPos - r * 0.15);
        ctx.stroke();
    }

    ctx.restore();
};

ArcSurvivors.Enemy.prototype.drawLadybug = function(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);

    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.7, r * 0.75, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#DC143C';
    ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.7);
    ctx.lineTo(0, r * 0.7);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-r * 0.3, 0);
    ctx.lineTo(-r * 0.1, r * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.3, 0);
    ctx.lineTo(r * 0.1, r * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.25, -r * 0.2);
    ctx.lineTo(-r * 0.1, -r * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.25, -r * 0.2);
    ctx.lineTo(r * 0.1, -r * 0.5);
    ctx.stroke();

    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.ellipse(-r * 0.2, -r * 0.35, r * 0.15, r * 0.12, 0, 0, Math.PI * 2);
    ctx.ellipse(r * 0.2, -r * 0.35, r * 0.15, r * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-r * 0.22, -r * 0.38, r * 0.04, 0, Math.PI * 2);
    ctx.arc(r * 0.18, -r * 0.38, r * 0.04, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-r * 0.22, -r * 0.38, r * 0.02, 0, Math.PI * 2);
    ctx.arc(r * 0.18, -r * 0.38, r * 0.02, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
};

ArcSurvivors.Enemy.prototype.drawCockroach = function(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#4A4A4A';
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.ellipse(0, r * 0.3, r * 0.6, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -r * 0.2, r * 0.5, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -r * 0.55, r * 0.35, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -r * 0.85, r * 0.15, r * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(-r * 0.12, -r * 0.55, r * 0.05, 0, Math.PI * 2);
    ctx.arc(r * 0.12, -r * 0.55, r * 0.05, 0, Math.PI * 2);
    ctx.arc(0, -r * 0.5, r * 0.03, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    for (var i = 0; i < 3; i++) {
        var side = i === 0 ? -1 : 1;
        var yPos = r * 0.1 + i * r * 0.25;
        ctx.beginPath();
        ctx.moveTo(side * r * 0.2, yPos);
        ctx.lineTo(side * r * 0.5, yPos - r * 0.1);
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(-r * 0.15, -r * 0.1);
    ctx.quadraticCurveTo(-r * 0.25, r * 0.3, -r * 0.15, r * 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.15, -r * 0.1);
    ctx.quadraticCurveTo(r * 0.25, r * 0.3, r * 0.15, r * 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.1);
    ctx.lineTo(0, r * 0.35);
    ctx.stroke();

    ctx.restore();
};

ArcSurvivors.Enemy.prototype.drawMantis = function(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#228B22';
    ctx.strokeStyle = '#006400';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.ellipse(0, r * 0.5, r * 0.3, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, r * 0.15, r * 0.25, r * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -r * 0.2, r * 0.22, r * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -r * 0.5, r * 0.18, r * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(-r * 0.08, -r * 0.55, r * 0.05, 0, Math.PI * 2);
    ctx.arc(r * 0.08, -r * 0.55, r * 0.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, -r * 0.15);
    ctx.lineTo(-r * 0.8, -r * 0.6);
    ctx.lineTo(-r * 0.95, -r * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.3, -r * 0.15);
    ctx.lineTo(r * 0.8, -r * 0.6);
    ctx.lineTo(r * 0.95, -r * 0.5);
    ctx.stroke();

    ctx.fillStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(-r * 0.95, -r * 0.5);
    ctx.lineTo(-r * 0.88, -r * 0.42);
    ctx.lineTo(-r * 0.85, -r * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r * 0.95, -r * 0.5);
    ctx.lineTo(r * 0.88, -r * 0.42);
    ctx.lineTo(r * 0.85, -r * 0.55);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
};

ArcSurvivors.Enemy.prototype.drawFly = function(ctx, x, y, r) {
    var t = Date.now() / 100;
    var wingVib = Math.sin(t * 3) * 0.3;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#1a1a1a';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.ellipse(0, r * 0.1, r * 0.4, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -r * 0.2, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(200,200,200,0.6)';
    ctx.strokeStyle = 'rgba(150,150,150,0.8)';
    ctx.lineWidth = 0.5;

    ctx.beginPath();
    ctx.ellipse(-r * 0.3, -r * 0.1 + wingVib * r, r * 0.35, r * 0.15, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(r * 0.3, -r * 0.1 + wingVib * r, r * 0.35, r * 0.15, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#cc0000';
    ctx.beginPath();
    ctx.arc(0, -r * 0.25, r * 0.06, 0, Math.PI * 2);
    ctx.arc(-r * 0.15, -r * 0.15, r * 0.04, 0, Math.PI * 2);
    ctx.arc(r * 0.15, -r * 0.15, r * 0.04, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#888';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.06, r * 0.35);
    ctx.lineTo(-r * 0.06, r * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.06, r * 0.35);
    ctx.lineTo(r * 0.06, r * 0.5);
    ctx.stroke();

    ctx.restore();
};

ArcSurvivors.Enemy.prototype.drawDragonfly = function(ctx, x, y, r) {
    var t = Date.now() / 100;
    var wingFlap = Math.sin(t) * 0.5;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.3, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -r * 0.4, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(100,200,255,0.5)';
    ctx.strokeStyle = 'rgba(50,150,200,0.7)';
    ctx.lineWidth = 0.5;

    ctx.beginPath();
    ctx.ellipse(-r * 0.7, -r * 0.3, r * 0.6, r * 0.2, wingFlap * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(r * 0.7, -r * 0.3, r * 0.6, r * 0.2, -wingFlap * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(-r * 0.6, r * 0.3, r * 0.5, r * 0.15, -wingFlap * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(r * 0.6, r * 0.3, r * 0.5, r * 0.15, wingFlap * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(0, -r * 0.45, r * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#00CED1';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.6, r * 0.08, r * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
};

ArcSurvivors.Enemy.prototype.drawMosquito = function(ctx, x, y, r) {
    var t = Date.now() / 80;
    var wingFlap = Math.sin(t * 2) * 0.4;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#800080';
    ctx.strokeStyle = '#4b008b';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.ellipse(0, r * 0.2, r * 0.25, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -r * 0.3, r * 0.25, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -r * 0.6, r * 0.2, r * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(-r * 0.08, -r * 0.65, r * 0.04, 0, Math.PI * 2);
    ctx.arc(r * 0.08, -r * 0.65, r * 0.04, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(200,150,255,0.6)';
    ctx.strokeStyle = 'rgba(150,100,200,0.8)';
    ctx.lineWidth = 0.5;

    ctx.beginPath();
    ctx.ellipse(-r * 0.4, r * 0.1 + wingFlap * r, r * 0.35, r * 0.12, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(r * 0.4, r * 0.1 + wingFlap * r, r * 0.35, r * 0.12, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#4b008b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.5);
    ctx.lineTo(-r * 0.05, r * 1.0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, r * 0.5);
    ctx.lineTo(r * 0.05, r * 1.0);
    ctx.stroke();

    ctx.fillStyle = '#800080';
    ctx.beginPath();
    ctx.moveTo(0, r * 1.0);
    ctx.lineTo(-r * 0.05, r * 0.9);
    ctx.lineTo(r * 0.05, r * 0.9);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
};

ArcSurvivors.Enemy.prototype.drawHedgehog = function(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#8B4513';
    ctx.strokeStyle = '#5c2d0a';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -r * 0.35, r * 0.4, r * 0.3, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#3d1f08';
    ctx.lineWidth = 2;
    for (var i = 0; i < 12; i++) {
        var angle = (i / 12) * Math.PI + Math.PI;
        var length = r * 0.5 + Math.random() * r * 0.2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * r * 0.4, Math.sin(angle) * r * 0.4);
        ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
        ctx.stroke();
    }

    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(-r * 0.15, -r * 0.35, r * 0.08, r * 0.06, 0, 0, Math.PI * 2);
    ctx.ellipse(r * 0.15, -r * 0.35, r * 0.08, r * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.35, r * 0.03, 0, Math.PI * 2);
    ctx.arc(r * 0.15, -r * 0.35, r * 0.03, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.05, r * 0.08, r * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#5c2d0a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, r * 0.2);
    ctx.lineTo(-r * 0.3, r * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.2, r * 0.2);
    ctx.lineTo(r * 0.3, r * 0.5);
    ctx.stroke();

    ctx.restore();
};

ArcSurvivors.Enemy.prototype.drawGecko = function(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#6B8E23';
    ctx.strokeStyle = '#4a6318';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.ellipse(0, r * 0.3, r * 0.35, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -r * 0.35, r * 0.3, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -r * 0.65, r * 0.2, r * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.ellipse(-r * 0.12, -r * 0.72, r * 0.08, r * 0.1, -0.3, 0, Math.PI * 2);
    ctx.ellipse(r * 0.12, -r * 0.72, r * 0.08, r * 0.1, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.ellipse(-r * 0.12, -r * 0.72, r * 0.04, r * 0.06, 0, 0, Math.PI * 2);
    ctx.ellipse(r * 0.12, -r * 0.72, r * 0.04, r * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#4a6318';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(-r * 0.15, r * 0.35);
    ctx.lineTo(-r * 0.4, r * 0.55);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.15, r * 0.35);
    ctx.lineTo(r * 0.4, r * 0.55);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-r * 0.12, r * 0.45);
    ctx.lineTo(-r * 0.35, r * 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.12, r * 0.45);
    ctx.lineTo(r * 0.35, r * 0.7);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-r * 0.23, -r * 0.45);
    ctx.lineTo(-r * 0.35, -r * 0.7);
    ctx.quadraticCurveTo(-r * 0.25, -r * 0.85, -r * 0.15, -r * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.23, -r * 0.45);
    ctx.lineTo(r * 0.35, -r * 0.7);
    ctx.quadraticCurveTo(r * 0.25, -r * 0.85, r * 0.15, -r * 0.8);
    ctx.stroke();

    ctx.restore();
};

ArcSurvivors.Enemy.prototype.drawWasp = function(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);

    var t = Date.now() / 100;
    var wingFlap = Math.sin(t * 2) * 0.35;

    ctx.fillStyle = 'rgba(255,255,200,0.6)';
    ctx.strokeStyle = 'rgba(200,200,150,0.8)';
    ctx.lineWidth = 0.5;

    ctx.beginPath();
    ctx.ellipse(-r * 0.4, -r * 0.3 + wingFlap * r, r * 0.35, r * 0.15, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(r * 0.4, -r * 0.3 + wingFlap * r, r * 0.35, r * 0.15, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.ellipse(0, r * 0.4, r * 0.25, r * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -r * 0.15, r * 0.25, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -r * 0.45, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(-r * 0.08, -r * 0.5, r * 0.04, 0, Math.PI * 2);
    ctx.arc(r * 0.08, -r * 0.5, r * 0.04, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-r * 0.05, r * 0.1);
    ctx.lineTo(-r * 0.05, r * 0.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.05, r * 0.1);
    ctx.lineTo(r * 0.05, r * 0.6);
    ctx.stroke();

    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.moveTo(0, r * 0.6);
    ctx.lineTo(-r * 0.05, r * 0.75);
    ctx.lineTo(r * 0.05, r * 0.75);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
};

ArcSurvivors.Enemy.prototype.drawRat = function(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#8B4513';
    ctx.strokeStyle = '#5c2d0a';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.ellipse(0, r * 0.15, r * 0.45, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -r * 0.25, r * 0.35, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -r * 0.55, r * 0.22, r * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.ellipse(-r * 0.15, -r * 0.58, r * 0.06, r * 0.08, 0, 0, Math.PI * 2);
    ctx.ellipse(r * 0.15, -r * 0.58, r * 0.06, r * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.58, r * 0.03, 0, Math.PI * 2);
    ctx.arc(r * 0.15, -r * 0.58, r * 0.03, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffaaaa';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.15);
    ctx.lineTo(-r * 0.1, -r * 0.05);
    ctx.lineTo(r * 0.1, -r * 0.05);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#5c2d0a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, r * 0.1);
    ctx.lineTo(-r * 0.3, r * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.2, r * 0.1);
    ctx.lineTo(r * 0.3, r * 0.3);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-r * 0.15, r * 0.35);
    ctx.lineTo(-r * 0.2, r * 0.65);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.15, r * 0.35);
    ctx.lineTo(r * 0.2, r * 0.65);
    ctx.stroke();

    ctx.restore();
};