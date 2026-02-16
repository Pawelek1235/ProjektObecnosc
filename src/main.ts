import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import { useAuthStore } from '@/stores/auth'

const app = createApp(App)

// 1️⃣ utwórz pinia
const pinia = createPinia()
app.use(pinia)

// 2️⃣ zainicjalizuj auth store (POZA komponentem)
const auth = useAuthStore(pinia)
await auth.init()

// 3️⃣ router dopiero PO init
app.use(router)

// 4️⃣ mount
app.mount('#app')
