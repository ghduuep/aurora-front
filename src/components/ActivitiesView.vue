<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from './PageHeader.vue'
import { fetchApi } from '@/lib/api'
import { authClient } from '@/lib/auth-client'
import LoadingView from './LoadingView.vue'

const session = authClient.useSession()
const items = ref([])
const isLoading = ref(false)

// Function to load data

// Modal state
const isModalOpen = ref(false)
const editingItem = ref<any>(null)
const form = ref<any>({})

const leads = ref<any[]>([])
const contacts = ref<any[]>([])
const users = ref<any[]>([])

async function loadRelations() {
  try {
    const [leadsData, contactsData, usersData] = await Promise.all([
      fetchApi('/leads/'),
      fetchApi('/contacts/'),
      fetchApi('/users/')
    ])
    leads.value = Array.isArray(leadsData) ? leadsData : leadsData.data || []
    contacts.value = Array.isArray(contactsData) ? contactsData : contactsData.data || []
    users.value = Array.isArray(usersData) ? usersData : usersData.data || []
  } catch (error) {
    console.error('Error loading relations:', error)
  }
}

async function openModal(item?: any) {
  await loadRelations()

  if (item) {
    editingItem.value = item
    const leadId = item.leadId ?? item.lead?.id ?? ''
    const contactId = item.contactId ?? item.contact?.id ?? ''
    const userId = item.userId ?? item.user?.id ?? ''
    const activity_date = item.activity_date ? new Date(item.activity_date).toISOString().slice(0, 16) : ''
    form.value = { ...item, leadId, contactId, userId, activity_date }

  } else {
    editingItem.value = null
    form.value = {
      leadId: '',
      contactId: '',
      userId: '',
      type: 'note'
    }

  }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

async function saveItem() {
  try {
    const payload = { ...form.value }

    if (session.value?.data?.user?.role === 'sales' || session.data?.user?.role === 'sales') {
      payload.userId = session.value?.data?.user?.id || session.data?.user?.id || null
    }

    Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null })
    if (payload.activity_date && !payload.activity_date.includes('Z')) { payload.activity_date = new Date(payload.activity_date).toISOString() }

    if (editingItem.value) {
      await fetchApi(`/activities/${editingItem.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      await fetchApi('/activities/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
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
    const data = await fetchApi('/activities/')
    items.value = Array.isArray(data) ? data : data.data || []
  } catch (error) {
    console.error('Error loading items:', error)
  } finally {
    isLoading.value = false
  }
}

async function deleteItem(id: string) {
  if (!confirm('Tem certeza que deseja excluir este item?')) return;
  try {
    await fetchApi(`/activities/${id}`, { method: 'DELETE' })
    await loadItems()
  } catch (error) {
    console.error('Error deleting item:', error)
    alert('Erro ao excluir o item: ' + (error as Error).message)
  }
}
</script>

<template>
  <PageHeader title="Atividades" paragraph="Gerencie os registros de Atividades do sistema">
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
            <th>type</th>
            <th>description</th>
            <th>activity_date</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0">
            <td colspan="4" class="text-center py-4 text-base-content/50">Nao ha registros por aqui</td>
          </tr>
          <tr v-else v-for="item in items" :key="item.id">
            <td>{{ (item as any)["type"] }}</td>
            <td>{{ (item as any)["description"] }}</td>
            <td>{{ (item as any)["activity_date"] }}</td>
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
      <h3 class="font-bold text-lg">{{ editingItem ? 'Editar' : 'Nova' }} Atividade</h3>
      <form @submit.prevent="saveItem" class="py-4 flex flex-col gap-2">
        
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Lead <span class="text-xs text-base-content/50 ml-1">(opcional)</span></span>
          </label>
          <select v-model="form.leadId" class="select select-bordered w-full">
            <option disabled value="">Selecione...</option>
            <option v-for="lead in leads" :key="lead.id" :value="lead.id">{{ lead.title }}</option>
          </select>
        </div>
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Contato <span class="text-xs text-base-content/50 ml-1">(opcional)</span></span>
          </label>
          <select v-model="form.contactId" class="select select-bordered w-full">
            <option disabled value="">Selecione...</option>
            <option v-for="contact in contacts" :key="contact.id" :value="contact.id">{{ contact.name }}</option>
          </select>
        </div>
        <div class="form-control w-full" v-if="session.data?.user?.role === 'admin' || session.data?.user?.role === 'manager'">
          <label class="label">
            <span class="label-text">Usuário <span class="text-xs text-base-content/50 ml-1">(opcional)</span></span>
          </label>
          <select v-model="form.userId" class="select select-bordered w-full">
            <option disabled value="">Selecione...</option>
            <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }} ({{ user.email }})</option>
          </select>
        </div>
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Tipo <span class="text-error" title="Obrigatório">*</span></span>
          </label>
          <select required v-model="form.type" class="select select-bordered w-full">
            <option disabled value="">Selecione...</option>
            <option value="call">call</option>
            <option value="email">email</option>
            <option value="meeting">meeting</option>
            <option value="note">note</option>
            <option value="whatsapp">whatsapp</option>
          </select>
        </div>
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Descrição <span class="text-xs text-base-content/50 ml-1">(opcional)</span></span>
          </label>
          <textarea v-model="form.description" class="textarea textarea-bordered w-full" placeholder="Descrição"></textarea>
        </div>
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Data da Atividade <span class="text-error" title="Obrigatório">*</span></span>
          </label>
          <input required type="datetime-local" v-model="form.activity_date" class="input input-bordered w-full" placeholder="Data da Atividade" />
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
