<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from './PageHeader.vue'
import { fetchApi, getResponseData, type PaginatedResponse } from '@/lib/api'
import LoadingView from './LoadingView.vue'
import type { EditableRecord, User } from '@/lib/crm-types'

const items = ref<User[]>([])
const isLoading = ref(false)

const isModalOpen = ref(false)
const editingItem = ref<User | null>(null)
const form = ref<EditableRecord>({})

async function loadItems() {
  isLoading.value = true
  try {
    const data = await fetchApi<User[] | PaginatedResponse<User>>('/users/')
    items.value = getResponseData(data)
  } catch (error) {
    console.error('Error loading items:', error)
  } finally {
    isLoading.value = false
  }
}

async function openModal(item: User) {
  editingItem.value = item
  form.value = { role: item.role || 'sales' }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

async function saveItem() {
  try {
    const payload = { ...form.value }
    Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null })

    if (editingItem.value) {
      await fetchApi(`/users/${editingItem.value.id}/role`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    }
    await loadItems()
    closeModal()
  } catch (error) {
    console.error('Error saving item:', error)
    alert('Erro ao salvar o item: ' + (error as Error).message)
  }
}

onMounted(() => {
  loadItems()
})
</script>

<template>
  <PageHeader title="Usuários" paragraph="Gerencie os usuários e seus níveis de acesso">
    <template #actions>
      <router-link to="/user" class="btn btn-info">Adicionar Novo</router-link>
    </template>
  </PageHeader>

  <LoadingView v-if="isLoading" class="mt-10" />

  <div v-else class="mt-6">
    <div class="overflow-x-auto bg-base-100 rounded-box border border-base-300">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Cargo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0">
            <td colspan="4" class="text-center py-4 text-base-content/50">
              Nao ha registros por aqui
            </td>
          </tr>
          <tr v-else v-for="item in items" :key="item.id">
            <td>
              <div class="flex items-center gap-3">
                <div class="avatar placeholder">
                  <div class="bg-neutral text-neutral-content rounded-full w-8">
                    <span class="text-xs">{{ item.name ? item.name.charAt(0).toUpperCase() : 'U' }}</span>
                  </div>
                </div>
                <div>
                  <div class="font-bold">{{ item.name }}</div>
                </div>
              </div>
            </td>
            <td>{{ item.email }}</td>
            <td>
              <span class="badge badge-sm" :class="item.role === 'admin' ? 'badge-primary' : 'badge-ghost'">
                {{ item.role || 'sales' }}
              </span>
            </td>
            <td>
              <button class="btn btn-sm btn-ghost" @click="openModal(item)">Mudar Cargo</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <dialog class="modal" :class="{ 'modal-open': isModalOpen }">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Alterar cargo de {{ editingItem?.name }}</h3>
      <form @submit.prevent="saveItem" class="py-4 flex flex-col gap-2">
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Cargo <span class="text-error" title="Obrigatório">*</span></span>
          </label>
          <select v-model="form.role" class="select select-bordered w-full" required>
            <option value="admin">Administrador</option>
            <option value="manager">Gerente</option>
            <option value="sales">Vendedor (Sales)</option>
          </select>
        </div>
        
        <div class="modal-action">
          <button type="button" class="btn" @click="closeModal">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar</button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="closeModal">close</button>
    </form>
  </dialog>
</template>
