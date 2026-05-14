<script setup lang="ts">
import SidebarItem from './SidebarItem.vue';
</script>

<template>
  <ul class="menu bg-base-200 min-h-full w-80 p-4">
    <SidebarItem link="/dashboard" title="Dashboard" />
    <SidebarItem link="/companies" title="Companies" />
    <SidebarItem link="/leads" title="Leads" />
    <SidebarItem link="/contacts" title="Contacts" />
    <SidebarItem link="/tasks" title="Tasks" />
    <SidebarItem link="/users" title="Users"/>

  </ul>
</template>
