import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 修复单个表格的宽度
function fixTableWidth(tableContainer) {
  const headerTable = tableContainer.querySelector('.el-table__header')
  const bodyTable = tableContainer.querySelector('.el-table__body')
  
  // 修复表头
  if (headerTable) {
    headerTable.style.setProperty('width', '100%', 'important')
    headerTable.style.setProperty('min-width', '100%', 'important')
    headerTable.style.setProperty('table-layout', 'auto', 'important')
  }
  
  // 修复表体
  if (bodyTable) {
    bodyTable.style.setProperty('width', '100%', 'important')
    bodyTable.style.setProperty('min-width', '100%', 'important')
    bodyTable.style.setProperty('table-layout', 'auto', 'important')
  }
  
  // 移除所有 col 的固定 width 属性
  const cols = tableContainer.querySelectorAll('colgroup col')
  cols.forEach(col => {
    col.removeAttribute('width')
    col.style.setProperty('width', 'auto', 'important')
    col.style.setProperty('min-width', 'auto', 'important')
  })
  
  // 修复 table 元素本身
  const tables = tableContainer.querySelectorAll('table.el-table__header, table.el-table__body')
  tables.forEach(table => {
    table.style.setProperty('width', '100%', 'important')
    table.style.setProperty('min-width', '100%', 'important')
  })
}

// 自定义指令：修复表格宽度
app.directive('table-auto', {
  mounted(el) {
    // 延迟执行，确保表格已渲染
    setTimeout(() => {
      fixTableWidth(el)
      
      // 使用 MutationObserver 持续监控
      const observer = new MutationObserver(() => {
        fixTableWidth(el)
      })
      
      observer.observe(el, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
      })
      
      // 保存 observer 以便清理
      el._tableObserver = observer
    }, 100)
  },
  beforeUnmount(el) {
    if (el._tableObserver) {
      el._tableObserver.disconnect()
    }
  }
})

// 全局修复：页面加载后修复所有表格
function fixAllTables() {
  document.querySelectorAll('.el-table').forEach(table => {
    fixTableWidth(table)
  })
}

// 页面加载完成后执行
window.addEventListener('load', () => {
  setTimeout(fixAllTables, 200)
  // 再次执行确保 SPA 路由切换后的表格也被修复
  setTimeout(fixAllTables, 500)
})

app.use(pinia)
app.use(router)
app.use(ElementPlus, { locale: zhCn })

app.mount('#app')
