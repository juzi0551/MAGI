import { StatusProps } from '../../types';

/**
 * 状态组件
 * 显示系统运行状态信息
 */
const Status = ({ 
  refreshTrigger = 0, 
  systemStatus, 
  className = '' 
}: StatusProps) => {
  const getStatusDisplay = () => {
    switch (systemStatus) {
      case 'processing':
        return {
          main: 'CODE:561',
          status: 'FILE:MAGI_SYS',
          detail: 'EXTENTION:6804',
          extra: 'EX_MODE:ON',
          priority: 'PRIORITY:AAA'
        };
      case 'completed':
        return {
          main: 'CODE:561',
          status: 'FILE:MAGI_SYS',
          detail: 'EXTENTION:6804',
          extra: 'EX_MODE:OFF',
          priority: 'PRIORITY:AAA'
        };
      case 'standby':
      default:
        return {
          main: 'CODE:561',
          status: 'FILE:MAGI_SYS',
          detail: 'EXTENTION:6804',
          extra: 'EX_MODE:OFF',
          priority: 'PRIORITY:AAA'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className={`system-status ${className}`} key={refreshTrigger}>
      <div>{statusDisplay.main}</div>
      <div>{statusDisplay.status}</div>
      <div>{statusDisplay.detail}</div>
      <div>{statusDisplay.extra}</div>
      <div>{statusDisplay.priority}</div>
    </div>
  );
};

export default Status;