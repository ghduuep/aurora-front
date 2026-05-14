import LoginView from '@/components/LoginView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: LoginView,
    },
    {
      path: '/dashboard',
      component: () => import('@/layouts/DefaultLayout.vue')
    }
  ],
})

export default router
