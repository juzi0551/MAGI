/**
 * Hooks统一导出
 */

// 基础存储Hook
export {
  useLocalStorage,
  useSimpleLocalStorage,
  useObjectLocalStorage,
  useArrayLocalStorage,
  type UseLocalStorageOptions,
  type UseLocalStorageReturn
} from './useLocalStorage';

// 配置管理Hook
export {
  useConfig,
  useUserConfig,
  useAudioConfig,
  type UseConfigReturn
} from './useConfig';

// 历史记录Hook
export {
  useHistory,
  useHistoryList,
  useHistoryDetail,
  type UseHistoryReturn
} from './useHistory';