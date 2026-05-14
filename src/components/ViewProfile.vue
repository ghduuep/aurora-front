<script setup lang="ts">
import { authClient } from '@/lib/auth-client'
import PageHeader from './PageHeader.vue'

const session = authClient.useSession()
</script>

<template>
  <div v-if="session.isPending" class="text-center justify-center flex">
    <span class="loading loading-spinner loading-xl"></span>
  </div>

  <div v-else class="flex justify-center flex-col">
    <PageHeader title="Seu perfil" paragraph="Veja e edita suas informações.">
      <template #actions>
      <button class="btn btn-error">
        Cancelar
      </button>

      <button class="btn btn-info">
        Salvar alterações
      </button>
    </template>
    </PageHeader>

    <div class="flex justify-around gap-4">
    <div class="flex justify-center gap-3 items-center flex-col mt-10">
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
        <p class="text-md font-light">{{ session.data.user.role }}</p>
      </div>

      <input type="file" class="file-input file-input-md" />
    </div>

    <div class="flex flex-col gap-3">
      <h2 class="text-2xl font-bold">Informações Pessoais</h2>
      <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">      
        <label class="label">Nome</label>
        <input type="text" class="input" placeholder="My awesome page" />
      
        <label class="label">E-mail</label>
        <input type="email" class="input" placeholder="my-awesome-page" readonly/>
      
      </fieldset>
    </div>
  </div>
  </div>
</template>
