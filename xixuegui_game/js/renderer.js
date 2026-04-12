/**
 * renderer.js - 渲染系统（背景、UI、特效）
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Renderer = {
    drawBackground: function(ctx) {
        var RC = ArcSurvivors.GAME_CONFIG.RENDERER;
        var BG = RC.BACKGROUND;
        var CFG = ArcSurvivors.GAME_CONFIG;

        ctx.fillStyle = BG.COLOR;
        ctx.fillRect(0, 0, CFG.CANVAS_WIDTH, CFG.CANVAS_HEIGHT);

        ctx.strokeStyle = BG.GRID_COLOR;
        ctx.lineWidth = 1;

        for (var x = 0; x < CFG.CANVAS_WIDTH; x += BG.GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CFG.CANVAS_HEIGHT);
            ctx.stroke();
        }
        for (var y = 0; y < CFG.CANVAS_HEIGHT; y += BG.GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CFG.CANVAS_WIDTH, y);
            ctx.stroke();
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
    }
};
