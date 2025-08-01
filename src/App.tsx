import { useState } from 'react';
import { MagiSystem, MagiContainer, InputContainer } from './components';

function App() {
  const [question, setQuestion] = useState('');

  const handleQuestionChange = (value: string) => {
    setQuestion(value);
  };

  const handleQuestionSubmit = (submittedQuestion: string) => {
    console.log('Question submitted:', submittedQuestion);
    // TODO: 这里将来会连接到MAGI系统的问答处理逻辑
    // 暂时只是清空输入框
    setQuestion('');
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
            <MagiContainer status="standby" />
          </div>
        </div>
        
        {/* 用户输入组件 */}
        <InputContainer
          value={question}
          onChange={handleQuestionChange}
          onSubmit={handleQuestionSubmit}
          placeholder="请输入您的问题..."
        />
      </MagiSystem>
    </div>
  );
}

export default App;