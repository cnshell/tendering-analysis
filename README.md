# 招投标文档智能分析系统

📋 Tendering Document Intelligent Analysis System

## 项目简介

基于 Vue 3 + Element Plus 的招投标文档智能分析系统，提供：

- 📄 投标文件解析
- ✅ 废标项检测
- 📊 智能评分分析
- 📈 可视化报表
- 📑 多版本对比

## 技术栈

- **Frontend**: Vue 3 + Vite
- **UI Framework**: Element Plus
- **State Management**: Pinia
- **Router**: Vue Router

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 项目结构

```
tendering/
├── src/
│   ├── src/              # 源代码
│   │   ├── views/        # 页面组件
│   │   ├── components/   # 公共组件
│   │   ├── stores/       # Pinia 状态管理
│   │   ├── router/       # 路由配置
│   │   └── main.js       # 入口文件
│   ├── dist/             # 构建输出
│   └── package.json
└── README.md
```

## 功能特性

### 1. 项目列表管理
- 创建和管理投标项目
- 多版本支持
- 状态跟踪

### 2. 文档分析
- 自动解析投标文件
- 提取关键信息
- 识别废标项

### 3. 智能评分
- 多维度评分
- 权重配置
- 得分可视化

### 4. 报表导出
- PDF 报告
- Word 文档
- 对比表格

## License

MIT
