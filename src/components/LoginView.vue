<script setup lang="ts">
import { reactive, ref } from 'vue';
import { authClient } from '@/lib/auth-client';
import router from '@/router';

const form = reactive({
  email: '',
  password: ''
});

const error = ref('')
const loading = ref(false)

async function login() {
  error.value = ''
  loading.value = true

  try {
    const result = await authClient.signIn.email({
      email: form.email,
      password: form.password
    })

    if (result.error) {
      error.value = result.error.message || "Erro ao fazer login"
      return
    }

    console.log(result);

    router.push("/dashboard");
  } catch(e: any) {
    error.value = e.message ||  "Erro ao fazer login"
  } finally {
    loading.value = false
  }
}
</script>

<template>
<div>
  <div>
    <h1>Bem-vindo de volta</h1>
    <p>Por favor insira suas credenciais para acessar seu painel.</p>
  </div>
  <form @submit.prevent="login">
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" placeholder="name@company.com" v-model="form.email">

    <label for="password">Senha:</label>
    <input type="password" id="password" name="password" v-model="form.password">

    <button type="submit">Enviar</button>
  </form>
  <p v-if="error">{{ error }}</p>
</div>
</template>

