<template>
  <div class="app-container">
    <el-header class="app-header">
      <div class="header-content">
        <h1 class="app-title">📋 招投标文档智能分析系统</h1>
        <div class="header-info">
          <el-tag type="info">Demo 版</el-tag>
        </div>
      </div>
    </el-header>
    
    <el-main class="app-main">
      <router-view />
    </el-main>
    
    <el-footer class="app-footer">
      <p>招投标文档智能分析系统 v1.1 Demo | 基于需求规格说明书开发</p>
    </el-footer>
  </div>
</template>

<script setup>
</script>

<!-- 全局样式 - 覆盖 Element Plus 表格固定宽度 -->
<style>
/* 表格整体宽度 - 最高优先级 */
.el-table,
table.el-table__header,
table.el-table__body {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 100% !important;
  table-layout: auto !important;
}

/* 表头和表体 */
.el-table__header-wrapper table,
.el-table__body-wrapper table {
  width: 100% !important;
  min-width: 100% !important;
  table-layout: auto !important;
}

/* 强制覆盖 col 的 width 属性 - 使用属性选择器 */
.el-table col[width],
.el-table__header col[width],
.el-table__body col[width] {
  width: auto !important;
  min-width: auto !important;
}

/* 单元格 */
.el-table .el-table__cell {
  min-width: auto !important;
  width: auto !important;
}
</style>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.app-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.app-main {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.app-footer {
  background-color: #545c64;
  color: #c0c4cc;
  text-align: center;
  padding: 15px;
  font-size: 14px;
}

.app-footer p {
  margin: 0;
}
</style>
