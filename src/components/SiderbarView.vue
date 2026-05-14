<script setup lang="ts">
import SidebarItem from './SidebarItem.vue';
</script>

<template>
<div class="drawer lg:drawer-open">
  <input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content flex flex-col items-center justify-center">
    <!-- Page content here -->
    <label for="my-drawer-3" class="btn drawer-button lg:hidden">
      Open drawer
    </label>
  </div>
  <div class="drawer-side">
    <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay"></label>
    <ul class="menu bg-base-200 min-h-full w-80 p-4">
      <!-- Sidebar content here -->
      <SidebarItem link="/dashboard" title="Dashboard"></SidebarItem>
      <SidebarItem link="/companies" title="Companies"></SidebarItem>
      <SidebarItem link="/leads" title="Leads"></SidebarItem>
      <SidebarItem link="/contacts" title="Contacts"></SidebarItem>
      <SidebarItem link="/Tasks" title="Tasks"></SidebarItem>
    </ul>
  </div>
</div>
</template>