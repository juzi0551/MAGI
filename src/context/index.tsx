import { ContextProviderProps } from '../types/context';
import { ConfigProvider } from './ConfigContext';
import { MagiProvider } from './MagiContext';
import { HistoryProvider } from './HistoryContext';

/**
 * 应用主Context Provider
 * 整合所有Context Provider，确保正确的嵌套顺序
 */
export function AppProvider({ children }: ContextProviderProps) {
  return (
    <ConfigProvider>
      <HistoryProvider>
        <MagiProvider>
          {children}
        </MagiProvider>
      </HistoryProvider>
    </ConfigProvider>
  );
}

/**
 * Context Provider组件的导出
 */
export { ConfigProvider, useConfig } from './ConfigContext';
export { MagiProvider, useMagi } from './MagiContext';
export { HistoryProvider, useHistory } from './HistoryContext';