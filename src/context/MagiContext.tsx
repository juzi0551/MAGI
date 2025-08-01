import { createContext, useContext, useReducer, useCallback } from 'react';
import { MagiContextType, ContextProviderProps } from '../types/context';
import { 
  SystemStatus, 
  QuestionType, 
  WiseManAnswer, 
  FinalStatus, 
  AppError,
  ErrorType,
  MagiQuestion,
  MagiDecision 
} from '../types/ai';
import MagiAIService from '../services/ai';
import { useConfig } from './ConfigContext';

interface MagiState {
  question: string;
  questionType: QuestionType | null;
  systemStatus: SystemStatus;
  wiseManAnswers: WiseManAnswer[];
  finalStatus: FinalStatus | null;
  refreshTrigger: number;
  isProcessing: boolean;
  processingStartTime: number | null;
  processingQuestion: string | null; // 新增：正在处理的原始问题
  error: AppError | null;
}

type MagiAction =
  | { type: 'SET_QUESTION'; payload: string }
  | { type: 'SET_QUESTION_TYPE'; payload: QuestionType }
  | { type: 'SET_SYSTEM_STATUS'; payload: SystemStatus }
  | { type: 'SET_WISE_MAN_ANSWERS'; payload: WiseManAnswer[] }
  | { type: 'UPDATE_WISE_MAN_ANSWER'; payload: WiseManAnswer }
  | { type: 'SET_FINAL_STATUS'; payload: FinalStatus | null }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_PROCESSING_START_TIME'; payload: number | null }
  | { type: 'SET_ERROR'; payload: AppError | null }
  | { type: 'REFRESH_TRIGGER' }
  | { type: 'RESET_SYSTEM' }
  | { type: 'COMPLETE_PROCESSING' }; // 新增：专门用于完成处理，保留processingStartTime

const initialState: MagiState = {
  question: '',
  questionType: null,
  systemStatus: 'standby',
  wiseManAnswers: [],
  finalStatus: null,
  refreshTrigger: 0,
  isProcessing: false,
  processingStartTime: null,
  processingQuestion: null, // 新增
  error: null,
};

function magiReducer(state: MagiState, action: MagiAction): MagiState {
  switch (action.type) {
    case 'SET_QUESTION':
      return { ...state, question: action.payload };
    
    case 'SET_QUESTION_TYPE':
      return { ...state, questionType: action.payload };
    
    case 'SET_SYSTEM_STATUS':
      return { 
        ...state, 
        systemStatus: action.payload,
        isProcessing: action.payload === 'processing'
      };
    
    case 'SET_WISE_MAN_ANSWERS':
      return { ...state, wiseManAnswers: action.payload };
    
    case 'UPDATE_WISE_MAN_ANSWER': {
      const updatedAnswers = [...state.wiseManAnswers];
      const existingIndex = updatedAnswers.findIndex(
        answer => answer.name === action.payload.name
      );
      
      if (existingIndex >= 0) {
        updatedAnswers[existingIndex] = action.payload;
      } else {
        updatedAnswers.push(action.payload);
      }
      
      return { ...state, wiseManAnswers: updatedAnswers };
    }
    
    case 'SET_FINAL_STATUS':
      return { ...state, finalStatus: action.payload };
    
    case 'SET_PROCESSING':
      return { 
        ...state, 
        isProcessing: action.payload,
        processingStartTime: action.payload ? Date.now() : null,
        processingQuestion: action.payload ? state.question : null // 保存正在处理的问题
      };
    
    case 'COMPLETE_PROCESSING':
      return {
        ...state,
        systemStatus: 'completed',
        isProcessing: false,
        // 保留processingStartTime用于历史记录保存
      };
    
    case 'SET_PROCESSING_START_TIME':
      return { ...state, processingStartTime: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'REFRESH_TRIGGER':
      return { ...state, refreshTrigger: state.refreshTrigger + 1 };
    
    case 'RESET_SYSTEM':
      return {
        ...initialState,
        refreshTrigger: state.refreshTrigger + 1,
      };
    
    default:
      return state;
  }
}

// 决策逻辑计算
function calculateFinalDecision(answers: WiseManAnswer[]): FinalStatus | null {
  if (answers.length === 0) return null;
  
  // 检查是否有错误
  const errorCount = answers.filter(a => a.status === 'error').length;
  if (errorCount >= 2) return 'error';
  
  // 检查是否为信息查询
  const infoCount = answers.filter(a => a.status === 'info').length;
  if (infoCount >= 2) return 'info';
  
  // 对于是/否问题的决策逻辑
  const yesCount = answers.filter(a => a.status === 'yes').length;
  const noCount = answers.filter(a => a.status === 'no').length;
  const conditionalCount = answers.filter(a => a.status === 'conditional').length;
  
  // 多数同意
  if (yesCount >= 2) return 'yes';
  
  // 多数拒绝
  if (noCount >= 2) return 'no';
  
  // 如果有条件回答
  if (conditionalCount > 0) return 'conditional';
  
  // 其他情况
  return 'error';
}

const MagiContext = createContext<MagiContextType | undefined>(undefined);

export function MagiProvider({ children }: ContextProviderProps) {
  const [state, dispatch] = useReducer(magiReducer, initialState);
  const config = useConfig();

  // 设置问题
  const setQuestion = useCallback((question: string) => {
    dispatch({ type: 'SET_QUESTION', payload: question });
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // 处理问题（主流程）
  const processQuestion = useCallback(async () => {
    if (!state.question.trim()) {
      dispatch({
        type: 'SET_ERROR',
        payload: {
          type: ErrorType.UNKNOWN_ERROR,
          message: '请输入问题',
          timestamp: Date.now()
        }
      });
      return;
    }

    // 防止重复提交
    if (state.isProcessing) {
      return;
    }

    try {
      // 重置状态
      dispatch({ type: 'SET_WISE_MAN_ANSWERS', payload: [] });
      dispatch({ type: 'SET_FINAL_STATUS', payload: null });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // 开始处理
      dispatch({ type: 'SET_SYSTEM_STATUS', payload: 'processing' });
      dispatch({ type: 'SET_PROCESSING', payload: true });
      
      // 清空输入框（问题发送成功后立即清空）
      dispatch({ type: 'SET_QUESTION', payload: '' });

      // 创建MAGI问题对象
      const magiQuestion: MagiQuestion = {
        id: `question-${Date.now()}`,
        query: state.question,
        timestamp: new Date()
      };

      // 使用AI服务处理问题，传入用户配置
      const userConfig = {
        provider: config.provider,
        model: config.model,
        apiKey: config.apiKey,
        apiBase: config.apiBase,
        customBackground: config.customBackground,
        customPrompts: config.customPrompts
      };
      
      const decision: MagiDecision = await MagiAIService.processQuestion(magiQuestion, userConfig);
      
      // 更新问题类型
      dispatch({ 
        type: 'SET_QUESTION_TYPE', 
        payload: decision.questionType === 'yes-no' ? 'yes_no' : 'info' 
      });

      // 更新贤者回答
      dispatch({ type: 'SET_WISE_MAN_ANSWERS', payload: decision.wiseManAnswers });

      // 转换最终决策到FinalStatus
      let finalStatus: FinalStatus;
      switch (decision.finalDecision.result) {
        case 'yes':
          finalStatus = 'yes';
          break;
        case 'no':
          finalStatus = 'no';
          break;
        case 'conditional':
          finalStatus = 'conditional';
          break;
        case 'info':
          finalStatus = 'info';
          break;
        case 'error':
        default:
          finalStatus = 'error';
          break;
      }
      
      dispatch({ type: 'SET_FINAL_STATUS', payload: finalStatus });
      
      // 处理完成 - 使用新的action保留processingStartTime
      dispatch({ type: 'COMPLETE_PROCESSING' });

    } catch (error) {
      console.error('处理问题时发生错误:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: {
          type: ErrorType.UNKNOWN_ERROR,
          message: MagiAIService.getErrorMessage(error as Error),
          timestamp: Date.now()
        }
      });
      dispatch({ type: 'SET_SYSTEM_STATUS', payload: 'standby' });
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [state.question, config]);

  // 重置系统
  const resetSystem = useCallback(() => {
    dispatch({ type: 'RESET_SYSTEM' });
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // 更新系统状态
  const updateSystemStatus = useCallback((status: SystemStatus) => {
    dispatch({ type: 'SET_SYSTEM_STATUS', payload: status });
  }, []);

  // 更新贤者回答
  const updateWiseManAnswer = useCallback((answer: WiseManAnswer) => {
    dispatch({ type: 'UPDATE_WISE_MAN_ANSWER', payload: answer });
  }, []);

  // 计算最终状态
  const calculateFinalStatus = useCallback(() => {
    const finalStatus = calculateFinalDecision(state.wiseManAnswers) || 'error';
    dispatch({ type: 'SET_FINAL_STATUS', payload: finalStatus });
  }, [state.wiseManAnswers]);

  const contextValue: MagiContextType = {
    // 核心状态
    question: state.question,
    questionType: state.questionType,
    systemStatus: state.systemStatus,
    wiseManAnswers: state.wiseManAnswers,
    finalStatus: state.finalStatus,
    refreshTrigger: state.refreshTrigger,

    // 处理状态
    isProcessing: state.isProcessing,
    processingStartTime: state.processingStartTime,
    processingQuestion: state.processingQuestion,
    error: state.error,

    // 操作方法
    setQuestion,
    processQuestion,
    resetSystem,
    clearError,

    // 内部方法
    updateSystemStatus,
    updateWiseManAnswer,
    calculateFinalStatus,
  };

  return (
    <MagiContext.Provider value={contextValue}>
      {children}
    </MagiContext.Provider>
  );
}

export function useMagi(): MagiContextType {
  const context = useContext(MagiContext);
  if (context === undefined) {
    throw new Error('useMagi must be used within a MagiProvider');
  }
  return context;
}