<script setup lang="ts">
import HeaderView from '@/components/HeaderView.vue'
import SiderbarView from '@/components/SiderbarView.vue'
</script>

<template>
  <HeaderView/>

  <div class="drawer lg:drawer-open">
    <input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col min-h-screen p-4">
      <label for="my-drawer-3" class="btn drawer-button lg:hidden">Open drawer</label>

      <main class="flex-1">
        <RouterView />
      </main>
    </div>

    <div class="drawer-side">
      <label for="my-drawer-3" class="drawer-overlay"></label>
      <SiderbarView />
    </div>
  </div>
</template>
