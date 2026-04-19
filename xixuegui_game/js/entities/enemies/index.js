var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Enemies = {
    base: ArcSurvivors.Enemy,
    types: ArcSurvivors.Enemy.prototype.draw,
    spawn: ArcSurvivors.spawnEnemies,
    spawnBoss: ArcSurvivors.spawnBoss,
    showBossWarning: ArcSurvivors.showBossWarning,
    bullet: ArcSurvivors.EnemyBullet
};