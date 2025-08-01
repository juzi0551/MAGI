# MAGI 决策系统


基于《新世纪福音战士》中的超级计算机系统设计的Web应用，通过三个不同人格的贤者（Melchior、Balthasar、Casper）对用户问题进行分析和决策。

本项目致力于还原动画中MAGI系统的视觉效果和交互体验，结合现代AI技术，为用户提供独特的决策辅助工具。界面设计参考了多个优秀的EVA同人项目，音效系统模拟了原作中的经典声音，力求为EVA粉丝带来沉浸式的体验。

## 🌐 在线体验

**体验地址**: [https://magi.ai123.win/](https://magi.ai123.win/)

> 💡 **提示**: 如遇到服务器睡眠状态，请稍等片刻等待服务启动。首次访问可能需要1分钟的等待启动时间。

## ✨ 功能特性

- 🤖 **三贤者AI问答系统** - 支持多种AI提供商（openrouter【测】，deepseek【测】OpenAI、Claude、Gemini等）
- 🎨 **EVA原作风格界面** - 完整还原动画中的MAGI系统视觉效果
- 📱 **响应式设计** - 桌面端完整支持，移动端适配优化中
- 📚 **历史记录管理** - 完整的问答历史记录和详情查看
- 🔊 **音频效果系统** - 不同决策状态的音频反馈
- ⚙️ **灵活配置** - 支持多AI提供商切换和个性化设置

## 🚀 技术栈

### 核心技术
- **前端框架**: React 18.2 + TypeScript 5.2
- **构建工具**: Vite 5.0
- **状态管理**: React Context API
- **样式方案**: CSS变量 + 模块化CSS
- **测试框架**: Jest + React Testing Library
- **音频处理**: Web Audio API
- **部署平台**: Render

### 设计资源
- **界面设计**: 参考TomaszRewak/MAGI项目的界面布局
- **音效系统**: 基于itorr/magi项目的声音方案
- **字体资源**: 使用EVA标题字体增强视觉效果
- **图标设计**: 采用EVA风格图标系统

## 📦 快速开始

### 🚀 直接体验
访问 [在线演示](https://magi.ai123.win/) 立即体验MAGI决策系统，无需安装任何软件。

### 💻 本地开发

#### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run serve
```

### 运行测试

```bash
# 运行测试
npm run test

# 监听模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

### 代码检查

```bash
# 检查代码
npm run lint

# 自动修复
npm run lint:fix

# TypeScript类型检查
npm run type-check
```

## 📁 项目结构

```
src/
├── components/          # React组件
│   ├── common/          # 通用组件（模态框、输入框等）
│   ├── layout/          # 布局组件（系统主框架）
│   └── magi/            # MAGI系统核心组件
├── context/             # React Context状态管理
│   ├── ConfigContext.tsx    # 配置管理
│   ├── MagiContext.tsx      # 核心系统状态
│   ├── HistoryContext.tsx   # 历史记录管理
│   └── AudioContext.tsx     # 音频控制
├── hooks/               # 自定义Hooks
│   ├── useLocalStorage.ts   # 本地存储
│   ├── useMagiAudio.ts      # 音频效果
│   └── useConfig.ts         # 配置管理
├── services/            # 服务层
│   ├── ai/              # AI服务集成
│   └── storage/         # 数据存储服务
├── styles/              # 样式文件
│   ├── base/            # 基础样式（重置、变量、字体）
│   └── components/      # 组件样式
├── types/               # TypeScript类型定义
├── assets/              # 静态资源
│   ├── images/          # 图片资源
│   └── audio/           # 音频资源
├── App.tsx              # 应用根组件
└── main.tsx             # 应用入口
```

## 🎯 功能状态

### ✅ 已完成功能
- **基础架构** - React + Vite + TypeScript项目搭建
- **UI系统** - EVA风格界面设计（桌面端）
- **三贤者系统** - 完整的MAGI视觉界面和交互
- **AI集成** - 多AI提供商支持和问答处理
- **状态管理** - Context-based状态管理系统
- **配置系统** - 用户配置和API密钥管理
- **历史记录** - 完整的历史记录存储和UI
- **音频效果** - Web Audio API音效系统

### 🚧 开发中功能
- **响应式设计** - 移动端和平板适配优化
- **错误处理** - 完善的错误处理和用户反馈
- **性能优化** - 代码分割和懒加载
- **测试覆盖** - 单元测试和集成测试

### 📱 移动端适配状态
- **桌面端** - ✅ 完全支持
- **平板端** - 🚧 基础适配完成，需要优化
- **移动端** - 🚧 基础适配完成，需要进一步优化

## 🗺️ 开发路线图

### 近期计划 (v1.1)
- [ ] 完善移动端响应式设计
- [ ] 优化平板端用户体验
- [ ] 实现完整的错误处理系统
- [ ] 添加性能优化和代码分割

### 中期计划 (v1.2)
- [ ] 增加更多AI提供商支持
- [ ] 实现主题切换功能
- [ ] 添加用户偏好设置
- [ ] 完善测试覆盖率

### 长期计划 (v2.0)
- [ ] 多语言支持
- [ ] 离线模式支持
- [ ] PWA功能
- [ ] 数据导出/导入功能

## ⚙️ 配置说明

### AI提供商配置

系统支持以下AI提供商：
- OpenAI (GPT-3.5/GPT-4)
- Anthropic Claude
- Google Gemini
- 其他兼容OpenAI API的服务

在设置面板中配置相应的API密钥即可使用。

### 音频设置

- 支持启用/禁用音频效果
- 可调节音量大小
- 不同决策状态有对应的音频反馈

## 🚀 部署

### 当前部署状态
- **生产环境**: [https://magi.ai123.win/](https://magi.ai123.win/) (Render平台)
- **部署状态**: ✅ 正常运行
- **更新频率**: 跟随主分支自动部署

### Render平台部署

项目已配置为可直接部署到Render平台：

1. 连接GitHub仓库到Render
2. 选择Static Site类型
3. 配置构建设置：
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

### 其他平台部署

项目构建后的`dist`目录可部署到任何静态托管服务：
- Render（演示地址所在服务器）
- Vercel
- Netlify  
- GitHub Pages
- 阿里云OSS
- 腾讯云COS

## 🤝 贡献指南

1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📄 许可证

本项目保留所有权利。未经明确授权，不得用于商业用途。

### 使用条款
- ✅ **个人学习和研究** - 允许个人非商业用途的学习和研究
- ✅ **开源贡献** - 欢迎提交改进建议和bug修复
- ❌ **商业使用** - 未经授权不得用于任何商业目的
- ❌ **二次分发** - 不得重新分发或销售本项目代码

### 商业授权
如需商业使用，请联系作者获取商业授权许可。

**联系方式**: [在此添加你的联系方式]

## 🙏 致谢

### 原作与设定
- 《新世纪福音战士》原作设定
- GAINAX/khara 动画制作公司

### 参考项目
- **MAGI核心界面**: [TomaszRewak/MAGI](https://github.com/TomaszRewak/MAGI) - 提供了MAGI系统界面设计灵感
- **声音方案**: [itorr/magi](https://github.com/itorr/magi) - 音频效果和声音设计参考
- **EVA字体**: [itorr/eva-title](https://github.com/itorr/eva-title) - EVA标题字体资源
- **EVA图标**: [moeoverflow/EVA-icon](https://github.com/moeoverflow/EVA-icon) - EVA风格图标设计


---

---

**重要提示**: 
- 本项目仅供个人学习和研究使用
- 未经授权不得用于商业用途
- 请遵守相关AI服务提供商的使用条款
- 如需商业使用请联系作者获取授权