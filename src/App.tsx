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
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '80px', // 为输入框留出空间
          width: '100%',
          height: '100%'
        }}>
          <div style={{
            width: '98%',
            height: '65vh',
            minHeight: '450px',
            maxHeight: '600px'
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