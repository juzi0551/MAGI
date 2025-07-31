import { HeaderProps } from '../../types';

/**
 * MAGI系统标题组件
 * 显示左右标题("提訴"和"決議")
 */
const Header = ({ side, title, className = '' }: HeaderProps) => {
  return (
    <div className={`header ${side} ${className}`}>
      <hr />
      <span>{title}</span>
    </div>
  );
};

export default Header;