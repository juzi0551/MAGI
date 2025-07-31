import { useState, useEffect } from 'react';

interface ConnectionLineProps {
  type: 'casper-balthasar' | 'casper-melchior' | 'balthasar-melchior';
  isActive: boolean;
  className?: string;
}

/**
 * 连接线组件
 * 显示三贤者之间的连接线，支持动画效果
 */
const ConnectionLine = ({ type, isActive, className = '' }: ConnectionLineProps) => {
  const [animationDelay, setAnimationDelay] = useState(0);

  useEffect(() => {
    // 为不同的连接线设置不同的动画延迟
    const delays = {
      'casper-balthasar': 0,
      'casper-melchior': 0.1,
      'balthasar-melchior': 0.2
    };
    setAnimationDelay(delays[type]);
  }, [type]);

  const connectionClass = `connection ${type} ${isActive ? 'active' : ''} ${className}`;

  return (
    <div 
      className={connectionClass}
      style={{
        animationDelay: `${animationDelay}s`
      }}
    />
  );
};

export default ConnectionLine;