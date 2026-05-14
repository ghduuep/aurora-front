<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  paragraph: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="flex justify-between p-3">
    <div class="flex flex-col gap-2">
      <h1 class="text-4xl font-bold">{{ props.title }}</h1>
      <p class="font-light">{{ props.paragraph }}</p>
    </div>

    <div class="flex gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>
