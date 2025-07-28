/**
 * MAGI系统音效管理器
 * 基于Web Audio API实现EVA风格的系统音效
 */
class MagiAudio {
    constructor() {
        this.audioCtx = null;
        this.carrierVolume = null;
        this.currentOscillators = [];
        this.isEnabled = true;
        this.volume = 0.3; // 默认音量30%
        this.isInitialized = false;
        
        // 音效频率配置
        this.frequencies = {
            deliberating: 2080,    // 审议中载波频率
            lfo_normal: 10,        // 普通LFO频率
            lfo_urgent: 30,        // 紧急LFO频率
            decision_yes: 2000,    // 通过音效
            decision_no: 3400,     // 否决音效
            decision_conditional: 2700,  // 条件通过
            decision_info: 2200,   // 信息回答
            decision_error: 1500   // 错误音效
        };
        
        this.init();
    }
    
    /**
     * 初始化音频上下文
     */
    init() {
        try {
            // 兼容不同浏览器
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) {
                console.warn('MAGI Audio: Web Audio API 不支持');
                this.isEnabled = false;
                return;
            }
            
            this.audioCtx = new AudioContext();
            
            // 创建主音量控制节点 - 按照参考项目设置
            this.carrierVolume = this.audioCtx.createGain();
            this.carrierVolume.gain.linearRampToValueAtTime(0.5, 0); // 参考项目的设置方式
            this.carrierVolume.connect(this.audioCtx.destination);
            
            // 监听页面可见性变化
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.stopAll();
                    this.closeAudioContext();
                }
            });
            
            this.isInitialized = true;
            console.log('MAGI Audio: 音频系统初始化成功');
            
        } catch (error) {
            console.error('MAGI Audio: 初始化失败', error);
            this.isEnabled = false;
        }
    }
    
    /**
     * 确保音频上下文已启动（需要用户交互）
     */
    async ensureAudioContext() {
        if (!this.isEnabled || !this.audioCtx) return false;
        
        if (this.audioCtx.state === 'suspended') {
            try {
                await this.audioCtx.resume();
                console.log('MAGI Audio: 音频上下文已恢复');
            } catch (error) {
                console.error('MAGI Audio: 无法恢复音频上下文', error);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 播放审议中音效 - 完全按照参考项目实现
     * @param {boolean} isUrgent - 是否为紧急模式
     */
    async playDeliberating(isUrgent = false) {
        if (!await this.ensureAudioContext()) return;
        
        try {
            // 停止之前的音效
            this.stopAll();
            
            // 重新初始化音频上下文（如果需要）
            if (!this.audioCtx) {
                this.audioCtx = new AudioContext();
                this.carrierVolume = this.audioCtx.createGain();
                this.carrierVolume.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
                this.carrierVolume.connect(this.audioCtx.destination);
            }
            
            // 创建载波振荡器 - 完全按照参考项目
            const osc = this.audioCtx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = this.frequencies.deliberating; // 使用 .value 而不是 setValueAtTime
            
            // 创建LFO调制器 - 完全按照参考项目
            const lfo = this.audioCtx.createOscillator();
            lfo.type = 'square';
            const lfoFreq = isUrgent ? this.frequencies.lfo_urgent : this.frequencies.lfo_normal;
            lfo.frequency.value = lfoFreq; // 使用 .value 而不是 setValueAtTime
            
            // 连接音频节点 - 完全按照参考项目的连接方式
            lfo.connect(this.carrierVolume.gain);  // LFO直接连接到音量增益
            osc.connect(this.carrierVolume);       // 载波连接到音量控制
            
            // 启动振荡器
            lfo.start(0);
            osc.start(0);
            
            // 保存引用以便停止
            this.currentOscillators.push(osc, lfo);
            
            console.log(`MAGI Audio: 开始播放审议音效 (${isUrgent ? '紧急' : '普通'}模式) - 频率: ${this.frequencies.deliberating}Hz, LFO: ${lfoFreq}Hz`);
            
        } catch (error) {
            console.error('MAGI Audio: 播放审议音效失败', error);
        }
    }
    
    /**
     * 播放决议完成音效 - 完全按照参考项目实现
     * @param {string} status - 决议状态 ('yes', 'no', 'conditional', 'info', 'error')
     */
    async playDecision(status) {
        if (!await this.ensureAudioContext()) return;
        
        try {
            // 停止审议音效
            this.stopAll();
            
            // 重新初始化音频上下文（如果需要）
            if (!this.audioCtx) {
                this.audioCtx = new AudioContext();
                this.carrierVolume = this.audioCtx.createGain();
                this.carrierVolume.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
                this.carrierVolume.connect(this.audioCtx.destination);
            }
            
            // 根据状态选择频率 - 按照参考项目的逻辑
            let frequency;
            switch (status) {
                case 'yes':
                    frequency = this.frequencies.decision_yes;   // 2000Hz - 通过
                    break;
                case 'no':
                case 'error':
                    frequency = this.frequencies.decision_no;    // 3400Hz - 否决/错误
                    break;
                case 'conditional':
                    frequency = this.frequencies.decision_conditional; // 2700Hz - 条件通过
                    break;
                case 'info':
                default:
                    frequency = this.frequencies.decision_info;  // 2200Hz - 信息
                    break;
            }
            
            // 创建决议音效振荡器 - 完全按照参考项目
            const VCO = this.audioCtx.createOscillator();
            VCO.frequency.value = frequency; // 使用 .value 而不是 setValueAtTime
            VCO.connect(this.carrierVolume); // 直接连接到载波音量控制
            VCO.start(0);
            VCO.stop(this.audioCtx.currentTime + 0.8); // 0.8秒后停止
            
            console.log(`MAGI Audio: 播放决议音效 - ${status} (${frequency}Hz, 0.8s)`);
            
        } catch (error) {
            console.error('MAGI Audio: 播放决议音效失败', error);
        }
    }
    
    /**
     * 停止所有音效 - 完全按照参考项目实现
     */
    stopAll() {
        try {
            // 停止审议音效的振荡器
            this.currentOscillators.forEach(osc => {
                try {
                    osc.stop(0); // 立即停止
                } catch (e) {
                    // 忽略已经停止的振荡器错误
                }
            });
            this.currentOscillators = [];
            
            // 如果有决议音效的VCO，也要停止
            if (this.currentVCO) {
                try {
                    this.currentVCO.stop(this.audioCtx.currentTime);
                } catch (e) {
                    // 忽略错误
                }
                this.currentVCO = null;
            }
        } catch (error) {
            console.error('MAGI Audio: 停止音效失败', error);
        }
    }
    
    /**
     * 关闭音频上下文
     */
    closeAudioContext() {
        try {
            if (this.audioCtx && this.audioCtx.state !== 'closed') {
                this.audioCtx.close();
                this.audioCtx = null;
                this.carrierVolume = null;
                this.isInitialized = false;
                console.log('MAGI Audio: 音频上下文已关闭');
            }
        } catch (error) {
            console.error('MAGI Audio: 关闭音频上下文失败', error);
        }
    }
    
    /**
     * 设置音效开关
     * @param {boolean} enabled - 是否启用音效
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.stopAll();
        }
        console.log(`MAGI Audio: 音效${enabled ? '开启' : '关闭'}`);
    }
    
    /**
     * 设置音量
     * @param {number} volume - 音量 (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.carrierVolume) {
            this.carrierVolume.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
        }
        console.log(`MAGI Audio: 音量设置为 ${Math.round(this.volume * 100)}%`);
    }
    
    /**
     * 获取音效状态
     */
    getStatus() {
        return {
            enabled: this.isEnabled,
            initialized: this.isInitialized,
            volume: this.volume,
            contextState: this.audioCtx ? this.audioCtx.state : 'none'
        };
    }
}

// 创建全局音频管理器实例
window.MagiAudio = new MagiAudio();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MagiAudio;
}