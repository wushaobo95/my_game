/**
 * game.js - 主循环与事件绑定
 */
(function() {
    var GS = ArcSurvivors;
    var CFG = GS.GAME_CONFIG;
    var STR = GS.STRINGS;
    var Audio = GS.Audio;
    var EventSystem = GS.EventSystem;
    var Events = GS.Events;

    var canvas = document.getElementById('gameCanvas');
    var ctx = canvas.getContext('2d');
    var muted = false;

    // 初始化资源加载器
    if (GS.ResourceLoader) {
        GS.ResourceLoader.init(
            function(loaded, total) {
                console.log('Resource loading: ' + loaded + '/' + total);
            },
            function() {
                console.log('All resources loaded');
            }
        );
    }

    // 注册事件监听器
    EventSystem.on(Events.PLAYER_DIE, function() {
        console.log('Player died');
    });

    EventSystem.on(Events.PLAYER_REVIVE, function() {
        console.log('Player revived');
    });

    EventSystem.on(Events.BOSS_SPAWN, function(boss) {
        console.log('Boss spawned');
    });

    EventSystem.on(Events.BOSS_DIE, function(boss) {
        console.log('Boss defeated');
    });

    EventSystem.on(Events.UPGRADE_SELECT, function(upgrade) {
        console.log('Upgrade selected:', upgrade.id);
    });

    EventSystem.on(Events.ITEM_PICKUP, function(item) {
        console.log('Item picked up:', item.id);
    });

    // 计算技能最大等级
    function getSkillMaxLevel(skillId) {
        var UPGRADE_LIMITS = {
            1: 5,   // 攻击强化 - 最大5级
            2: 5,   // 急速射击 - 最大5级
            3: 5,   // 弹道加速 - 最大5级
            5: 5,   // 生命强化 - 最大5级
            7: 5,   // 疾风步 - 最大5级
            10: Math.floor(CFG.UPGRADES.CRITICAL_MAX / CFG.UPGRADES.CRITICAL_CHANCE_BONUS),  // 暴击强化
            11: CFG.UPGRADES.LIGHTNING_CHAIN_MAX    // 神锋无影
        };
        return UPGRADE_LIMITS[skillId] || 5;
    }

    // 计算技能当前等级
    function getSkillCurrentLevel(skillId, player) {
        var count = 0;
        for (var i = 0; i < player.acquiredUpgrades.length; i++) {
            if (player.acquiredUpgrades[i].id == skillId) {
                count++;
            }
        }
        return count;
    }

    GS.gameOver = function() {
        var ui = STR.UI;
        GS.gameState.running = false;
        Audio.stopBGM();
        Audio.gameOver();
        document.getElementById('finalTime').textContent = GS.formatString(ui.FINAL_TIME, { time: Math.floor(GS.gameState.time) });
        document.getElementById('finalKills').textContent = GS.formatString(ui.FINAL_KILLS, { kills: GS.gameState.kills });
        document.getElementById('finalLevel').textContent = GS.formatString(ui.FINAL_LEVEL, { level: GS.player.level });
        document.getElementById('gameOver').style.display = 'flex';
        
        EventSystem.emit(Events.GAME_OVER);
    };

    GS.resetGame = function() {
        GS.gameState = { running: true, paused: false, time: 0, kills: 0, difficultyFactor: 1, bossTimer: 0 };
        GS.player = new GS.Player();
        GS.enemies = [];
        GS.bullets = [];
        GS.enemyBullets = [];
        GS.gems = [];
        GS.particles = [];
        GS.itemPickups = [];
        GS.buffPickups = [];
        if (ArcSurvivors.BossRegistry) ArcSurvivors.BossRegistry.spawnCount = 0;
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('upgradeScreen').style.display = 'none';
        document.getElementById('pauseScreen').style.display = 'none';
        Audio.startBGM();
        
        // 重置状态面板缓存
        lastSkillsHash = '';
        lastItemsHash = '';
        
        // 直接清空技能和法宝列表的DOM
        document.getElementById('skillsList').innerHTML = '';
        document.getElementById('itemsList').innerHTML = '';
        
        EventSystem.emit(Events.GAME_RESET);
    };

    GS.togglePause = function() {
        if (!GS.gameState.running) return;
        if (document.getElementById('upgradeScreen').style.display === 'flex') return;

        GS.gameState.paused = !GS.gameState.paused;
        Audio.pause();

        if (GS.gameState.paused) {
            document.getElementById('pauseScreen').style.display = 'flex';
            Audio.stopBGM();
            EventSystem.emit(Events.GAME_PAUSE);
        } else {
            document.getElementById('pauseScreen').style.display = 'none';
            Audio.startBGM();
            EventSystem.emit(Events.GAME_RESUME);
        }
    };

    GS.updateStatusPanel = function() {
        if (!GS.player) return;

        var p = GS.player;
        var PC = CFG.PLAYER;
        var STAT_STR = STR.STATS;
        var UI_STR = STR.UI;

        var baseAttackPower = PC.ATTACK_POWER;
        var baseAttackCooldown = PC.ATTACK_COOLDOWN;
        var baseBulletSpeed = PC.BULLET_SPEED;
        var baseSpeed = PC.SPEED;
        var basePickupRange = PC.PICKUP_RANGE;
        var baseRegenRate = 0;

        var attackPowerBonus = p.attackPower - baseAttackPower;
        var attackSpeedBonus = (1 / p.attackCooldown) - (1 / baseAttackCooldown);
        var bulletSpeedBonus = p.bulletSpeed - baseBulletSpeed;
        var speedBonus = p.speed - baseSpeed;
        var pickupRangeBonus = p.pickupRange - basePickupRange;
        var regenRateBonus = p.regenRate - baseRegenRate;

        function formatStat(base, current, bonus, unit) {
            var currentStr = current.toFixed(1);
            var bonusStr = bonus === 0 ? '' : ' <span style="color:#8f8">(+' + bonus.toFixed(1) + ')</span>';
            return currentStr + bonusStr;
        }

        var criticalPercent = (p.criticalChance * 100).toFixed(0);
        var dodgePercent = (p.dodgeChance * 100).toFixed(0);
        
        var statsHTML = '';
        var statItems = [
            [STAT_STR.ATTACK_POWER, formatStat(baseAttackPower, p.attackPower, attackPowerBonus, '')],
            [STAT_STR.ATTACK_SPEED, formatStat(1/baseAttackCooldown, 1/p.attackCooldown, attackSpeedBonus, '/s') + UI_STR.ATTACK_SPEED_SUFFIX],
            [STAT_STR.BULLET_SPEED, formatStat(baseBulletSpeed, p.bulletSpeed, bulletSpeedBonus, '')],
            [STAT_STR.MOVE_SPEED, formatStat(baseSpeed, p.speed, speedBonus, '')],
            [STAT_STR.CRITICAL, criticalPercent + '%'],
            [STAT_STR.DODGE, dodgePercent + '%'],
            [STAT_STR.HP_REGEN, formatStat(baseRegenRate, p.regenRate, regenRateBonus, '/s') + UI_STR.HP_RECOVERY_SUFFIX],
            [STAT_STR.PICKUP_RANGE, formatStat(basePickupRange, p.pickupRange, pickupRangeBonus, '')]
        ];

        for (var i = 0; i < statItems.length; i++) {
            statsHTML += '<div class="stat-row"><span>' + statItems[i][0] + '</span><span class="val">' + statItems[i][1] + '</span></div>';
        }
        document.getElementById('statsList').innerHTML = statsHTML;

        var skills = [];
        var items = [];
        for (var j = 0; j < p.acquiredUpgrades.length; j++) {
            var u = p.acquiredUpgrades[j];
            if (u.isItem === true) {
                items.push(u);
            } else {
                skills.push(u);
            }
        }

        // 生成技能和道具的哈希值用于缓存比较
        var skillsHash = skills.map(function(s) { return s.id; }).sort().join(',');
        var itemsHash = items.map(function(i) { return i.id; }).sort().join(',');

        // 只在技能或道具变化时更新DOM
        if (skillsHash !== lastSkillsHash) {
            lastSkillsHash = skillsHash;
            var skillsHTML = '';
            if (skills.length === 0) {
                skillsHTML = '<div style="color:#555;font-size:12px">' + UI_STR.NO_SKILLS + '</div>';
            } else {
                var skillCounts = {};
                for (var k = 0; k < skills.length; k++) {
                    var s = skills[k];
                    if (!skillCounts[s.id]) {
                        skillCounts[s.id] = { count: 0, id: s.id };
                    }
                    skillCounts[s.id].count++;
                }
                for (var sId in skillCounts) {
                    var skillItem = skillCounts[sId];
                    var skillDef = null;
                    for (var si = 0; si < GS.UPGRADES.length; si++) {
                        if (GS.UPGRADES[si].id == sId) {
                            skillDef = GS.UPGRADES[si];
                            break;
                        }
                    }
                    var isMaxed = skillDef && !skillDef.canAppear(p);
                    var display = GS.getUpgradeDisplay(skillDef || { id: parseInt(sId) });
                    var currentLevel = skillItem.count;
                    var maxLevel = getSkillMaxLevel(parseInt(sId));
                    var levelText = isMaxed ? 'MAX' : currentLevel.toString();
                    
                    skillsHTML += '<div class="upgrade-item skill-item" data-upgrade-id="' + sId + '">';
                    skillsHTML += '<span class="icon">' + display.icon + '</span>';
                    skillsHTML += '<span class="level-indicator ' + (isMaxed ? 'maxed' : '') + '">' + levelText + '</span>';
                    skillsHTML += '</div>';
                }
            }
            document.getElementById('skillsList').innerHTML = skillsHTML;
        }

        if (itemsHash !== lastItemsHash) {
            lastItemsHash = itemsHash;
            var itemsHTML = '';
            if (items.length === 0) {
                itemsHTML = '<div style="color:#555;font-size:12px">' + UI_STR.NO_ITEMS + '</div>';
            } else {
                var itemCounts = {};
                for (var m = 0; m < items.length; m++) {
                    var it = items[m];
                    if (!itemCounts[it.id]) {
                        itemCounts[it.id] = { count: 0, id: it.id };
                    }
                    itemCounts[it.id].count++;
                }
                for (var iId in itemCounts) {
                    var itemItem = itemCounts[iId];
                    var itemDef = null;
                    for (var ii = 0; ii < GS.ITEMS.length; ii++) {
                        if (GS.ITEMS[ii].id == iId) {
                            itemDef = GS.ITEMS[ii];
                            break;
                        }
                    }
                    var itemDisplay = GS.getItemDisplay(itemDef || { id: parseInt(iId) });
                    itemsHTML += '<div class="upgrade-item item-item" data-upgrade-id="' + iId + '">';
                    itemsHTML += '<span class="icon">' + itemDisplay.icon + '</span>';
                    if (itemItem.count > 1) {
                        itemsHTML += '<span class="item-count">' + itemItem.count + '</span>';
                    }
                    itemsHTML += '</div>';
                }
            }
            document.getElementById('itemsList').innerHTML = itemsHTML;
        }
    };

    document.addEventListener('keydown', function(e) {
        var key = e.key.toLowerCase();
        GS.keys[key] = true;

        if (key === 'escape') GS.togglePause();
    });

    document.addEventListener('keyup', function(e) {
        GS.keys[e.key.toLowerCase()] = false;
    });

    var audioStarted = false;
    function initAudio() {
        if (!audioStarted) {
            Audio.init();
            Audio.resume();
            Audio.startBGM();
            audioStarted = true;
        }
    }
    canvas.addEventListener('click', initAudio);
    document.addEventListener('keydown', function(e) {
        if (!audioStarted && (e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd' ||
            e.key === 'arrowup' || e.key === 'arrowdown' || e.key === 'arrowleft' || e.key === 'arrowright')) {
            initAudio();
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
            Audio.mute();
            btn.textContent = STR.UI.MUTE_OFF;
        } else {
            Audio.init();
            Audio.resume();
            Audio.unmute();
            Audio.startBGM();
            btn.textContent = STR.UI.MUTE_ON;
        }
    });

    function handleUpgradeClick(e) {
        var target = e.target;
        while (target && !target.classList.contains('upgrade-item')) {
            target = target.parentElement;
        }
        if (!target) return;

        var upgradeId = target.getAttribute('data-upgrade-id');
        if (!upgradeId) return;

        var upgrade = null;
        for (var i = 0; i < GS.UPGRADES.length; i++) {
            if (GS.UPGRADES[i].id == upgradeId) {
                upgrade = GS.UPGRADES[i];
                break;
            }
        }
        if (!upgrade) {
            for (var j = 0; j < GS.ITEMS.length; j++) {
                if (GS.ITEMS[j].id == upgradeId) {
                    upgrade = GS.ITEMS[j];
                    break;
                }
            }
        }

        if (upgrade) {
            GS.showUpgradeDescription(upgrade);
        }
    }

    document.getElementById('skillsList').addEventListener('click', handleUpgradeClick);
    document.getElementById('itemsList').addEventListener('click', handleUpgradeClick);

    var lastTime = 0;
    var panelUpdateTimer = 0;
    var lastSkillsHash = '';
    var lastItemsHash = '';

    function gameLoop(timestamp) {
        var dt = Math.min((timestamp - lastTime) / 1000, CFG.MAX_DT);
        lastTime = timestamp;

        if (GS.hitStop.active) {
            GS.hitStop.frames--;
            if (GS.hitStop.frames <= 0) GS.hitStop.active = false;
            requestAnimationFrame(gameLoop);
            return;
        }

        if (GS.gameState.running && !GS.gameState.paused) {
            var DF = CFG.DIFFICULTY;
            GS.gameState.time += dt;
            var newDifficulty = DF.BASE + Math.floor(GS.gameState.time / DF.INCREASE_INTERVAL) * DF.INCREASE_AMOUNT;
            if (newDifficulty !== GS.gameState.difficultyFactor) {
                GS.gameState.difficultyFactor = newDifficulty;
                EventSystem.emit(Events.DIFFICULTY_INCREASE, newDifficulty);
            }

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

            for (i = 0; i < GS.itemPickups.length; i++) GS.itemPickups[i].update(dt);
            GS.itemPickups = GS.itemPickups.filter(function(ip) { return ip.active; });

            for (i = 0; i < GS.buffPickups.length; i++) GS.buffPickups[i].update(dt);
            GS.buffPickups = GS.buffPickups.filter(function(bp) { return bp.active; });

            GS.updatePlayerBuffs(dt);

            for (i = 0; i < GS.particles.length; i++) GS.particles[i].update(dt);
            GS.particles = GS.particles.filter(function(p) { return p.active; });

            while (GS.particles.length > CFG.PARTICLE.MAX_COUNT) GS.particles.shift();

            if (GS.screenShake.duration > 0) GS.screenShake.duration -= dt;

            panelUpdateTimer += dt;
            if (panelUpdateTimer > CFG.PANEL_UPDATE_INTERVAL) {
                panelUpdateTimer = 0;
                GS.updateStatusPanel();
            }
        }

        ctx.save();
        if (GS.screenShake.duration > 0) {
            ctx.translate(
                (Math.random() - 0.5) * GS.screenShake.intensity * 2,
                (Math.random() - 0.5) * GS.screenShake.intensity * 2
            );
        }

        GS.Renderer.drawBackground(ctx);

        for (i = 0; i < GS.gems.length; i++) GS.gems[i].draw(ctx);
        for (i = 0; i < GS.itemPickups.length; i++) GS.itemPickups[i].draw(ctx);
        for (i = 0; i < GS.buffPickups.length; i++) GS.buffPickups[i].draw(ctx);
        for (i = 0; i < GS.bullets.length; i++) GS.bullets[i].draw(ctx);
        for (i = 0; i < GS.enemyBullets.length; i++) GS.enemyBullets[i].draw(ctx);
        for (i = 0; i < GS.enemies.length; i++) GS.enemies[i].draw(ctx);

        GS.player.draw(ctx);

        for (i = 0; i < GS.particles.length; i++) GS.particles[i].draw(ctx);

        GS.Renderer.drawDangerWarning(ctx);
        GS.Renderer.drawHitEffect(ctx);
        GS.Renderer.drawUI(ctx);
        GS.drawBuffIndicators(ctx);

        ctx.restore();

        requestAnimationFrame(gameLoop);
    }

    GS.player = new GS.Player();
    EventSystem.emit(Events.GAME_START);
    requestAnimationFrame(gameLoop);
})();