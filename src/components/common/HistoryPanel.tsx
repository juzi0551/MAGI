import { useState } from 'react';
import { HistoryPanelProps, HistoryRecord } from '../../types';

/**
 * 历史记录面板组件 - 参考原MAGI项目设计
 * 支持折叠/展开、点击查看详情、清空历史记录
 */
const HistoryPanel = ({ 
  records = [], 
  onRecordDetail, 
  onClearHistory,
  className = '' 
}: HistoryPanelProps) => {
  const [collapsed, setCollapsed] = useState(true);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

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
    return statusMap[status as keyof typeof statusMap] || '待 機';
  };

  const getStatusClass = (status: string): string => {
    return `status-tag status-${status}`;
  };

  const handleItemClick = (record: HistoryRecord, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onRecordDetail) {
      onRecordDetail({
        ...record,
        _clickTimestamp: Date.now()
      });
    }
  };

  const handleClearHistory = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('确定要清空所有历史记录吗？')) {
      if (onClearHistory) {
        onClearHistory();
      }
    }
  };

  return (
    <div className={`history-panel ${collapsed ? 'collapsed' : ''} ${className}`}>
      {/* 标题栏 */}
      <div className="history-header" onClick={toggleCollapse}>
        {/* 左侧区域：箭头和标题 */}
        <div className="header-left-section" onClick={toggleCollapse}>
          <button
            className="toggle-history-btn"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse();
            }}
          >
            {collapsed ? '▲' : '▼'}
          </button>
          <span className="history-title">📚 履歴</span>
        </div>

        {/* 右侧区域：清空按钮 - 只在展开状态下显示 */}
        {!collapsed && (
          <button
            className="clear-history-btn"
            onClick={handleClearHistory}
          >
            清空
          </button>
        )}
      </div>

      {/* 历史记录列表 - 只在非折叠状态下显示 */}
      {!collapsed && (
        <div className="history-list">
          {records.length === 0 ? (
            <div className="no-history">暫 無</div>
          ) : (
            records.slice().reverse().map((record) => (
              <div
                key={record.id}
                className="history-item"
                onClick={(e) => handleItemClick(record, e)}
                title="点击查看详情"
              >
                <div className="history-item-header">
                  <span className="history-time">
                    🕐 {formatTimestamp(record.timestamp)}
                  </span>
                  <span className={getStatusClass(record.finalStatus)}>
                    {getStatusText(record.finalStatus)}
                  </span>
                </div>
                <div className="history-question">
                  問題: {record.question}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;