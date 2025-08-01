import { useState, useEffect } from 'react';
import { MagiContainerProps, WiseManStatus } from '../../types';
import { useMagi } from '../../context';
import Header from '../layout/Header';
import WiseMan from './WiseMan';
import Response from './Response';
import Status from './Status';
import ConnectionLine from './ConnectionLine';

/**
 * MAGI主容器组件
 * 包含三角形连接线和整体MAGI布局，现在与AI服务完全集成
 */
const MagiContainer = ({ children, className = '' }: MagiContainerProps) => {
  const magi = useMagi();
  
  const [wiseManStates, setWiseManStates] = useState<{
    melchior: WiseManStatus;
    balthasar: WiseManStatus;
    casper: WiseManStatus;
  }>({
    melchior: 'standby',
    balthasar: 'standby',
    casper: 'standby'
  });

  // 根据MAGI上下文状态更新贤者状态
  useEffect(() => {
    console.log('🎯 MagiContainer状态更新:', {
      systemStatus: magi.systemStatus,
      isProcessing: magi.isProcessing,
      wiseManAnswers: magi.wiseManAnswers.length,
      finalStatus: magi.finalStatus
    });

    if (magi.systemStatus === 'processing') {
      // 处理中状态：所有贤者显示为处理中
      setWiseManStates({
        melchior: 'processing',
        balthasar: 'processing',
        casper: 'processing'
      });
    } else if (magi.systemStatus === 'completed' && magi.wiseManAnswers.length > 0) {
      // 处理完成：根据实际AI回答更新贤者状态
      const newStates = {
        melchior: 'standby' as WiseManStatus,
        balthasar: 'standby' as WiseManStatus,
        casper: 'standby' as WiseManStatus
      };

      // 映射AI回答到贤者状态
      magi.wiseManAnswers.forEach(answer => {
        let wiseManKey: keyof typeof newStates;
        
        // 根据贤者名称或类型映射
        if (answer.name.toLowerCase().includes('melchior') || answer.type === 'scientist') {
          wiseManKey = 'melchior';
        } else if (answer.name.toLowerCase().includes('balthasar') || answer.type === 'mother') {
          wiseManKey = 'balthasar';
        } else if (answer.name.toLowerCase().includes('casper') || answer.type === 'woman') {
          wiseManKey = 'casper';
        } else {
          console.warn('⚠️ 无法映射贤者回答:', answer.name, answer.type);
          return;
        }

        // 映射状态
        switch (answer.status) {
          case 'yes':
            newStates[wiseManKey] = 'yes';
            break;
          case 'no':
            newStates[wiseManKey] = 'no';
            break;
          case 'conditional':
            newStates[wiseManKey] = 'conditional';
            break;
          case 'info':
            newStates[wiseManKey] = 'info';
            break;
          case 'error':
            newStates[wiseManKey] = 'error';
            break;
          default:
            newStates[wiseManKey] = 'standby';
        }
      });

      console.log('🎯 更新贤者状态:', newStates);
      setWiseManStates(newStates);
    } else {
      // 待机状态：重置所有贤者
      setWiseManStates({
        melchior: 'standby',
        balthasar: 'standby',
        casper: 'standby'
      });
    }
  }, [magi.systemStatus, magi.wiseManAnswers, magi.finalStatus]);

  // 确定容器的CSS类名（包含动效控制）
  const containerClassName = [
    'magi',
    magi.systemStatus === 'processing' ? 'magi-in-progress' : '',
    className
  ].filter(Boolean).join(' ');

  // 确定Response组件的状态
  const responseStatus = magi.finalStatus || magi.systemStatus || 'standby';

  // 处理贤者点击事件
  const handleWiseManClick = (name: string) => {
    const answer = magi.wiseManAnswers.find(a => 
      a.name.toLowerCase().includes(name) || 
      (name === 'melchior' && a.type === 'scientist') ||
      (name === 'balthasar' && a.type === 'mother') ||
      (name === 'casper' && a.type === 'woman')
    );

    if (answer) {
      console.log(`📝 ${name} 详细回答:`, {
        response: answer.response,
        status: answer.status,
        conditions: answer.conditions,
        timestamp: answer.timestamp
      });
    } else {
      console.log(`🔍 点击了贤者: ${name}，当前状态: ${wiseManStates[name as keyof typeof wiseManStates]}`);
    }
  };

  return (
    <div className={containerClassName}>
      {/* 左侧标题 */}
      <Header side="left" title="提訴" />

      {/* 右侧标题 */}
      <Header side="right" title="決議" />

      {/* MAGI标题 */}
      <div className="title">MAGI</div>

      {/* 系统状态 */}
      <Status
        systemStatus={magi.systemStatus}
        currentQuestion={magi.question}
        refreshTrigger={magi.refreshTrigger}
      />

      {/* 三贤者 */}
      <WiseMan
        name="melchior"
        status={wiseManStates.melchior}
        orderNumber={1}
        onClick={() => handleWiseManClick('melchior')}
        isAnimating={magi.systemStatus === 'processing'}
      />

      <WiseMan
        name="balthasar"
        status={wiseManStates.balthasar}
        orderNumber={2}
        onClick={() => handleWiseManClick('balthasar')}
        isAnimating={magi.systemStatus === 'processing'}
      />

      <WiseMan
        name="casper"
        status={wiseManStates.casper}
        orderNumber={3}
        onClick={() => handleWiseManClick('casper')}
        isAnimating={magi.systemStatus === 'processing'}
      />

      {/* 连接线 */}
      <ConnectionLine
        type="casper-balthasar"
        isActive={magi.systemStatus === 'processing'}
      />
      <ConnectionLine
        type="casper-melchior"
        isActive={magi.systemStatus === 'processing'}
      />
      <ConnectionLine
        type="balthasar-melchior"
        isActive={magi.systemStatus === 'processing'}
      />

      {/* 响应状态 */}
      <Response
        status={responseStatus as any}
      />

      {children}
    </div>
  );
};

export default MagiContainer;