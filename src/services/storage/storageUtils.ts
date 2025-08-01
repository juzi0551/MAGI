/**
 * 存储工具类
 * 提供localStorage兼容性检测和基础操作
 */

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class StorageUtils {
  private static _isAvailable: boolean | null = null;

  /**
   * 检测localStorage是否可用
   */
  static isStorageAvailable(): boolean {
    if (this._isAvailable !== null) {
      return this._isAvailable;
    }

    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      this._isAvailable = true;
      return true;
    } catch {
      this._isAvailable = false;
      return false;
    }
  }

  /**
   * 安全地获取localStorage项
   */
  static getItem<T>(key: string): StorageResult<T> {
    try {
      if (!this.isStorageAvailable()) {
        return { success: false, error: 'localStorage不可用' };
      }

      const item = localStorage.getItem(key);
      if (item === null) {
        return { success: false, error: '项目不存在' };
      }

      const data = JSON.parse(item) as T;
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: `获取存储项失败: ${error instanceof Error ? error.message : '未知错误'}` 
      };
    }
  }

  /**
   * 安全地设置localStorage项
   */
  static setItem<T>(key: string, value: T): StorageResult<void> {
    try {
      if (!this.isStorageAvailable()) {
        return { success: false, error: 'localStorage不可用' };
      }

      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: `设置存储项失败: ${error instanceof Error ? error.message : '未知错误'}` 
      };
    }
  }

  /**
   * 安全地删除localStorage项
   */
  static removeItem(key: string): StorageResult<void> {
    try {
      if (!this.isStorageAvailable()) {
        return { success: false, error: 'localStorage不可用' };
      }

      localStorage.removeItem(key);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: `删除存储项失败: ${error instanceof Error ? error.message : '未知错误'}` 
      };
    }
  }

  /**
   * 获取存储使用情况（估算）
   */
  static getStorageSize(): number {
    if (!this.isStorageAvailable()) {
      return 0;
    }

    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }

  /**
   * 清空所有MAGI相关的存储项
   */
  static clearMagiStorage(): StorageResult<void> {
    try {
      if (!this.isStorageAvailable()) {
        return { success: false, error: 'localStorage不可用' };
      }

      const keysToRemove: string[] = [];
      for (const key in localStorage) {
        if (key.startsWith('magi_')) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: `清空存储失败: ${error instanceof Error ? error.message : '未知错误'}` 
      };
    }
  }
}