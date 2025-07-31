import { useState } from 'react';
import { InputContainerProps } from '../../types';

/**
 * 输入容器组件
 * 处理用户问题输入
 */
const InputContainer = ({ 
  value, 
  onChange, 
  onSubmit, 
  disabled = false, 
  placeholder = "请输入您的问题...", 
  className = '' 
}: InputContainerProps) => {
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSubmit(inputValue.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled) {
      handleSubmit(e);
    }
  };

  return (
    <div className={`input-container ${className}`}>
      <label htmlFor="question-input">質問:</label>
      <input
        id="question-input"
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        autoFocus
      />
      <button
        type="submit"
        className="input-submit-btn"
        onClick={handleSubmit}
        disabled={disabled || !inputValue.trim()}
      >
        提交
      </button>
    </div>
  );
};

export default InputContainer;