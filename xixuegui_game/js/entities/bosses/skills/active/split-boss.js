/**
 * bosses/skills/active/split-boss.js - Boss分裂技能
 * 当Boss血量降至阈值时，分裂成两个较小的Boss，继承本体70%血量
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.splitBoss = function() {
    return {
        name: 'split_boss',
        cooldown: 1,  // 每1秒检查一次
        timer: 0,
        phase: 0,
        _hasSplit: false,
        _splitThreshold: 0.5,  // 50%血量时分裂
        
        execute: function(boss, dt) {
            // 检查是否已分裂
            if (this._hasSplit) return;
            
            var hpPercent = boss.hp / boss.maxHp;
            
            // 当血量降至50%时分裂
            if (hpPercent <= this._splitThreshold) {
                this._hasSplit = true;
                this._performSplit(boss);
            }
        },
        
        _performSplit: function(boss) {
            var CFG = ArcSurvivors.GAME_CONFIG;
            var SC = CFG.BOSS_SKILLS.ACTIVE.SPLIT_BOSS;
            
            // 计算继承属性
            var inheritedHpPercent = SC ? SC.HP_PERCENT : 0.7;
            var inheritedDamagePercent = SC ? SC.DAMAGE_PERCENT : 0.7;
            var inheritedSizePercent = SC ? SC.SIZE_PERCENT : 0.8;
            
            // 停止原Boss
            boss.active = false;
            boss.visible = false;  // 隐藏但不删除，保持技能配置
            
            // 在Boss位置生成分裂特效
            ArcSurvivors.spawnParticles(boss.x, boss.y, 30, boss.color, 10, 5);
            ArcSurvivors.spawnParticles(boss.x, boss.y, 20, 'rgb(255, 255, 255)', 8, 6);
            
            // 创建两个分裂体
            for (var i = 0; i < 2; i++) {
                var offsetX = (i === 0 ? -30 : 30);
                var offsetY = (i === 0 ? -20 : 20);
                
                var newX = Math.max(boss.radius, Math.min(CFG.CANVAS_WIDTH - boss.radius, boss.x + offsetX));
                var newY = Math.max(boss.radius, Math.min(CFG.CANVAS_HEIGHT - boss.radius, boss.y + offsetY));
                
                // 创建分裂体Boss
                var splitBoss = new ArcSurvivors.BossDefault(newX, newY);
                
                // 继承属性（70%）
                splitBoss.hp = boss.maxHp * inheritedHpPercent;
                splitBoss.maxHp = splitBoss.hp;
                splitBoss.damage = boss.damage * inheritedDamagePercent;
                splitBoss.radius = boss.radius * inheritedSizePercent;
                
                // 标记为分裂体
                splitBoss.isSplitClone = true;
                splitBoss.splitParent = boss;
                splitBoss.bossType = boss.bossType;
                splitBoss.color = boss.color;
                
                // 复制技能但移除分裂技能（防止无限分裂）
                splitBoss.skills = [];
                for (var j = 0; j < boss.skills.length; j++) {
                    var skill = boss.skills[j];
                    if (skill.name !== 'split_boss') {
                        // 重新创建技能实例
                        var skillName = skill.name;
                        // 转换回驼峰命名
                        var camelCaseName = skillName.replace(/_([a-z])/g, function(match, letter) {
                            return letter.toUpperCase();
                        });
                        if (ArcSurvivors.Skills.Active[camelCaseName]) {
                            splitBoss.addSkill(ArcSurvivors.Skills.Active[camelCaseName]());
                        }
                    }
                }
                
                // 减少冷却时间让分裂体更激进
                for (var k = 0; k < splitBoss.skills.length; k++) {
                    splitBoss.skills[k].cooldown *= 0.7;
                    splitBoss.skills[k].timer = 0;
                }
                
                // 添加到敌人列表
                ArcSurvivors.enemies.push(splitBoss);
                
                // 生成特效
                ArcSurvivors.spawnParticles(newX, newY, 15, 'rgb(255, 100, 100)', 6, 4);
            }
            
            // 播放音效
            ArcSurvivors.Audio.bossDeath();
            ArcSurvivors.Audio.hit();
            
            // 屏幕震动
            ArcSurvivors.screenShake.intensity = 5;
            ArcSurvivors.screenShake.duration = 0.5;
        }
    };
};
