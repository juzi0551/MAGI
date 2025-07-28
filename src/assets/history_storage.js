// 历史记录localStorage工具函数
const STORAGE_KEY = 'magi_question_history';

const HistoryStorage = {
    // 保存记录到localStorage
    saveRecord: (record) => {
        try {
            const existingData = HistoryStorage.getStorageData();
            existingData.records.push(record);
            existingData.lastUpdated = Date.now();
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
            return true;
        } catch (error) {
            console.error('保存历史记录失败:', error);
            return false;
        }
    },

    // 获取所有记录
    getRecords: () => {
        try {
            const data = HistoryStorage.getStorageData();
            return data.records || [];
        } catch (error) {
            console.error('获取历史记录失败:', error);
            return [];
        }
    },

    // 清空所有记录
    clearAll: () => {
        try {
            const emptyData = {
                version: "1.0",
                records: [],
                lastUpdated: Date.now()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyData));
            return true;
        } catch (error) {
            console.error('清空历史记录失败:', error);
            return false;
        }
    },

    // 获取存储数据结构
    getStorageData: () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                // 确保数据结构正确
                if (data && Array.isArray(data.records)) {
                    return data;
                }
            }
        } catch (error) {
            console.error('解析历史记录数据失败:', error);
        }
        
        // 返回默认结构
        return {
            version: "1.0",
            records: [],
            lastUpdated: Date.now()
        };
    },

    // 检查localStorage是否可用
    isAvailable: () => {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }
};

// 导出到全局作用域，供Python回调使用
window.HistoryStorage = HistoryStorage;

// HistoryStorage已经导出到window.HistoryStorage，不需要ES6 export
