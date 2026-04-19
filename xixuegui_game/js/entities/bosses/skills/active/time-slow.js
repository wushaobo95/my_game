/**
 * bosses/skills/active/time-slow.js - 时间缓速
 * 释放时间缓速场，范围内玩家移动速度大幅降低
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.timeSlow = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.TIME_SLOW;

    return {
        name: 'time_slow',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: 0,
        castDuration: SC.DURATION,
        _isActive: false,
        _slowTimer: 0,
        _fieldX: 0,
        _fieldY: 0,

        onCastStart: function(boss) {
            var duration = boss.bossPhase >= 2 ? SC.DURATION_PHASE2 : SC.DURATION;
            
            this._slowTimer = duration;
            this._isActive = true;
            this._fieldX = boss.x;
            this._fieldY = boss.y;
            
            boss.timeSlowActive = true;
            boss.timeSlowX = this._fieldX;
            boss.timeSlowY = this._fieldY;
            
            // 记录进入时间缓速场前的玩家速度
            var player = ArcSurvivors.player;
            if (!player.timeSlowOriginalSpeed) {
                player.timeSlowOriginalSpeed = player.baseSpeed || player.speed;
            }
            
            // 时间缓速特效
            ArcSurvivors.spawnParticles(boss.x, boss.y, 25, 'rgb(100, 100, 255)', 7, 4);
            ArcSurvivors.Audio.hit();
        },

        updateCast: function(boss, dt) {
            var radius = boss.bossPhase >= 2 ? SC.RADIUS_PHASE2 : SC.RADIUS;
            
            this._slowTimer -= dt;
            
            // 更新领域位置（跟随Boss）
            this._fieldX = boss.x;
            this._fieldY = boss.y;
            boss.timeSlowX = this._fieldX;
            boss.timeSlowY = this._fieldY;
            
            var player = ArcSurvivors.player;
            var dist = ArcSurvivors.Utils.distance(this._fieldX, this._fieldY, player.x, player.y);
            
            // 检测玩家是否在领域内
            if (dist <= radius) {
                if (!player.inTimeSlowField) {
                    player.inTimeSlowField = true;
                    // 使用保存的原始速度
                    if (!player.timeSlowOriginalSpeed) {
                        player.timeSlowOriginalSpeed = player.baseSpeed || player.speed;
                    }
                    player.speed = player.timeSlowOriginalSpeed * SC.SLOW_FACTOR;
                }
                
                // 时间缓速粒子效果
                if (Math.random() < 0.4) {
                    var angle = Math.random() * Math.PI * 2;
                    var dist2 = Math.random() * radius;
                    var px = this._fieldX + Math.cos(angle) * dist2;
                    var py = this._fieldY + Math.sin(angle) * dist2;
                    ArcSurvivors.spawnParticles(px, py, 1, 'rgb(150, 150, 255)', 3, 1);
                }
            } else {
                if (player.inTimeSlowField) {
                    player.inTimeSlowField = false;
                    // 恢复到时间缓速前的速度
                    if (player.timeSlowOriginalSpeed) {
                        player.speed = player.timeSlowOriginalSpeed;
                        player.timeSlowOriginalSpeed = null;
                    }
                }
            }
            
            if (this._slowTimer <= 0) {
                this._deactivate(boss);
            }
        },

        onCastEnd: function(boss) {
            this._deactivate(boss);
        },

        _deactivate: function(boss) {
            boss.timeSlowActive = false;
            
            var player = ArcSurvivors.player;
            if (player.inTimeSlowField) {
                player.inTimeSlowField = false;
                // 恢复到时间缓速前的速度
                if (player.timeSlowOriginalSpeed) {
                    player.speed = player.timeSlowOriginalSpeed;
                    player.timeSlowOriginalSpeed = null;
                }
            }
            
            // 清理保存的速度
            player.timeSlowOriginalSpeed = null;
            
            this._isActive = false;
        }
    };
};

// 绘制时间缓速领域（在boss-base.js的draw中调用）
ArcSurvivors.drawTimeSlowField = function(ctx, boss) {
    if (!boss.timeSlowActive) return;
    
    var SC = ArcSurvivors.GAME_CONFIG.BOSS_SKILLS.ACTIVE.TIME_SLOW;
    var radius = boss.bossPhase >= 2 ? SC.RADIUS_PHASE2 : SC.RADIUS;
    
    // 绘制时间缓速领域
    var grad = ctx.createRadialGradient(
        boss.timeSlowX, boss.timeSlowY, 0,
        boss.timeSlowX, boss.timeSlowY, radius
    );
    grad.addColorStop(0, 'rgba(100, 100, 255, 0.3)');
    grad.addColorStop(0.6, 'rgba(120, 120, 255, 0.2)');
    grad.addColorStop(1, 'rgba(150, 150, 255, 0)');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(boss.timeSlowX, boss.timeSlowY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制时钟效果
    var time = Date.now() / 1000;
    ctx.strokeStyle = 'rgba(180, 180, 255, 0.5)';
    ctx.lineWidth = 2;
    
    for (var i = 0; i < 12; i++) {
        var angle = (i / 12) * Math.PI * 2 + time * 0.5;
        var innerR = radius * 0.8;
        var outerR = radius * 0.95;
        
        ctx.beginPath();
        ctx.moveTo(
            boss.timeSlowX + Math.cos(angle) * innerR,
            boss.timeSlowY + Math.sin(angle) * innerR
        );
        ctx.lineTo(
            boss.timeSlowX + Math.cos(angle) * outerR,
            boss.timeSlowY + Math.sin(angle) * outerR
        );
        ctx.stroke();
    }
};
