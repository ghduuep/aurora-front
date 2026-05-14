import LoginView from '@/components/LoginView.vue'
import ViewProfile from '@/components/ViewProfile.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: LoginView,
    },
    {
      path: '/',
      component: DefaultLayout,
      children: [{ path: 'perfil', component: ViewProfile }],
    },
  ],
})

export default router
