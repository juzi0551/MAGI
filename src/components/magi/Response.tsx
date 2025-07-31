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
      return '承認';
    case 'no':
      return '拒否';
    case 'conditional':
      return '条件付';
    case 'info':
      return '情報';
    case 'error':
      return 'エラー';
    case 'processing':
      return '処理中';
    case 'standby':
    default:
      return '待機';
  }
}

export default Response;