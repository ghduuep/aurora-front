<script setup lang="ts">
import { reactive } from 'vue'
import PageHeader from './PageHeader.vue'
import { computed, ref } from 'vue'
import { authClient } from '@/lib/auth-client'

const form = reactive({
  name: '',
  password: '',
  email: '',
  image: '',
})

const isSaving = ref(false)
const error = ref('')

const hasChanges = computed(() => {
  return (
    form.name !== '' ||
    form.email !== '' ||
    form.password !== '' ||
    form.image !== ''
  )
})

const isFormComplete = computed(() => {
  return (
    form.name !== '' &&
    form.email !== '' &&
    form.password !== '' ||
    form.image !== ''
  )
})

function cancelChanges() {
  form.name = ''
  form.email = ''
  form.password = ''
  form.image = ''
}

async function createUser() {
  error.value = ''

  try {
    isSaving.value = true

    const res = await authClient.signUp.email({
      name: form.name,
      email: form.email,
      password: form.password,
      image: form.image,
    })

    console.log(res.error)

    if (res.error) {
      error.value = res.error.message || 'Erro ao criar usuário'
    }
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <PageHeader title="Novo usuário" paragraph="Crie aqui um novo usuário para acessar o Aurora">
    <template #actions>
      <button class="btn btn-error" v-if="hasChanges" @click="cancelChanges">Cancelar</button>

      <button class="btn btn-info" :disabled="isSaving || !isFormComplete" @click="createUser">
        Salvar alterações
      </button>
    </template>
  </PageHeader>

  <form class="flex justify-center mt-10">
    <fieldset
      class="fieldset bg-base-200 border-base-300 rounded-box w-xl border p-6 gap-4 flex flex-col items-center"
    >
      <div class="avatar avatar-placeholder justify-center">
        <div class="bg-neutral text-neutral-content w-24 rounded-full">
          <span class="text-xl">{{ form.name.charAt(0).toUpperCase() }}</span>
        </div>
      </div>

      <input type="file" class="file-input file-input-md" accept="image/*" />
      <label class="label input">
        <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g
            stroke-linejoin="round"
            stroke-linecap="round"
            stroke-width="2.5"
            fill="none"
            stroke="currentColor"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </g>
        </svg>
        <input
          type="text"
          required
          placeholder="Nome"
          title="Only letters, numbers or dash"
          v-model="form.name"
        />
      </label>

      <label class="label input validator">
        <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g
            stroke-linejoin="round"
            stroke-linecap="round"
            stroke-width="2.5"
            fill="none"
            stroke="currentColor"
          >
            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
          </g>
        </svg>
        <input type="email" placeholder="mail@site.com" required v-model="form.email" />
      </label>
      <div class="validator-hint hidden">Enter valid email address</div>

      <label class="label input validator">
        <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g
            stroke-linejoin="round"
            stroke-linecap="round"
            stroke-width="2.5"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
            ></path>
            <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
          </g>
        </svg>
        <input
          type="password"
          required
          placeholder="Password"
          minlength="8"
          pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
          title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
          v-model="form.password"
        />
      </label>
      <p class="validator-hint hidden">
        Must be more than 8 characters, including
        <br />At least one number <br />At least one lowercase letter <br />At least one uppercase
        letter
      </p>
    </fieldset>
  </form>
</template>
