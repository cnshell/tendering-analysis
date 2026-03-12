import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProjectStore = defineStore('project', () => {
  // Mock 项目数据
  const projects = ref([
    {
      id: '1',
      name: '智慧城市监控系统采购项目',
      createdAt: '2026-03-10 10:00:00',
      tenderFile: {
        uploaded: true,
        verified: true,
        name: '招标文件 - 智慧城市监控系统.docx',
        indicators: 15,
        wasteConditions: 3,
        indicatorDetails: [
          { name: '技术方案完整性', weight: 20, criteria: '方案需包含系统架构、功能模块、技术路线' },
          { name: '硬件配置要求', weight: 15, criteria: '摄像头分辨率≥400 万像素，存储容量≥100TB' },
          { name: '软件功能', weight: 15, criteria: '支持人脸识别、车辆识别、行为分析' },
          { name: '系统性能', weight: 10, criteria: '响应时间≤2 秒，并发用户≥500' },
          { name: '安全要求', weight: 10, criteria: '支持国密算法，通过等保 2.0 三级认证' },
          { name: '实施计划', weight: 8, criteria: '工期≤90 天，分阶段交付' },
          { name: '培训方案', weight: 5, criteria: '提供不少于 3 次现场培训' },
          { name: '售后服务', weight: 7, criteria: '7×24 小时响应，2 小时到场' },
          { name: '企业资质', weight: 5, criteria: '具备电子与智能化工程专业承包一级' },
          { name: '项目经验', weight: 5, criteria: '近 3 年类似项目≥3 个' }
        ],
        wasteConditionDetails: [
          { item: '营业执照过期', severity: '严重', reason: '投标人营业执照有效期不足 6 个月' },
          { item: '资质证书缺失', severity: '严重', reason: '未提供有效的安全生产许可证' },
          { item: '业绩造假', severity: '严重', reason: '提供的合同业绩经查证为虚假信息' }
        ]
      },
      versions: [
        {
          versionId: 'v1',
          versionName: 'v1.0 初稿',
          status: 'analysis_complete',
          files: [
            { name: '技术方案.docx', size: 15 * 1024 * 1024, uploaded: true },
            { name: '商务报价.pdf', size: 5 * 1024 * 1024, uploaded: true }
          ],
          analysisResult: {
            totalScore: 87.5,
            wasteItems: [
              { item: '技术参数偏离', reason: '摄像头分辨率仅 300 万像素，低于要求的 400 万像素', severity: '一般' },
              { item: '培训次数不足', reason: '仅提供 2 次现场培训，低于要求的 3 次', severity: '一般' }
            ],
            scores: [
              { name: '技术方案', weight: 40, score: 36, detail: '方案完整，技术路线清晰', suggestion: '建议补充系统容灾备份方案，增加应急预案章节，完善系统扩展性说明' },
              { name: '项目实施', weight: 20, score: 18, detail: '实施计划合理', suggestion: '建议细化各阶段里程碑，增加人员配置计划，明确验收标准' },
              { name: '售后服务', weight: 15, score: 13.5, detail: '服务承诺良好', suggestion: '建议增加培训次数至 3 次，补充远程技术支持方案，明确备件供应周期' },
              { name: '企业资质', weight: 15, score: 15, detail: '资质齐全', suggestion: '资质条件完全满足，无需改进' },
              { name: '报价合理性', weight: 10, score: 5, detail: '报价略高于预算', suggestion: '建议优化设备选型，考虑国产化替代方案，调整部分非核心配置' }
            ]
          }
        },
        {
          versionId: 'v2',
          versionName: 'v1.1 修订版',
          status: 'upload_complete',
          files: [
            { name: '技术方案 - 修订版.docx', size: 16 * 1024 * 1024, uploaded: true }
          ]
        }
      ]
    },
    {
      id: '2',
      name: '办公设备采购项目',
      createdAt: '2026-03-11 09:00:00',
      tenderFile: null,
      versions: []
    }
  ])

  // 分析队列 Mock 数据
  const analysisQueue = ref([])
  const currentAnalysis = ref(null)

  // 计算属性
  const getProjectById = computed(() => {
    return (id) => projects.value.find(p => p.id === id)
  })

  const getProjectStatus = computed(() => {
    return (project) => {
      if (!project.tenderFile?.verified || project.versions.length === 0) return 'initial'
      const hasAnalyzing = project.versions.some(v => v.status === 'analyzing')
      const hasCompleted = project.versions.some(v => v.status === 'analysis_complete')
      const hasUnfinished = project.versions.some(v => v.status !== 'analysis_complete')
      
      if (hasAnalyzing) return 'analyzing'
      if (hasCompleted && hasUnfinished) return 'partial_complete'
      if (hasCompleted) return 'complete'
      return 'ready'
    }
  })

  // 方法
  function createProject(name) {
    const newProject = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toLocaleString('zh-CN'),
      tenderFile: null,
      versions: []
    }
    projects.value.push(newProject)
    return newProject
  }

  function uploadTenderFile(projectId, file) {
    const project = projects.value.find(p => p.id === projectId)
    if (project && !project.tenderFile?.verified) {
      // Mock 验证过程
      project.tenderFile = {
        uploaded: true,
        verifying: true,
        name: file.name
      }
      // 模拟验证延迟
      setTimeout(() => {
        project.tenderFile.verifying = false
        project.tenderFile.verified = true
        project.tenderFile.indicators = Math.floor(Math.random() * 10) + 5
        project.tenderFile.wasteConditions = Math.floor(Math.random() * 3) + 1
      }, 2000)
      return true
    }
    return false
  }

  function createVersion(projectId, versionName) {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      // 检查版本号唯一性
      const exists = project.versions.some(v => v.versionName === versionName)
      if (exists) return null
      
      const newVersion = {
        versionId: `v${Date.now()}`,
        versionName,
        status: 'waiting_upload',
        files: []
      }
      project.versions.push(newVersion)
      return newVersion
    }
    return null
  }

  function uploadVersionFiles(projectId, versionId, files) {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      const version = project.versions.find(v => v.versionId === versionId)
      if (version) {
        version.files = files.map(f => ({
          name: f.name,
          size: f.size,
          uploaded: true
        }))
        version.status = 'upload_complete'
        return true
      }
    }
    return false
  }

  function startAnalysis(projectId, versionId) {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      const version = project.versions.find(v => v.versionId === versionId)
      if (version) {
        // 加入队列
        const queueItem = {
          projectId,
          projectName: project.name,
          versionId,
          versionName: version.versionName,
          position: analysisQueue.value.length + 1,
          estimatedWait: analysisQueue.value.length * 5 // 每个任务约 5 分钟
        }
        analysisQueue.value.push(queueItem)
        version.status = 'queued'
        version.queueInfo = queueItem
        return queueItem
      }
    }
    return null
  }

  function simulateAnalysisProgress() {
    // 模拟分析进度
    if (currentAnalysis.value) {
      currentAnalysis.value.progress = (currentAnalysis.value.progress || 0) + 10
      if (currentAnalysis.value.progress >= 100) {
        // 分析完成
        const project = projects.value.find(p => p.id === currentAnalysis.value.projectId)
        if (project) {
          const version = project.versions.find(v => v.versionId === currentAnalysis.value.versionId)
          if (version) {
            version.status = 'analysis_complete'
            version.analysisResult = {
              totalScore: Math.floor(Math.random() * 20) + 75,
              wasteItems: [],
              scores: [
                { name: '技术方案', weight: 40, score: Math.floor(Math.random() * 10) + 30, detail: '方案完整' },
                { name: '项目实施', weight: 20, score: Math.floor(Math.random() * 5) + 15, detail: '计划合理' },
                { name: '售后服务', weight: 15, score: Math.floor(Math.random() * 5) + 10, detail: '服务良好' },
                { name: '企业资质', weight: 15, score: Math.floor(Math.random() * 5) + 10, detail: '资质齐全' },
                { name: '报价合理性', weight: 10, score: Math.floor(Math.random() * 3) + 5, detail: '报价合理' }
              ]
            }
          }
        }
        currentAnalysis.value = null
        analysisQueue.value.shift()
      }
    } else if (analysisQueue.value.length > 0) {
      // 开始新任务
      currentAnalysis.value = {
        ...analysisQueue.value[0],
        progress: 0,
        stage: 'document_parsing'
      }
      const project = projects.value.find(p => p.id === currentAnalysis.value.projectId)
      if (project) {
        const version = project.versions.find(v => v.versionId === currentAnalysis.value.versionId)
        if (version) {
          version.status = 'analyzing'
          version.analysisProgress = 0
        }
      }
    }
  }

  // 定时模拟分析进度
  setInterval(simulateAnalysisProgress, 2000)

  return {
    projects,
    analysisQueue,
    currentAnalysis,
    getProjectById,
    getProjectStatus,
    createProject,
    uploadTenderFile,
    createVersion,
    uploadVersionFiles,
    startAnalysis
  }
})
