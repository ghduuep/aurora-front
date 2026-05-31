<script setup lang="ts">
import { authClient } from '@/lib/auth-client'
import PageHeader from './PageHeader.vue'
import { reactive, watchEffect, ref, computed } from 'vue'
import LoadingView from './LoadingView.vue'
import ToastView from './ToastView.vue'

const session = authClient.useSession()

const form = reactive({
  name: '',
  email: '',
  image: '',
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

watchEffect(() => {
  if (session.value) {
    form.name = session.value.data?.user.name || ''
    form.email = session.value.data?.user.email || ''
  }
})

const hasProfileChanges = computed(() => {
  const user = session.value.data?.user
  if (!user) return false
  return (
    form.name !== (user.name || '') ||
    form.email !== (user.email || '') ||
    form.image !== (user.image || '')
  )
})

const hasPasswordChanges = computed(() => {
  return (
    passwordForm.currentPassword.length > 0 ||
    passwordForm.newPassword.length > 0 ||
    passwordForm.confirmPassword.length > 0
  )
})

const isPasswordFormValid = computed(() => {
  if (!hasPasswordChanges.value) return true
  return (
    passwordForm.currentPassword.length > 0 &&
    passwordForm.newPassword.length > 0 &&
    passwordForm.confirmPassword.length > 0 &&
    passwordMatch.value
  )
})

const passwordMatch = computed(() => {
  return passwordForm.newPassword === passwordForm.confirmPassword
})

const isSaving = ref(false)

const error = ref('')
const success = ref('')

function cancelChanges() {
  const user = session.value.data?.user

  if (!user) return
  form.name = user.name || ''
  form.email = user.email || ''
  form.image = user.image || ''
  passwordForm.confirmPassword = ''
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
}

async function saveProfile() {
  error.value = ''
  success.value = ''

  try {
    isSaving.value = true

    if (hasProfileChanges.value) {
      const payload: { name?: string; image?: string } = {}

      if (form.name !== session.value.data?.user.name) payload.name = form.name
      if (form.image !== session.value.data?.user.image) payload.image = form.image

      const response = await authClient.updateUser(payload)
      if (response.error) {
        error.value = response.error.message || 'Ocorreu um erro ao atualizar o perfil'
        return
      }
    }

    if (hasPasswordChanges.value && isPasswordFormValid.value) {
      const response = await authClient.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })

      if (response.error) {
        error.value = response.error.message || 'Ocorreu um erro ao alterar a senha'
        return
      }

      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    }

    success.value = 'Perfil atualizado com sucesso'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <LoadingView v-if="session.isPending" />

  <div v-else class="flex justify-center flex-col">
    <ToastView v-if="error" type="error" :message="error" />
    <ToastView v-if="success" type="success" :message="success" />

    <PageHeader title="Seu perfil" paragraph="Veja e edita suas informações.">
      <template #actions>
        <button
          class="btn btn-error"
          v-if="hasProfileChanges || hasPasswordChanges"
          @click="cancelChanges"
        >
          Cancelar
        </button>

        <button
          class="btn btn-info"
          :disabled="
            isSaving || (!hasProfileChanges && !hasPasswordChanges) || !isPasswordFormValid
          "
          @click="saveProfile"
        >
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
          <p class="text-md font-light">Cargo: {{ session.data.user.role }}</p>
        </div>

        <input type="file" class="file-input file-input-md" accept="image/*" />
      </div>

      <div class="flex flex-col gap-3">
        <h2 class="text-2xl font-bold">Informações Pessoais</h2>
        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
          <label class="label">Nome</label>
          <input type="text" class="input" v-model="form.name" />

          <label class="label">E-mail</label>
          <input type="email" class="input" v-model="form.email" disabled />
        </fieldset>

        <fieldset
          class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 grid grid-cols-1 gap-2"
        >
          <legend class="fieldset-legend">Alterar Senha</legend>

          
          <div class="w-full">
            <label class="label p-0 pb-1 text-xs">Senha atual</label>
            <label class="input validator w-full">
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
                minlength="8"
                pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                v-model="passwordForm.currentPassword"
              />
            </label>
            
            <p class="validator-hint hidden text-[11px] mt-1">
              Mais de 8 caracteres (1 número, 1 maiúscula, 1 minúscula)
            </p>
          </div>

          
          <div class="w-full">
            <label class="label p-0 pb-1 text-xs">Nova senha</label>
            <label class="input validator w-full">
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
                minlength="8"
                pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                v-model="passwordForm.newPassword"
              />
            </label>
            <p class="validator-hint hidden text-[11px] mt-1">
              Mais de 8 caracteres (1 número, 1 maiúscula, 1 minúscula)
            </p>
          </div>

          
          <div class="w-full">
            <label class="label p-0 pb-1 text-xs">Confirme nova senha</label>
            <label class="input validator w-full">
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
                minlength="8"
                pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                v-model="passwordForm.confirmPassword"
              />
            </label>
            <p class="validator-hint hidden text-[11px] mt-1">
              Mais de 8 caracteres (1 número, 1 maiúscula, 1 minúscula)
            </p>

            <p v-if="!passwordMatch" class="text-error text-[11px] mt-1">As senhas não coincidem</p>
          </div>
        </fieldset>
      </div>
    </div>
  </div>

  <ToastView message="error" type="error" v-if="error"></ToastView>
</template>
