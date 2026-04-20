/**
 * bosses/skills/active/horn-blast.js - 独角冲击
 * 蓄力释放环形冲击波，Phase3带击退
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.hornBlast = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.HORN_BLAST;

    return {
        name: 'horn_blast',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: 0,
        castDuration: SC.WARNING_DURATION,
        _phase: 'warning',
        _blastRadius: 0,
        _damageDealt: false,

        onCastStart: function(boss) {
            this._phase = 'warning';
            this._blastRadius = boss.bossPhase >= 3 ? SC.RADIUS_PHASE3 : SC.RADIUS;
            this._damageDealt = false;
            this._castTimer = 0;
        },

        updateCast: function(boss, dt) {
            if (this._phase === 'warning') {
                if (this._castTimer === undefined) this._castTimer = 0;
                this._castTimer += dt;
                
                if (this._castTimer >= SC.WARNING_DURATION) {
                    this._phase = 'blast';
                    this._castTimer = 0;
                    ArcSurvivors.Audio.hit();
                    this._applyBlast(boss);
                }
            }
        },

        _applyBlast: function(boss) {
            var player = ArcSurvivors.player;
            var dist = ArcSurvivors.Utils.distance(boss.x, boss.y, player.x, player.y);
            
            if (dist <= this._blastRadius && player.invulnerableTimer <= 0) {
                var damage = boss.damage * SC.DAMAGE_SCALE;
                player.takeDamage(damage);
                
                if (boss.bossPhase >= 3) {
                    var angle = Math.atan2(player.y - boss.y, player.x - boss.x);
                    player.knockbackX = Math.cos(angle) * SC.KNOCKBACK_FORCE;
                    player.knockbackY = Math.sin(angle) * SC.KNOCKBACK_FORCE;
                    player.knockbackTimer = 0.3;
                }
            }
            
            for (var i = 0; i < 20; i++) {
                var angle = (i / 20) * Math.PI * 2;
                var px = boss.x + Math.cos(angle) * this._blastRadius * 0.8;
                var py = boss.y + Math.sin(angle) * this._blastRadius * 0.8;
                ArcSurvivors.spawnParticles(px, py, 2, 'rgb(200, 150, 100)', 4, 3);
            }
        },

        onCastEnd: function(boss) {
            this._phase = 'warning';
            this._castTimer = 0;
        }
    };
};