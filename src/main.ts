import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// TDesign Vue Next
import TDesign from 'tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'

// Remix Icon
import 'remixicon/fonts/remixicon.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(TDesign)

app.mount('#app')
