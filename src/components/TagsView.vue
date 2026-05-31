<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from './PageHeader.vue'
import { fetchApi, getResponseData, type PaginatedResponse } from '@/lib/api'
import LoadingView from './LoadingView.vue'
import type { EditableRecord } from '@/lib/crm-types'
import type { Tag } from '@/lib/tags'

const items = ref<Tag[]>([])
const isLoading = ref(false)

// Function to load data

// Modal state
const isModalOpen = ref(false)
const editingItem = ref<Tag | null>(null)
const form = ref<EditableRecord>({})

function openModal(item?: Tag) {
  if (item) {
    editingItem.value = item
    form.value = { ...item }
  } else {
    editingItem.value = null
    form.value = {}
  }
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
      await fetchApi(`/tags/${editingItem.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
    } else {
      await fetchApi('/tags/', {
        method: 'POST',
        body: JSON.stringify(payload)
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

async function loadItems() {
  isLoading.value = true
  try {
    const data = await fetchApi<Tag[] | PaginatedResponse<Tag>>('/tags/')
    items.value = getResponseData(data)
  } catch (error) {
    console.error('Error loading items:', error)
  } finally {
    isLoading.value = false
  }
}

async function deleteItem(id: string) {
  if (!confirm('Tem certeza que deseja excluir este item?')) return;
  try {
    await fetchApi(`/tags/${id}`, { method: 'DELETE' })
    await loadItems()
  } catch (error) {
    console.error('Error deleting item:', error)
    alert('Erro ao excluir o item: ' + (error as Error).message)
  }
}
</script>

<template>
  <PageHeader title="Tags" paragraph="Gerencie os registros de Tags do sistema">
    <template #actions>
      <button class="btn btn-info" @click="openModal()">Adicionar Novo</button>
</template>
  </PageHeader>

  <LoadingView v-if="isLoading" class="mt-10" />

  <div v-else class="mt-6">
    <div class="overflow-x-auto bg-base-100 rounded-box border border-base-300">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>name</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0">
            <td colspan="2" class="text-center py-4 text-base-content/50">Nao ha registros por aqui</td>
          </tr>
          <tr v-else v-for="item in items" :key="item.id">
            <td>{{ item.name }}</td>
            <td>
              <button class="btn btn-sm btn-ghost" @click="openModal(item)">Editar</button>
              <button class="btn btn-sm btn-error btn-ghost text-error" @click="deleteItem(item.id)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

    

  <dialog class="modal" :class="{ 'modal-open': isModalOpen }">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ editingItem ? 'Editar' : 'Nova' }} Tag</h3>
      <form @submit.prevent="saveItem" class="py-4 flex flex-col gap-2">
        
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Nome <span class="text-error" title="Obrigatório">*</span></span>
          </label>
          <input required type="text" v-model="form.name" class="input input-bordered w-full" placeholder="Nome" />
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
