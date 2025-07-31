import { useState, useEffect } from 'react';
import { MagiContainerProps, WiseManStatus } from '../../types';
import Header from '../layout/Header';
import WiseMan from './WiseMan';
import Response from './Response';
import Status from './Status';
import ConnectionLine from './ConnectionLine';

/**
 * MAGI主容器组件
 * 包含三角形连接线和整体MAGI布局
 */
const MagiContainer = ({ status, children, className = '' }: MagiContainerProps) => {
  const [wiseManStates, setWiseManStates] = useState<{
    melchior: WiseManStatus;
    balthasar: WiseManStatus;
    casper: WiseManStatus;
  }>({
    melchior: 'standby',
    balthasar: 'standby',
    casper: 'standby'
  });

  const [currentQuestion, setCurrentQuestion] = useState<string>('');

  // 根据系统状态更新贤者状态
  useEffect(() => {
    if (status === 'processing') {
      setWiseManStates({
        melchior: 'processing',
        balthasar: 'processing',
        casper: 'processing'
      });
      setCurrentQuestion('示例问题分析中...');
    } else if (status === 'completed') {
      // 模拟不同的决策结果
      setWiseManStates({
        melchior: 'yes',
        balthasar: 'conditional',
        casper: 'no'
      });
    } else {
      setWiseManStates({
        melchior: 'standby',
        balthasar: 'standby',
        casper: 'standby'
      });
      setCurrentQuestion('');
    }
  }, [status]);

  const containerClass = `magi ${status === 'processing' ? 'magi-in-progress' : ''} ${className}`;

  const handleWiseManClick = (name: string) => {
    const currentState = wiseManStates[name as keyof typeof wiseManStates];
    console.log(`点击了贤者: ${name}，当前状态: ${currentState}`);

    // 在完成状态下，点击可以查看详细信息
    if (status === 'completed') {
      const details = {
        melchior: '逻辑分析：基于数据和概率计算，该方案具有较高的成功率。',
        balthasar: '伦理考量：需要在确保安全的前提下执行，建议增加保护措施。',
        casper: '直觉判断：感觉存在未知风险，建议谨慎行事或寻找替代方案。'
      };

      console.log(`${name} 详细分析:`, details[name as keyof typeof details]);
    }
  };

  // 计算最终响应状态
  const getFinalResponseStatus = () => {
    if (status === 'processing') return 'processing';
    if (status === 'standby') return 'standby';

    const states = Object.values(wiseManStates);
    const yesCount = states.filter(s => s === 'yes').length;
    const noCount = states.filter(s => s === 'no').length;
    const conditionalCount = states.filter(s => s === 'conditional').length;

    if (yesCount >= 2) return 'yes';
    if (noCount >= 2) return 'no';
    if (conditionalCount > 0) return 'conditional';
    return 'info';
  };

  return (
    <div className={containerClass}>
      {/* 左侧标题 */}
      <Header side="left" title="提訴" />

      {/* 右侧标题 */}
      <Header side="right" title="決議" />

      {/* MAGI标题 */}
      <div className="title">MAGI</div>

      {/* 系统状态 */}
      <Status
        systemStatus={status}
        currentQuestion={currentQuestion}
        refreshTrigger={Date.now()}
      />

      {/* 三贤者 */}
      <WiseMan
        name="melchior"
        status={wiseManStates.melchior}
        orderNumber={1}
        onClick={() => handleWiseManClick('melchior')}
        isAnimating={status === 'processing'}
      />

      <WiseMan
        name="balthasar"
        status={wiseManStates.balthasar}
        orderNumber={2}
        onClick={() => handleWiseManClick('balthasar')}
        isAnimating={status === 'processing'}
      />

      <WiseMan
        name="casper"
        status={wiseManStates.casper}
        orderNumber={3}
        onClick={() => handleWiseManClick('casper')}
        isAnimating={status === 'processing'}
      />

      {/* 连接线 */}
      <ConnectionLine
        type="casper-balthasar"
        isActive={status === 'processing'}
      />
      <ConnectionLine
        type="casper-melchior"
        isActive={status === 'processing'}
      />
      <ConnectionLine
        type="balthasar-melchior"
        isActive={status === 'processing'}
      />

      {/* 响应状态 */}
      <Response
        status={getFinalResponseStatus() as any}
      />

      {children}
    </div>
  );
};



export default MagiContainer;