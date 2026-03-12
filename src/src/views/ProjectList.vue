<template>
  <div class="project-list">
    <div class="page-header">
      <h2>项目列表</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        创建新项目
      </el-button>
    </div>

    <!-- 项目列表 -->
    <el-row :gutter="20" class="project-cards">
      <el-col :span="8" v-for="project in projects" :key="project.id">
        <el-card class="project-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="project-name">{{ project.name }}</span>
              <el-tag :type="getStatusType(project.status)">{{ getStatusText(project.status) }}</el-tag>
            </div>
          </template>
          
          <div class="card-content">
            <div class="info-row">
              <el-icon><Clock /></el-icon>
              <span>创建时间：{{ project.createdAt }}</span>
            </div>
            <div class="info-row">
              <el-icon><Document /></el-icon>
              <span>招标文件：{{ project.tenderFile?.verified ? '已验证' : '未上传' }}</span>
            </div>
            <div class="info-row">
              <el-icon><Files /></el-icon>
              <span>投标版本：{{ project.versions.length }} 个</span>
            </div>
            
            <!-- 队列信息 -->
            <div v-if="project.status === 'analyzing' && project.versions.some(v => v.queueInfo)" class="queue-info">
              <el-alert
                title="分析队列中"
                type="info"
                :closable="false"
                show-icon
              >
                <template #default>
                  <div v-for="version in project.versions" :key="version.versionId" v-if="version.queueInfo">
                    版本 {{ version.versionName }}: 排队位置 #{{ version.queueInfo.position }}
                    <br>
                    预计等待：约{{ version.queueInfo.estimatedWait }}分钟
                  </div>
                </template>
              </el-alert>
            </div>
          </div>
          
          <template #footer>
            <el-button type="primary" link @click="goToProject(project.id)">
              查看详情
            </el-button>
          </template>
        </el-card>
      </el-col>
    </el-row>

    <!-- 空状态 -->
    <el-empty v-if="projects.length === 0" description="暂无项目，创建一个开始吧" />

    <!-- 创建项目对话框 -->
    <el-dialog v-model="showCreateDialog" title="创建新项目" width="500px">
      <el-form :model="newProject" label-width="80px">
        <el-form-item label="项目名称" required>
          <el-input v-model="newProject.name" placeholder="请输入项目名称" maxlength="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateProject">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '../stores/projectStore'
import { ElMessage } from 'element-plus'

const router = useRouter()
const store = useProjectStore()

const projects = computed(() => {
  return store.projects.map(p => ({
    ...p,
    status: store.getProjectStatus(p)
  }))
})

const showCreateDialog = ref(false)
const newProject = ref({ name: '' })

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

function goToProject(id) {
  router.push(`/project/${id}`)
}

function handleCreateProject() {
  if (!newProject.value.name.trim()) {
    ElMessage.warning('请输入项目名称')
    return
  }
  
  // 检查名称唯一性
  const exists = store.projects.some(p => p.name === newProject.value.name)
  if (exists) {
    ElMessage.error('项目名称已存在，请使用其他名称')
    return
  }
  
  store.createProject(newProject.value.name)
  ElMessage.success('项目创建成功')
  showCreateDialog.value = false
  newProject.value.name = ''
}
</script>

<style scoped>
.project-list {
  padding: 20px 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.project-cards {
  margin-top: 20px;
}

.project-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-name {
  font-weight: 600;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70%;
}

.card-content {
  min-height: 120px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: #606266;
  font-size: 14px;
}

.queue-info {
  margin-top: 15px;
}
</style>
