/**
 * test-resource-loading.js - 资源加载测试脚本
 * 用于测试资源加载器功能
 */

// 测试资源加载器
function testResourceLoader() {
    console.log('=== 资源加载器测试 ===');
    
    // 检查资源加载器是否可用
    if (!ArcSurvivors.ResourceLoader) {
        console.error('资源加载器未加载！');
        return;
    }
    
    // 初始化资源加载器
    ArcSurvivors.ResourceLoader.init(
        function(loaded, total) {
            console.log('加载进度: ' + loaded + '/' + total + ' (' + Math.round(loaded/total*100) + '%)');
        },
        function() {
            console.log('所有资源加载完成！');
            
            // 显示加载结果
            var manifest = ArcSurvivors.ResourceLoader.getManifest();
            var audioManifest = ArcSurvivors.ResourceLoader.getAudioManifest();
            
            console.log('=== 精灵图资源 ===');
            for (var key in manifest) {
                var isLoaded = ArcSurvivors.ResourceLoader.hasSprite(key);
                console.log(key + ': ' + (isLoaded ? '✓ 已加载' : '✗ 缺失'));
            }
            
            console.log('=== 音频资源 ===');
            for (var key in audioManifest) {
                var isLoaded = ArcSurvivors.ResourceLoader.hasAudio(key);
                console.log(key + ': ' + (isLoaded ? '✓ 已加载' : '✗ 缺失'));
            }
            
            // 测试绘制
            testDraw();
        }
    );
}

// 测试绘制
function testDraw() {
    console.log('=== 测试绘制 ===');
    
    // 创建测试画布
    var canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    canvas.style.border = '1px solid #00ff88';
    canvas.style.background = '#1a1a2e';
    document.body.appendChild(canvas);
    
    var ctx = canvas.getContext('2d');
    
    // 测试玩家精灵图
    if (ArcSurvivors.ResourceLoader.hasSprite('player_normal')) {
        var sprite = ArcSurvivors.ResourceLoader.getSprite('player_normal');
        ctx.drawImage(sprite, 70, 70, 60, 60);
        console.log('玩家精灵图绘制成功');
    } else {
        // 回退绘制
        ctx.beginPath();
        ctx.arc(100, 100, 30, 0, Math.PI * 2);
        var gradient = ctx.createRadialGradient(100, 100, 0, 100, 100, 30);
        gradient.addColorStop(0, '#6633ff');
        gradient.addColorStop(1, '#3311aa');
        ctx.fillStyle = gradient;
        ctx.fill();
        console.log('使用Canvas回退绘制');
    }
    
    // 测试敌人精灵图
    if (ArcSurvivors.ResourceLoader.hasSprite('enemy_normal')) {
        var sprite = ArcSurvivors.ResourceLoader.getSprite('enemy_normal');
        ctx.drawImage(sprite, 30, 30, 30, 30);
        console.log('敌人精灵图绘制成功');
    } else {
        // 回退绘制
        ctx.beginPath();
        ctx.arc(45, 45, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#ff4444';
        ctx.fill();
        console.log('使用Canvas回退绘制');
    }
    
    // 测试子弹精灵图
    if (ArcSurvivors.ResourceLoader.hasSprite('bullet_normal')) {
        var sprite = ArcSurvivors.ResourceLoader.getSprite('bullet_normal');
        ctx.drawImage(sprite, 150, 50, 16, 16);
        console.log('子弹精灵图绘制成功');
    } else {
        // 回退绘制
        ctx.beginPath();
        ctx.arc(158, 58, 8, 0, Math.PI * 2);
        var gradient = ctx.createRadialGradient(158, 58, 0, 158, 58, 8);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#6633ff');
        gradient.addColorStop(1, '#3311aa');
        ctx.fillStyle = gradient;
        ctx.fill();
        console.log('使用Canvas回退绘制');
    }
}

// 测试音频系统
function testAudioSystem() {
    console.log('=== 音频系统测试 ===');
    
    // 检查音频系统是否可用
    if (!ArcSurvivors.Audio) {
        console.error('音频系统未加载！');
        return;
    }
    
    // 初始化音频系统
    ArcSurvivors.Audio.init();
    ArcSurvivors.Audio.resume();
    
    // 测试合成音效
    console.log('播放合成音效...');
    ArcSurvivors.Audio.shoot();
    
    // 测试外部音频文件
    if (ArcSurvivors.ResourceLoader.hasAudio('sfx_shoot')) {
        console.log('播放外部音频文件...');
        ArcSurvivors.ResourceLoader.playAudio('sfx_shoot', 1.0);
    } else {
        console.log('外部音频文件不存在，使用合成音效');
    }
}

// 运行所有测试
function runAllTests() {
    console.log('开始运行所有测试...');
    
    // 测试资源加载器
    testResourceLoader();
    
    // 延迟测试音频系统（等待用户交互）
    setTimeout(function() {
        if (confirm('是否测试音频系统？')) {
            testAudioSystem();
        }
    }, 1000);
}

// 页面加载完成后运行测试
if (typeof window !== 'undefined') {
    window.onload = function() {
        console.log('页面加载完成，准备运行测试...');
        
        // 添加测试按钮
        var button = document.createElement('button');
        button.textContent = '运行资源加载测试';
        button.style.cssText = 'position: fixed; top: 10px; right: 10px; padding: 10px; background: #00ff88; color: black; border: none; border-radius: 4px; cursor: pointer; z-index: 1000;';
        button.onclick = runAllTests;
        document.body.appendChild(button);
    };
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testResourceLoader: testResourceLoader,
        testAudioSystem: testAudioSystem,
        runAllTests: runAllTests
    };
}