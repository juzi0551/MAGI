import { useState } from 'react';
import { WiseAnswerDisplayProps } from '../../types';

/**
 * 贤者回答显示组件
 * 显示单个贤者的回答内容
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
  const [expanded, setExpanded] = useState(isExpanded);

  const handleToggleExpand = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onToggleExpand?.();
  };

  const getWiseManTitle = (name: string): string => {
    switch (name) {
      case 'melchior':
        return 'MELCHIOR-1 (科学家)';
      case 'balthasar':
        return 'BALTHASAR-2 (母亲)';
      case 'casper':
        return 'CASPER-3 (女人)';
      default:
        return name.toUpperCase();
    }
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
        return '';
      case 'error':
        return '錯 誤';
      case 'processing':
        return '審議中';
      case 'standby':
      default:
        return '待 機';
    }
  };

  const displayResponse = expanded || response.length <= 200 
    ? response 
    : response.substring(0, 200) + '...';

  return (
    <div className={`wise-answer ${name} ${className}`}>
      <div className="wise-answer-title">
        {getWiseManTitle(name)}
        <div className={`answer-status status-${status}`}>
          {getStatusText(status)}
        </div>
      </div>
      
      <div className="answer-content">
        {status === 'processing' ? (
          <div className="answer-loading">思考中</div>
        ) : status === 'standby' ? (
          '待機中...'
        ) : (
          <>
            {displayResponse}
            
            {response.length > 200 && (
              <button 
                className="expand-btn"
                onClick={handleToggleExpand}
              >
                {expanded ? '收起' : '展开'}
              </button>
            )}
            
            {conditions.length > 0 && (
              <div className="answer-conditions">
                <div className="conditions-title">条件:</div>
                <ul className="conditions-list">
                  {conditions.map((condition, index) => (
                    <li key={index} className="condition-item">
                      {condition}
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