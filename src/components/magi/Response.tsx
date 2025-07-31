import { ResponseProps } from '../../types';

/**
 * 响应组件
 * 显示系统最终决策状态的视觉反馈
 */
const Response = ({ 
  status, 
  finalDecision, 
  className = '' 
}: ResponseProps) => {
  const responseClass = `response status-${status} ${status === 'processing' ? 'flicker' : ''} ${className}`;
  
  const displayText = finalDecision || getDefaultStatusText(status);

  return (
    <div className={responseClass}>
      <div className="inner">
        {displayText}
      </div>
    </div>
  );
};

// 获取默认状态文本的辅助函数
function getDefaultStatusText(status: string): string {
  switch (status) {
    case 'yes':
      return 'APPROVED';
    case 'no':
      return 'REJECTED';
    case 'conditional':
      return 'CONDITIONAL';
    case 'info':
      return 'INFORMATION';
    case 'error':
      return 'ERROR';
    case 'processing':
      return 'PROCESSING';
    case 'standby':
    default:
      return 'STANDBY';
  }
}

export default Response;