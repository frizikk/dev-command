import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'

// Basic router setup (will expand later)
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('./views/CommandView.vue') // Placeholder
        }
    ]
})

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
