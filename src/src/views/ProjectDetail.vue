<template>
  <div class="project-detail">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ name: 'ProjectList' }">项目列表</el-breadcrumb-item>
      <el-breadcrumb-item>项目详情</el-breadcrumb-item>
    </el-breadcrumb>

    <div v-if="project" class="content">
      <!-- 项目信息卡片 -->
      <el-card class="project-info-card">
        <template #header>
          <div class="card-header">
            <h2>{{ project.name }}</h2>
            <el-tag :type="getStatusType(projectStatus)">{{ getStatusText(projectStatus) }}</el-tag>
          </div>
        </template>
        <div class="info-row">
          <span class="label">创建时间：</span>
          <span>{{ project.createdAt }}</span>
        </div>
        <div class="info-row">
          <span class="label">项目 ID：</span>
          <span>{{ project.id }}</span>
        </div>
      </el-card>

      <!-- 招标文件区域 -->
      <el-card class="section-card">
        <template #header>
          <div class="section-header">
            <h3>📄 招标文件</h3>
            <el-tag v-if="project.tenderFile?.verified" type="success">已验证通过，不可修改</el-tag>
          </div>
        </template>
        
        <div v-if="!project.tenderFile" class="upload-area">
          <el-upload
            drag
            :auto-upload="false"
            :on-change="handleTenderFileChange"
            :show-file-list="false"
            accept=".doc,.docx,.pdf,.wps"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 Word/PDF/WPS 格式，单个文件最大 300MB
              </div>
            </template>
          </el-upload>
        </div>
        
        <div v-else-if="project.tenderFile.verifying" class="verifying-area">
          <el-result icon="loading" title="验证中" sub-title="正在检查招标文件内容..." />
        </div>
        
        <div v-else class="tender-file-info">
          <div class="file-info">
            <el-icon><Document /></el-icon>
            <span class="file-name">{{ project.tenderFile.name }}</span>
          </div>
          <div class="indicator-preview">
            <el-alert
              :title="`检测到${project.tenderFile.indicators}个评分指标，${project.tenderFile.wasteConditions}个废标条件`"
              type="success"
              :closable="false"
              show-icon
            >
              <template #default>
                <el-button type="primary" link size="small" @click="showTenderDetail = true">
                  查看详情
                </el-button>
              </template>
            </el-alert>
          </div>
        </div>
      </el-card>

      <!-- 投标版本区域 -->
      <el-card class="section-card">
        <template #header>
          <div class="section-header">
            <h3>📁 投标版本</h3>
            <el-button type="primary" size="small" @click="showCreateVersionDialog = true">
              <el-icon><Plus /></el-icon>
              创建版本
            </el-button>
          </div>
        </template>

        <!-- 版本列表 -->
        <div v-if="project.versions.length > 0" class="version-list">
          <div
            v-for="version in project.versions"
            :key="version.versionId"
            class="version-item"
            :class="`version-${version.status}`"
          >
            <div class="version-header">
              <span class="version-name">{{ version.versionName }}</span>
              <el-tag :type="getVersionStatusType(version.status)">
                {{ getVersionStatusText(version.status) }}
              </el-tag>
            </div>
            
            <div class="version-content">
              <div class="file-count">
                <el-icon><Files /></el-icon>
                <span>{{ version.files?.length || 0 }} 个文件</span>
              </div>
              
              <!-- 队列信息 -->
              <div v-if="version.status === 'queued'" class="queue-info">
                <el-alert
                  title="排队中"
                  type="info"
                  :closable="false"
                  show-icon
                >
                  排队位置：#{{ version.queueInfo?.position }} | 
                  预计等待：约{{ version.queueInfo?.estimatedWait }}分钟
                </el-alert>
              </div>
              
              <!-- 分析进度 -->
              <div v-if="version.status === 'analyzing'" class="progress-info">
                <el-progress :percentage="version.analysisProgress || 0" :stroke-width="20">
                  <template #default="{ percentage }">
                    <span class="percentage-value">{{ percentage }}%</span>
                  </template>
                </el-progress>
                <div class="progress-stages">
                  <el-tag size="small" :type="getStageType('parsing', version)">文档解析</el-tag>
                  <el-tag size="small" :type="getStageType('extracting', version)">指标提取</el-tag>
                  <el-tag size="small" :type="getStageType('comparing', version)">内容比对</el-tag>
                  <el-tag size="small" :type="getStageType('generating', version)">结果生成</el-tag>
                </div>
              </div>
            </div>
            
            <div class="version-actions">
              <el-button 
                v-if="version.status === 'upload_complete'" 
                type="primary" 
                size="small"
                @click="startAnalysis(version)"
              >
                启动分析
              </el-button>
              <el-button 
                v-if="version.status === 'analysis_complete'" 
                type="success" 
                size="small"
                @click="viewResult(version)"
              >
                查看结果
              </el-button>
              <el-button 
                v-if="version.status === 'analysis_failed'" 
                type="warning" 
                size="small"
                @click="retryAnalysis(version)"
              >
                重新分析
              </el-button>
              <el-button 
                v-if="version.status === 'analyzing'" 
                type="danger" 
                size="small"
                @click="forceStop(version)"
              >
                强制结束
              </el-button>
              <el-button 
                size="small"
                @click="goToVersion(version)"
              >
                详情
              </el-button>
            </div>
          </div>
        </div>
        
        <el-empty v-else description="暂无投标版本，创建一个开始吧" />
      </el-card>
    </div>

    <!-- 招标文件详情对话框 -->
    <el-dialog v-model="showTenderDetail" title="📋 招标文件详情" width="900px">
      <el-tabs>
        <el-tab-pane label="评分指标" :label="`评分指标 (${project.tenderFile?.indicatorDetails?.length || 0})`">
          <el-table :data="project.tenderFile?.indicatorDetails || []" stripe>
            <el-table-column type="index" label="#" width="50" />
            <el-table-column prop="name" label="指标名称" width="200" />
            <el-table-column prop="weight" label="权重" width="80">
              <template #default="{ row }">
                <el-tag size="small">{{ row.weight }}%</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="criteria" label="评分标准" />
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="废标条件" :label="`废标条件 (${project.tenderFile?.wasteConditionDetails?.length || 0})`">
          <el-table :data="project.tenderFile?.wasteConditionDetails || []" stripe>
            <el-table-column type="index" label="#" width="50" />
            <el-table-column prop="item" label="废标项" width="200" />
            <el-table-column prop="severity" label="严重程度" width="100">
              <template #default="{ row }">
                <el-tag :type="row.severity === '严重' ? 'danger' : 'warning'" size="small">
                  {{ row.severity }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="判定标准" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 创建版本对话框 -->
    <el-dialog v-model="showCreateVersionDialog" title="创建投标版本" width="500px">
      <el-form :model="newVersion" label-width="80px">
        <el-form-item label="版本号" required>
          <el-input 
            v-model="newVersion.versionName" 
            placeholder="如：v1.0、初稿、2026-03-10 修订版"
            maxlength="50"
          />
          <div class="form-tip">
            长度≤50 字符，禁止包含 /\:*?"<>| 等特殊字符
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateVersionDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateVersion">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from '../stores/projectStore'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const store = useProjectStore()

const project = computed(() => store.getProjectById(route.params.id))
const projectStatus = computed(() => project.value ? store.getProjectStatus(project.value) : 'initial')

const showTenderDetail = ref(false)
const showCreateVersionDialog = ref(false)
const newVersion = ref({ versionName: '' })

function getStatusType(status) {
  const types = {
    initial: 'info',
    ready: 'success',
    analyzing: 'warning',
    partial_complete: 'primary',
    complete: 'success'
  }
  return types[status] || 'info'
}

function getStatusText(status) {
  const texts = {
    initial: '初建',
    ready: '就绪',
    analyzing: '分析中',
    partial_complete: '部分完成',
    complete: '全部完成'
  }
  return texts[status] || status
}

function getVersionStatusType(status) {
  const types = {
    waiting_upload: 'info',
    uploading: 'primary',
    upload_complete: 'success',
    queued: 'info',
    analyzing: 'warning',
    analysis_complete: 'success',
    analysis_failed: 'danger'
  }
  return types[status] || 'info'
}

function getVersionStatusText(status) {
  const texts = {
    waiting_upload: '等待上传',
    uploading: '上传中',
    upload_complete: '上传完成',
    queued: '排队中',
    analyzing: '分析中',
    analysis_complete: '分析完成',
    analysis_failed: '分析失败'
  }
  return texts[status] || status
}

function getStageType(stage, version) {
  const progress = version.analysisProgress || 0
  if (stage === 'parsing' && progress >= 25) return 'success'
  if (stage === 'extracting' && progress >= 50) return 'success'
  if (stage === 'comparing' && progress >= 75) return 'success'
  if (stage === 'generating' && progress >= 100) return 'success'
  if (progress === 0) return 'info'
  return 'warning'
}

function handleTenderFileChange(file) {
  if (!project.value) return
  
  // 验证文件大小
  const maxSize = 300 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error('文件大小超出限制（最大 300MB）')
    return
  }
  
  store.uploadTenderFile(project.value.id, file)
  ElMessage.success('招标文件上传成功，正在验证...')
}

function handleCreateVersion() {
  if (!newVersion.value.versionName.trim()) {
    ElMessage.warning('请输入版本号')
    return
  }
  
  // 验证特殊字符
  const invalidChars = /[\/\\:*?"<>|]/
  if (invalidChars.test(newVersion.value.versionName)) {
    ElMessage.error('版本号不能包含特殊字符：/ \\ : * ? " < > |')
    return
  }
  
  const result = store.createVersion(project.value.id, newVersion.value.versionName)
  if (result) {
    ElMessage.success('版本创建成功')
    showCreateVersionDialog.value = false
    newVersion.value.versionName = ''
  } else {
    ElMessage.error('版本号已存在，请使用其他名称')
  }
}

function startAnalysis(version) {
  const result = store.startAnalysis(project.value.id, version.versionId)
  if (result) {
    ElMessage.success('已加入分析队列')
  }
}

function viewResult(version) {
  router.push(`/project/${project.value.id}/version/${version.versionId}/result`)
}

function retryAnalysis(version) {
  startAnalysis(version)
}

function forceStop(version) {
  version.status = 'analysis_failed'
  ElMessage.info('分析已强制结束')
}

function goToVersion(version) {
  router.push(`/project/${project.value.id}/version/${version.versionId}`)
}
</script>

<style scoped>
.project-detail {
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
}

.info-row {
  margin-bottom: 10px;
  color: #606266;
}

.info-row .label {
  font-weight: 600;
  color: #303133;
}

.upload-area {
  padding: 20px 0;
}

.verifying-area {
  padding: 20px 0;
}

.tender-file-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #606266;
}

.file-name {
  font-weight: 500;
}

.version-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.version-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  background: #fff;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.version-name {
  font-weight: 600;
  font-size: 16px;
}

.version-content {
  margin-bottom: 15px;
}

.file-count {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #606266;
  font-size: 14px;
  margin-bottom: 10px;
}

.queue-info, .progress-info {
  margin-top: 10px;
}

.progress-stages {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.version-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>
