import { useState } from 'react';
import { MagiSystemProps, SystemStatus } from '../../types';
import InputContainer from '../common/InputContainer';
import WiseAnswerDisplay from '../magi/WiseAnswerDisplay';

/**
 * MAGI系统根组件
 * 负责整体布局和状态协调
 */
const MagiSystem = ({ children, className = '' }: MagiSystemProps) => {
  const [question, setQuestion] = useState('');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('standby');
  const [processingStage, setProcessingStage] = useState(0);

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

  return (
    <div className={`system ${className}`}>
      <div className="left-panel">
        {/* 左侧面板内容 */}
        {children}
        
        {/* 输入容器 */}
        <InputContainer
          value={question}
          onChange={handleQuestionChange}
          onSubmit={handleQuestionSubmit}
          disabled={systemStatus === 'processing'}
          placeholder="请输入您的问题..."
        />
      </div>
      
      <div className="right-panel">
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
        
        {/* 设置图标占位 */}
        <div className="settings-icon" title="设置">
          ⚙️
        </div>
      </div>
    </div>
  );
};

export default MagiSystem;