import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import i18n from './i18n'
import {startQiankun} from './qiankun/index.ts'
createApp(App).use(i18n).mount('#main-app')
startQiankun()
