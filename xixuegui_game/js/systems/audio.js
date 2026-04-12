/**
 * systems/audio.js - Web Audio API 合成音效（无需外部文件）
 */
var ArcSurvivors = ArcSurvivors || {};

ArcSurvivors.Audio = (function() {
    var ctx = null;
    var masterGain = null;
    var bgmGain = null;
    var sfxGain = null;
    var bgmPlaying = false;
    var bgmOscillators = [];
    var masterVolume = 0.5;

    function init() {
        var AC = ArcSurvivors.GAME_CONFIG.AUDIO;
        if (ctx) return;
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        masterVolume = AC.MASTER_VOLUME;
        masterGain = ctx.createGain();
        masterGain.gain.value = masterVolume;
        masterGain.connect(ctx.destination);

        bgmGain = ctx.createGain();
        bgmGain.gain.value = AC.BGM_VOLUME;
        bgmGain.connect(masterGain);

        sfxGain = ctx.createGain();
        sfxGain.gain.value = AC.SFX_VOLUME;
        sfxGain.connect(masterGain);
    }

    function resume() {
        if (ctx && ctx.state === 'suspended') {
            ctx.resume().catch(function(err) {
                console.warn('Audio context resume failed:', err);
            });
        }
    }

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

    function playNoise(duration, gainVal) {
        var AC = ArcSurvivors.GAME_CONFIG.AUDIO;
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
        filter.frequency.value = AC.NOISE_FILTER_FREQ;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(sfxGain);
        source.start();
    }

    function startBGM() {
        var BGM = ArcSurvivors.GAME_CONFIG.AUDIO.BGM;
        if (bgmPlaying || !ctx) return;
        bgmPlaying = true;

        var drone = ctx.createOscillator();
        drone.type = 'sine';
        drone.frequency.value = BGM.DRONE_FREQ;
        var droneGain = ctx.createGain();
        droneGain.gain.value = 0.15;
        drone.connect(droneGain);
        droneGain.connect(bgmGain);
        drone.start();
        bgmOscillators.push(drone);

        var drone2 = ctx.createOscillator();
        drone2.type = 'sine';
        drone2.frequency.value = BGM.DRONE2_FREQ;
        var drone2Gain = ctx.createGain();
        drone2Gain.gain.value = 0.08;
        drone2.connect(drone2Gain);
        drone2Gain.connect(bgmGain);
        drone2.start();
        bgmOscillators.push(drone2);

        var beatInterval = setInterval(function() {
            if (!bgmPlaying) { clearInterval(beatInterval); return; }
            playTone(BGM.BEAT_FREQ1, BGM.BEAT_VOL1, BGM.BEAT_WAVE1, BGM.BEAT_GAIN1, bgmGain);
            setTimeout(function() {
                if (bgmPlaying) playTone(BGM.BEAT_FREQ2, BGM.BEAT_VOL2, BGM.BEAT_WAVE2, BGM.BEAT_GAIN2, bgmGain);
            }, 250);
        }, 500);

        var melody = BGM.MELODY;
        var melodyIdx = 0;
        var melodyInterval = setInterval(function() {
            if (!bgmPlaying) { clearInterval(melodyInterval); return; }
            playTone(melody[melodyIdx], BGM.MELODY_VOL, BGM.MELODY_WAVE, BGM.MELODY_GAIN, bgmGain);
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

    function playExternalAudio(name, fallbackFn, volume) {
        if (ArcSurvivors.ResourceLoader && ArcSurvivors.ResourceLoader.hasAudio(name)) {
            ArcSurvivors.ResourceLoader.playAudio(name, volume || 1.0);
        } else if (fallbackFn) {
            fallbackFn();
        }
    }

    function shoot() {
        playExternalAudio('sfx_shoot', function() {
            playTone(880, 0.08, 'square', 0.15);
            playTone(1200, 0.05, 'sine', 0.1);
        });
    }

    function hit() {
        playExternalAudio('sfx_hit', function() {
            playTone(300, 0.06, 'sawtooth', 0.12);
        });
    }

    function enemyDeath() {
        playExternalAudio('sfx_enemy_death', function() {
            playNoise(0.12, 0.15);
            playTone(150, 0.15, 'sine', 0.1);
        });
    }

    function bossDeath() {
        playExternalAudio('sfx_boss_death', function() {
            playNoise(0.4, 0.3);
            playTone(100, 0.5, 'sawtooth', 0.2);
            setTimeout(function() { playTone(80, 0.4, 'sine', 0.15); }, 100);
            setTimeout(function() { playTone(60, 0.6, 'sine', 0.1); }, 200);
            setTimeout(function() {
                playTone(440, 0.2, 'triangle', 0.15);
                playTone(554, 0.2, 'triangle', 0.12);
                playTone(659, 0.3, 'triangle', 0.1);
            }, 300);
        });
    }

    function bossWarning() {
        playExternalAudio('sfx_boss_warning', function() {
            playTone(200, 0.3, 'sawtooth', 0.2);
            setTimeout(function() { playTone(180, 0.3, 'sawtooth', 0.2); }, 400);
            setTimeout(function() { playTone(160, 0.4, 'sawtooth', 0.25); }, 800);
        });
    }

    function levelUp() {
        playExternalAudio('sfx_level_up', function() {
            playTone(440, 0.15, 'sine', 0.2);
            setTimeout(function() { playTone(554, 0.15, 'sine', 0.2); }, 100);
            setTimeout(function() { playTone(659, 0.2, 'sine', 0.25); }, 200);
            setTimeout(function() { playTone(880, 0.3, 'triangle', 0.15); }, 300);
        });
    }

    function playerHurt() {
        playExternalAudio('sfx_player_hurt', function() {
            playTone(80, 0.2, 'sawtooth', 0.2);
            playNoise(0.1, 0.1);
        });
    }

    function pickup() {
        playExternalAudio('sfx_pickup', function() {
            playTone(600, 0.05, 'sine', 0.08);
        });
    }

    function gameOver() {
        playExternalAudio('sfx_game_over', function() {
            playTone(200, 0.4, 'sawtooth', 0.2);
            setTimeout(function() { playTone(150, 0.4, 'sawtooth', 0.15); }, 200);
            setTimeout(function() { playTone(100, 0.6, 'sawtooth', 0.1); }, 400);
        });
    }

    function pause() {
        playExternalAudio('sfx_pause', function() {
            playTone(440, 0.1, 'sine', 0.1);
        });
    }

    function mute() {
        if (masterGain) {
            masterGain.gain.value = 0;
        }
    }

    function unmute() {
        if (masterGain) {
            masterGain.gain.value = masterVolume;
        }
    }

    return {
        init: init,
        resume: resume,
        startBGM: startBGM,
        stopBGM: stopBGM,
        mute: mute,
        unmute: unmute,
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