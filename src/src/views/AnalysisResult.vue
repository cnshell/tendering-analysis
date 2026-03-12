<template>
  <div class="analysis-result">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ name: 'ProjectList' }">项目列表</el-breadcrumb-item>
      <el-breadcrumb-item :to="projectDetailRoute">{{ projectName }}</el-breadcrumb-item>
      <el-breadcrumb-item :to="versionDetailRoute">{{ versionName }}</el-breadcrumb-item>
      <el-breadcrumb-item>分析结果</el-breadcrumb-item>
    </el-breadcrumb>

    <div v-if="result" class="content">
      <!-- 结果概览卡片 -->
      <el-card class="overview-card">
        <template #header>
          <div class="card-header">
            <h2>📊 分析结果概览</h2>
            <div class="header-actions">
              <el-button type="success" @click="exportReport('pdf')">
                <el-icon><Document /></el-icon>
                导出 PDF
              </el-button>
              <el-button type="primary" @click="exportReport('word')">
                <el-icon><Document /></el-icon>
                导出 Word
              </el-button>
              <el-button type="warning" @click="exportCompare">
                <el-icon><DataAnalysis /></el-icon>
                导出对比表
              </el-button>
            </div>
          </div>
        </template>

        <div class="overview-content">
          <div class="score-circle">
            <el-progress
              type="circle"
              :percentage="result.totalScore"
              :width="180"
              :stroke-width="12"
              :color="getScoreColor(result.totalScore)"
            >
              <template #default="{ percentage }">
                <div class="score-text">
                  <span class="score-number">{{ percentage }}</span>
                  <span class="score-unit">分</span>
                </div>
              </template>
            </el-progress>
          </div>
          
          <div class="overview-info">
            <div class="info-item">
              <div class="info-label">项目名称</div>
              <div class="info-value">{{ projectName }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">投标版本</div>
              <div class="info-value">{{ versionName }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">分析时间</div>
              <div class="info-value">{{ analysisTime }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">废标项</div>
              <div class="info-value">
                <el-tag 
                  :type="result.wasteItems?.length > 0 ? 'danger' : 'success'"
                  :class="result.wasteItems?.length > 0 ? 'waste-tag-highlight' : ''"
                  @click="result.wasteItems?.length > 0 && (showWasteDetail = true)"
                  style="cursor: pointer;"
                >
                  {{ result.wasteItems?.length || 0 }} 项
                  <el-icon style="margin-left: 5px;"><WarningFilled /></el-icon>
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 废标项警告 -->
      <el-alert
        v-if="result.wasteItems && result.wasteItems.length > 0"
        title="⚠️ 发现废标项"
        type="error"
        :closable="false"
        show-icon
        class="waste-alert"
      >
        <template #default>
          <el-table :data="result.wasteItems" :fit="false" table-layout="auto" v-table-auto style="width: 100%; margin-top: 15px;">
            <el-table-column type="index" width="50" />
            <el-table-column prop="item" label="废标项" min-width="120" />
            <el-table-column prop="reason" label="原因" min-width="200" />
            <el-table-column prop="severity" label="严重程度" width="100">
              <template #default="{ row }">
                <el-tag :type="row.severity === '严重' ? 'danger' : 'warning'">{{ row.severity }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-alert>

      <!-- 详细得分表格 -->
      <el-card class="scores-card">
        <template #header>
          <h3>📋 详细得分情况</h3>
        </template>

        <el-table :data="result.scores" :fit="false" table-layout="auto" v-table-auto style="width: 100%" stripe>
          <el-table-column prop="name" label="评分项" min-width="150" />
          <el-table-column prop="weight" label="权重" width="80">
            <template #default="{ row }">
              {{ row.weight }}%
            </template>
          </el-table-column>
          <el-table-column prop="score" label="得分" width="80">
            <template #default="{ row }">
              <span :class="getScoreClass(row.score, row.weight)">
                {{ row.score }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="得分率" width="120">
            <template #default="{ row }">
              <el-progress
                :percentage="Math.round((row.score / row.weight) * 100)"
                :stroke-width="16"
                :color="getProgressColor((row.score / row.weight) * 100)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="detail" label="评语" min-width="150" />
          <el-table-column label="改善建议" width="120" fixed="right">
            <template #default="{ row }">
              <el-button 
                type="primary" 
                size="small" 
                link
                @click="showSuggestion(row)"
              >
                <el-icon><Idea /></el-icon>
                查看建议
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 得分可视化图表 -->
      <el-card class="chart-card">
        <template #header>
          <h3>📈 得分可视化</h3>
        </template>

        <div class="chart-container">
          <div class="bar-chart">
            <div
              v-for="item in result.scores"
              :key="item.name"
              class="bar-item"
            >
              <div class="bar-label">{{ item.name }}</div>
              <div class="bar-wrapper">
                <div
                  class="bar"
                  :style="{
                    width: `${(item.score / item.weight) * 100}%`,
                    backgroundColor: getProgressColor((item.score / item.weight) * 100)
                  }"
                >
                  <span class="bar-value">{{ item.score }}/{{ item.weight }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 废标项详情对话框 -->
      <el-dialog v-model="showWasteDetail" title="⚠️ 废标项详情" width="800px">
        <el-alert
          title="以下废标项可能导致投标被否决，请重点关注"
          type="warning"
          :closable="false"
          show-icon
          style="margin-bottom: 20px;"
        />
        <el-table :data="result.wasteItems" :fit="false" table-layout="auto" v-table-auto stripe>
          <el-table-column type="index" label="#" width="50" />
          <el-table-column prop="item" label="废标项" min-width="150" />
          <el-table-column prop="reason" label="原因说明" min-width="250" />
          <el-table-column prop="severity" label="严重程度" width="100">
            <template #default="{ row }">
              <el-tag :type="row.severity === '严重' ? 'danger' : 'warning'">
                {{ row.severity }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>

      <!-- 改善建议对话框 -->
      <el-dialog v-model="showSuggestionDialog" title="💡 改善建议" width="600px">
        <div v-if="currentSuggestion" class="suggestion-content">
          <div class="suggestion-header">
            <h4>{{ currentSuggestion.name }}</h4>
            <div class="score-info">
              得分：<span class="score-num">{{ currentSuggestion.score }}</span> / 
              权重：<span class="weight-num">{{ currentSuggestion.weight }}</span>
            </div>
          </div>
          <el-divider />
          <div class="suggestion-body">
            <div class="suggestion-section">
              <h5>📝 当前评语</h5>
              <p class="detail-text">{{ currentSuggestion.detail }}</p>
            </div>
            <div class="suggestion-section">
              <h5>💡 改善建议</h5>
              <p class="suggestion-text">{{ currentSuggestion.suggestion }}</p>
            </div>
          </div>
        </div>
      </el-dialog>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回版本详情
        </el-button>
        <el-button type="primary" @click="goToProject">
          <el-icon><HomeFilled /></el-icon>
          返回项目列表
        </el-button>
      </div>
    </div>

    <el-empty v-else description="暂无分析结果" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from '../stores/projectStore'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const store = useProjectStore()

const projectId = route.params.projectId
const versionId = route.params.versionId

const projectDetailRoute = computed(() => ({ name: 'ProjectDetail', params: { id: projectId } }))
const versionDetailRoute = computed(() => ({ name: 'VersionDetail', params: { projectId: projectId, versionId: versionId } }))

const project = computed(() => store.getProjectById(projectId))
const projectName = computed(() => project.value?.name || '未知项目')
const version = computed(() => project.value?.versions?.find(v => v.versionId === versionId))
const versionName = computed(() => version.value?.versionName || '未知版本')
const result = computed(() => version.value?.analysisResult)
const analysisTime = computed(() => {
  return new Date().toLocaleString('zh-CN')
})

const showWasteDetail = ref(false)
const showSuggestionDialog = ref(false)
const currentSuggestion = ref(null)

function showSuggestion(row) {
  currentSuggestion.value = row
  showSuggestionDialog.value = true
}

function getScoreColor(score) {
  if (score >= 90) return '#67c23a'
  if (score >= 80) return '#409eff'
  if (score >= 70) return '#e6a23c'
  if (score >= 60) return '#f56c6c'
  return '#909399'
}

function getProgressColor(percentage) {
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 80) return '#409eff'
  if (percentage >= 70) return '#e6a23c'
  if (percentage >= 60) return '#f56c6c'
  return '#909399'
}

function getScoreClass(score, weight) {
  const rate = score / weight
  if (rate >= 0.9) return 'score-excellent'
  if (rate >= 0.8) return 'score-good'
  if (rate >= 0.7) return 'score-normal'
  return 'score-poor'
}

function exportReport(type) {
  ElMessage.success(`正在生成${type.toUpperCase()}报告...`)
  setTimeout(() => {
    ElMessage.success('报告导出成功（Demo 功能）')
  }, 1000)
}

function exportCompare() {
  ElMessage.success('正在生成多版本对比表...')
  setTimeout(() => {
    ElMessage.success('对比表导出成功（Demo 功能）')
  }, 1000)
}

function goBack() {
  router.push(`/project/${projectId}/version/${versionId}`)
}

function goToProject() {
  router.push('/')
}
</script>

<style scoped>
.analysis-result {
  padding: 20px 0;
}

.breadcrumb {
  margin-bottom: 20px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
}

.section-card h3 {
  margin: 0;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.overview-content {
  display: flex;
  gap: 40px;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.score-circle {
  flex-shrink: 0;
}

.score-text {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-number {
  font-size: 36px;
  font-weight: bold;
  color: #303133;
}

.score-unit {
  font-size: 14px;
  color: #909399;
}

.overview-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  text-align: center;
}

.info-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.info-value {
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

/* 废标项高亮样式 */
.waste-tag-highlight {
  font-size: 18px !important;
  font-weight: bold !important;
  padding: 8px 15px !important;
  animation: waste-pulse 2s infinite;
}

@keyframes waste-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(245, 108, 108, 0);
  }
}

.waste-alert {
  margin-top: 10px;
}

/* 废标项表格宽度自适应 - 使用:deep() 穿透 scoped */
.waste-alert :deep(.el-table) {
  width: 100% !important;
  max-width: 100%;
}

.waste-alert :deep(.el-table__body) {
  width: 100% !important;
  table-layout: auto !important;
}

.waste-alert :deep(.el-table__body colgroup col) {
  width: auto !important;
}

/* 详细得分表格宽度自适应 - 使用:deep() 穿透 scoped */
.scores-card :deep(.el-table) {
  width: 100% !important;
  max-width: 100%;
}

.scores-card :deep(.el-table__body) {
  width: 100% !important;
  table-layout: auto !important;
}

.scores-card :deep(.el-table__body colgroup col) {
  width: auto !important;
}

/* 废标项详情对话框表格宽度自适应 */
:deep(.el-dialog) .el-table {
  width: 100% !important;
  max-width: 100%;
}

:deep(.el-dialog) .el-table__body {
  width: 100% !important;
  table-layout: auto !important;
}

:deep(.el-dialog) .el-table__body colgroup col {
  width: auto !important;
}

.chart-card h3 {
  margin: 0;
  font-size: 16px;
}

.chart-container {
  padding: 20px 0;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.bar-label {
  width: 120px;
  text-align: right;
  font-size: 14px;
  color: #606266;
}

.bar-wrapper {
  flex: 1;
  background: #f5f7fa;
  border-radius: 4px;
  height: 32px;
  overflow: hidden;
}

.bar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  transition: width 0.3s ease;
  min-width: 60px;
}

.bar-value {
  color: white;
  font-size: 12px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  padding: 20px 0;
}

.score-excellent {
  color: #67c23a;
  font-weight: 600;
}

.score-good {
  color: #409eff;
  font-weight: 600;
}

.score-normal {
  color: #e6a23c;
  font-weight: 600;
}

.score-poor {
  color: #f56c6c;
  font-weight: 600;
}

.suggestion-content {
  padding: 10px 0;
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.suggestion-header h4 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.score-info {
  font-size: 14px;
  color: #606266;
}

.score-num {
  color: #409eff;
  font-weight: 600;
}

.weight-num {
  color: #67c23a;
  font-weight: 600;
}

.suggestion-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.suggestion-section h5 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 14px;
}

.detail-text {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  color: #606266;
  margin: 0;
}

.suggestion-text {
  padding: 12px;
  background: #ecf5ff;
  border-left: 3px solid #409eff;
  border-radius: 4px;
  color: #303133;
  margin: 0;
  line-height: 1.6;
}
</style>
