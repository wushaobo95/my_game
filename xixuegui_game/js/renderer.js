/**
 * renderer.js - 渲染系统（背景、UI、特效）
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Renderer = {
    drawBackground: function(ctx) {
        ctx.fillStyle = '#0a0a15';
        ctx.fillRect(0, 0, ArcSurvivors.CANVAS_WIDTH, ArcSurvivors.CANVAS_HEIGHT);

        ctx.strokeStyle = 'rgba(50, 50, 100, 0.3)';
        ctx.lineWidth = 1;
        var gridSize = 50;

        for (var x = 0; x < ArcSurvivors.CANVAS_WIDTH; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, ArcSurvivors.CANVAS_HEIGHT);
            ctx.stroke();
        }
        for (var y = 0; y < ArcSurvivors.CANVAS_HEIGHT; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(ArcSurvivors.CANVAS_WIDTH, y);
            ctx.stroke();
        }
    },

    drawUI: function(ctx) {
        var player = ArcSurvivors.player;
        var gs = ArcSurvivors.gameState;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, ArcSurvivors.CANVAS_WIDTH, 40);

        // 生命条
        ctx.fillStyle = '#333';
        ctx.fillRect(10, 8, 200, 20);
        var hpGrad = ctx.createLinearGradient(10, 0, 210, 0);
        hpGrad.addColorStop(0, '#ff4444');
        hpGrad.addColorStop(1, '#ff8888');
        ctx.fillStyle = hpGrad;
        ctx.fillRect(10, 8, (player.hp / player.maxHp) * 200, 20);
        ctx.strokeStyle = '#666';
        ctx.strokeRect(10, 8, 200, 20);

        // 经验条
        ctx.fillStyle = '#333';
        ctx.fillRect(220, 8, 200, 20);
        var expGrad = ctx.createLinearGradient(220, 0, 420, 0);
        expGrad.addColorStop(0, '#4444ff');
        expGrad.addColorStop(1, '#aa44ff');
        ctx.fillStyle = expGrad;
        ctx.fillRect(220, 8, (player.exp / player.expToLevel) * 200, 20);
        ctx.strokeStyle = '#666';
        ctx.strokeRect(220, 8, 200, 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px sans-serif';
        ctx.fillText('LV.' + player.level, 430, 24);
        ctx.fillText('击杀: ' + gs.kills, 500, 24);
        ctx.fillText('存活: ' + Math.floor(gs.time) + 's', 600, 24);
    },

    drawDangerWarning: function(ctx) {
        var enemies = ArcSurvivors.enemies;
        var W = ArcSurvivors.CANVAS_WIDTH;
        var H = ArcSurvivors.CANVAS_HEIGHT;
        var pulseAlpha = (Math.sin(ArcSurvivors.gameState.time * 10) + 1) / 2 * 0.5 + 0.3;

        for (var i = 0; i < enemies.length; i++) {
            var e = enemies[i];
            if (e.x < 0 || e.x > W || e.y < 0 || e.y > H) {
                var wx = -1, wy = -1;
                if (e.x < 0) { wx = 10; wy = Math.max(100, Math.min(H - 100, e.y)); }
                else if (e.x > W) { wx = W - 10; wy = Math.max(100, Math.min(H - 100, e.y)); }
                else if (e.y < 0) { wx = Math.max(100, Math.min(W - 100, e.x)); wy = 10; }
                else if (e.y > H) { wx = Math.max(100, Math.min(W - 100, e.x)); wy = H - 10; }

                if (wx > 0 && wy > 0) {
                    ctx.beginPath();
                    ctx.arc(wx, wy, 8, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 0, 0, ' + pulseAlpha + ')';
                    ctx.fill();
                }
            }
        }
    },

    drawHitEffect: function(ctx) {
        if (ArcSurvivors.player.invulnerable) {
            var alpha = (Math.sin(Date.now() / 50) + 1) / 2 * 0.3;
            ctx.fillStyle = 'rgba(255, 0, 0, ' + alpha + ')';
            ctx.fillRect(0, 0, ArcSurvivors.CANVAS_WIDTH, ArcSurvivors.CANVAS_HEIGHT);
        }
    }
};
