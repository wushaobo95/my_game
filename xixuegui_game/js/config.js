/**
 * config.js - 游戏常量与全局状态
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.CANVAS_WIDTH = 1280;
ArcSurvivors.CANVAS_HEIGHT = 720;

ArcSurvivors.gameState = {
    running: true,
    paused: false,
    time: 0,
    kills: 0,
    difficultyFactor: 1
};

ArcSurvivors.keys = {};

ArcSurvivors.player = null;
ArcSurvivors.enemies = [];
ArcSurvivors.bullets = [];
ArcSurvivors.enemyBullets = [];
ArcSurvivors.gems = [];
ArcSurvivors.particles = [];

ArcSurvivors.screenShake = { intensity: 0, duration: 0 };
ArcSurvivors.hitStop = { active: false, frames: 0 };
