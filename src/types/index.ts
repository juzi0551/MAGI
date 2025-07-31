/**
 * 统一的类型导出文件
 */

// AI相关类型
export type {
  AIProvider,
  QuestionType,
  WiseManStatus,
  SystemStatus,
  FinalStatus,
  WiseManName,
  WiseManAnswer,
  AIRequestParams,
  AIResponse,
  QuestionAnalysis,
  AppError,
  AIServiceConfig,
  PersonalityPrompts,
  ModelConfig,
} from './ai';

export { ErrorType } from './ai';

// 配置相关类型
export type {
  UserConfig,
  AudioSettings,
  AppConfig,
  ConfigStorage,
  ConfigContextType,
  SettingsModalProps,
  AIProviderOption,
  ModelOption,
  ConfigValidation,
  ConfigMigration,
} from './config';

export { 
  DEFAULT_CONFIG, 
  AUDIO_FREQUENCIES, 
  AI_PROVIDERS 
} from './config';

// 历史记录相关类型
export type {
  HistoryRecord,
  HistoryStorage,
  HistoryContextType,
  HistoryStatistics,
  HistoryPanelProps,
  HistoryItemProps,
  HistoryDetailModalProps,
  HistoryFilter,
  HistorySortBy,
  HistorySortOrder,
  HistorySort,
  HistoryExportData,
  HistoryMigration,
} from './history';

export { 
  DEFAULT_HISTORY_STORAGE, 
  HISTORY_CONSTANTS 
} from './history';

// 组件相关类型
export type {
  BaseComponentProps,
  MagiSystemProps,
  MagiContainerProps,
  WiseManProps,
  ResponseProps,
  StatusProps,
  HeaderProps,
  InputContainerProps,
  ErrorBoundaryProps,
  ErrorBoundaryState,
  LoadingProps,
  ModalProps,
  ButtonProps,
  InputProps,
  SelectProps,
  SliderProps,
  SwitchProps,
  TooltipProps,
  NotificationProps,
  ConfirmDialogProps,
  WiseAnswerDisplayProps,
  SystemStatusIndicatorProps,
  HistoryModalProps,
} from './components';

// Context相关类型
export type {
  MagiContextType,
  AudioContextType,
  NotificationContextType,
  ThemeContextType,
  I18nContextType,
  AppContextType,
  ContextProviderProps,
  UseContextHook,
  ContextAction,
  ContextReducer,
} from './context';

// 工具相关类型
export type {
  Formatter,
  StatusUtils,
  DecisionCalculator,
  Validator,
  StorageUtils,
  AudioUtils,
  NetworkUtils,
  DebugUtils,
  PerformanceMonitor,
  CacheUtils,
  EventUtils,
  DataTransformer,
  UtilFunction,
  AsyncUtilFunction,
  ErrorHandler,
} from './utils';

export { CONSTANTS } from './utils';

// 常用类型别名
export type ID = string;
export type Timestamp = number;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 事件处理器类型
export type EventHandler<T = void> = (event?: T) => void;
export type AsyncEventHandler<T = void> = (event?: T) => Promise<void>;

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

// 分页类型
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}

// 搜索类型
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    pageSize: number;
  };
}

// 主题类型
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    monospace: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}