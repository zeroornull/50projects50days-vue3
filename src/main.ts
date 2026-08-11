import dayjs from 'dayjs'
import { createApp, vaporInteropPlugin } from 'vue'

import App from './App.vue'
import { router } from './router'

import '@fortawesome/fontawesome-free/css/all.min.css'
import './styles/init.css'
import './mock'

const DEFAULT_DOCUMENT_TITLE = '50 Projects'

router.afterEach((to, _, failure) => {
  if (failure)
    return

  const title = to.meta.title
  globalThis.document.title = typeof title === 'string' && title.trim() ? title : DEFAULT_DOCUMENT_TITLE
})

const app = createApp(App)

dayjs.locale('zh-cn')
app.config.globalProperties.dayjs = dayjs
app.use(router).use(vaporInteropPlugin).mount('#app')
