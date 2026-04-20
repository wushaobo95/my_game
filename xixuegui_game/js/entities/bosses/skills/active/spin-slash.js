/**
 * bosses/skills/active/spin-slash.js - 旋转切割
 * 原地旋转释放多道刀光，Phase2带减速
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.spinSlash = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.SPIN_SLASH;

    return {
        name: 'spin_slash',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: 0,
        castDuration: SC.DURATION,
        _rotation: 0,
        _slashAngles: [],
        _isActive: false,

        onCastStart: function(boss) {
            this._rotation = 0;
            this._isActive = true;
            
            var slashCount = boss.bossPhase >= 2 ? SC.SLASH_COUNT_PHASE2 : SC.SLASH_COUNT;
            this._slashAngles = [];
            
            for (var i = 0; i < slashCount; i++) {
                this._slashAngles.push((i / slashCount) * Math.PI * 2);
            }
        },

        updateCast: function(boss, dt) {
            this._rotation += dt * 4;
            
            var player = ArcSurvivors.player;
            var dist = ArcSurvivors.Utils.distance(boss.x, boss.y, player.x, player.y);
            
            if (dist <= SC.RADIUS && player.invulnerableTimer <= 0) {
                var damage = boss.damage * SC.DAMAGE_SCALE * dt / SC.DURATION;
                player.takeDamage(damage);
                
                if (boss.bossPhase >= 2) {
                    player.slowed = true;
                    player.slowedTimer = Math.max(player.slowedTimer || 0, SC.SLOW_DURATION);
                    player.speed = player.baseSpeed * SC.SLOW_FACTOR;
                }
            }
            
            if (Math.random() < 0.3) {
                var angle = Math.random() * Math.PI * 2;
                var r = Math.random() * SC.RADIUS;
                var px = boss.x + Math.cos(angle) * r;
                var py = boss.y + Math.sin(angle) * r;
                ArcSurvivors.spawnParticles(px, py, 1, 'rgb(255, 100, 50)', 3, 2);
            }
        },

        onCastEnd: function(boss) {
            this._isActive = false;
        }
    };
};