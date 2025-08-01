import { AIService } from './aiService';
import { MagiQueryService } from './magiQueryService';
import { MagiQuestion, MagiDecision } from '../../types/ai';
import { UserConfig } from '../../types/config';

/**
 * API调用错误类型
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public provider?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * 网络错误类型
 */
export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * 配置错误类型
 */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

/**
 * 重试配置接口
 */
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableErrors: string[];
}

/**
 * 默认重试配置
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1秒
  maxDelay: 10000, // 10秒
  backoffFactor: 2,
  retryableErrors: [
    'NETWORK_ERROR',
    'TIMEOUT',
    'RATE_LIMIT',
    'SERVER_ERROR',
    'SERVICE_UNAVAILABLE'
  ]
};

/**
 * MAGI AI服务 - 带错误处理和重试机制的封装
 */
export class MagiAIService {
  private static retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG;

  /**
   * 设置重试配置
   */
  static setRetryConfig(config: Partial<RetryConfig>) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  /**
   * 处理MAGI问题（带重试机制）
   * @param question 用户问题
   * @param userConfig 用户配置（包含自定义设置）
   */
  static async processQuestion(question: MagiQuestion, userConfig?: UserConfig): Promise<MagiDecision> {
    return this.withRetry(
      async () => {
        try {
          return await MagiQueryService.processQuestion(question, userConfig);
        } catch (error) {
          throw this.categorizeError(error);
        }
      },
      'processQuestion'
    );
  }

  /**
   * 判断问题类型（带重试机制）
   */
  static async isYesNoQuestion(question: MagiQuestion, prompt: string): Promise<boolean> {
    return this.withRetry(
      async () => {
        try {
          return await AIService.isYesNoQuestion(question, prompt);
        } catch (error) {
          throw this.categorizeError(error);
        }
      },
      'isYesNoQuestion'
    );
  }

  /**
   * 通用重试包装器
   */
  private static async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        console.log(`[${operationName}] 尝试 ${attempt + 1}/${this.retryConfig.maxRetries + 1}`);
        
        const result = await operation();
        
        if (attempt > 0) {
          console.log(`[${operationName}] 重试成功，尝试次数: ${attempt + 1}`);
        }
        
        return result;
        
      } catch (error) {
        lastError = error as Error;
        console.error(`[${operationName}] 尝试 ${attempt + 1} 失败:`, error);
        
        // 检查是否应该重试
        if (attempt === this.retryConfig.maxRetries || !this.shouldRetry(error as Error)) {
          break;
        }
        
        // 计算延迟时间（指数退避）
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, attempt),
          this.retryConfig.maxDelay
        );
        
        console.log(`[${operationName}] ${delay}ms 后重试...`);
        await this.sleep(delay);
      }
    }
    
    // 所有重试都失败了
    console.error(`[${operationName}] 所有重试都失败，最终错误:`, lastError);
    throw lastError || new Error('操作失败，原因未知');
  }

  /**
   * 错误分类
   */
  private static categorizeError(error: unknown): Error {
    if (error instanceof APIError || error instanceof NetworkError || error instanceof ConfigError) {
      return error;
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorLower = errorMessage.toLowerCase();

    // 网络相关错误
    if (errorLower.includes('network') || 
        errorLower.includes('connection') || 
        errorLower.includes('timeout') ||
        errorLower.includes('fetch')) {
      return new NetworkError(errorMessage, error instanceof Error ? error : undefined);
    }

    // API相关错误
    if (errorLower.includes('api key') || 
        errorLower.includes('authentication') || 
        errorLower.includes('authorization')) {
      return new ConfigError(`API配置错误: ${errorMessage}`);
    }

    if (errorLower.includes('rate limit') || 
        errorLower.includes('quota') || 
        errorLower.includes('too many requests')) {
      return new APIError(`API限流: ${errorMessage}`, 429, 'RATE_LIMIT');
    }

    if (errorLower.includes('server error') || 
        errorLower.includes('internal error') || 
        errorLower.includes('service unavailable')) {
      return new APIError(`服务器错误: ${errorMessage}`, 500, 'SERVER_ERROR');
    }

    // 默认为网络错误
    return new NetworkError(`未知错误: ${errorMessage}`, error instanceof Error ? error : undefined);
  }

  /**
   * 判断是否应该重试
   */
  private static shouldRetry(error: Error): boolean {
    // 配置错误不重试
    if (error instanceof ConfigError) {
      return false;
    }

    // 网络错误总是重试
    if (error instanceof NetworkError) {
      return true;
    }

    // API错误根据错误代码判断
    if (error instanceof APIError) {
      return this.retryConfig.retryableErrors.includes(error.code || '');
    }

    // 其他错误默认重试
    return true;
  }

  /**
   * 延迟函数
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取错误的用户友好信息
   */
  static getErrorMessage(error: Error): string {
    if (error instanceof ConfigError) {
      return `配置错误：${error.message}`;
    }

    if (error instanceof NetworkError) {
      return `网络错误：请检查网络连接后重试`;
    }

    if (error instanceof APIError) {
      switch (error.code) {
        case 'RATE_LIMIT':
          return `API调用过于频繁，请稍后重试`;
        case 'SERVER_ERROR':
          return `AI服务暂时不可用，请稍后重试`;
        default:
          return `API错误：${error.message}`;
      }
    }

    return `未知错误：${error.message}`;
  }

  /**
   * 获取错误类型
   */
  static getErrorType(error: Error): 'config' | 'network' | 'api' | 'unknown' {
    if (error instanceof ConfigError) return 'config';
    if (error instanceof NetworkError) return 'network';
    if (error instanceof APIError) return 'api';
    return 'unknown';
  }

  /**
   * 检查服务可用性
   */
  static async checkServiceHealth(): Promise<{
    available: boolean;
    error?: string;
    suggestion?: string;
  }> {
    try {
      // 创建一个简单的测试问题
      const testQuestion: MagiQuestion = {
        id: 'health-check',
        query: '1+1=2吗？',
        timestamp: new Date()
      };

      // 尝试进行问题类型判断（较轻量的操作）
      await this.isYesNoQuestion(testQuestion, '请回答Yes或No');
      
      return { available: true };
      
    } catch (error) {
      const errorType = this.getErrorType(error as Error);
      const errorMessage = this.getErrorMessage(error as Error);
      
      let suggestion = '';
      switch (errorType) {
        case 'config':
          suggestion = '请检查API配置是否正确';
          break;
        case 'network':
          suggestion = '请检查网络连接';
          break;
        case 'api':
          suggestion = '请稍后重试或联系技术支持';
          break;
        default:
          suggestion = '请重新启动应用或联系技术支持';
      }
      
      return {
        available: false,
        error: errorMessage,
        suggestion
      };
    }
  }
}

export default MagiAIService;