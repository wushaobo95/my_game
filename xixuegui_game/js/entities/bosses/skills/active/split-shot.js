/**
 * bosses/skills/active/split-shot.js - 分裂射击
 * 子弹击中目标后分裂成3个小子弹，向不同方向散射
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.splitShot = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.SPLIT_SHOT;

    return {
        name: 'split_shot',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: 0,

        execute: function(boss, dt) {
            var bulletCount = boss.bossPhase >= 2 ? SC.BULLET_COUNT_PHASE2 : SC.BULLET_COUNT;
            var damage = boss.damage * SC.DAMAGE_SCALE;
            var player = ArcSurvivors.player;

            // 计算朝向玩家的角度
            var baseAngle = Math.atan2(player.y - boss.y, player.x - boss.x);

            for (var i = 0; i < bulletCount; i++) {
                // 扇形散布
                var spreadAngle = (i - (bulletCount - 1) / 2) * 0.25;
                var angle = baseAngle + spreadAngle;

                // 创建会分裂的子弹
                var bullet = new ArcSurvivors.EnemyBullet(
                    boss.x, boss.y,
                    angle,
                    SC.SPEED,
                    damage,
                    0, 0  // 非追踪弹
                );
                
                // 标记为可分裂子弹
                bullet.canSplit = true;
                bullet.splitCount = SC.SPLIT_COUNT;
                bullet.splitAngle = SC.SPLIT_ANGLE * Math.PI / 180;
                bullet.parentBoss = boss;
                
                ArcSurvivors.enemyBullets.push(bullet);
            }
        }
    };
};

// 在敌人子弹更新中处理分裂
ArcSurvivors.splitBulletOnHit = function(bullet, target) {
    if (!bullet.canSplit || bullet.hasSplit) return;
    
    var SC = ArcSurvivors.GAME_CONFIG.BOSS_SKILLS.ACTIVE.SPLIT_SHOT;
    var damage = bullet.damage * 0.5; // 分裂子弹伤害减半
    
    bullet.hasSplit = true;
    
    // 创建分裂子弹
    for (var i = 0; i < bullet.splitCount; i++) {
        var angleOffset = (i - (bullet.splitCount - 1) / 2) * bullet.splitAngle;
        var newAngle = bullet.angle + angleOffset;
        
        var splitBullet = new ArcSurvivors.EnemyBullet(
            bullet.x, bullet.y,
            newAngle,
            bullet.speed * 0.8, // 分裂子弹速度稍慢
            damage,
            0, 0
        );
        
        // 分裂子弹不能再分裂
        splitBullet.canSplit = false;
        
        ArcSurvivors.enemyBullets.push(splitBullet);
    }
    
    // 分裂特效
    ArcSurvivors.spawnParticles(bullet.x, bullet.y, 5, 'rgb(255, 100, 100)', 3, 2);
};
