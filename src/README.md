# 招投标文档智能分析系统 - Demo 版

基于需求规格说明书 v1.1 开发的前端演示版本。

## 技术栈

- **框架**: Vue 3 + Vite
- **UI 库**: Element Plus
- **路由**: Vue Router
- **状态管理**: Pinia
- **HTTP**: Axios

## 功能实现

### ✅ 已实现页面

1. **项目列表页** (`/`)
   - 项目卡片展示
   - 创建新项目
   - 项目状态显示（初建/就绪/分析中/部分完成/全部完成）
   - 队列位置和预计等待时间

2. **项目详情页** (`/project/:id`)
   - 招标文件上传（单次上传，验证通过后不可修改）
   - 招标文件验证预览（评分指标数量、废标条件）
   - **招标文件详情弹窗**（分栏显示评分指标和废标条件）
   - 投标版本管理（创建、版本号校验）
   - 版本状态可视化（颜色编码）
   - 分析队列信息展示

3. **版本详情页** (`/project/:projectId/version/:versionId`)
   - 文件上传（支持多文件、断点续传模拟）
   - 文件大小限制校验（单文件≤300MB，单版本≤1GB）
   - 分析控制（启动分析、强制结束、重新分析）
   - 分析进度展示（文档解析→指标提取→内容比对→结果生成）

4. **分析结果页** (`/project/:projectId/version/:versionId/result`)
   - 综合得分展示（圆形进度条）
   - 废标项警告
   - **废标项详情弹窗**（点击废标项数量查看详细信息）
   - 详细得分表格（权重、得分、得分率、评语）
   - **改善建议列**（每行可查看针对性改善建议）
   - 得分可视化条形图
   - 导出功能（PDF/Word/Excel 对比表）

### 🎯 Mock 数据特性

- 模拟真实的分析队列等待
- 模拟分析进度（每 2 秒更新 10%）
- 模拟招标文件验证（2 秒延迟）
- 模拟文件上传进度
- 随机生成分析结果

## 快速开始

### 1. 安装依赖

```bash
cd /root/.openclaw/workspace/tendering/src
npm install
```

### 2. 开发模式

```bash
npm run dev
```

访问：http://localhost:5173/tendering/

### 3. 生产构建

```bash
npm run build
```

构建输出：`/root/.openclaw/workspace/tendering/src/dist/`

### 4. Nginx 配置

```bash
# 复制配置文件
sudo cp /root/.openclaw/workspace/tendering/nginx/tendering.conf /etc/nginx/conf.d/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo nginx -s reload
```

访问：http://127.0.0.1/tendering/

## 目录结构

```
tendering/
├── src/                    # 前端源代码
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.js         # 入口文件
│       ├── App.vue         # 根组件
│       ├── router/         # 路由配置
│       │   └── index.js
│       ├── stores/         # Pinia 状态管理
│       │   └── projectStore.js
│       ├── views/          # 页面组件
│       │   ├── ProjectList.vue
│       │   ├── ProjectDetail.vue
│       │   ├── VersionDetail.vue
│       │   └── AnalysisResult.vue
│       └── components/     # 可复用组件（预留）
├── nginx/
│   └── tendering.conf      # Nginx 配置
└── requirements/
    └── 招投标文档智能分析系统需求规格说明书 v1.1.md
```

## 需求覆盖对照

| 需求章节 | 实现状态 | 说明 |
|---------|---------|------|
| 3.1 项目管理 | ✅ | 创建、状态管理 |
| 3.2 文件管理 | ✅ | 招标文件单次上传、版本管理 |
| 3.3 文件验证 | ✅ | 格式验证、内容验证 Mock |
| 3.4 分析控制 | ✅ | 队列管理、手动触发 |
| 3.5 分析执行 | ✅ | 进度展示、检查点 Mock |
| 3.6 错误处理 | ✅ | 错误提示 UI |
| 3.7 用户反馈 | ✅ | 队列位置、预计等待 |
| 6.1 页面结构 | ✅ | 所有页面 |
| 6.2 状态可视化 | ✅ | 颜色编码、按钮状态 |

## 注意事项

1. **Demo 限制**: 本版本为纯前端 Demo，数据存储在内存中，刷新页面会重置
2. **Mock 数据**: 分析结果、验证结果均为随机生成
3. **Nginx 配置**: 需要先构建项目（`npm run build`）才能通过 Nginx 访问
4. **端口冲突**: 开发模式默认使用 5173 端口

## 后续扩展

- 对接真实后端 API
- 实现文件真实上传（分片、断点续传）
- 集成文档解析服务
- 实现智能评分算法
- 添加用户认证（单用户密码验证）
