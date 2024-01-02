import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'ant-design-vue/dist/reset.css';
import Antd from 'ant-design-vue';
// highlight 的样式，依赖包，组件
import 'highlight.js/styles/atom-one-dark.css'
import 'highlight.js/styles/an-old-hope.min.css'
import 'highlight.js/styles/stackoverflow-light.min.css'
import 'highlight.js/lib/common'
import hljsVuePlugin from '@highlightjs/vue-plugin'
import App from './pages/App.vue'
import router from './router'


const app = createApp(App)
app.use(Antd)
app.use(createPinia())
app.use(router)
//注册组件
app.use(hljsVuePlugin)

app.mount('#app')
