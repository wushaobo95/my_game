/**
 * game.js - 主循环与事件绑定
 */
(function() {
    var GS = ArcSurvivors;
    var Audio = GS.Audio;

    var canvas = document.getElementById('gameCanvas');
    var ctx = canvas.getContext('2d');
    var muted = false;

    GS.gameOver = function() {
        GS.gameState.running = false;
        Audio.stopBGM();
        Audio.gameOver();
        document.getElementById('finalTime').textContent = Math.floor(GS.gameState.time);
        document.getElementById('finalKills').textContent = GS.gameState.kills;
        document.getElementById('finalLevel').textContent = GS.player.level;
        document.getElementById('gameOver').style.display = 'flex';
    };

    GS.resetGame = function() {
        GS.gameState = { running: true, paused: false, time: 0, kills: 0, difficultyFactor: 1, bossTimer: 0 };
        GS.player = new GS.Player();
        GS.enemies = [];
        GS.bullets = [];
        GS.enemyBullets = [];
        GS.gems = [];
        GS.particles = [];
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('upgradeScreen').style.display = 'none';
        document.getElementById('pauseScreen').style.display = 'none';
        Audio.startBGM();
    };

    GS.togglePause = function() {
        if (!GS.gameState.running) return;
        if (document.getElementById('upgradeScreen').style.display === 'flex') return;

        GS.gameState.paused = !GS.gameState.paused;
        Audio.pause();

        if (GS.gameState.paused) {
            document.getElementById('pauseScreen').style.display = 'flex';
            Audio.stopBGM();
        } else {
            document.getElementById('pauseScreen').style.display = 'none';
            Audio.startBGM();
        }
    };

    // 更新状态面板内容
    GS.updateStatusPanel = function() {
        if (!GS.player) return;

        var p = GS.player;
        var statsHTML = '';
        var statItems = [
            ['攻击力', p.attackPower.toFixed(1)],
            ['攻速', (1 / p.attackCooldown).toFixed(1) + '/s'],
            ['子弹速度', p.bulletSpeed.toFixed(1)],
            ['子弹大小', p.bulletSize.toFixed(1)],
            ['穿透', p.bulletPenetration],
            ['弹射', p.wallBounces],
            ['额外投射', p.extraProjectiles],
            ['移速', p.speed.toFixed(1)],
            ['生命恢复', p.regenRate + '/s'],
            ['拾取范围', p.pickupRange.toFixed(0)]
        ];

        for (var i = 0; i < statItems.length; i++) {
            statsHTML += '<div class="stat-row"><span>' + statItems[i][0] + '</span><span class="val">' + statItems[i][1] + '</span></div>';
        }
        document.getElementById('statsList').innerHTML = statsHTML;

        var upgradesHTML = '';
        if (p.acquiredUpgrades.length === 0) {
            upgradesHTML = '<div style="color:#555;font-size:12px">暂无技能</div>';
        } else {
            // 统计每种升级获得的次数
            var counts = {};
            for (var j = 0; j < p.acquiredUpgrades.length; j++) {
                var u = p.acquiredUpgrades[j];
                if (!counts[u.id]) {
                    counts[u.id] = { icon: u.icon, name: u.name, count: 0 };
                }
                counts[u.id].count++;
            }
            for (var id in counts) {
                var item = counts[id];
                upgradesHTML += '<div class="upgrade-item"><span class="icon">' + item.icon + '</span><span>' + item.name;
                if (item.count > 1) upgradesHTML += ' x' + item.count;
                upgradesHTML += '</span></div>';
            }
        }
        document.getElementById('upgradesList').innerHTML = upgradesHTML;
    };

    // 事件绑定
    document.addEventListener('keydown', function(e) {
        var key = e.key.toLowerCase();
        GS.keys[key] = true;

        if (key === 'r') GS.resetGame();
        if (key === 'escape') GS.togglePause();
    });

    document.addEventListener('keyup', function(e) {
        GS.keys[e.key.toLowerCase()] = false;
    });

    // 首次点击初始化音频
    var audioStarted = false;
    canvas.addEventListener('click', function() {
        if (!audioStarted) {
            Audio.init();
            Audio.resume();
            Audio.startBGM();
            audioStarted = true;
        }
    });

    document.getElementById('restartBtn').addEventListener('click', GS.resetGame);

    document.getElementById('resumeBtn').addEventListener('click', function() {
        if (GS.gameState.paused) GS.togglePause();
    });

    document.getElementById('muteBtn').addEventListener('click', function() {
        muted = !muted;
        var btn = document.getElementById('muteBtn');
        if (muted) {
            Audio.stopBGM();
            btn.textContent = '🔇 音乐: 关';
        } else {
            Audio.init();
            Audio.resume();
            Audio.startBGM();
            btn.textContent = '🔊 音乐: 开';
        }
    });

    // 游戏循环
    var lastTime = 0;
    var panelUpdateTimer = 0;

    function gameLoop(timestamp) {
        var dt = Math.min((timestamp - lastTime) / 1000, 0.05);
        lastTime = timestamp;

        if (GS.hitStop.active) {
            GS.hitStop.frames--;
            if (GS.hitStop.frames <= 0) GS.hitStop.active = false;
            requestAnimationFrame(gameLoop);
            return;
        }

        if (GS.gameState.running && !GS.gameState.paused) {
            GS.gameState.time += dt;
            GS.gameState.difficultyFactor = 1 + Math.floor(GS.gameState.time / 60) * 0.15;

            GS.player.update(dt);
            GS.spawnEnemies(dt);

            var i;
            for (i = 0; i < GS.enemies.length; i++) GS.enemies[i].update(dt);
            GS.enemies = GS.enemies.filter(function(e) { return e.active; });

            for (i = 0; i < GS.bullets.length; i++) GS.bullets[i].update(dt);
            GS.bullets = GS.bullets.filter(function(b) { return b.active; });

            for (i = 0; i < GS.enemyBullets.length; i++) GS.enemyBullets[i].update(dt);
            GS.enemyBullets = GS.enemyBullets.filter(function(b) { return b.active; });

            for (i = 0; i < GS.gems.length; i++) GS.gems[i].update(dt);
            GS.gems = GS.gems.filter(function(g) { return g.active; });

            for (i = 0; i < GS.particles.length; i++) GS.particles[i].update(dt);
            GS.particles = GS.particles.filter(function(p) { return p.active; });

            while (GS.particles.length > 300) GS.particles.shift();

            if (GS.screenShake.duration > 0) GS.screenShake.duration -= dt;

            // 面板每0.2秒更新一次
            panelUpdateTimer += dt;
            if (panelUpdateTimer > 0.2) {
                panelUpdateTimer = 0;
                GS.updateStatusPanel();
            }
        }

        // 渲染
        ctx.save();
        if (GS.screenShake.duration > 0) {
            ctx.translate(
                (Math.random() - 0.5) * GS.screenShake.intensity * 2,
                (Math.random() - 0.5) * GS.screenShake.intensity * 2
            );
        }

        GS.Renderer.drawBackground(ctx);

        for (i = 0; i < GS.gems.length; i++) GS.gems[i].draw(ctx);
        for (i = 0; i < GS.bullets.length; i++) GS.bullets[i].draw(ctx);
        for (i = 0; i < GS.enemyBullets.length; i++) GS.enemyBullets[i].draw(ctx);
        for (i = 0; i < GS.enemies.length; i++) GS.enemies[i].draw(ctx);

        GS.player.draw(ctx);

        for (i = 0; i < GS.particles.length; i++) GS.particles[i].draw(ctx);

        GS.Renderer.drawDangerWarning(ctx);
        GS.Renderer.drawHitEffect(ctx);
        GS.Renderer.drawUI(ctx);

        ctx.restore();

        requestAnimationFrame(gameLoop);
    }

    // 启动
    GS.player = new GS.Player();
    requestAnimationFrame(gameLoop);
})();
