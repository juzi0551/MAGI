/**
 * MAGI系统音效管理器
 * 完全按照参考项目实现
 */
var audioCtx;
var VCO;
var carrierVolume;
var sound = true;
var exMode = false;

// 音效频率配置
var frequencies = {
    decision_yes: 2000,    // 通过音效
    decision_no: 3400,     // 否决音效
    decision_conditional: 2700,  // 条件通过
    decision_info: 2200,   // 信息回答
    decision_error: 1500   // 错误音效
};

// 初始化函数
function load() {
    try {
        // 兼容不同浏览器
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
            console.warn('MAGI Audio: Web Audio API 不支持');
            sound = false;
            return;
        }
        
        audioCtx = new AudioContext();
        
        audioCtx.addEventListener('close', function(e) {
            console.log('MAGI Audio: 音频上下文已关闭');
        });
        
        // 创建主音量控制节点 - 完全按照参考项目设置
        carrierVolume = audioCtx.createGain();
        carrierVolume.gain.linearRampToValueAtTime(0.5, 0); // 参考项目的设置方式
        carrierVolume.connect(audioCtx.destination);
        
        console.log('MAGI Audio: 音频系统初始化成功');
    } catch (error) {
        console.error('MAGI Audio: 初始化失败', error);
        sound = false;
    }
}
    
// 播放决议完成音效 - 完全按照参考项目实现
function playOscillator(hz) {
    if (!hz) hz = 3400;
    if (!sound) return;
    
    try {
        if (!audioCtx) {
            load();
        }
        
        // 停止之前的音效
        stopAll();
        
        // 创建决议音效振荡器
        VCO = audioCtx.createOscillator();
        VCO.frequency.value = hz;
        VCO.connect(carrierVolume);
        VCO.start(0);
        VCO.stop(audioCtx.currentTime + 0.8);
        
        console.log('MAGI Audio: 播放决议音效 - ' + hz + 'Hz');
    } catch (error) {
        console.error('MAGI Audio: 播放决议音效失败', error);
    }
}

// 停止所有音效 - 完全按照参考项目实现
function stopAll() {
    try {
        // 停止决议音效
        try {
            if (VCO) VCO.stop(audioCtx.currentTime);
        } catch (e) {
            // 忽略错误
        }
    } catch (error) {
        console.error('MAGI Audio: 停止音效失败', error);
    }
}

// 关闭音频上下文
function closeAudioContext() {
    try {
        if (audioCtx && audioCtx.state !== 'closed') {
            audioCtx.close();
            audioCtx = null;
            carrierVolume = null;
            console.log('MAGI Audio: 音频上下文已关闭');
        }
    } catch (error) {
        console.error('MAGI Audio: 关闭音频上下文失败', error);
    }
}

// 设置音效开关
function setEnabled(enabled) {
    sound = enabled;
    if (!enabled) {
        stopAll();
    }
    console.log('MAGI Audio: 音效' + (enabled ? '开启' : '关闭'));
}

// 设置音量
function setVolume(volume) {
    if (carrierVolume) {
        carrierVolume.gain.linearRampToValueAtTime(volume, 0);
    }
    console.log('MAGI Audio: 音量设置为 ' + Math.round(volume * 100) + '%');
}

// 设置紧急模式
function setExMode(enabled) {
    exMode = enabled;
    console.log('MAGI Audio: 紧急模式' + (enabled ? '开启' : '关闭'));
}

// 确保音频上下文已启动（需要用户交互）
function ensureAudioContext() {
    if (!sound) return false;
    
    if (!audioCtx) {
        load();
    }
    
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().then(function() {
            console.log('MAGI Audio: 音频上下文已恢复');
        }).catch(function(error) {
            console.error('MAGI Audio: 无法恢复音频上下文', error);
        });
    }
    
    return true;
}

// 监听页面可见性变化
document.addEventListener('visibilitychange', function(e) {
    if (document.hidden) {
        stopAll();
        try {
            if (audioCtx) {
                audioCtx.close();
                audioCtx = null;
            }
        } catch (e) {}
    }
});

// 导出API
window.MagiAudio = {
    playOscillator: playOscillator,
    stopAll: stopAll,
    setEnabled: setEnabled,
    setVolume: setVolume,
    setExMode: setExMode,
    ensureAudioContext: ensureAudioContext,
    getStatus: function() {
        return {
            enabled: sound,
            exMode: exMode,
            contextState: audioCtx ? audioCtx.state : 'none'
        };
    }
};

// 添加用户交互监听器来启动音频上下文
document.addEventListener('click', function startAudio() {
    ensureAudioContext();
    document.removeEventListener('click', startAudio);
}, {once: true});

document.addEventListener('keydown', function startAudio() {
    ensureAudioContext();
    document.removeEventListener('keydown', startAudio);
}, {once: true});

// 初始化
console.log('MAGI Audio: 系统已加载，等待用户交互激活');
