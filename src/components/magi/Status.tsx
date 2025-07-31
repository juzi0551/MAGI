import { StatusProps } from '../../types';

/**
 * 状态组件
 * 显示系统运行状态信息
 */
const Status = ({ 
  refreshTrigger = 0, 
  systemStatus, 
  currentQuestion, 
  className = '' 
}: StatusProps) => {
  const getStatusDisplay = () => {
    switch (systemStatus) {
      case 'processing':
        return {
          main: 'SYSTEM',
          status: 'STATUS: PROCESSING',
          detail: currentQuestion ? `ANALYZING: ${currentQuestion.substring(0, 30)}${currentQuestion.length > 30 ? '...' : ''}` : 'ANALYZING QUERY'
        };
      case 'completed':
        return {
          main: 'SYSTEM',
          status: 'STATUS: COMPLETED',
          detail: 'DECISION READY'
        };
      case 'standby':
      default:
        return {
          main: 'SYSTEM',
          status: 'STATUS: STANDBY',
          detail: 'READY'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className={`system-status ${className}`} key={refreshTrigger}>
      <div>{statusDisplay.main}</div>
      <div>{statusDisplay.status}</div>
      <div>{statusDisplay.detail}</div>
    </div>
  );
};

export default Status;