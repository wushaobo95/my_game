/**
 * bosses/skills/active/aura-buff.js - 鼓舞领域
 * 释放光环增强范围内小怪，Phase 2增加范围
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.auraBuff = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.AURA_BUFF;

    return {
        name: 'aura_buff',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: SC.PHASE || 0,
        castDuration: SC.DURATION,
        _isActive: false,
        _auraTimer: 0,
        _buffedEnemies: [],

        onCastStart: function(boss) {
            this._auraTimer = SC.DURATION;
            this._isActive = true;
            this._buffedEnemies = [];
            boss.auraActive = true;

            // 领域开启特效
            ArcSurvivors.spawnParticles(boss.x, boss.y, 25, 'rgb(255, 200, 0)', 6, 4);
            ArcSurvivors.Audio.hit();
        },

        updateCast: function(boss, dt) {
            var radius = boss.bossPhase >= 2 ? SC.RADIUS_PHASE2 : SC.RADIUS;

            this._auraTimer -= dt;

            // 每帧更新范围内小怪的增益效果
            var enemies = ArcSurvivors.enemies;
            var player = ArcSurvivors.player;

            for (var i = 0; i < enemies.length; i++) {
                var enemy = enemies[i];
                if (!enemy || !enemy.active || enemy === boss) continue;

                var dist = ArcSurvivors.Utils.distance(boss.x, boss.y, enemy.x, enemy.y);

                if (dist <= radius) {
                    // 在范围内，应用增益
                    if (!enemy.auraBuffed) {
                        enemy.auraBuffed = true;
                        enemy.baseSpeed = enemy.baseSpeed || enemy.speed;
                        enemy.baseDamage = enemy.baseDamage || enemy.damage;
                        this._buffedEnemies.push(enemy);
                    }
                    // 实时更新增益（防止被其他效果覆盖）
                    enemy.speed = (enemy.baseSpeed || enemy.speed) * SC.ENEMY_SPEED_BONUS;
                    enemy.damage = (enemy.baseDamage || enemy.damage) * SC.ENEMY_DAMAGE_BONUS;
                } else {
                    // 离开范围，移除增益
                    if (enemy.auraBuffed) {
                        enemy.speed = enemy.baseSpeed || enemy.speed;
                        enemy.damage = enemy.baseDamage || enemy.damage;
                        enemy.auraBuffed = false;
                    }
                }
            }

            // 领域粒子效果
            if (Math.random() < 0.5) {
                var angle = Math.random() * Math.PI * 2;
                var dist = Math.random() * radius;
                var px = boss.x + Math.cos(angle) * dist;
                var py = boss.y + Math.sin(angle) * dist;
                ArcSurvivors.spawnParticles(px, py, 1, 'rgb(255, 200, 0)', 3, 1);
            }

            if (this._auraTimer <= 0) {
                // 领域结束，清除所有增益
                this._clearBuffs();
                boss.auraActive = false;
                this._isActive = false;
            }
        },

        onCastEnd: function(boss) {
            this._clearBuffs();
            boss.auraActive = false;
            this._isActive = false;
        },

        _clearBuffs: function() {
            for (var i = 0; i < this._buffedEnemies.length; i++) {
                var enemy = this._buffedEnemies[i];
                if (enemy && enemy.active) {
                    enemy.speed = enemy.baseSpeed || enemy.speed;
                    enemy.damage = enemy.baseDamage || enemy.damage;
                    enemy.auraBuffed = false;
                }
            }
            this._buffedEnemies = [];
        }
    };
};
