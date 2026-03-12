<template>
  <div class="version-detail">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ name: 'ProjectList' }">项目列表</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ name: 'ProjectDetail', params: { id: projectId } }">{{ projectName }}</el-breadcrumb-item>
      <el-breadcrumb-item>版本详情</el-breadcrumb-item>
    </el-breadcrumb>

    <div v-if="version" class="content">
      <!-- 版本信息卡片 -->
      <el-card class="version-info-card">
        <template #header>
          <div class="card-header">
            <h2>{{ version.versionName }}</h2>
            <el-tag :type="getStatusType(version.status)">
              {{ getStatusText(version.status) }}
            </el-tag>
          </div>
        </template>
        <div class="info-row">
          <span class="label">版本 ID：</span>
          <span>{{ version.versionId }}</span>
        </div>
        <div class="info-row">
          <span class="label">所属项目：</span>
          <span>{{ projectName }}</span>
        </div>
      </el-card>

      <!-- 文件上传区域 -->
      <el-card class="section-card">
        <template #header>
          <h3>📎 投标文件</h3>
        </template>

        <div v-if="version.status === 'waiting_upload' || version.status === 'upload_complete'" class="upload-section">
          <el-upload
            drag
            :auto-upload="false"
            :on-change="handleFileChange"
            :show-file-list="false"
            :disabled="uploading"
            multiple
            accept=".doc,.docx,.pdf,.wps"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 Word/PDF/WPS 格式 | 单文件≤300MB | 单版本总文件≤1GB | 支持断点续传
              </div>
            </template>
          </el-upload>
          
          <div v-if="uploading" class="upload-progress">
            <el-progress :percentage="uploadProgress" :status="uploadStatus" />
          </div>
        </div>

        <!-- 文件列表 -->
        <div v-if="version.files && version.files.length > 0" class="file-list">
          <h4>已上传文件</h4>
          <el-table :data="version.files" style="width: 100%">
            <el-table-column prop="name" label="文件名" />
            <el-table-column prop="size" label="大小" width="120">
              <template #default="{ row }">
                {{ formatSize(row.size) }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.uploaded" type="success" size="small">已完成</el-tag>
                <el-tag v-else type="info" size="small">上传中</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" v-if="version.status === 'upload_complete'">
              <template #default="{ row, $index }">
                <el-button type="danger" size="small" link @click="deleteFile($index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="file-summary">
            共 {{ version.files.length }} 个文件，
            总计 {{ formatSize(totalSize) }} / 1GB
          </div>
        </div>
      </el-card>

      <!-- 分析控制区域 -->
      <el-card class="section-card" v-if="version.files && version.files.length > 0">
        <template #header>
          <h3>🚀 分析控制</h3>
        </template>

        <div class="analysis-control">
          <!-- 等待上传状态 -->
          <el-alert
            v-if="version.status === 'waiting_upload'"
            title="请先上传投标文件"
            type="info"
            :closable="false"
            show-icon
          />

          <!-- 上传完成状态 -->
          <div v-if="version.status === 'upload_complete'" class="ready-to-analyze">
            <el-alert
              title="文件上传完成，可以启动分析"
              type="success"
              :closable="false"
              show-icon
            />
            <el-button type="primary" size="large" @click="startAnalysis" class="analyze-btn">
              <el-icon><VideoPlay /></el-icon>
              启动分析
            </el-button>
          </div>

          <!-- 排队中状态 -->
          <div v-if="version.status === 'queued'" class="queued-info">
            <el-result icon="info" title="排队中" :sub-title="`当前位置：#${version.queueInfo?.position} | 预计等待：约${version.queueInfo?.estimatedWait}分钟`">
              <template #extra>
                <el-progress :percentage="0" :format="() => '等待分析...'" />
              </template>
            </el-result>
          </div>

          <!-- 分析中状态 -->
          <div v-if="version.status === 'analyzing'" class="analyzing-info">
            <el-progress
              :percentage="version.analysisProgress || 0"
              :format="percentage => `${percentage}%`"
              :stroke-width="24"
            />
            <div class="analysis-stages">
              <el-tag :type="getStageType(0)">文档解析</el-tag>
              <el-tag :type="getStageType(25)">指标提取</el-tag>
              <el-tag :type="getStageType(50)">内容比对</el-tag>
              <el-tag :type="getStageType(75)">结果生成</el-tag>
            </div>
            <el-button type="danger" @click="forceStop" class="stop-btn">
              <el-icon><CircleClose /></el-icon>
              强制结束
            </el-button>
          </div>

          <!-- 分析完成状态 -->
          <div v-if="version.status === 'analysis_complete'" class="complete-info">
            <el-result icon="success" title="分析完成" :sub-title="`综合得分：${version.analysisResult?.totalScore}分`">
              <template #extra>
                <el-button type="primary" @click="viewResult">
                  <el-icon><Document /></el-icon>
                  查看详细结果
                </el-button>
                <el-button type="success">
                  <el-icon><Download /></el-icon>
                  导出报告
                </el-button>
              </template>
            </el-result>
          </div>

          <!-- 分析失败状态 -->
          <div v-if="version.status === 'analysis_failed'" class="failed-info">
            <el-result icon="error" title="分析失败" sub-title="用户强制终止">
              <template #extra>
                <el-button type="primary" @click="startAnalysis">
                  <el-icon><Refresh /></el-icon>
                  重新分析
                </el-button>
              </template>
            </el-result>
          </div>
        </div>
      </el-card>
    </div>
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

const projectId = route.params.projectId
const versionId = route.params.versionId

const project = computed(() => store.getProjectById(projectId))
const projectName = computed(() => project.value?.name || '未知项目')
const version = computed(() => {
  return project.value?.versions?.find(v => v.versionId === versionId)
})

const uploading = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref(null)

function getStatusType(status) {
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

function getStatusText(status) {
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

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB'
}

const totalSize = computed(() => {
  return version.value?.files?.reduce((sum, f) => sum + f.size, 0) || 0
})

function getStageType(progress) {
  const current = version.value?.analysisProgress || 0
  if (current >= progress + 25) return 'success'
  if (current >= progress) return 'warning'
  return 'info'
}

function handleFileChange(file) {
  if (!version.value) return
  
  // 验证文件大小
  const maxSize = 300 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error('单文件大小不能超过 300MB')
    return
  }
  
  // 验证总大小
  const newTotal = totalSize.value + file.size
  const maxTotal = 1024 * 1024 * 1024
  if (newTotal > maxTotal) {
    ElMessage.error('单版本总文件大小不能超过 1GB')
    return
  }
  
  // 模拟上传
  uploading.value = true
  uploadProgress.value = 0
  
  const interval = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(interval)
      uploading.value = false
      
      // 添加文件到列表
      if (!version.value.files) version.value.files = []
      version.value.files.push({
        name: file.name,
        size: file.size,
        uploaded: true
      })
      
      version.value.status = 'upload_complete'
      ElMessage.success('文件上传成功')
    }
  }, 200)
}

function deleteFile(index) {
  if (version.value?.files) {
    version.value.files.splice(index, 1)
    if (version.value.files.length === 0) {
      version.value.status = 'waiting_upload'
    }
    ElMessage.success('文件已删除')
  }
}

function startAnalysis() {
  const result = store.startAnalysis(projectId, versionId)
  if (result) {
    ElMessage.success('已加入分析队列')
  }
}

function forceStop() {
  if (version.value) {
    version.value.status = 'analysis_failed'
    ElMessage.info('分析已强制结束')
  }
}

function viewResult() {
  router.push(`/project/${projectId}/version/${versionId}/result`)
}
</script>

<style scoped>
.version-detail {
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

.info-row {
  margin-bottom: 10px;
  color: #606266;
}

.info-row .label {
  font-weight: 600;
  color: #303133;
}

.upload-section {
  padding: 10px 0;
}

.upload-progress {
  margin-top: 20px;
}

.file-list {
  margin-top: 20px;
}

.file-list h4 {
  margin-bottom: 15px;
  color: #303133;
}

.file-summary {
  margin-top: 15px;
  text-align: right;
  color: #606266;
  font-size: 14px;
}

.analysis-control {
  padding: 20px 0;
}

.ready-to-analyze {
  text-align: center;
}

.analyze-btn {
  margin-top: 20px;
  padding: 20px 40px;
  font-size: 16px;
}

.queued-info, .analyzing-info, .complete-info, .failed-info {
  padding: 20px 0;
}

.analysis-stages {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
}

.stop-btn {
  margin-top: 20px;
}
</style>
