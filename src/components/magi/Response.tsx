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
      return '可 決';
    case 'no':
      return '否 決';
    case 'conditional':
      return '條 件';
    case 'info':
      return '情 報';
    case 'error':
      return 'エラー';
    case 'processing':
      return '審議中';
    case 'standby':
    default:
      return '待 機';
  }
}

export default Response;