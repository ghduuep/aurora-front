<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <li>
    <RouterLink :to="link">{{ props.title }}</RouterLink>
  </li>
</template>
