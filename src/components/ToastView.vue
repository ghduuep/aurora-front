<script setup lang="ts">
const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'info',
    validator: (value: string) => ['success', 'error', 'warning', 'info'].includes(value),
  },
})
</script>

<template>
  <div class="toast toast-top toast-center">
    <div class="alert" :class="`alert-${props.type}`">
      <span>{{ props.message }}</span>
    </div>
  </div>
</template>
