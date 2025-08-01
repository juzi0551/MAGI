import { useState, useEffect } from 'react';
import { InputContainerProps } from '../../types';
import { useMagi, useConfig } from '../../context';

/**
 * 输入容器组件 - 与MAGI Context完全集成
 * 处理用户问题输入和AI问答流程
 */
const InputContainer = ({ 
  value, 
  onChange, 
  onSubmit, 
  disabled = false, 
  placeholder = "", 
  className = '' 
}: InputContainerProps) => {
  const magi = useMagi();
  const config = useConfig();
  const [localValue, setLocalValue] = useState(value || '');

  // 同步外部value到本地状态
  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    setLocalValue(newValue);
    magi.setQuestion(newValue); // 直接同步到MAGI Context
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleSubmit = async () => {
    const question = localValue.trim();
    if (!question) {
      return;
    }

    // 检查是否被禁用
    if (disabled || magi.isProcessing) {
      return;
    }

    // 检查API配置
    if (!config.isConfigValid || !config.apiKey) {
      magi.clearError();
      setTimeout(() => {
        alert('请先配置API密钥才能进行问答');
      }, 100);
      return;
    }

    // 只调用onSubmit回调，不直接调用magi.processQuestion
    if (onSubmit) {
      onSubmit();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isDisabled) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // 确定禁用状态
  const isDisabled = disabled || magi.isProcessing || !config.isConfigValid;
  
  // 确定占位符文本
  const getPlaceholder = () => {
    if (magi.isProcessing) {
      return '处理中...';
    }
    if (!config.isConfigValid) {
      return '请先配置API密钥...';
    }
    return placeholder || '请输入您的问题...';
  };

  // 确定输入框样式
  const inputClassName = [
    magi.isProcessing ? 'processing' : '',
    !config.isConfigValid ? 'config-invalid' : '',
    magi.error ? 'error' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={`input-container ${className}`}>
      <label>質問: </label>
      <input
        type="text"
        value={localValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={getPlaceholder()}
        disabled={isDisabled}
        className={inputClassName}
        autoComplete="off"
        autoFocus
      />
      
      {/* 错误显示 */}
      {magi.error && (
        <div className="input-error">
          {magi.error.message}
        </div>
      )}
      
    </div>
  );
};

export default InputContainer;