<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from './PageHeader.vue'
import { fetchApi, getResponseData, type PaginatedResponse } from '@/lib/api'
import LoadingView from './LoadingView.vue'
import type { EditableRecord, PipelineStage } from '@/lib/crm-types'

const items = ref<PipelineStage[]>([])
const isLoading = ref(false)

// Function to load data

// Modal state
const isModalOpen = ref(false)
const editingItem = ref<PipelineStage | null>(null)
const form = ref<EditableRecord>({})

function openModal(item?: PipelineStage) {
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
    if (payload.position !== null && payload.position !== undefined) payload.position = Number(payload.position)

    if (editingItem.value) {
      await fetchApi(`/pipeline-stages/${editingItem.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
    } else {
      await fetchApi('/pipeline-stages/', {
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
    const data = await fetchApi<PipelineStage[] | PaginatedResponse<PipelineStage>>(
      '/pipeline-stages/',
    )
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
    await fetchApi(`/pipeline-stages/${id}`, { method: 'DELETE' })
    await loadItems()
  } catch (error) {
    console.error('Error deleting item:', error)
    alert('Erro ao excluir o item: ' + (error as Error).message)
  }
}
</script>

<template>
  <PageHeader title="Estágios do Pipeline" paragraph="Gerencie os registros de Estágios do Pipeline do sistema">
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
            <th>position</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0">
            <td colspan="3" class="text-center py-4 text-base-content/50">Nao ha registros por aqui</td>
          </tr>
          <tr v-else v-for="item in items" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.position }}</td>
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
      <h3 class="font-bold text-lg">{{ editingItem ? 'Editar' : 'Nova' }} Estágio do Pipeline</h3>
      <form @submit.prevent="saveItem" class="py-4 flex flex-col gap-2">
        
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Nome <span class="text-error" title="Obrigatório">*</span></span>
          </label>
          <input required type="text" v-model="form.name" class="input input-bordered w-full" placeholder="Nome" />
        </div>
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Posição <span class="text-xs text-base-content/50 ml-1">(opcional)</span></span>
          </label>
          <input type="number" v-model="form.position" class="input input-bordered w-full" placeholder="Posição" />
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
