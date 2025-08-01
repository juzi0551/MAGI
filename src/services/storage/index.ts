/**
 * 存储服务统一入口
 * 提供所有存储操作的统一接口
 */

export { StorageUtils, type StorageResult } from './storageUtils';
export { ConfigStorageService, type ConfigStorage } from './configStorage';
export { HistoryStorageService, type HistoryStorage } from './historyStorage';

// 导入服务类用于内部使用
import { StorageUtils } from './storageUtils';
import { ConfigStorageService } from './configStorage';
import { HistoryStorageService } from './historyStorage';

/**
 * 存储服务管理器
 * 提供统一的存储管理功能
 */
export class StorageManager {
  /**
   * 初始化存储服务
   * 检查localStorage可用性，进行必要的迁移
   */
  static async initialize(): Promise<{
    success: boolean;
    storageAvailable: boolean;
    migrations: string[];
    errors: string[];
  }> {
    const result = {
      success: true,
      storageAvailable: StorageUtils.isStorageAvailable(),
      migrations: [] as string[],
      errors: [] as string[]
    };

    try {
      // 初始化配置存储
      const configResult = ConfigStorageService.getConfig();
      if (configResult.success) {
        result.migrations.push('配置存储已初始化');
      } else {
        result.errors.push(`配置存储初始化失败: ${configResult.error}`);
      }

      // 初始化历史记录存储
      const historyResult = HistoryStorageService.getHistory();
      if (historyResult.success) {
        result.migrations.push('历史记录存储已初始化');
      } else {
        result.errors.push(`历史记录存储初始化失败: ${historyResult.error}`);
      }

      // 如果有错误，标记为失败
      if (result.errors.length > 0) {
        result.success = false;
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`存储初始化异常: ${error instanceof Error ? error.message : '未知错误'}`);
    }

    return result;
  }

  /**
   * 获取存储使用情况
   */
  static getStorageInfo() {
    return {
      available: StorageUtils.isStorageAvailable(),
      totalSize: StorageUtils.getStorageSize(),
      storageKeys: this.getMagiStorageKeys()
    };
  }

  /**
   * 获取所有MAGI相关的存储键
   */
  private static getMagiStorageKeys(): string[] {
    if (!StorageUtils.isStorageAvailable()) {
      return [];
    }

    const keys: string[] = [];
    for (const key in localStorage) {
      if (key.startsWith('magi_')) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * 清理过期或无效的存储数据
   */
  static cleanupStorage(): {
    success: boolean;
    cleanedItems: string[];
    errors: string[];
  } {
    const result = {
      success: true,
      cleanedItems: [] as string[],
      errors: [] as string[]
    };

    if (!StorageUtils.isStorageAvailable()) {
      result.success = false;
      result.errors.push('localStorage不可用');
      return result;
    }

    try {
      const keys = this.getMagiStorageKeys();
      
      for (const key of keys) {
        try {
          const item = localStorage.getItem(key);
          if (!item) {
            continue;
          }

          // 尝试解析JSON
          const parsed = JSON.parse(item);
          
          // 检查是否有有效的版本信息
          if (!parsed.version) {
            localStorage.removeItem(key);
            result.cleanedItems.push(`已清理无版本信息的项: ${key}`);
            continue;
          }

          // 检查是否过期（可以根据需要添加过期逻辑）
          // 这里暂时不删除任何有效数据
          
        } catch (parseError) {
          // 无法解析的项目，可能损坏，删除它
          localStorage.removeItem(key);
          result.cleanedItems.push(`已清理损坏的项: ${key}`);
        }
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`清理存储时出错: ${error instanceof Error ? error.message : '未知错误'}`);
    }

    return result;
  }

  /**
   * 完全重置所有MAGI存储数据
   */
  static resetAllStorage(): {
    success: boolean;
    message: string;
  } {
    const clearResult = StorageUtils.clearMagiStorage();
    
    if (clearResult.success) {
      return {
        success: true,
        message: '所有MAGI存储数据已清除'
      };
    } else {
      return {
        success: false,
        message: clearResult.error || '清除存储数据失败'
      };
    }
  }

  /**
   * 导出所有MAGI数据
   */
  static exportAllData(): {
    success: boolean;
    data?: string;
    error?: string;
  } {
    try {
      const configResult = ConfigStorageService.exportConfig();
      const historyResult = HistoryStorageService.exportHistory();

      if (!configResult.success) {
        return { success: false, error: `导出配置失败: ${configResult.error}` };
      }

      if (!historyResult.success) {
        return { success: false, error: `导出历史记录失败: ${historyResult.error}` };
      }

      const exportData = {
        version: '1.0.0',
        exportTime: new Date().toISOString(),
        config: JSON.parse(configResult.data!),
        history: JSON.parse(historyResult.data!)
      };

      return {
        success: true,
        data: JSON.stringify(exportData, null, 2)
      };

    } catch (error) {
      return {
        success: false,
        error: `导出数据失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 导入所有MAGI数据
   */
  static importAllData(data: string): {
    success: boolean;
    message: string;
    errors: string[];
  } {
    const result = {
      success: true,
      message: '',
      errors: [] as string[]
    };

    try {
      const importData = JSON.parse(data);

      // 验证数据格式
      if (!importData.config || !importData.history) {
        return {
          success: false,
          message: '导入数据格式无效',
          errors: ['缺少配置或历史记录数据']
        };
      }

      // 导入配置
      const configResult = ConfigStorageService.importConfig(JSON.stringify(importData.config));
      if (!configResult.success) {
        result.errors.push(`配置导入失败: ${configResult.error}`);
      }

      // 导入历史记录
      const historyResult = HistoryStorageService.importHistory(JSON.stringify(importData.history));
      if (!historyResult.success) {
        result.errors.push(`历史记录导入失败: ${historyResult.error}`);
      }

      if (result.errors.length > 0) {
        result.success = false;
        result.message = '部分数据导入失败';
      } else {
        result.message = '所有数据导入成功';
      }

      return result;

    } catch (error) {
      return {
        success: false,
        message: '导入数据失败',
        errors: [`解析数据失败: ${error instanceof Error ? error.message : '未知错误'}`]
      };
    }
  }
}