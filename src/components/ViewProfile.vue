<script setup lang="ts">
import { authClient } from '@/lib/auth-client'

const session = authClient.useSession()
</script>

<template>
  <div v-if="session.isPending" class="text-center justify-center flex">
    <span class="loading loading-spinner loading-xl"></span>
  </div>

  <div v-else-if="session.data" class="flex justify-center gap-3 items-center flex-col">
    <div class="avatar" v-if="session.data.user.image">
      <div class="w-24 rounded-full">
        <img :src="session.data.user.image" />
      </div>
    </div>

    <div class="avatar avatar-placeholder" v-else>
      <div class="bg-neutral text-neutral-content w-24 rounded-full">
        <span class="text-xl">{{ session.data.user.name.charAt(0) }}</span>
      </div>
    </div>

    <div class="flex flex-col gap-2 text-center">
      <h2 class="text-xl font-semibold">{{ session.data.user.name }}</h2>
      <p class="text-md font-light">{{session.data.user.role}}</p>
    </div>

    <input type="file" class="file-input file-input-md" />

    <input type="text" :placeholder="session.data.user.email" class="input" disabled />
  </div>
</template>
