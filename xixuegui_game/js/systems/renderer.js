/**
 * systems/renderer.js - 渲染系统（背景、UI、特效）
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Renderer = {
    drawBackground: function(ctx) {
        var RC = ArcSurvivors.GAME_CONFIG.RENDERER;
        var BG = RC.BACKGROUND;
        var CFG = ArcSurvivors.GAME_CONFIG;
        var RL = ArcSurvivors.ResourceLoader;

        if (RL && RL.hasSprite('background')) {
            var bgSprite = RL.getSprite('background');
            ctx.drawImage(bgSprite, 0, 0, CFG.CANVAS_WIDTH, CFG.CANVAS_HEIGHT);
            if (RL.hasSprite('background_grid')) {
                var gridSprite = RL.getSprite('background_grid');
                ctx.drawImage(gridSprite, 0, 0, CFG.CANVAS_WIDTH, CFG.CANVAS_HEIGHT);
            }
        } else {
            // 草原底色
            ctx.fillStyle = BG.COLOR;
            ctx.fillRect(0, 0, CFG.CANVAS_WIDTH, CFG.CANVAS_HEIGHT);

            // 草地深浅色块
            var seed = 42;
            function seededRandom() {
                seed = (seed * 16807 + 0) % 2147483647;
                return (seed - 1) / 2147483646;
            }

            // 深色草丛斑块
            ctx.fillStyle = 'rgba(20, 70, 12, 0.3)';
            for (var b = 0; b < 60; b++) {
                var bx = seededRandom() * CFG.CANVAS_WIDTH;
                var by = seededRandom() * CFG.CANVAS_HEIGHT;
                var br = 30 + seededRandom() * 50;
                ctx.beginPath();
                ctx.ellipse(bx, by, br, br * 0.6, seededRandom() * Math.PI, 0, Math.PI * 2);
                ctx.fill();
            }

            // 浅色草丛斑块
            ctx.fillStyle = 'rgba(60, 130, 30, 0.2)';
            for (var c = 0; c < 40; c++) {
                var cx2 = seededRandom() * CFG.CANVAS_WIDTH;
                var cy2 = seededRandom() * CFG.CANVAS_HEIGHT;
                var cr = 20 + seededRandom() * 40;
                ctx.beginPath();
                ctx.ellipse(cx2, cy2, cr, cr * 0.5, seededRandom() * Math.PI, 0, Math.PI * 2);
                ctx.fill();
            }

            // 草叶
            seed = 42;
            ctx.strokeStyle = 'rgba(50, 120, 25, 0.5)';
            ctx.lineWidth = 1.5;
            for (var g = 0; g < BG.GRASS_COUNT; g++) {
                var gx = seededRandom() * CFG.CANVAS_WIDTH;
                var gy = seededRandom() * CFG.CANVAS_HEIGHT;
                var gh = 8 + seededRandom() * 15;
                var ga = -0.3 + seededRandom() * 0.6;

                ctx.beginPath();
                ctx.moveTo(gx, gy);
                ctx.quadraticCurveTo(gx + Math.sin(ga) * gh * 0.5, gy - gh * 0.6, gx + Math.sin(ga) * gh, gy - gh);
                ctx.stroke();
            }

            // 小花点缀
            seed = 99;
            for (var f = 0; f < 15; f++) {
                var fx = seededRandom() * CFG.CANVAS_WIDTH;
                var fy = seededRandom() * CFG.CANVAS_HEIGHT;
                var fc = ['#ffee88', '#ffaa88', '#ffffff', '#ffddaa'][Math.floor(seededRandom() * 4)];
                ctx.fillStyle = fc;
                ctx.beginPath();
                ctx.arc(fx, fy, 2 + seededRandom() * 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },

    drawUI: function(ctx) {
        var player = ArcSurvivors.player;
        var gs = ArcSurvivors.gameState;
        var CFG = ArcSurvivors.GAME_CONFIG;
        var RC = CFG.RENDERER;
        var STR = ArcSurvivors.STRINGS.UI;
        var HP = RC.HP_BAR;
        var EXP = RC.EXP_BAR;
        var TXT = RC.TEXT;

        ctx.fillStyle = RC.UI_OVERLAY.COLOR;
        ctx.fillRect(0, 0, CFG.CANVAS_WIDTH, RC.UI_BAR_HEIGHT);

        // 生命条
        ctx.fillStyle = HP.BG_COLOR;
        ctx.fillRect(HP.X, HP.Y, HP.WIDTH, HP.HEIGHT);
        var hpGrad = ctx.createLinearGradient(HP.X, 0, HP.X + HP.WIDTH, 0);
        hpGrad.addColorStop(0, HP.GRADIENT_START);
        hpGrad.addColorStop(1, HP.GRADIENT_END);
        ctx.fillStyle = hpGrad;
        ctx.fillRect(HP.X, HP.Y, (player.hp / player.maxHp) * HP.WIDTH, HP.HEIGHT);
        ctx.strokeStyle = HP.BORDER_COLOR;
        ctx.strokeRect(HP.X, HP.Y, HP.WIDTH, HP.HEIGHT);

        ctx.fillStyle = '#fff';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(Math.floor(player.hp) + '/' + player.maxHp, HP.X + HP.WIDTH / 2, HP.Y + HP.HEIGHT / 2 + 5);
        ctx.textAlign = 'left';

        // 经验条
        ctx.fillStyle = EXP.BG_COLOR;
        ctx.fillRect(EXP.X, EXP.Y, EXP.WIDTH, EXP.HEIGHT);
        var expGrad = ctx.createLinearGradient(EXP.X, 0, EXP.X + EXP.WIDTH, 0);
        expGrad.addColorStop(0, EXP.GRADIENT_START);
        expGrad.addColorStop(1, EXP.GRADIENT_END);
        ctx.fillStyle = expGrad;
        ctx.fillRect(EXP.X, EXP.Y, (player.exp / player.expToLevel) * EXP.WIDTH, EXP.HEIGHT);
        ctx.strokeStyle = EXP.BORDER_COLOR;
        ctx.strokeRect(EXP.X, EXP.Y, EXP.WIDTH, EXP.HEIGHT);

        ctx.fillStyle = TXT.COLOR;
        ctx.font = TXT.FONT;
        ctx.fillText(STR.LEVEL_PREFIX + player.level, TXT.LEVEL_X, TXT.LEVEL_Y);
        ctx.fillText(STR.KILLS_PREFIX + gs.kills, TXT.KILLS_X, TXT.KILLS_Y);
        ctx.fillText(STR.TIME_PREFIX + Math.floor(gs.time) + STR.TIME_SUFFIX, TXT.TIME_X, TXT.TIME_Y);
    },

    drawDangerWarning: function(ctx) {
        var enemies = ArcSurvivors.enemies;
        var CFG = ArcSurvivors.GAME_CONFIG;
        var gs = ArcSurvivors.gameState;
        var DW = CFG.RENDERER.DANGER_WARNING;
        var W = CFG.CANVAS_WIDTH;
        var H = CFG.CANVAS_HEIGHT;
        var pulseAlpha = (Math.sin(gs.time * DW.PULSE_SPEED) + 1) / 2 * (DW.PULSE_MAX - DW.PULSE_MIN) + DW.PULSE_MIN;

        for (var i = 0; i < enemies.length; i++) {
            var e = enemies[i];
            if (e.x < 0 || e.x > W || e.y < 0 || e.y > H) {
                var wx = -1, wy = -1;
                if (e.x < 0) { wx = DW.MARGIN; wy = Math.max(DW.SAFE_MARGIN, Math.min(H - DW.SAFE_MARGIN, e.y)); }
                else if (e.x > W) { wx = W - DW.MARGIN; wy = Math.max(DW.SAFE_MARGIN, Math.min(H - DW.SAFE_MARGIN, e.y)); }
                else if (e.y < 0) { wx = Math.max(DW.SAFE_MARGIN, Math.min(W - DW.SAFE_MARGIN, e.x)); wy = DW.MARGIN; }
                else if (e.y > H) { wx = Math.max(DW.SAFE_MARGIN, Math.min(W - DW.SAFE_MARGIN, e.x)); wy = H - DW.MARGIN; }

                if (wx > 0 && wy > 0) {
                    ctx.beginPath();
                    ctx.arc(wx, wy, DW.RADIUS, 0, Math.PI * 2);
                    ctx.fillStyle = DW.COLOR.replace('{alpha}', pulseAlpha);
                    ctx.fill();
                }
            }
        }
    },

    drawHitEffect: function(ctx) {
        var HE = ArcSurvivors.GAME_CONFIG.RENDERER.HIT_OVERLAY;
        var player = ArcSurvivors.player;
        if (player.invulnerable && !player.hasShieldBuff) {
            var alpha = (Math.sin(Date.now() / HE.FLASH_SPEED) + 1) / 2 * HE.MAX_ALPHA;
            ctx.fillStyle = HE.COLOR.replace('{alpha}', alpha);
            ctx.fillRect(0, 0, ArcSurvivors.GAME_CONFIG.CANVAS_WIDTH, ArcSurvivors.GAME_CONFIG.CANVAS_HEIGHT);
        }
    },

    drawLightning: function(ctx, x1, y1, x2, y2, color, width) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        
        var segments = 5;
        var dx = (x2 - x1) / segments;
        var dy = (y2 - y1) / segments;
        
        for (var i = 1; i < segments; i++) {
            var x = x1 + dx * i + (Math.random() - 0.5) * 30;
            var y = y1 + dy * i + (Math.random() - 0.5) * 30;
            ctx.lineTo(x, y);
        }
        
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
    }
};