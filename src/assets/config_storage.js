window.ConfigStorage = {
    saveUserConfig: function(config) {
        try {
            localStorage.setItem('magi_user_config', JSON.stringify(config));
            console.log('💾 配置已保存:', config);
        } catch (e) {
            console.error('保存配置失败:', e);
        }
    },

    getUserConfig: function() {
        try {
            const configString = localStorage.getItem('magi_user_config');
            if (configString) {
                const config = JSON.parse(configString);
                console.log('📂 配置已加载:', config);
                return config;
            }
            return null;
        } catch (e) {
            console.error('加载配置失败:', e);
            return null;
        }
    },

    clearUserConfig: function() {
        try {
            localStorage.removeItem('magi_user_config');
            console.log('🗑️ 配置已清除');
        } catch (e) {
            console.error('清除配置失败:', e);
        }
    }
};