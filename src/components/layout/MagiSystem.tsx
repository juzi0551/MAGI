import { useState, useEffect, useRef } from 'react';
import { MagiSystemProps } from '../../types';
import { HistoryRecord } from '../../types/history';
import { useConfig, useHistory, useMagi, useAudio } from '../../context';
import { useMagiAudio } from '../../hooks/useMagiAudio';
import InputContainer from '../common/InputContainer';
import WiseAnswerDisplay from '../magi/WiseAnswerDisplay';
import HistoryPanel from '../common/HistoryPanel';
import HistoryModal from '../common/HistoryModal';
import SettingsModal from '../common/SettingsModal';
import StartupScreen from '../common/StartupScreen';

/**
 * MAGI系统根组件
 * 负责整体布局和状态协调
 */
const MagiSystem = ({ children, className = '' }: MagiSystemProps) => {
  const config = useConfig();
  const history = useHistory();
  const magi = useMagi();
  const { isAudioEnabled, audioVolume } = useAudio();
  const audio = useMagiAudio();
  const stopProcessingSoundRef = useRef<(() => void) | null>(null);
  const hasPlayedDecisionSoundRef = useRef(false);

  // 初始化音频
  useEffect(() => {
    const initAudio = () => {
      audio.initialize();
      window.removeEventListener('click', initAudio);
    };
    window.addEventListener('click', initAudio);
    return () => {
      window.removeEventListener('click', initAudio);
    };
  }, [audio]);

  // 启动动画状态
  const [isStartupComplete, setIsStartupComplete] = useState(false);
  const [showStartupScreen, setShowStartupScreen] = useState(true);
  
  // 历史记录模态框状态
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  // 设置面板状态
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  
  // 右侧面板显示状态
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true);

  // 追踪已保存的问题，避免重复保存
  const [savedQuestions, setSavedQuestions] = useState<Set<string>>(new Set());

  // 页面加载时检查配置，如果没有API密钥则自动打开设置面板
  useEffect(() => {
    if (!config.isLoading && !config.isConfigValid) {
      // 延迟一点时间让初始化和启动动画完成
      setTimeout(() => {
        if (!config.apiKey && isStartupComplete) {
          setIsSettingsPanelOpen(true);
        }
      }, 2000);
    }
  }, [config.isLoading, config.isConfigValid, config.apiKey, isStartupComplete]);

  // 音频效果
  useEffect(() => {
    audio.setVolume(audioVolume / 100);
  }, [audioVolume, audio]);

  useEffect(() => {
    if (isAudioEnabled) {
      if (magi.systemStatus === 'processing') {
        stopProcessingSoundRef.current = audio.playProcessingSound();
        hasPlayedDecisionSoundRef.current = false; // 为新的决议重置播放标志
      } else {
        if (stopProcessingSoundRef.current) {
          stopProcessingSoundRef.current();
          stopProcessingSoundRef.current = null;
        }
      }
    }
    return () => {
      if (stopProcessingSoundRef.current) {
        stopProcessingSoundRef.current();
        stopProcessingSoundRef.current = null;
      }
    };
  }, [magi.systemStatus, isAudioEnabled, audio]);

  useEffect(() => {
    if (isAudioEnabled && magi.systemStatus === 'completed' && magi.finalStatus && !hasPlayedDecisionSoundRef.current) {
      audio.playDecisionSound(magi.finalStatus);
      hasPlayedDecisionSoundRef.current = true; // 标记为已播放
    }
  }, [magi.finalStatus, magi.systemStatus, isAudioEnabled, audio]);

  // 监听AI处理开始，清空旧的保存追踪
  useEffect(() => {
    if (magi.systemStatus === 'processing') {
      setSavedQuestions(new Set());
    }
  }, [magi.systemStatus]);

  // 监听AI处理完成，自动保存历史记录
  useEffect(() => {
    if (magi.systemStatus === 'completed' && 
        magi.processingQuestion && 
        magi.wiseManAnswers.length > 0 && 
        magi.finalStatus &&
        magi.processingStartTime) {
      
      // 生成问题的唯一标识（基于问题内容和处理开始时间）
      const questionKey = `${magi.processingQuestion}_${magi.processingStartTime}`;
      
      // 检查是否已经保存过这个问题
      if (savedQuestions.has(questionKey)) {
        return;
      }

      // 计算处理时长
      const duration = Date.now() - magi.processingStartTime;
      
      // 创建历史记录
      const newRecord = {
        question: magi.processingQuestion, // 使用处理时的原始问题
        questionType: magi.questionType || 'info',
        finalStatus: magi.finalStatus,
        answers: magi.wiseManAnswers,
        duration: duration
      };
      
      try {
        // 保存到历史记录
        history.addRecord(newRecord);
        
        // 标记为已保存
        setSavedQuestions(prev => new Set(prev).add(questionKey));
      } catch (error) {
        console.error('❌ 保存历史记录失败:', error);
      }
    }
  }, [magi.systemStatus, magi.wiseManAnswers, magi.finalStatus, magi.processingStartTime, magi.processingQuestion, magi.questionType, history, savedQuestions]);

  // 启动动画完成处理
  const handleStartupComplete = () => {
    setIsStartupComplete(true);
    // 稍微延迟隐藏启动画面，让面板滑入动画开始
    setTimeout(() => {
      setShowStartupScreen(false);
    }, 100);
  };

  const handleQuestionChange = (value: string) => {
    magi.setQuestion(value);
  };

  const handleQuestionSubmit = async () => {
    try {
      // 触发MAGI处理流程
      await magi.processQuestion();
    } catch (error) {
      console.error('💥 问题处理失败:', error);
    }
  };

  const getWiseAnswerContent = (name: string) => {
    // 查找对应贤者的回答
    const answer = magi.wiseManAnswers.find(answer => {
      const wiseName = name.toLowerCase();
      const answerName = answer.name.toLowerCase();
      return answerName.includes(wiseName);
    });

    if (magi.systemStatus === 'standby') {
      return { status: 'standby', response: '待機中...' };
    }
    
    if (magi.systemStatus === 'processing') {
      if (answer) {
        return { status: answer.status, response: answer.response };
      }
      return { status: 'processing', response: '審議中...' };
    }
    
    if (magi.systemStatus === 'completed' && answer) {
      return { status: answer.status, response: answer.response };
    }
    
    return { status: 'standby', response: '待機中...' };
  };

  // 历史记录事件处理
  const handleRecordDetail = (record: HistoryRecord & { _clickTimestamp?: number }) => {
    history.selectRecord(record);
    setIsHistoryModalOpen(true);
  };

  const handleClearHistory = () => {
    history.clearHistory();
  };

  const handleHistoryModalClose = () => {
    setIsHistoryModalOpen(false);
    history.selectRecord(null);
  };

  // 设置面板事件处理
  const handleSettingsClick = () => {
    setIsSettingsPanelOpen(true);
  };

  const handleSettingsClose = () => {
    setIsSettingsPanelOpen(false);
  };

  // 右侧面板显示/隐藏事件处理
  const handleRightPanelToggle = () => {
    setIsRightPanelVisible(!isRightPanelVisible);
  };

  return (
    <>
      {/* 启动画面 */}
      {showStartupScreen && (
        <StartupScreen onComplete={handleStartupComplete} />
      )}
      
      {/* 主系统界面 */}
      <div className={`system ${className} ${!isRightPanelVisible ? 'right-panel-hidden' : ''} ${
        !isStartupComplete ? 'startup-mode' : 'startup-complete'
      }`}>
        <div className={`left-panel ${!isRightPanelVisible ? 'fullscreen' : ''}`}>
          {/* 左侧面板内容 - 传递状态给子组件 */}
          <div data-system-status={magi.systemStatus}>
            {children}
          </div>
          
          {/* 历史记录面板 */}
          <HistoryPanel
            records={history.records}
            onRecordDetail={handleRecordDetail}
            onClearHistory={handleClearHistory}
          />
          
          {/* 输入容器 */}
          <InputContainer
            value={magi.question}
            onChange={handleQuestionChange}
            onSubmit={handleQuestionSubmit}
            disabled={magi.systemStatus === 'processing'}
          />
        </div>
        
        <div className={`right-panel ${!isRightPanelVisible ? 'hidden' : ''}`}>
          {/* 右侧面板 - 贤者回答 */}
          <div className="wise-answers">
            <WiseAnswerDisplay
              name="melchior"
              status={getWiseAnswerContent('melchior').status as any}
              response={getWiseAnswerContent('melchior').response}
            />
            
            <WiseAnswerDisplay
              name="balthasar"
              status={getWiseAnswerContent('balthasar').status as any}
              response={getWiseAnswerContent('balthasar').response}
            />
            
            <WiseAnswerDisplay
              name="casper"
              status={getWiseAnswerContent('casper').status as any}
              response={getWiseAnswerContent('casper').response}
            />
          </div>
        </div>

        {/* 控制按钮区域 - 独立于右侧面板 */}
        <div className="control-buttons">
          {/* 展开/收缩按钮 */}
          <div className="panel-toggle-btn" title={isRightPanelVisible ? "收缩右侧面板" : "展开右侧面板"} onClick={handleRightPanelToggle}>
            <img 
              src="/src/assets/images/hide.svg"
              alt={isRightPanelVisible ? "隐藏" : "展开"} 
              width="24" 
              height="24"
            />
          </div>
          
          {/* 设置图标 */}
          <div className="settings-icon" title="设置" onClick={handleSettingsClick}>
            <img src="/src/assets/images/setting.svg" alt="设置" width="20" height="20" />
          </div>
        </div>

        {/* 历史记录详情模态框 */}
        <HistoryModal
          isOpen={isHistoryModalOpen}
          record={history.selectedRecord}
          onClose={handleHistoryModalClose}
        />
        
        {/* 设置模态框 */}
        <SettingsModal
          isOpen={isSettingsPanelOpen}
          onClose={handleSettingsClose}
        />
      </div>
    </>
  );
};

export default MagiSystem;