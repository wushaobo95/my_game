/**
 * audio.js - Web Audio API 合成音效（无需外部文件）
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Audio = (function() {
    var ctx = null;
    var masterGain = null;
    var bgmGain = null;
    var sfxGain = null;
    var bgmPlaying = false;
    var bgmOscillators = [];

    function init() {
        if (ctx) return;
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = ctx.createGain();
        masterGain.gain.value = 0.5;
        masterGain.connect(ctx.destination);

        bgmGain = ctx.createGain();
        bgmGain.gain.value = 0.3;
        bgmGain.connect(masterGain);

        sfxGain = ctx.createGain();
        sfxGain.gain.value = 0.6;
        sfxGain.connect(masterGain);
    }

    function resume() {
        if (ctx && ctx.state === 'suspended') ctx.resume();
    }

    // 播放一个音符
    function playTone(freq, duration, type, gainVal, target) {
        if (!ctx) return;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(gainVal || 0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(target || sfxGain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    }

    // 噪音（用于爆炸等）
    function playNoise(duration, gainVal) {
        if (!ctx) return;
        var bufferSize = ctx.sampleRate * duration;
        var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        var source = ctx.createBufferSource();
        source.buffer = buffer;
        var gain = ctx.createGain();
        gain.gain.setValueAtTime(gainVal || 0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        var filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(sfxGain);
        source.start();
    }

    // 背景音乐 - 低沉氛围 + 节拍
    function startBGM() {
        if (bgmPlaying || !ctx) return;
        bgmPlaying = true;

        // 低音嗡鸣
        var drone = ctx.createOscillator();
        drone.type = 'sine';
        drone.frequency.value = 55;
        var droneGain = ctx.createGain();
        droneGain.gain.value = 0.15;
        drone.connect(droneGain);
        droneGain.connect(bgmGain);
        drone.start();
        bgmOscillators.push(drone);

        // 第二层泛音
        var drone2 = ctx.createOscillator();
        drone2.type = 'sine';
        drone2.frequency.value = 82.5;
        var drone2Gain = ctx.createGain();
        drone2Gain.gain.value = 0.08;
        drone2.connect(drone2Gain);
        drone2Gain.connect(bgmGain);
        drone2.start();
        bgmOscillators.push(drone2);

        // 节拍循环
        var beatInterval = setInterval(function() {
            if (!bgmPlaying) { clearInterval(beatInterval); return; }
            playTone(40, 0.15, 'sine', 0.25, bgmGain);
            setTimeout(function() {
                if (bgmPlaying) playTone(60, 0.1, 'square', 0.05, bgmGain);
            }, 250);
        }, 500);

        // 旋律循环
        var melody = [220, 247, 262, 294, 330, 294, 262, 247];
        var melodyIdx = 0;
        var melodyInterval = setInterval(function() {
            if (!bgmPlaying) { clearInterval(melodyInterval); return; }
            playTone(melody[melodyIdx], 0.3, 'triangle', 0.06, bgmGain);
            melodyIdx = (melodyIdx + 1) % melody.length;
        }, 750);
    }

    function stopBGM() {
        bgmPlaying = false;
        for (var i = 0; i < bgmOscillators.length; i++) {
            try { bgmOscillators[i].stop(); } catch(e) {}
        }
        bgmOscillators = [];
    }

    // 音效
    function shoot() {
        playTone(880, 0.08, 'square', 0.15);
        playTone(1200, 0.05, 'sine', 0.1);
    }

    function hit() {
        playTone(300, 0.06, 'sawtooth', 0.12);
    }

    function enemyDeath() {
        playNoise(0.12, 0.15);
        playTone(150, 0.15, 'sine', 0.1);
    }

    function bossDeath() {
        playNoise(0.4, 0.3);
        playTone(100, 0.5, 'sawtooth', 0.2);
        setTimeout(function() { playTone(80, 0.4, 'sine', 0.15); }, 100);
        setTimeout(function() { playTone(60, 0.6, 'sine', 0.1); }, 200);
        setTimeout(function() {
            playTone(440, 0.2, 'triangle', 0.15);
            playTone(554, 0.2, 'triangle', 0.12);
            playTone(659, 0.3, 'triangle', 0.1);
        }, 300);
    }

    function bossWarning() {
        playTone(200, 0.3, 'sawtooth', 0.2);
        setTimeout(function() { playTone(180, 0.3, 'sawtooth', 0.2); }, 400);
        setTimeout(function() { playTone(160, 0.4, 'sawtooth', 0.25); }, 800);
    }

    function levelUp() {
        playTone(440, 0.15, 'sine', 0.2);
        setTimeout(function() { playTone(554, 0.15, 'sine', 0.2); }, 100);
        setTimeout(function() { playTone(659, 0.2, 'sine', 0.25); }, 200);
        setTimeout(function() { playTone(880, 0.3, 'triangle', 0.15); }, 300);
    }

    function playerHurt() {
        playTone(80, 0.2, 'sawtooth', 0.2);
        playNoise(0.1, 0.1);
    }

    function pickup() {
        playTone(600, 0.05, 'sine', 0.08);
    }

    function gameOver() {
        playTone(200, 0.4, 'sawtooth', 0.2);
        setTimeout(function() { playTone(150, 0.4, 'sawtooth', 0.15); }, 200);
        setTimeout(function() { playTone(100, 0.6, 'sawtooth', 0.1); }, 400);
    }

    function pause() {
        playTone(440, 0.1, 'sine', 0.1);
    }

    return {
        init: init,
        resume: resume,
        startBGM: startBGM,
        stopBGM: stopBGM,
        shoot: shoot,
        hit: hit,
        enemyDeath: enemyDeath,
        bossDeath: bossDeath,
        bossWarning: bossWarning,
        levelUp: levelUp,
        playerHurt: playerHurt,
        pickup: pickup,
        gameOver: gameOver,
        pause: pause
    };
})();
