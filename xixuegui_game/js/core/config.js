/**
 * core/config.js - 命名空间、全局状态与工具函数
 * 必须最先加载，其他文件依赖此文件定义的命名空间
 */
var ArcSurvivors = ArcSurvivors || {};

// ============================================================
// 工具函数：格式化文案
// ============================================================
ArcSurvivors.formatString = function(template, data) {
    if (!template) return '';
    return template.replace(/\{(\w+)\}/g, function(match, key) {
        return data[key] !== undefined ? data[key] : match;
    });
};

// ============================================================
// 全局状态与实体数组
// ============================================================
ArcSurvivors.CANVAS_WIDTH = window.innerWidth || 1280;
ArcSurvivors.CANVAS_HEIGHT = window.innerHeight || 720;

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
ArcSurvivors.itemPickups = [];
ArcSurvivors.buffPickups = [];
