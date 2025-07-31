import { useState } from 'react';
import { MagiSystem, MagiContainer } from './components';
import { SystemStatus } from './types';

function App() {
  const [demoStatus, setDemoStatus] = useState<SystemStatus>('standby');

  const handleDemo = () => {
    if (demoStatus !== 'standby') return;

    setDemoStatus('processing');

    setTimeout(() => {
      setDemoStatus('completed');

      setTimeout(() => {
        setDemoStatus('standby');
      }, 5000);
    }, 3000);
  };

  return (
    <div className="app">
      <MagiSystem>
        {/* MAGI核心界面容器 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: '5px', // 与input-container右边对齐 (var(--spacing-sm) = 5px)
          bottom: '80px', // 为输入框留出空间
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end', // 右对齐
          justifyContent: 'flex-start' // 顶部对齐
        }}>
          {/* MAGI面板 - 2:1比例 */}
          <div style={{
            width: '100%',
            aspectRatio: '2 / 1',
            maxHeight: 'calc(100% - 60px)', // 为按钮留出空间
            maxWidth: 'calc((100vh - 160px) * 2 / 1)', // 基于高度计算最大宽度
          }}>
            <MagiContainer status={demoStatus} />
          </div>

          {/* 演示按钮 */}
          <button
            className="btn"
            onClick={handleDemo}
            disabled={demoStatus !== 'standby'}
            style={{
              marginTop: '20px',
              opacity: demoStatus !== 'standby' ? 0.5 : 1
            }}
          >
            {demoStatus === 'standby' ? '演示决策流程' :
              demoStatus === 'processing' ? '处理中...' : '决策完成'}
          </button>
        </div>
      </MagiSystem>
    </div>
  )
}

export default App