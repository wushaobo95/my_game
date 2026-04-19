/**
 * bosses/skills/active/darkness-field.js - 黑暗领域
 * 释放黑暗领域，范围内玩家视野受限，命中率下降
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.darknessField = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.DARKNESS_FIELD;

    return {
        name: 'darkness_field',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: 0,
        castDuration: SC.DURATION,
        _isActive: false,
        _fieldTimer: 0,
        _fieldX: 0,
        _fieldY: 0,

        onCastStart: function(boss) {
            var duration = boss.bossPhase >= 2 ? SC.DURATION_PHASE2 : SC.DURATION;
            
            this._fieldTimer = duration;
            this._isActive = true;
            this._fieldX = boss.x;
            this._fieldY = boss.y;
            
            boss.darknessFieldActive = true;
            boss.darknessFieldX = this._fieldX;
            boss.darknessFieldY = this._fieldY;
            
            // 黑暗领域生成特效
            ArcSurvivors.spawnParticles(boss.x, boss.y, 20, 'rgb(50, 0, 100)', 8, 4);
            ArcSurvivors.Audio.hit();
        },

        updateCast: function(boss, dt) {
            var radius = boss.bossPhase >= 2 ? SC.RADIUS_PHASE2 : SC.RADIUS;
            
            this._fieldTimer -= dt;
            
            // 更新领域位置（跟随Boss）
            this._fieldX = boss.x;
            this._fieldY = boss.y;
            boss.darknessFieldX = this._fieldX;
            boss.darknessFieldY = this._fieldY;
            
            var player = ArcSurvivors.player;
            var dist = ArcSurvivors.Utils.distance(this._fieldX, this._fieldY, player.x, player.y);
            
            // 检测玩家是否在领域内
            if (dist <= radius) {
                // 玩家命中率下降
                player.inDarknessField = true;
                player.darknessFieldHitChance = SC.PLAYER_HIT_CHANCE;
                
                // 黑暗粒子效果
                if (Math.random() < 0.3) {
                    var angle = Math.random() * Math.PI * 2;
                    var dist2 = Math.random() * radius;
                    var px = this._fieldX + Math.cos(angle) * dist2;
                    var py = this._fieldY + Math.sin(angle) * dist2;
                    ArcSurvivors.spawnParticles(px, py, 1, 'rgb(50, 0, 100)', 4, 1);
                }
            } else {
                player.inDarknessField = false;
            }
            
            if (this._fieldTimer <= 0) {
                this._deactivate(boss);
            }
        },

        onCastEnd: function(boss) {
            this._deactivate(boss);
        },

        _deactivate: function(boss) {
            boss.darknessFieldActive = false;
            ArcSurvivors.player.inDarknessField = false;
            this._isActive = false;
        }
    };
};

// 绘制黑暗领域（在boss-base.js的draw中调用）
ArcSurvivors.drawDarknessField = function(ctx, boss) {
    if (!boss.darknessFieldActive) return;
    
    var SC = ArcSurvivors.GAME_CONFIG.BOSS_SKILLS.ACTIVE.DARKNESS_FIELD;
    var radius = boss.bossPhase >= 2 ? SC.RADIUS_PHASE2 : SC.RADIUS;
    
    // 绘制黑暗领域
    var grad = ctx.createRadialGradient(
        boss.darknessFieldX, boss.darknessFieldY, 0,
        boss.darknessFieldX, boss.darknessFieldY, radius
    );
    grad.addColorStop(0, 'rgba(20, 0, 40, 0.6)');
    grad.addColorStop(0.7, 'rgba(30, 0, 60, 0.4)');
    grad.addColorStop(1, 'rgba(40, 0, 80, 0)');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(boss.darknessFieldX, boss.darknessFieldY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制边缘
    ctx.strokeStyle = 'rgba(80, 0, 120, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(boss.darknessFieldX, boss.darknessFieldY, radius, 0, Math.PI * 2);
    ctx.stroke();
};
