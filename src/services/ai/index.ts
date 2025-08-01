/**
 * AI服务层统一入口
 * 提供MAGI系统所需的所有AI相关服务
 */

// 核心服务类
export { AIService } from './aiService';
export { MagiQueryService } from './magiQueryService';
export { 
  MagiAIService,
  APIError,
  NetworkError,
  ConfigError
} from './magiAIService';

// 类型定义
export type {
  MagiQuestion,
  MagiDecision,
  WiseManAnswer,
  AIResponse,
  AIProvider
} from '../../types/ai';

// 提示词配置
export {
  MELCHIOR_PROMPT,
  BALTHASAR_PROMPT,
  CASPER_PROMPT,
  YES_NO_QUESTION_PROMPT,
  PERSONALITY_PROMPTS,
  getPersonalityPrompt
} from '../../config/prompts';

// 便捷的默认导出
export { MagiAIService as default } from './magiAIService';