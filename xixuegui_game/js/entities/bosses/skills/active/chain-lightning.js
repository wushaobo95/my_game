/**
 * bosses/skills/active/chain-lightning.js - 连锁闪电
 * 发射闪电攻击玩家，击中后弹射到附近敌人
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.chainLightning = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.CHAIN_LIGHTNING;

    return {
        name: 'chain_lightning',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: 0,

        execute: function(boss, dt) {
            var chainCount = boss.bossPhase >= 2 ? SC.CHAIN_COUNT_PHASE2 : SC.CHAIN_COUNT;
            var damage = boss.damage * SC.DAMAGE_SCALE;
            var player = ArcSurvivors.player;
            
            // 创建连锁闪电
            var lightning = {
                chains: [],
                currentIndex: 0,
                chainCount: chainCount,
                damage: damage,
                damageDecay: SC.DAMAGE_DECAY,
                chainRange: SC.CHAIN_RANGE,
                lastX: boss.x,
                lastY: boss.y
            };
            
            // 第一条链：Boss到玩家
            if (ArcSurvivors.Utils.distance(boss.x, boss.y, player.x, player.y) <= SC.CHAIN_RANGE * 2) {
                lightning.chains.push({
                    fromX: boss.x,
                    fromY: boss.y,
                    toX: player.x,
                    toY: player.y,
                    damage: damage,
                    target: player
                });
                
                // 对玩家造成伤害
                player.takeDamage(damage);
                
                // 闪电特效
                ArcSurvivors.spawnLightningEffect(boss.x, boss.y, player.x, player.y);
                
                lightning.lastX = player.x;
                lightning.lastY = player.y;
                
                // 继续连锁
                this._continueChain(boss, lightning);
            }
            
            ArcSurvivors.Audio.hit();
        },
        
        _continueChain: function(boss, lightning) {
            var chainedTargets = [ArcSurvivors.player];
            
            for (var i = 1; i < lightning.chainCount; i++) {
                // 寻找范围内的下一个目标
                var nextTarget = this._findNextChainTarget(
                    lightning.lastX, 
                    lightning.lastY, 
                    lightning.chainRange,
                    chainedTargets
                );
                
                if (!nextTarget) break;
                
                // 递减伤害
                var chainDamage = lightning.damage * Math.pow(1 - lightning.damageDecay, i);
                
                lightning.chains.push({
                    fromX: lightning.lastX,
                    fromY: lightning.lastY,
                    toX: nextTarget.x,
                    toY: nextTarget.y,
                    damage: chainDamage,
                    target: nextTarget
                });
                
                // 造成伤害
                if (nextTarget === ArcSurvivors.player) {
                    nextTarget.takeDamage(chainDamage);
                } else {
                    // 对小怪造成伤害
                    nextTarget.takeDamage(chainDamage, boss);
                }
                
                // 闪电特效
                ArcSurvivors.spawnLightningEffect(lightning.lastX, lightning.lastY, nextTarget.x, nextTarget.y);
                
                chainedTargets.push(nextTarget);
                lightning.lastX = nextTarget.x;
                lightning.lastY = nextTarget.y;
            }
        },
        
        _findNextChainTarget: function(fromX, fromY, range, excludeTargets) {
            var player = ArcSurvivors.player;
            var enemies = ArcSurvivors.enemies;
            var candidates = [];
            
            // 检查玩家是否在范围内且未被连锁
            var playerDist = ArcSurvivors.Utils.distance(fromX, fromY, player.x, player.y);
            if (playerDist <= range && excludeTargets.indexOf(player) === -1) {
                candidates.push({ target: player, dist: playerDist, priority: 2 });
            }
            
            // 检查小怪
            for (var i = 0; i < enemies.length; i++) {
                var enemy = enemies[i];
                if (!enemy.active || excludeTargets.indexOf(enemy) !== -1) continue;
                
                var dist = ArcSurvivors.Utils.distance(fromX, fromY, enemy.x, enemy.y);
                if (dist <= range) {
                    candidates.push({ target: enemy, dist: dist, priority: 1 });
                }
            }
            
            // 优先选择玩家，其次最近的小怪
            candidates.sort(function(a, b) {
                if (a.priority !== b.priority) return b.priority - a.priority;
                return a.dist - b.dist;
            });
            
            return candidates.length > 0 ? candidates[0].target : null;
        }
    };
};

// 生成闪电特效
ArcSurvivors.spawnLightningEffect = function(fromX, fromY, toX, toY) {
    var dx = toX - fromX;
    var dy = toY - fromY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var segments = Math.floor(dist / 20);
    
    // 闪电粒子
    for (var i = 0; i <= segments; i++) {
        var t = i / segments;
        var baseX = fromX + dx * t;
        var baseY = fromY + dy * t;
        
        // 添加随机偏移
        var offsetX = (Math.random() - 0.5) * 15;
        var offsetY = (Math.random() - 0.5) * 15;
        
        ArcSurvivors.spawnParticles(baseX + offsetX, baseY + offsetY, 2, 'rgb(255, 255, 100)', 4, 3);
    }
    
    // 核心闪电
    ArcSurvivors.spawnParticles((fromX + toX) / 2, (fromY + toY) / 2, 5, 'rgb(255, 255, 200)', 6, 4);
};
