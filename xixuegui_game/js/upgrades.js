/**
 * upgrades.js - 升级系统
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.UPGRADES = [
    { id: 1, name: '攻击强化', desc: '攻击力+8', icon: '⚔️', apply: function(p) { p.attackPower += 8; } },
    { id: 2, name: '急速射击', desc: '攻击速度+15%', icon: '⚡', apply: function(p) { p.attackCooldown *= 0.85; } },
    { id: 3, name: '弹道加速', desc: '子弹速度+25%', icon: '💨', apply: function(p) { p.bulletSpeed *= 1.25; } },
    { id: 4, name: '弹幕扩张', desc: '子弹大小+20%，伤害+3', icon: '🔮', apply: function(p) { p.bulletSize *= 1.2; p.attackPower += 3; } },
    { id: 5, name: '生命强化', desc: '最大生命+20并恢复', icon: '❤️', apply: function(p) { p.maxHp += 20; p.hp += 20; } },
    { id: 6, name: '生命再生', desc: '每秒回复1点生命', icon: '💚', apply: function(p) { p.regenRate += 1; } },
    { id: 7, name: '疾风步', desc: '移动速度+10%', icon: '👟', apply: function(p) { p.speed *= 1.1; } },
    { id: 8, name: '穿透强化', desc: '子弹穿透+1', icon: '🎯', apply: function(p) { p.bulletPenetration += 1; } },
    { id: 9, name: '多重射击', desc: '额外投射物+1', icon: '🔱', apply: function(p) { p.extraProjectiles += 1; } },
    { id: 10, name: '冰霜新星', desc: '受击后释放冰霜新星(8秒CD)', icon: '❄️', apply: function(p) { p.hasFrostNova = true; p.frostNovaCooldown = 0; } },
    { id: 11, name: '墙壁弹射', desc: '子弹墙壁弹射次数+1', icon: '🧱', apply: function(p) { p.wallBounces += 1; } },
    { id: 12, name: '击杀爆炸', desc: '击杀敌人产生爆炸(50%攻击力)', icon: '💥', apply: function(p) { p.hasKillExplosion = true; } },
    { id: 13, name: '经验磁力', desc: '经验拾取范围+40%', icon: '🧲', apply: function(p) { p.pickupRange *= 1.4; } },
    { id: 14, name: '自动激光', desc: '每10秒发射贯穿激光', icon: '🔫', apply: function(p) { p.hasAutoLaser = true; p.laserTimer = 0; } },
    { id: 15, name: '弹射射击', desc: '子弹命中后弹射一次', icon: '🔄', apply: function(p) { p.hasBouncing = true; } }
];

ArcSurvivors.showUpgradeScreen = function() {
    this.gameState.paused = true;

    var available = this.UPGRADES.slice();
    var selected = [];
    for (var i = 0; i < 3 && available.length > 0; i++) {
        var index = Math.floor(Math.random() * available.length);
        selected.push(available.splice(index, 1)[0]);
    }

    var container = document.getElementById('upgradeCards');
    container.innerHTML = '';

    var self = this;
    for (var j = 0; j < selected.length; j++) {
        var upgrade = selected[j];
        var card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = '<div class="icon">' + upgrade.icon + '</div><div class="name">' + upgrade.name + '</div><div class="desc">' + upgrade.desc + '</div>';

        card.onclick = (function(u) {
            return function() {
                u.apply(self.player);
                self.player.acquiredUpgrades.push(u);
                self.player.pulseEffect = 1;
                document.getElementById('upgradeScreen').style.display = 'none';
                self.gameState.paused = false;

                var enemies = self.enemies;
                for (var k = 0; k < enemies.length; k++) {
                    enemies[k].speed *= 0.5;
                    (function(e) {
                        setTimeout(function() {
                            if (e.active) e.speed *= 2;
                        }, 200);
                    })(enemies[k]);
                }
            };
        })(upgrade);

        container.appendChild(card);
    }

    document.getElementById('upgradeScreen').style.display = 'flex';
};
