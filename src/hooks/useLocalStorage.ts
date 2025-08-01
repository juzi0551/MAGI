import { useState, useEffect, useCallback } from 'react';
import { StorageUtils } from '../services/storage/storageUtils';

/**
 * useLocalStorage Hook选项
 */
export interface UseLocalStorageOptions<T> {
  defaultValue: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  onError?: (error: string) => void;
}

/**
 * useLocalStorage Hook返回值
 */
export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
  isLoading: boolean;
  error: string | null;
  isStorageAvailable: boolean;
}

/**
 * 通用的localStorage Hook
 * 提供统一的存储接口，包含错误处理和降级支持
 */
export function useLocalStorage<T>(
  key: string,
  options: UseLocalStorageOptions<T>
): UseLocalStorageReturn<T> {
  const { defaultValue, serialize, deserialize, onError } = options;

  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStorageAvailable] = useState(() => StorageUtils.isStorageAvailable());

  // 自定义序列化函数
  const serializeValue = useCallback((val: T): string => {
    if (serialize) {
      return serialize(val);
    }
    return JSON.stringify(val);
  }, [serialize]);

  // 自定义反序列化函数
  const deserializeValue = useCallback((val: string): T => {
    if (deserialize) {
      return deserialize(val);
    }
    return JSON.parse(val) as T;
  }, [deserialize]);

  // 错误处理
  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    if (onError) {
      onError(errorMessage);
    }
  }, [onError]);

  // 初始化：从localStorage读取值
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    if (!isStorageAvailable) {
      // localStorage不可用，使用默认值
      setValue(defaultValue);
      setIsLoading(false);
      return;
    }

    try {
      const result = StorageUtils.getItem<string>(key);
      
      if (result.success && result.data !== undefined) {
        const deserializedValue = deserializeValue(result.data);
        setValue(deserializedValue);
      } else {
        setValue(defaultValue);
      }
    } catch (err) {
      const errorMessage = `读取localStorage失败: ${err instanceof Error ? err.message : '未知错误'}`;
      handleError(errorMessage);
      setValue(defaultValue);
    }

    setIsLoading(false);
  }, [key, defaultValue, isStorageAvailable, deserializeValue, handleError]);

  // 更新值的函数
  const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prevValue => {
      const valueToStore = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prevValue) : newValue;
      
      // 如果localStorage可用，尝试保存
      if (isStorageAvailable) {
        try {
          const serializedValue = serializeValue(valueToStore);
          const result = StorageUtils.setItem(key, serializedValue);
          
          if (!result.success) {
            handleError(result.error || '保存到localStorage失败');
          } else {
            setError(null); // 清除之前的错误
          }
        } catch (err) {
          const errorMessage = `保存到localStorage失败: ${err instanceof Error ? err.message : '未知错误'}`;
          handleError(errorMessage);
        }
      }
      
      return valueToStore;
    });
  }, [key, isStorageAvailable, serializeValue, handleError]);

  // 删除值的函数
  const removeValue = useCallback(() => {
    setValue(defaultValue);
    setError(null);

    if (isStorageAvailable) {
      const result = StorageUtils.removeItem(key);
      if (!result.success) {
        handleError(result.error || '从localStorage删除失败');
      }
    }
  }, [key, defaultValue, isStorageAvailable, handleError]);

  return {
    value,
    setValue: updateValue,
    removeValue,
    isLoading,
    error,
    isStorageAvailable
  };
}

/**
 * 简化版本的useLocalStorage，适用于基本类型
 */
export function useSimpleLocalStorage<T>(
  key: string,
  defaultValue: T,
  onError?: (error: string) => void
): UseLocalStorageReturn<T> {
  return useLocalStorage(key, {
    defaultValue,
    onError
  });
}

/**
 * 专门用于对象的useLocalStorage
 */
export function useObjectLocalStorage<T extends Record<string, any>>(
  key: string,
  defaultValue: T,
  onError?: (error: string) => void
): UseLocalStorageReturn<T> {
  return useLocalStorage(key, {
    defaultValue,
    serialize: (value) => JSON.stringify(value, null, 2),
    deserialize: (value) => JSON.parse(value),
    onError
  });
}

/**
 * 用于数组的useLocalStorage
 */
export function useArrayLocalStorage<T>(
  key: string,
  defaultValue: T[],
  onError?: (error: string) => void
): UseLocalStorageReturn<T[]> {
  return useLocalStorage(key, {
    defaultValue,
    onError
  });
}