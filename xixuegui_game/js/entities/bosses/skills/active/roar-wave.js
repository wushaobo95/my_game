/**
 * bosses/skills/active/roar-wave.js - 狮吼波
 * 向四周发射扇形冲击波，Phase2波数增加
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.roarWave = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.ROAR_WAVE;

    return {
        name: 'roar_wave',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: 0,
        castDuration: 2,
        _waveIndex: 0,
        _waves: [],
        _castTimer: 0,

        onCastStart: function(boss) {
            this._waveIndex = 0;
            this._waves = [];
            this._castTimer = 0;
            
            var waveCount = boss.bossPhase >= 2 ? SC.WAVE_COUNT_PHASE2 : SC.WAVE_COUNT;
            var startAngle = Math.random() * Math.PI * 2;
            
            for (var i = 0; i < waveCount; i++) {
                this._waves.push({
                    angle: startAngle + (i / waveCount) * Math.PI * 2,
                    active: false,
                    timer: 0
                });
            }
        },

        updateCast: function(boss, dt) {
            this._castTimer += dt;
            var interval = SC.WAVE_INTERVAL;
            
            for (var i = 0; i < this._waves.length; i++) {
                var wave = this._waves[i];
                if (!wave.active && this._castTimer >= i * interval) {
                    wave.active = true;
                    wave.timer = SC.RADIUS / SC.SPEED;
                    ArcSurvivors.Audio.hit();
                }
                
                if (wave.active) {
                    wave.timer -= dt;
                    this._checkWaveCollision(boss, wave);
                }
            }
        },

        _checkWaveCollision: function(boss, wave) {
            var player = ArcSurvivors.player;
            if (player.invulnerableTimer > 0) return;
            
            var traveledDist = (SC.RADIUS / SC.SPEED - wave.timer) * SC.SPEED;
            var dist = ArcSurvivors.Utils.distance(boss.x, boss.y, player.x, player.y);
            
            if (Math.abs(dist - traveledDist) < 30) {
                var playerAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
                var angleDiff = Math.abs(playerAngle - wave.angle);
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                angleDiff = Math.abs(angleDiff);
                
                if (angleDiff < 0.5 || angleDiff > Math.PI * 2 - 0.5) {
                    var damage = boss.damage * SC.DAMAGE_SCALE;
                    player.takeDamage(damage);
                }
            }
        },

        onCastEnd: function(boss) {
            this._waves = [];
        }
    };
};