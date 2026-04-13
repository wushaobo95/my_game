/**
 * bosses/skills/passive/damage-reduction.js - 伤害减免
 * Boss受到的单次伤害不超过最大生命值的一定比例
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Skills.Passive.damageReduction = function(boss) {
    boss.damageReduction = true;
};
