<script setup lang="ts">
const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true
  },
})

const alertClasses: Record<string, string> = {
  error: 'alert-error',
  success: 'alert-success',
  warning: 'alert-warning',
  info: 'alert-info',
}
</script>

<template>
  <div class="toast toast-top toast-center">
    <div class="alert" :class="alertClasses[props.type]">
      <span>{{ props.message }}</span>
    </div>
  </div>
</template>
