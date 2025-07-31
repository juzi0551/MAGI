# MAGI 决策模拟系统

基于《新世纪福音战士》中的超级计算机系统设计的Web应用，通过三个不同人格（科学家、母亲、女人）对用户问题进行分析和决策。

## 技术栈

- **前端框架**: React 18.2 + TypeScript 5.2
- **构建工具**: Vite 5.0
- **状态管理**: React Context API
- **样式方案**: CSS Modules + CSS变量
- **测试框架**: Jest + React Testing Library

## 开发环境

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

### 运行测试

```bash
npm run test
```

### 代码检查

```bash
npm run lint
```

## 项目结构

```
src/
├── components/          # 组件
│   ├── common/          # 通用组件
│   ├── layout/          # 布局组件
│   └── magi/            # MAGI系统特有组件
├── context/             # React Context
├── hooks/               # 自定义Hooks
├── services/            # 服务层
├── styles/              # 样式文件
│   ├── base/            # 基础样式
│   └── components/      # 组件样式
├── types/               # TypeScript类型定义
├── utils/               # 工具函数
├── assets/              # 项目资源
├── App.tsx              # 应用入口组件
└── main.tsx             # 应用入口文件
```

## 功能特性

- ✅ 基础架构搭建完成
- 🚧 三贤者AI问答系统（开发中）
- 🚧 多AI服务提供商支持（开发中）
- 🚧 历史记录管理（开发中）
- 🚧 音频效果系统（开发中）
- 🚧 响应式设计（开发中）

## 开发进度

当前正在进行：项目基础架构搭建

## 许可证

MIT License