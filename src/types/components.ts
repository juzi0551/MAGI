/**
 * 组件Props接口定义
 */

import { ReactNode } from 'react';
import { WiseManName, WiseManStatus, SystemStatus, FinalStatus } from './ai';
import { HistoryRecord } from './history';

// 基础组件Props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// MAGI系统根组件Props
export interface MagiSystemProps extends BaseComponentProps {
  // 无额外props，作为应用根组件
}

// MAGI容器组件Props
export interface MagiContainerProps extends BaseComponentProps {
  status: SystemStatus;
}

// 贤者组件Props
export interface WiseManProps {
  name: WiseManName;
  status: WiseManStatus;
  orderNumber: 1 | 2 | 3;
  onClick?: () => void;
  className?: string;
  isAnimating?: boolean;
}

// 响应组件Props
export interface ResponseProps {
  status: FinalStatus | 'standby' | 'processing';
  finalDecision?: string;
  className?: string;
}

// 状态组件Props
export interface StatusProps {
  refreshTrigger?: number;
  systemStatus: SystemStatus;
  currentQuestion?: string;
  className?: string;
}

// 标题组件Props
export interface HeaderProps {
  side: 'left' | 'right';
  title: string;
  className?: string;
}

// 输入容器组件Props
export interface InputContainerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (question: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

// 错误边界组件Props
export interface ErrorBoundaryProps extends BaseComponentProps {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

// 错误边界状态
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// 加载组件Props
export interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

// 模态框基础Props
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

// 按钮组件Props
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// 输入框组件Props
export interface InputProps {
  type?: 'text' | 'password' | 'email' | 'url';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

// 选择框组件Props
export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

// 滑块组件Props
export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  showValue?: boolean;
  className?: string;
}

// 开关组件Props
export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

// 工具提示组件Props
export interface TooltipProps extends BaseComponentProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
}

// 通知组件Props
export interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  className?: string;
}

// 确认对话框Props
export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

// 贤者回答显示组件Props
export interface WiseAnswerDisplayProps {
  name: WiseManName;
  status: WiseManStatus;
  response: string;
  conditions?: string[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  className?: string;
}

// 系统状态指示器Props
export interface SystemStatusIndicatorProps {
  status: SystemStatus;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

// 历史记录模态框Props
export interface HistoryModalProps {
  isOpen: boolean;
  record: HistoryRecord | null;
  onClose: () => void;
  className?: string;
}