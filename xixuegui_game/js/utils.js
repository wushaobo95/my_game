/**
 * utils.js - 工具函数
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Utils = {
    distance: function(x1, y1, x2, y2) {
        var dx = x2 - x1;
        var dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    pointToLineDistance: function(px, py, x1, y1, x2, y2) {
        var A = px - x1, B = py - y1;
        var C = x2 - x1, D = y2 - y1;
        var dot = A * C + B * D;
        var lenSq = C * C + D * D;
        var param = lenSq !== 0 ? dot / lenSq : -1;
        var xx, yy;

        if (param < 0) { xx = x1; yy = y1; }
        else if (param > 1) { xx = x2; yy = y2; }
        else { xx = x1 + param * C; yy = y1 + param * D; }

        return Math.sqrt((px - xx) * (px - xx) + (py - yy) * (py - yy));
    },

    randomRange: function(min, max) {
        return Math.random() * (max - min) + min;
    }
};
