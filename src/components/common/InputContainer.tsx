import { InputContainerProps } from '../../types';

/**
 * 输入容器组件 - 参考原MAGI项目设计
 * 处理用户问题输入
 */
const InputContainer = ({ 
  value, 
  onChange, 
  onSubmit, 
  disabled = false, 
  placeholder = "", 
  className = '' 
}: InputContainerProps) => {

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled && value.trim()) {
      onSubmit(value.trim());
    }
  };

  return (
    <div className={`input-container ${className}`}>
      <label>質問: </label>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        autoFocus
      />
    </div>
  );
};

export default InputContainer;