import { useState, useEffect } from 'react';
import { HistoryModalProps } from '../../types';
import { WiseManAnswer } from '../../types/ai';

// 为了保持代码一致性，创建WiseAnswer别名
type WiseAnswer = WiseManAnswer;

/**
 * 历史记录详情模态框组件 - 参考原MAGI项目设计
 * 显示问题、最终决策和三贤者的详细回答
 */
const HistoryModal = ({
  isOpen,
  record,
  onClose,
  className = ''
}: HistoryModalProps) => {
  const [expandedAnswers, setExpandedAnswers] = useState<Record<number, boolean>>({});

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  // 背景点击关闭
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 切换回答展开状态
  const toggleAnswerExpand = (index: number) => {
    setExpandedAnswers(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // 文本截断函数
  const truncateText = (text: string, maxLength: number = 200): string => {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // 时间格式化
  const formatTimestamp = (timestamp: number): string => {
    try {
      if (!timestamp) return '未知时间';
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '无效时间';
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('时间格式化错误:', error);
      return '格式化失败';
    }
  };

  // 状态文本获取
  const getStatusText = (status: string): string => {
    const statusMap = {
      'yes': '可 決',
      'no': '否 決',
      'conditional': '状 態',
      'info': '情 報',
      'error': '誤 差',
      'standby': '待 機',
      'progress': '審議中'
    };
    return statusMap[status as keyof typeof statusMap] || '未知状态';
  };

  // 贤者名称获取
  const getWiseManName = (name: string): string => {
    const nameMap = {
      'melchior': 'MELCHIOR-1 (科學家)',
      'balthasar': 'MELCHIOR-1 (母親)',
      'casper': 'CASPER-3 (女人)'
    };
    return nameMap[name as keyof typeof nameMap] || (name ? name.toUpperCase() : '未知贤者');
  };

  if (!isOpen || !record) {
    return null;
  }

  return (
    <div
      className={`modal-content history-modal-content ${className}`}
      onClick={handleBackgroundClick}
    >
      <div className="modal-inner" onClick={(e) => e.stopPropagation()}>
        {/* 模态框标题 */}
        <div className="modal-header">
          <div className="modal-title">📚 历史记录详情</div>
          <div
            className="close"
            onClick={onClose}
            title="ESC键也可关闭"
          >
            ×
          </div>
        </div>

        {/* 模态框内容 */}
        <div className="modal-body history-modal-body">
          {/* 问题信息 */}
          <div className="history-section">
            <div className="section-title">問題:</div>
            <div className="section-content">
              {record.question || '无问题内容'}
            </div>
            <div className="question-time">
              時間: {formatTimestamp(record.timestamp)}
            </div>
          </div>

          {/* 最终决策 */}
          <div className="history-section">
            <div className="section-title">最終決策:</div>
            <div className={`decision-status status-${record.finalStatus || 'info'}`}>
              {getStatusText(record.finalStatus || 'info')}
            </div>
          </div>

          {/* 贤者回答 */}
          <div className="history-section">
            <div className="section-title">賢者回答:</div>
            <div className="answers-list">
              {record.answers && record.answers.length > 0 ? (
                record.answers.map((answer: WiseAnswer, index: number) => {
                  const answerText = answer.response || '无回答';
                  const isExpanded = expandedAnswers[index];
                  const shouldTruncate = answerText.length > 200;
                  const displayText = shouldTruncate && !isExpanded
                    ? truncateText(answerText, 200)
                    : answerText;

                  return (
                    <div key={`answer-${index}`} className="wise-answer-item">
                      <div className="wise-header">
                        <div className="wise-name">
                          {getWiseManName(answer.name)}
                        </div>
                        <div className={`wise-status status-${answer.status || 'info'}`}>
                          {getStatusText(answer.status || 'info')}
                        </div>
                      </div>
                      <div className="wise-response">{displayText}</div>

                      {/* 条件回答显示 */}
                      {answer.status === 'conditional' && answer.conditions && Array.isArray(answer.conditions) && answer.conditions.length > 0 && (
                        <div className="wise-conditions">
                          <div className="conditions-title">附加条件:</div>
                          <ul className="conditions-list">
                            {answer.conditions.map((condition: string, condIndex: number) => (
                              <li key={condIndex} className="condition-item">
                                {condition}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 展开/收起按钮 */}
                      {shouldTruncate && (
                        <button
                          className="expand-btn"
                          onClick={() => toggleAnswerExpand(index)}
                        >
                          {isExpanded ? '收起 ▲' : '展开更多 ▼'}
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="no-answers">暂无贤者回答数据</div>
              )}
            </div>
          </div>
        </div>

        {/* 底部关闭按钮 */}
        <div className="modal-footer">
          <button className="modal-close-btn" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;