/**
 * bosses/skills/active/charge.js - 冲刺撞击
 * 向玩家方向高速冲刺，路径留下伤害轨迹
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Active.charge = function() {
    var CFG = ArcSurvivors.GAME_CONFIG;
    var SC = CFG.BOSS_SKILLS.ACTIVE.CHARGE;

    return {
        name: 'charge',
        cooldown: SC.COOLDOWN,
        timer: 0,
        phase: 0,

        execute: function(boss, dt) {
            var player = ArcSurvivors.player;
            boss.chargeAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
            boss.chargeState = 'charging';
            boss.chargeTimer = SC.CHARGE_DURATION;
            boss.chargeTrail = [];
        }
    };
};
