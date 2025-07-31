import { WiseManProps } from '../../types';

/**
 * 贤者组件
 * 显示三贤者的圆形图标和基础状态
 */
const WiseMan = ({ 
  name, 
  status, 
  orderNumber, 
  onClick, 
  className = '', 
  isAnimating = false 
}: WiseManProps) => {
  const handleClick = () => {
    onClick?.();
  };

  const wiseManClass = `wise-man ${name} status-${status} ${isAnimating ? 'animating' : ''} ${className}`;

  return (
    <div 
      className={wiseManClass}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={`${getWiseManTitle(name)} - ${getStatusText(status)}`}
    >
      <div className="inner">
        {name.toUpperCase()} • {orderNumber}
      </div>
    </div>
  );
};

// 获取贤者标题的辅助函数
function getWiseManTitle(name: string): string {
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
}

// 获取状态文本的辅助函数
function getStatusText(status: string): string {
  switch (status) {
    case 'yes':
      return '同意';
    case 'no':
      return '拒绝';
    case 'conditional':
      return '条件同意';
    case 'info':
      return '信息';
    case 'error':
      return '错误';
    case 'processing':
      return '处理中';
    case 'standby':
    default:
      return '待机';
  }
}

export default WiseMan;