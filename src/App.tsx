import { AppProvider, useMagi, useConfig } from './context';
import { MagiSystem, MagiContainer, InputContainer } from './components';

function AppContent() {
  const magi = useMagi();
  const config = useConfig();

  const handleQuestionChange = (value: string) => {
    magi.setQuestion(value);
  };

  const handleQuestionSubmit = async () => {
    // 检查配置是否有效
    if (!config.isConfigValid) {
      console.warn('Configuration is not valid, please set up API key first');
      return;
    }

    // 使用MAGI Context处理问题
    await magi.processQuestion();
  };

  return (
    <div className="app">
      <MagiSystem>
        {/* MAGI核心界面容器 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: '5px', // 与input-container右边对齐
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
            maxHeight: 'calc(100% - 20px)',
            maxWidth: 'calc((100vh - 160px) * 2 / 1)', // 基于高度计算最大宽度
          }}>
            <MagiContainer status={magi.systemStatus} />
          </div>
        </div>
        
        {/* 用户输入组件 */}
        <InputContainer
          value={magi.question}
          onChange={handleQuestionChange}
          onSubmit={handleQuestionSubmit}
          placeholder="请输入您的问题..."
          disabled={magi.isProcessing}
        />
      </MagiSystem>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;