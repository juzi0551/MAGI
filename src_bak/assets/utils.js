// 这个文件作为工具类的入口点
// 注意：不使用import语法，而是在HTML中通过script标签按顺序加载工具类文件

// 确保工具类已正确加载
window.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 MAGI工具类已加载');
  
  // 检查各个工具类是否可用
  if (window.AiService) {
    console.log('✅ AiService 已加载');
  } else {
    console.error('❌ AiService 未加载');
  }
  
  if (window.ConfigStorage) {
    console.log('✅ ConfigStorage 已加载');
  } else {
    console.error('❌ ConfigStorage 未加载');
  }
  
  if (window.HistoryStorage) {
    console.log('✅ HistoryStorage 已加载');
  } else {
    console.error('❌ HistoryStorage 未加载');
  }
});
