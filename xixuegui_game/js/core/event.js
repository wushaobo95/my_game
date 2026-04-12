/**
 * core/event.js - 事件系统
 * 解耦模块间通信，减少直接依赖
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.EventSystem = (function() {
    var listeners = {};
    var onceListeners = {};
    
    /**
     * 注册事件监听器
     * @param {string} event - 事件名称
     * @param {function} callback - 回调函数
     * @param {object} context - 回调上下文（可选）
     */
    function on(event, callback, context) {
        if (!listeners[event]) {
            listeners[event] = [];
        }
        listeners[event].push({
            callback: callback,
            context: context || null
        });
    }
    
    /**
     * 注册一次性事件监听器
     * @param {string} event - 事件名称
     * @param {function} callback - 回调函数
     * @param {object} context - 回调上下文（可选）
     */
    function once(event, callback, context) {
        if (!onceListeners[event]) {
            onceListeners[event] = [];
        }
        onceListeners[event].push({
            callback: callback,
            context: context || null
        });
    }
    
    /**
     * 移除事件监听器
     * @param {string} event - 事件名称
     * @param {function} callback - 回调函数（可选，不传则移除所有）
     */
    function off(event, callback) {
        if (!callback) {
            // 移除该事件的所有监听器
            delete listeners[event];
            delete onceListeners[event];
            return;
        }
        
        // 移除普通监听器
        if (listeners[event]) {
            listeners[event] = listeners[event].filter(function(listener) {
                return listener.callback !== callback;
            });
        }
        
        // 移除一次性监听器
        if (onceListeners[event]) {
            onceListeners[event] = onceListeners[event].filter(function(listener) {
                return listener.callback !== callback;
            });
        }
    }
    
    /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {...*} args - 传递给监听器的参数
     */
    function emit(event) {
        var args = Array.prototype.slice.call(arguments, 1);
        
        // 触发普通监听器
        if (listeners[event]) {
            listeners[event].forEach(function(listener) {
                listener.callback.apply(listener.context, args);
            });
        }
        
        // 触发一次性监听器
        if (onceListeners[event]) {
            onceListeners[event].forEach(function(listener) {
                listener.callback.apply(listener.context, args);
            });
            // 清空一次性监听器
            onceListeners[event] = [];
        }
    }
    
    /**
     * 获取事件监听器数量
     * @param {string} event - 事件名称
     * @returns {number}
     */
    function listenerCount(event) {
        var count = 0;
        if (listeners[event]) {
            count += listeners[event].length;
        }
        if (onceListeners[event]) {
            count += onceListeners[event].length;
        }
        return count;
    }
    
    /**
     * 清除所有事件监听器
     */
    function clear() {
        listeners = {};
        onceListeners = {};
    }
    
    // 返回公共接口
    return {
        on: on,
        once: once,
        off: off,
        emit: emit,
        listenerCount: listenerCount,
        clear: clear
    };
})();

// 预定义游戏事件
ArcSurvivors.Events = {
    // 玩家事件
    PLAYER_HURT: 'player:hurt',
    PLAYER_HEAL: 'player:heal',
    PLAYER_LEVEL_UP: 'player:levelUp',
    PLAYER_DIE: 'player:die',
    PLAYER_REVIVE: 'player:revive',
    
    // 敌人事件
    ENEMY_SPAWN: 'enemy:spawn',
    ENEMY_DIE: 'enemy:die',
    ENEMY_HURT: 'enemy:hurt',
    BOSS_SPAWN: 'boss:spawn',
    BOSS_DIE: 'boss:die',
    
    // 子弹事件
    BULLET_FIRE: 'bullet:fire',
    BULLET_HIT: 'bullet:hit',
    
    // 道具事件
    ITEM_SPAWN: 'item:spawn',
    ITEM_PICKUP: 'item:pickup',
    ITEM_USE: 'item:use',
    
    // 升级事件
    UPGRADE_SHOW: 'upgrade:show',
    UPGRADE_SELECT: 'upgrade:select',
    
    // 游戏事件
    GAME_START: 'game:start',
    GAME_PAUSE: 'game:pause',
    GAME_RESUME: 'game:resume',
    GAME_OVER: 'game:over',
    GAME_RESET: 'game:reset',
    
    // 难度事件
    DIFFICULTY_INCREASE: 'difficulty:increase',
    
    // 生成事件
    SPAWN_WAVE: 'spawn:wave',
    SPAWN_BOSS: 'spawn:boss'
};