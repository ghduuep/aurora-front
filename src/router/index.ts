import CreateUserForm from '@/components/CreateUserForm.vue'
import LoginView from '@/components/LoginView.vue'
import ViewProfile from '@/components/ViewProfile.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { createRouter, createWebHistory } from 'vue-router'

import ActivitiesView from '@/components/ActivitiesView.vue'
import CompaniesView from '@/components/CompaniesView.vue'
import ContactsView from '@/components/ContactsView.vue'
import LeadsView from '@/components/LeadsView.vue'
import TasksView from '@/components/TasksView.vue'
import PipelineStagesView from '@/components/PipelineStagesView.vue'
import TagsView from '@/components/TagsView.vue'
import UsersView from '@/components/UsersView.vue'

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
      redirect: '/leads',
      children: [
        { path: 'dashboard', redirect: '/leads' },
        { path: 'activities', component: ActivitiesView },
        { path: 'companies', component: CompaniesView },
        { path: 'contacts', component: ContactsView },
        { path: 'leads', component: LeadsView },
        { path: 'tasks', component: TasksView },
        { path: 'pipeline-stages', component: PipelineStagesView },
        { path: 'tags', component: TagsView },
        { path: 'users', component: UsersView },

        { path: 'perfil', component: ViewProfile },
        { path: 'user', component: CreateUserForm },
      ],
    },
  ],
})

export default router
