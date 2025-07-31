import { useState } from 'react';
import { MagiSystemProps, SystemStatus } from '../../types';
import { HistoryRecord } from '../../types/history';
import InputContainer from '../common/InputContainer';
import WiseAnswerDisplay from '../magi/WiseAnswerDisplay';
import HistoryPanel from '../common/HistoryPanel';
import HistoryModal from '../common/HistoryModal';
import SettingsPanel from '../common/SettingsPanel';

/**
 * MAGI系统根组件
 * 负责整体布局和状态协调
 */
const MagiSystem = ({ children, className = '' }: MagiSystemProps) => {
  const [question, setQuestion] = useState('');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('standby');
  const [processingStage, setProcessingStage] = useState(0);

  // 历史记录相关状态
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  // 设置面板状态
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  
  // 右侧面板显示状态
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true);

  const handleQuestionChange = (value: string) => {
    setQuestion(value);
  };

  const handleQuestionSubmit = (question: string) => {
    console.log('提交问题:', question);
    setSystemStatus('processing');
    setProcessingStage(0);
    
    // 模拟多阶段处理过程
    const stages = [
      { delay: 1000, stage: 1 },
      { delay: 2000, stage: 2 },
      { delay: 3000, stage: 3 }
    ];
    
    stages.forEach(({ delay, stage }) => {
      setTimeout(() => {
        setProcessingStage(stage);
      }, delay);
    });
    
    // 完成处理
    setTimeout(() => {
      setSystemStatus('completed');
      
      // 创建历史记录
      const newRecord: HistoryRecord = {
        id: `record-${Date.now()}`,
        timestamp: Date.now(),
        question: question,
        questionType: 'info', // 使用有效的问题类型
        finalStatus: 'conditional', // 模拟决策结果
        answers: [
          {
            name: 'melchior',
            status: 'yes',
            response: '从逻辑角度分析，该方案具有可行性。数据支持这一决策，风险可控。',
            timestamp: Date.now(),
            processingTime: 3000
          },
          {
            name: 'balthasar',
            status: 'conditional',
            response: '在道德层面需要谨慎考虑。建议在确保人员安全的前提下执行。',
            timestamp: Date.now(),
            processingTime: 3200,
            conditions: ['确保人员安全', '制定应急预案', '获得上级批准']
          },
          {
            name: 'casper',
            status: 'no',
            response: '直觉告诉我这个方案存在隐患。建议重新评估或寻找替代方案。',
            timestamp: Date.now(),
            processingTime: 2800
          }
        ],
        duration: 4000
      };
      
      // 添加到历史记录
      setHistoryRecords(prev => [...prev, newRecord]);
      setQuestion('');
      
      // 5秒后重置为待机状态
      setTimeout(() => {
        setSystemStatus('standby');
        setProcessingStage(0);
      }, 5000);
    }, 4000);
  };

  const getWiseAnswerContent = (name: string) => {
    if (systemStatus === 'standby') {
      return { status: 'standby', response: '待機中...' };
    }
    
    if (systemStatus === 'processing') {
      const responses = {
        melchior: [
          '正在分析问题的逻辑结构...',
          '计算概率和可行性...',
          '评估技术实现方案...'
        ],
        balthasar: [
          '正在考虑伦理和道德因素...',
          '评估对人类福祉的影响...',
          '权衡长远利益与风险...'
        ],
        casper: [
          '正在进行直觉判断...',
          '感受情感层面的反应...',
          '综合主观因素分析...'
        ]
      };
      
      const stageResponse = responses[name as keyof typeof responses]?.[processingStage] || responses[name as keyof typeof responses]?.[0];
      return { status: 'processing', response: stageResponse || '思考中...' };
    }
    
    if (systemStatus === 'completed') {
      const completedResponses = {
        melchior: { status: 'yes', response: '从逻辑角度分析，该方案具有可行性。数据支持这一决策，风险可控。' },
        balthasar: { status: 'conditional', response: '在道德层面需要谨慎考虑。建议在确保人员安全的前提下执行。' },
        casper: { status: 'no', response: '直觉告诉我这个方案存在隐患。建议重新评估或寻找替代方案。' }
      };
      
      return completedResponses[name as keyof typeof completedResponses] || { status: 'info', response: '分析完成' };
    }
    
    return { status: 'standby', response: '待機中...' };
  };

  // 历史记录事件处理
  const handleRecordDetail = (record: HistoryRecord & { _clickTimestamp?: number }) => {
    setSelectedRecord(record);
    setIsHistoryModalOpen(true);
  };

  const handleClearHistory = () => {
    setHistoryRecords([]);
  };

  const handleHistoryModalClose = () => {
    setIsHistoryModalOpen(false);
    setSelectedRecord(null);
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
    <div className={`system ${className} ${!isRightPanelVisible ? 'right-panel-hidden' : ''}`}>
      <div className={`left-panel ${!isRightPanelVisible ? 'fullscreen' : ''}`}>
        {/* 左侧面板内容 - 传递状态给子组件 */}
        <div data-system-status={systemStatus}>
          {children}
        </div>
        
        {/* 历史记录面板 */}
        <HistoryPanel
          records={historyRecords}
          onRecordDetail={handleRecordDetail}
          onClearHistory={handleClearHistory}
        />
        
        {/* 输入容器 */}
        <InputContainer
          value={question}
          onChange={handleQuestionChange}
          onSubmit={handleQuestionSubmit}
          disabled={systemStatus === 'processing'}
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
            src={isRightPanelVisible ? "/src/assets/images/hide.svg" : "/src/assets/images/hide.svg"} 
            alt={isRightPanelVisible ? "隐藏" : "展开"} 
            width="24" 
            height="24"
            style={{ transform: isRightPanelVisible ? 'none' : 'rotate(180deg)' }}
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
        record={selectedRecord}
        onClose={handleHistoryModalClose}
      />
      
      {/* 设置面板 */}
      <SettingsPanel
        isOpen={isSettingsPanelOpen}
        onClose={handleSettingsClose}
      />
    </div>
  );
};

export default MagiSystem;