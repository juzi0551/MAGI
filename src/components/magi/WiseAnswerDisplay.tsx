import { useState, useEffect } from 'react';
import { WiseAnswerDisplayProps } from '../../types';
import { useMagi, useConfig } from '../../context';
import { getPersonalityFullName } from '../../utils/personalityUtils';
import { PersonalityId } from '../../types/ai';

/**
 * 贤者回答显示组件 - 与MAGI Context完全集成
 * 显示单个贤者的回答内容，包含动态更新和详细信息
 */
const WiseAnswerDisplay = ({
  name,
  status,
  response,
  conditions = [],
  isExpanded = false,
  onToggleExpand,
  className = ''
}: WiseAnswerDisplayProps) => {
  const magi = useMagi();
  const { personalities } = useConfig();
  const [expanded, setExpanded] = useState(isExpanded);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);

  // 动态获取人格标题
  const getWiseManTitle = (name: string): string => {
    // 检查是否为人格ID
    if (['melchior', 'balthasar', 'casper'].includes(name)) {
      return getPersonalityFullName(name as PersonalityId, personalities);
    }
    // 如果不是人格ID，可能已经是格式化后的名称，直接使用
    return name;
  };

  // 从MAGI Context获取对应的贤者回答
  useEffect(() => {
    const answer = magi.wiseManAnswers.find(a => 
      a.name.toLowerCase().includes(name) || 
      (name === 'melchior' && a.type === 'scientist') ||
      (name === 'balthasar' && a.type === 'mother') ||
      (name === 'casper' && a.type === 'woman')
    );
    
    if (answer) {
      console.log(`🎯 更新${name}贤者回答:`, answer);
      setCurrentAnswer(answer);
    } else if (magi.systemStatus === 'standby') {
      setCurrentAnswer(null);
    }
  }, [magi.wiseManAnswers, magi.systemStatus, name]);

  const handleToggleExpand = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onToggleExpand?.();
  };


  const getStatusText = (status: string): string => {
    switch (status) {
      case 'yes':
        return '可 決';
      case 'no':
        return '否 決';
      case 'conditional':
        return '條 件';
      case 'info':
        return '情 報';
      case 'error':
        return '錯 誤';
      case 'processing':
        return '審議中';
      case 'standby':
      default:
        return '待 機';
    }
  };

  // 获取当前状态和内容
  const getCurrentStatus = () => {
    if (magi.systemStatus === 'processing') {
      return 'processing';
    } else if (currentAnswer) {
      return currentAnswer.status;
    } else {
      return status || 'standby';
    }
  };

  const getCurrentResponse = () => {
    if (currentAnswer) {
      return currentAnswer.response;
    }
    return response || '';
  };

  const getCurrentConditions = () => {
    if (currentAnswer) {
      return currentAnswer.conditions || [];
    }
    return conditions;
  };

  const currentStatus = getCurrentStatus();
  const currentResponseText = getCurrentResponse();
  const currentConditions = getCurrentConditions();
  
  const displayResponse = expanded || currentResponseText.length <= 200 
    ? currentResponseText 
    : currentResponseText.substring(0, 200) + '...';

  // 生成CSS类名
  const containerClassName = [
    'wise-answer',
    name,
    currentStatus === 'processing' ? 'processing' : '',
    currentAnswer ? 'has-answer' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClassName}>
      <div className="wise-answer-title">
        {getWiseManTitle(name)}
        <div className={`answer-status status-${currentStatus}`}>
          {getStatusText(currentStatus)}
        </div>
      </div>
      
      <div className="answer-content">
        {currentStatus === 'processing' ? (
          <div className="answer-loading">
            <span className="loading-text">審議中</span>
          </div>
        ) : currentStatus === 'standby' || !currentResponseText ? (
          <div className="answer-standby">待機中...</div>
        ) : (
          <>
            <div className="answer-text">
              {displayResponse}
            </div>
            
            {currentResponseText.length > 200 && (
              <button 
                className="expand-btn"
                onClick={handleToggleExpand}
              >
                {expanded ? '▲ 收起' : '▼ 展开'}
              </button>
            )}
            
            {currentConditions.length > 0 && (
              <div className="answer-conditions">
                <div className="conditions-title">⚠️ 附加条件:</div>
                <ul className="conditions-list">
                  {currentConditions.map((condition: string, index: number) => (
                    <li key={index} className="condition-item">
                      • {condition}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WiseAnswerDisplay;