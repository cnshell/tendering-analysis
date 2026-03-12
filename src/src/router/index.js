import { createRouter, createWebHashHistory } from 'vue-router'

import ProjectList from '../views/ProjectList.vue'
import ProjectDetail from '../views/ProjectDetail.vue'
import VersionDetail from '../views/VersionDetail.vue'
import AnalysisResult from '../views/AnalysisResult.vue'

const routes = [
  {
    path: '/',
    name: 'ProjectList',
    component: ProjectList
  },
  {
    path: '/project/:id',
    name: 'ProjectDetail',
    component: ProjectDetail
  },
  {
    path: '/project/:projectId/version/:versionId',
    name: 'VersionDetail',
    component: VersionDetail
  },
  {
    path: '/project/:projectId/version/:versionId/result',
    name: 'AnalysisResult',
    component: AnalysisResult
  }
]

const router = createRouter({
  routes,
  history: createWebHashHistory()
})

export default router
