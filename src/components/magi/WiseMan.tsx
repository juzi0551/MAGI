import { WiseManProps } from '../../types';
import { useConfig } from '../../context';
import { getPersonalityFullName, getMagiPanelDisplayName } from '../../utils/personalityUtils';
import { PersonalityId } from '../../types/ai';

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
  const { personalities } = useConfig();

  const handleClick = () => {
    onClick?.();
  };

  const wiseManClass = `wise-man ${name} status-${status} ${isAnimating ? 'animating' : ''} ${className}`;

  // 动态获取人格标题
  const getWiseManTitle = (name: string): string => {
    // 如果name是人格ID，使用配置中的名称
    if (['melchior', 'balthasar', 'casper'].includes(name)) {
      return getPersonalityFullName(name as PersonalityId, personalities);
    }
    // 否则使用默认逻辑
    switch (name) {
      case 'melchior':
        return 'MELCHIOR-1 (科學家)';
      case 'balthasar':
        return 'BALTHASAR-2 (母親)';
      case 'casper':
        return 'CASPER-3 (女人)';
      default:
        return name.toUpperCase();
    }
  };

  return (
    <div 
      className={wiseManClass}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={`${getWiseManTitle(name)} - ${getStatusText(status)}`}
    >
      <div className="inner">
        {['melchior', 'balthasar', 'casper'].includes(name) 
          ? getMagiPanelDisplayName(name as PersonalityId, personalities)
          : name.toUpperCase()
        } • {orderNumber}
      </div>
    </div>
  );
};

// 获取状态文本的辅助函数
function getStatusText(status: string): string {
  switch (status) {
    case 'yes':
      return '可 決';
    case 'no':
      return '否 決';
    case 'conditional':
      return '條件可決';
    case 'info':
      return '信 息';
    case 'error':
      return '錯 誤';
    case 'processing':
      return '審議中';
    case 'standby':
    default:
      return '待 機';
  }
}

export default WiseMan;