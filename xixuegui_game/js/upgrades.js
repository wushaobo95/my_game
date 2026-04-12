/**
 * upgrades.js - 升级系统与道具系统
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
            return p.baseBulletSpeed / ArcSurvivors.GAME_CONFIG.PLAYER.BULLET_SPEED < ArcSurvivors.GAME_CONFIG.UPGRADES.BULLET_SPEED_LIMIT;
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
            return p.baseSpeed / ArcSurvivors.GAME_CONFIG.PLAYER.SPEED < ArcSurvivors.GAME_CONFIG.UPGRADES.MOVE_SPEED_LIMIT;
        }
    },
    {
        id: 9,
        apply: function(p) { p.extraProjectiles += 1; },
        canAppear: function(p) { return p.extraProjectiles < ArcSurvivors.GAME_CONFIG.UPGRADES.MAX_EXTRA_PROJECTILES; }
    },
    {
        id: 10,
        apply: function(p) {
            var CFG = ArcSurvivors.GAME_CONFIG.UPGRADES;
            p.criticalChance = Math.min(p.criticalChance + CFG.CRITICAL_CHANCE_BONUS, CFG.CRITICAL_MAX);
        },
        canAppear: function(p) {
            return p.criticalChance < ArcSurvivors.GAME_CONFIG.UPGRADES.CRITICAL_MAX;
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
        apply: function(p) { p.hasVampireMask = true; },
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
    var ownedIds = ownedItems.map(function(u) { return u.id; });

    var available = this.ITEMS.filter(function(item) {
        return ownedIds.indexOf(item.id) === -1;
    });

    if (available.length === 0) return null;

    var index = Math.floor(Math.random() * available.length);
    return available[index];
};

ArcSurvivors.showItemDescription = function(item) {
    this.showUpgradeDescription(item);
};

ArcSurvivors.showUpgradeDescription = function(upgrade) {
    var STR = ArcSurvivors.STRINGS.UI;
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
        self.gameState.paused = false;
    });
};
