/**
 * systems/upgrade.js - 升级系统与道具系统
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.UPGRADES = [
    {
        id: 1,
        apply: function(p) {
            var bonus = ArcSurvivors.GAME_CONFIG.UPGRADES.ATTACK_POWER_BONUS;
            p.attackPower += bonus;
        },
        canAppear: function(p) { return true; }
    },
    {
        id: 2,
        apply: function(p) {
            var CFG = ArcSurvivors.GAME_CONFIG.UPGRADES;
            p.attackCooldown *= CFG.ATTACK_SPEED_BONUS;
            p.baseAttackCooldown = p.attackCooldown;
        },
        canAppear: function(p) {
            return p.baseAttackCooldown / ArcSurvivors.GAME_CONFIG.PLAYER.ATTACK_COOLDOWN < ArcSurvivors.GAME_CONFIG.UPGRADES.ATTACK_SPEED_LIMIT;
        }
    },
    {
        id: 3,
        apply: function(p) {
            var CFG = ArcSurvivors.GAME_CONFIG.UPGRADES;
            p.bulletSpeed *= CFG.BULLET_SPEED_BONUS;
            p.baseBulletSpeed = p.bulletSpeed;
        },
        canAppear: function(p) {
            return false; // 屏蔽弹道加速掉落
        }
    },
    {
        id: 5,
        apply: function(p) {
            var bonus = ArcSurvivors.GAME_CONFIG.UPGRADES.MAX_HP_BONUS;
            p.maxHp += bonus;
            p.hp += bonus;
        },
        canAppear: function(p) { return true; }
    },
    {
        id: 7,
        apply: function(p) {
            var CFG = ArcSurvivors.GAME_CONFIG.UPGRADES;
            p.speed *= CFG.MOVE_SPEED_BONUS;
            p.baseSpeed = p.speed;
        },
        canAppear: function(p) {
            return false; // 移除疾风步，改为法宝极速之靴
        }
    },
    {
        id: 9,
        apply: function(p) {
            p.extraProjectiles += 1;
        },
        canAppear: function(p) {
            return p.extraProjectiles < ArcSurvivors.GAME_CONFIG.UPGRADES.MAX_EXTRA_PROJECTILES;
        }
    },
    {
        id: 10,
        apply: function(p) {
            var CFG = ArcSurvivors.GAME_CONFIG.UPGRADES;
            p.criticalChance = Math.min(p.criticalChance + CFG.CRITICAL_CHANCE_BONUS, CFG.CRITICAL_MAX);
        },
        canAppear: function(p) {
            return false; // 移除暴击强化技能，改为法宝暴击斗篷
        }
    },
    {
        id: 11,
        apply: function(p) {
            var CFG = ArcSurvivors.GAME_CONFIG.UPGRADES;
            p.lightningChainCount = Math.min(p.lightningChainCount + CFG.LIGHTNING_CHAIN_BONUS, CFG.LIGHTNING_CHAIN_MAX);
        },
        canAppear: function(p) {
            return p.lightningChainCount < ArcSurvivors.GAME_CONFIG.UPGRADES.LIGHTNING_CHAIN_MAX;
        }
    },
    {
        id: 12,
        apply: function(p) {
            p.lightningStormCount = Math.min((p.lightningStormCount || 0) + 1, 5);
        },
        canAppear: function(p) {
            return (p.lightningStormCount || 0) < 5;
        }
    },
    {
        id: 13,
        apply: function(p) {
            p.fireOrbLevel = Math.min((p.fireOrbLevel || 0) + 1, 5);
        },
        canAppear: function(p) {
            return (p.fireOrbLevel || 0) < 5;
        }
    }
];

ArcSurvivors.ITEMS = [
    {
        id: 101,
        apply: function(p) { p.regenRate += ArcSurvivors.GAME_CONFIG.UPGRADES.REGEN_RATE_BONUS; },
        isItem: true
    },
    {
        id: 102,
        apply: function(p) { p.wallBounces = 1; },
        isItem: true
    },
    {
        id: 103,
        apply: function(p) { p.hasKillExplosion = true; },
        isItem: true
    },
    {
        id: 104,
        apply: function(p) {
            var CFG = ArcSurvivors.GAME_CONFIG;
            p.vampireHealAmount = (p.vampireHealAmount || 0) + CFG.VAMPIRE_MASK.HEAL_AMOUNT;
            p.hasVampireHeal = true;
        },
        isItem: true
    },
    {
        id: 105,
        apply: function(p) { p.pickupRange *= ArcSurvivors.GAME_CONFIG.UPGRADES.PICKUP_RANGE_BONUS; },
        isItem: true
    },
    {
        id: 106,
        apply: function(p) { p.hasFrostSlow = true; },
        isItem: true
    },
    {
        id: 108,
        apply: function(p) { p.hasReviveStone = true; },
        isItem: true
    },
    {
        id: 109,
        apply: function(p) { p.hasKnockback = true; },
        isItem: true
    },
    {
        id: 110,
        apply: function(p) { p.dodgeChance += ArcSurvivors.GAME_CONFIG.WINGS.DODGE_BONUS; },
        isItem: true
    },
    {
        id: 111,
        apply: function(p) { p.hasPoShi = true; },
        isItem: true
    },
    {
        id: 112,
        apply: function(p) { p.hasXinYan = true; },
        isItem: true
    },
    {
        id: 114,
        apply: function(p) {
            p.speed *= ArcSurvivors.GAME_CONFIG.SPEED_BOOTS.SPEED_BONUS;
            p.baseSpeed = p.speed;
        },
        isItem: true
    },
    {
        id: 115,
        apply: function(p) {
            p.criticalChance = 0.5;
        },
        isItem: true
    }
];

// 动态获取升级显示信息（支持格式化）
ArcSurvivors.getUpgradeDisplay = function(upgrade) {
    var STR = ArcSurvivors.STRINGS.UPGRADES[upgrade.id];
    var CFG = ArcSurvivors.GAME_CONFIG;
    if (!STR) return { name: '???', desc: '???', icon: '?' };

    var desc = STR.desc;
    // 根据升级类型格式化描述
    switch (upgrade.id) {
        case 1:
            desc = ArcSurvivors.formatString(desc, { value: CFG.UPGRADES.ATTACK_POWER_BONUS });
            break;
        case 2:
            desc = ArcSurvivors.formatString(desc, { percent: Math.round((1 - CFG.UPGRADES.ATTACK_SPEED_BONUS) * 100) });
            break;
        case 3:
            desc = ArcSurvivors.formatString(desc, { percent: Math.round((CFG.UPGRADES.BULLET_SPEED_BONUS - 1) * 100) });
            break;
        case 5:
            desc = ArcSurvivors.formatString(desc, { value: CFG.UPGRADES.MAX_HP_BONUS });
            break;
        case 7:
            desc = ArcSurvivors.formatString(desc, { percent: Math.round((CFG.UPGRADES.MOVE_SPEED_BONUS - 1) * 100) });
            break;
        case 10:
            desc = ArcSurvivors.formatString(desc, { percent: Math.round(CFG.UPGRADES.CRITICAL_CHANCE_BONUS * 100) });
            break;
        case 11:
            desc = ArcSurvivors.formatString(desc, { count: CFG.UPGRADES.LIGHTNING_CHAIN_BONUS });
            break;
        case 12:
            desc = ArcSurvivors.formatString(desc, { interval: CFG.LIGHTNING_STORM.INTERVAL, count: 1 });
            break;
        case 13:
            var nextLevel = (this.player.fireOrbLevel || 0) + 1;
            desc = ArcSurvivors.formatString(desc, { count: nextLevel });
            break;
    }

    return {
        name: STR.name,
        desc: desc,
        icon: STR.icon
    };
};

// 动态获取道具显示信息（支持格式化）
ArcSurvivors.getItemDisplay = function(item) {
    var STR = ArcSurvivors.STRINGS.ITEMS[item.id];
    var CFG = ArcSurvivors.GAME_CONFIG;
    if (!STR) return { name: '???', desc: '???', icon: '?' };

    var desc = STR.desc;
    switch (item.id) {
        case 101:
            desc = ArcSurvivors.formatString(desc, { value: CFG.UPGRADES.REGEN_RATE_BONUS });
            break;
        case 102:
            desc = ArcSurvivors.formatString(desc, { count: 1 });
            break;
        case 103:
            desc = ArcSurvivors.formatString(desc, { percent: Math.round(CFG.KILL_EXPLOSION.DAMAGE_SCALE * 100) });
            break;
        case 104:
            desc = ArcSurvivors.formatString(desc, { value: CFG.VAMPIRE_MASK.HEAL_AMOUNT });
            break;
        case 105:
            desc = ArcSurvivors.formatString(desc, { percent: Math.round((CFG.UPGRADES.PICKUP_RANGE_BONUS - 1) * 100) });
            break;
        case 109:
            desc = ArcSurvivors.formatString(desc, { distance: CFG.KNOCKBACK.DISTANCE });
            break;
        case 110:
            desc = ArcSurvivors.formatString(desc, { percent: Math.round(CFG.WINGS.DODGE_BONUS * 100) });
            break;
        case 111:
            desc = ArcSurvivors.formatString(desc, { 
                threshold: Math.round(CFG.DAMAGE_CONFIG.PO_SHI.HP_THRESHOLD * 100),
                bonus: Math.round(CFG.DAMAGE_CONFIG.PO_SHI.DAMAGE_BONUS * 100)
            });
            break;
        case 112:
            desc = ArcSurvivors.formatString(desc, { 
                step: Math.round(CFG.DAMAGE_CONFIG.XIN_YAN.HP_LOSS_STEP * 100),
                per_step: Math.round(CFG.DAMAGE_CONFIG.XIN_YAN.DAMAGE_PER_STEP * 100),
                max: Math.round(CFG.DAMAGE_CONFIG.XIN_YAN.MAX_DAMAGE_BONUS * 100)
            });
            break;
        case 114:
            desc = ArcSurvivors.formatString(desc, { percent: Math.round((CFG.SPEED_BOOTS.SPEED_BONUS - 1) * 100) });
            break;
        case 115:
            desc = STR.desc;
            break;
    }

    return {
        name: STR.name,
        desc: desc,
        icon: STR.icon
    };
};

ArcSurvivors.showUpgradeScreen = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var STR = ArcSurvivors.STRINGS.UI;
    this.gameState.paused = true;
    
    ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.UPGRADE_SHOW);

    var available = this.UPGRADES.filter(function(u) {
        return u.canAppear(this.player);
    }.bind(this));

    var selected = [];
    var upgradeChoices = CFG.UPGRADES.UPGRADE_CHOICES;
    for (var i = 0; i < upgradeChoices && available.length > 0; i++) {
        var index = Math.floor(Math.random() * available.length);
        selected.push(available.splice(index, 1)[0]);
    }

    var container = document.getElementById('upgradeCards');
    container.innerHTML = '';

    // 设置标题和样式类（技能选择）
    var screen = document.getElementById('upgradeScreen');
    document.getElementById('upgradeTitle').textContent = STR.SKILL_CHOICE_TITLE || '选择技能';
    screen.classList.add('skill-selection');
    screen.classList.remove('item-selection');

    var self = this;
    for (var j = 0; j < selected.length; j++) {
        var upgrade = selected[j];
        var display = this.getUpgradeDisplay(upgrade);
        var card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = '<div class="icon">' + display.icon + '</div><div class="name">' + display.name + '</div><div class="desc">' + display.desc + '</div>';

        card.onclick = (function(u) {
            return function() {
                var UE = CFG.UPGRADE_EFFECT;
                u.apply(self.player);
                self.player.acquiredUpgrades.push(u);
                self.player.pulseEffect = UE.PULSE_STRENGTH;
                document.getElementById('upgradeScreen').style.display = 'none';
                self.gameState.paused = false;
                
                ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.UPGRADE_SELECT, u);

                var enemies = self.enemies;
                for (var k = 0; k < enemies.length; k++) {
                    enemies[k].speed *= UE.SLOW_FACTOR;
                    (function(e) {
                        setTimeout(function() {
                            if (e.active) e.speed *= UE.SLOW_RECOVERY;
                        }, UE.SLOW_DURATION);
                    })(enemies[k]);
                }
            };
        })(upgrade);

        container.appendChild(card);
    }

    document.getElementById('upgradeScreen').style.display = 'flex';
};

ArcSurvivors.trySpawnItem = function() {
    var player = this.player;
    var ownedItems = player.acquiredUpgrades.filter(function(u) { return u.isItem; });
    
    var available = this.ITEMS.filter(function(item) {
        // 可重复掉落的法宝
        if (item.repeatable) {
            var count = 0;
            for (var i = 0; i < ownedItems.length; i++) {
                if (ownedItems[i].id === item.id) count++;
            }
            return count < (item.maxCount || 999);
        }
        // 普通法宝：检查是否已拥有
        for (var i = 0; i < ownedItems.length; i++) {
            if (ownedItems[i].id === item.id) return false;
        }
        return true;
    });

    if (available.length === 0) return null;

    // 随机选择一个具体法宝
    var index = Math.floor(Math.random() * available.length);
    var selected = available[index];
    
    // 创建一个新对象，继承原始法宝的属性，添加isUnified标记
    var pickup = {};
    for (var key in selected) {
        if (selected.hasOwnProperty(key)) {
            pickup[key] = selected[key];
        }
    }
    pickup.isUnified = true;
    
    return pickup;
};

ArcSurvivors.showItemDescription = function(item) {
    this.showUpgradeDescription(item);
};

ArcSurvivors.showUpgradeDescription = function(upgrade) {
    var STR = ArcSurvivors.STRINGS.UI;
    var wasPausedBefore = this.gameState.paused;
    this._descWasPausedBefore = wasPausedBefore;
    this.gameState.paused = true;

    var container = document.getElementById('itemDescription');
    var isItem = upgrade.isItem === true;
    var typeLabel = isItem ? STR.ITEM_LABEL : STR.SKILL_LABEL;

    var display = isItem ? this.getItemDisplay(upgrade) : this.getUpgradeDisplay(upgrade);

    var maxedInfo = '';
    if (!isItem) {
        var skillDef = null;
        for (var i = 0; i < this.UPGRADES.length; i++) {
            if (this.UPGRADES[i].id === upgrade.id) {
                skillDef = this.UPGRADES[i];
                break;
            }
        }
        if (skillDef && !skillDef.canAppear(this.player)) {
            maxedInfo = ' <span style="color:#ffcc00;font-size:14px">' + STR.MAXED_LABEL + '</span>';
        }
    }

    container.innerHTML = '<div class="item-icon">' + display.icon + '</div>' +
                         '<div class="item-name">' + display.name + maxedInfo + '</div>' +
                         '<div class="item-desc">' + display.desc + '</div>' +
                         '<div style="color:#888;font-size:12px;margin-bottom:15px">' + typeLabel + '</div>' +
                         '<button id="itemConfirmBtn">确认</button>';

    document.getElementById('itemDescriptionScreen').style.display = 'flex';

    var self = this;
    document.getElementById('itemConfirmBtn').addEventListener('click', function() {
        document.getElementById('itemDescriptionScreen').style.display = 'none';
        self.gameState.paused = self._descWasPausedBefore;
    });
};

// 法宝选择界面
ArcSurvivors.showItemChoiceScreen = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var STR = ArcSurvivors.STRINGS.UI;
    this.gameState.paused = true;

    // 获取可用法宝池（过滤掉已拥有的）
    var player = this.player;
    var ownedItems = player.acquiredUpgrades.filter(function(u) { return u.isItem; });
    var ownedIds = ownedItems.map(function(u) { return u.id; });

    var available = this.ITEMS.filter(function(item) {
        return ownedIds.indexOf(item.id) === -1;
    });

    if (available.length === 0) {
        // 法宝池耗尽，不应该发生（trySpawnItem已经检查过）
        this.gameState.paused = false;
        return;
    }

    // 随机选择最多3个法宝
    var selected = [];
    var choiceCount = Math.min(3, available.length);
    for (var i = 0; i < choiceCount; i++) {
        var index = Math.floor(Math.random() * available.length);
        selected.push(available.splice(index, 1)[0]);
    }

    var container = document.getElementById('upgradeCards');
    container.innerHTML = '';

    // 设置标题和样式类（法宝选择）
    var screen = document.getElementById('upgradeScreen');
    document.getElementById('upgradeTitle').textContent = STR.ITEM_CHOICE_TITLE || '选择法宝';
    screen.classList.add('item-selection');
    screen.classList.remove('skill-selection');

    var self = this;
    for (var j = 0; j < selected.length; j++) {
        var item = selected[j];
        var display = this.getItemDisplay(item);
        var card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = '<div class="icon">' + display.icon + '</div><div class="name">' + display.name + '</div><div class="desc">' + display.desc + '</div>';

        card.onclick = (function(u) {
            return function() {
                // 应用法宝效果
                u.apply(self.player);
                self.player.acquiredUpgrades.push(u);
                document.getElementById('upgradeScreen').style.display = 'none';
                self.gameState.paused = false;

                ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.ITEM_PICKUP, u);
            };
        })(item);

        container.appendChild(card);
    }

    document.getElementById('upgradeScreen').style.display = 'flex';
};

// 随机选择并自动应用一个可用技能
ArcSurvivors.autoApplyRandomUpgrade = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var UE = CFG.UPGRADE_EFFECT;

    // 获取可用技能池
    var available = this.UPGRADES.filter(function(u) {
        return u.canAppear(this.player);
    }.bind(this));

    if (available.length === 0) return;

    // 随机选择一个技能
    var index = Math.floor(Math.random() * available.length);
    var upgrade = available[index];

    // 应用技能效果
    upgrade.apply(this.player);
    this.player.acquiredUpgrades.push(upgrade);
    this.player.pulseEffect = UE.PULSE_STRENGTH;

    ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.UPGRADE_SELECT, upgrade);

    // 减速效果
    var enemies = this.enemies;
    for (var k = 0; k < enemies.length; k++) {
        enemies[k].speed *= UE.SLOW_FACTOR;
        (function(e) {
            setTimeout(function() {
                if (e.active) e.speed *= UE.SLOW_RECOVERY;
            }, UE.SLOW_DURATION);
        })(enemies[k]);
    }

    // 显示获得的技能信息
    var display = this.getUpgradeDisplay(upgrade);
    this.showFloatingText('+' + display.icon + ' ' + display.name, 'rgb(100,255,100)');
};

// 随机选择并自动应用一个可用法宝
ArcSurvivors.autoApplyRandomItem = function() {
    var player = this.player;
    var ownedItems = player.acquiredUpgrades.filter(function(u) { return u.isItem; });
    var ownedIds = ownedItems.map(function(u) { return u.id; });

    var available = this.ITEMS.filter(function(item) {
        // 可重复掉落的法宝
        if (item.repeatable) {
            var count = 0;
            for (var i = 0; i < ownedItems.length; i++) {
                if (ownedItems[i].id === item.id) count++;
            }
            return count < (item.maxCount || 999);
        }
        // 普通法宝：检查是否已拥有
        return ownedIds.indexOf(item.id) === -1;
    });

    if (available.length === 0) return;

    // 随机选择一个法宝
    var index = Math.floor(Math.random() * available.length);
    var item = available[index];

    // 应用法宝效果
    item.apply(player);
    player.acquiredUpgrades.push(item);

    ArcSurvivors.EventSystem.emit(ArcSurvivors.Events.ITEM_PICKUP, item);

    // 显示获得的法宝信息
    var display = this.getItemDisplay(item);
    this.showFloatingText('+' + display.icon + ' ' + display.name, 'rgb(255,215,0)');
};

// 浮动文字提示
ArcSurvivors.showFloatingText = function(text, color) {
    var player = this.player;
    if (!player) return;

    var floatText = {
        x: player.x,
        y: player.y - 30,
        text: text,
        color: color || 'rgb(255,255,255)',
        timer: 1.5,
        active: true
    };

    if (!this.floatingTexts) this.floatingTexts = [];
    this.floatingTexts.push(floatText);
};

// 在指定位置生成技能掉落物品
ArcSurvivors.spawnSkillPickup = function(x, y) {
    // 获取可用技能池
    var available = this.UPGRADES.filter(function(u) {
        return u.canAppear(this.player);
    }.bind(this));

    if (available.length === 0) return;

    // 检查是否有其他技能未满级（攻击力和生命强化的ID是1和5）
    var basicSkillIds = [1, 5]; // 攻击强化、生命强化
    var hasOtherSkillsNotMaxed = available.some(function(u) {
        return basicSkillIds.indexOf(u.id) === -1;
    });

    // 如果有其他技能未满级，则排除攻击力和生命强化
    if (hasOtherSkillsNotMaxed) {
        available = available.filter(function(u) {
            return basicSkillIds.indexOf(u.id) === -1;
        });
    }

    if (available.length === 0) return;

    // 随机选择一个技能
    var index = Math.floor(Math.random() * available.length);
    var upgrade = available[index];

    // 在玩家位置附近随机偏移
    var offsetX = (Math.random() - 0.5) * 40;
    var offsetY = (Math.random() - 0.5) * 40;

    // 创建技能掉落物品
    var skillPickup = new ArcSurvivors.SkillPickup(x + offsetX, y + offsetY, upgrade);
    this.skillPickups.push(skillPickup);
};