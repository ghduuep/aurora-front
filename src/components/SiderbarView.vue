<script setup lang="ts">
import { authClient } from '@/lib/auth-client'
import SidebarItem from './SidebarItem.vue'

const session = authClient.useSession()
</script>

<template>
  <ul class="menu bg-base-200 min-h-full w-80 p-4">
    <SidebarItem link="/dashboard" title="Dashboard" />
    <SidebarItem link="/users" title="Users" v-if="session.data?.user.role === 'admin'"/>
    <SidebarItem link="/companies" title="Companies" />
    <SidebarItem link="/leads" title="Leads" />
    <SidebarItem link="/contacts" title="Contacts" />
    <SidebarItem link="/tasks" title="Tasks" />
    <SidebarItem link="/activities" title="Activities" />
    <SidebarItem link="/pipeline-stages" title="Pipeline Stages" />
    <SidebarItem link="/tags" title="Tags" />
  </ul>
</template>
