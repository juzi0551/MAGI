import { ContextProviderProps } from '../types/context';
import { ConfigProvider } from './ConfigContext';
import { MagiProvider } from './MagiContext';
import { HistoryProvider } from './HistoryContext';
import { AudioProvider } from './AudioContext';

/**
 * 应用主Context Provider
 * 整合所有Context Provider，确保正确的嵌套顺序
 */
export function AppProvider({ children }: ContextProviderProps) {
  return (
    <ConfigProvider>
      <AudioProvider>
        <HistoryProvider>
          <MagiProvider>
            {children}
          </MagiProvider>
        </HistoryProvider>
      </AudioProvider>
    </ConfigProvider>
  );
}

/**
 * Context Provider组件的导出
 */
export { ConfigProvider, useConfig } from './ConfigContext';
export { MagiProvider, useMagi } from './MagiContext';
export { HistoryProvider, useHistory } from './HistoryContext';
export { AudioProvider, useAudio } from './AudioContext';