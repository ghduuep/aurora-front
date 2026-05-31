<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import PageHeader from './PageHeader.vue'
import { fetchApi } from '@/lib/api'
import { authClient } from '@/lib/auth-client'
import { loadAllTags, loadAllEntityTags, saveEntityTags } from '@/lib/tags'
import LoadingView from './LoadingView.vue'

const items = ref<any[]>([])
const stages = ref<any[]>([])

const isLoading = ref(false)
const session = authClient.useSession()
const users = ref<any[]>([])

const availableTags = ref<any[]>([])
const globalEntityTags = ref<any[]>([])

async function loadTagsData() {
  const [t, et] = await Promise.all([loadAllTags(), loadAllEntityTags()])
  availableTags.value = t
  globalEntityTags.value = et
}

// Companies and Contacts
const companies = ref<any[]>([])
const contacts = ref<any[]>([])
const isCompaniesLoading = ref(false)
const isContactsLoading = ref(false)

// Group leads by stage
const groupedLeads = computed(() => {
  const groups: Record<string, any[]> = {}
  stages.value.forEach((stage) => {
    groups[stage.id] = []
  })

  items.value.forEach((lead) => {
    if (!lead.stageId) {
      // Default to first stage if no stage is set
      const firstStage = stages.value[0]?.id
      if (firstStage) {
        if (!groups[firstStage]) groups[firstStage] = []
        groups[firstStage].push(lead)
      }
    } else {
      if (!groups[lead.stageId]) groups[lead.stageId] = []
      groups[lead.stageId].push(lead)
    }
  })
  return groups
})

// Modal state
const isModalOpen = ref(false)
const editingItem = ref<any>(null)
const form = ref<any>({})


async function loadUsers() {
  try {
    const data = await fetchApi('/users/')
    users.value = Array.isArray(data) ? data : data.data || []
  } catch (error) {
    console.error('Error loading users:', error)
  }
}

async function loadCompanies() {
  isCompaniesLoading.value = true
  try {
    const data = await fetchApi('/companies')
    companies.value = Array.isArray(data) ? data : data.data || []
  } catch (error) {
    console.error('Error loading companies:', error)
    companies.value = []
  } finally {
    isCompaniesLoading.value = false
  }
}

async function loadContacts() {
  isContactsLoading.value = true
  try {
    const data = await fetchApi('/contacts/')
    contacts.value = Array.isArray(data) ? data : data.data || []
  } catch (error) {
    console.error('Error loading contacts:', error)
    contacts.value = []
  } finally {
    isContactsLoading.value = false
  }
}

const availableContacts = computed(() => {
  if (!form.value.companyId) return contacts.value
  return contacts.value.filter(
    (c) => String(c.companyId ?? c.company?.id) === String(form.value.companyId),
  )
})

async function openModal(item?: any) {
  // ensure companies and contacts are loaded
  await Promise.all([loadCompanies(), loadContacts(), loadUsers()])

  if (item) {
    editingItem.value = item
    const companyId = item.companyId ?? item.company?.id ?? ''
    const contactId = item.contactId ?? item.contact?.id ?? ''
    const ownerId = item.ownerId ?? item.owner?.id ?? ''
    const expectedCloseDate = item.expectedCloseDate ? new Date(item.expectedCloseDate).toISOString().slice(0, 10) : ''
    form.value = { ...item, companyId, contactId, ownerId, expectedCloseDate }
    const eTags = globalEntityTags.value.filter((et: any) => String(et.entityId) === String(item.id))
    form.value.tags = eTags.map((et: any) => et.tagId)

  } else {
    editingItem.value = null
    form.value = {
      title: '',
      stageId: stages.value[0]?.id ?? '',
      value: null,
      probability: null,
      expectedCloseDate: '',
      companyId: '',
      contactId: '',
      status: 'open',
      ownerId: '',
    }
    form.value.tags = []

  }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

async function saveItem() {
  try {
    const payload = { ...form.value }

    if (!payload.ownerId) {
      payload.ownerId = session.value?.data?.user?.id || session.data?.user?.id || null
    }
    if (session.value?.data?.user?.role === 'sales' || session.data?.user?.role === 'sales') {
      payload.ownerId = session.value?.data?.user?.id || session.data?.user?.id || null
    }

    const tagsToSave = payload.tags || []
    delete payload.tags

    if (!payload.status) payload.status = 'open'
    if (!payload.stageId) payload.stageId = stages.value[0]?.id ?? ''

    // Fix for type mismatches (API expects string or null for value)
    if (payload.value !== null && payload.value !== undefined && payload.value !== '') {
      payload.value = String(payload.value)
    } else {
      payload.value = null
    }

    if (payload.probability === '') {
      payload.probability = null
    }

    if (payload.expectedCloseDate === '') {
      payload.expectedCloseDate = null
    } else if (payload.expectedCloseDate && !payload.expectedCloseDate.includes('Z')) {
      payload.expectedCloseDate = new Date(payload.expectedCloseDate).toISOString()
    }
    
    // Convert empty relationship strings to null or omit them so we don't send invalid empty string IDs
    if (!payload.companyId) payload.companyId = null
    if (!payload.contactId) payload.contactId = null

    if (editingItem.value) {
      await fetchApi(`/leads/${editingItem.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      await saveEntityTags(editingItem.value.id, "lead", tagsToSave)
    } else {
      const res = await fetchApi('/leads/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const newId = res?.id || res?.data?.id;
      if (newId) await saveEntityTags(newId, "lead", tagsToSave)
    }
    await loadItems()
    closeModal()
  } catch (error) {
    console.error('Error saving lead:', error)
    alert('Erro ao salvar o lead: ' + (error as Error).message)
  }
}

// Drag and drop logic
function onDragStart(event: DragEvent, leadId: string) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('leadId', leadId)
    event.dataTransfer.effectAllowed = 'move'
  }
}

async function onDrop(event: DragEvent, stageId: string) {
  if (event.dataTransfer) {
    const leadId = event.dataTransfer.getData('leadId')
    const lead = items.value.find((l) => l.id === leadId)
    if (lead && lead.stageId !== stageId) {
      // Optimistic update
      const originalStageId = lead.stageId
      lead.stageId = stageId

      try {
        await fetchApi(`/leads/${leadId}`, {
          method: 'PUT',
          body: JSON.stringify({ stageId }),
        })
      } catch (error) {
        // Revert on error
        lead.stageId = originalStageId
        console.error('Error updating lead stage:', error)
        alert('Erro ao mover lead')
      }
    }
  }
}

onMounted(() => {
  loadItems()
})

async function loadItems() {
  isLoading.value = true
  try {
    const [fetchedStages, fetchedLeads, fetchedCompanies, fetchedContacts] = await Promise.all([
      fetchApi('/pipeline-stages/'),
      fetchApi('/leads/'),
      fetchApi('/companies'),
      fetchApi('/contacts/'),
    ])
    stages.value = Array.isArray(fetchedStages) ? fetchedStages : fetchedStages.data || []

    // Sort stages by position if available
    stages.value.sort((a, b) => (a.position || 0) - (b.position || 0))

    items.value = Array.isArray(fetchedLeads) ? fetchedLeads : fetchedLeads.data || []
    companies.value = Array.isArray(fetchedCompanies)
      ? fetchedCompanies
      : fetchedCompanies.data || []
    contacts.value = Array.isArray(fetchedContacts) ? fetchedContacts : fetchedContacts.data || []
  } catch (error) {
    console.error('Error loading leads data:', error)
  } finally {
    isLoading.value = false
  }
}

async function deleteItem(id: string) {
  if (!confirm('Tem certeza que deseja excluir este Lead?')) return
  try {
    await fetchApi(`/leads/${id}`, { method: 'DELETE' })
    await loadItems()
    closeModal()
  } catch (error) {
    console.error('Error deleting item:', error)
    alert('Erro ao excluir o item: ' + (error as Error).message)
  }
}
</script>

<template>
  <PageHeader title="Leads" paragraph="Gerencie seus Leads em formato Kanban">
    <template #actions>
      <button class="btn btn-info" @click="openModal()">Adicionar Novo</button>
    </template>
  </PageHeader>

  <LoadingView v-if="isLoading" class="mt-10" />

  <!-- Kanban Board -->
  <div v-else class="mt-6 flex overflow-x-auto gap-4 pb-4 items-start min-h-[60vh]">
    <div
      v-for="stage in stages"
      :key="stage.id"
      class="bg-base-200 rounded-box p-4 min-w-[320px] max-w-[320px] flex-shrink-0 flex flex-col gap-3"
      @dragover.prevent
      @dragenter.prevent
      @drop="onDrop($event, stage.id)"
    >
      <div class="flex justify-between items-center mb-2">
        <h3 class="font-bold text-base-content">{{ stage.name }}</h3>
        <span class="badge badge-sm badge-neutral">{{ groupedLeads[stage.id]?.length || 0 }}</span>
      </div>

      <!-- Cards Container -->
      <div class="flex flex-col gap-3 min-h-[100px]">
        <div
          v-for="lead in groupedLeads[stage.id]"
          :key="lead.id"
          class="card bg-base-100 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow border border-base-300"
          draggable="true"
          @dragstart="onDragStart($event, lead.id)"
          @click="openModal(lead)"
        >
          <div class="card-body p-4 gap-2">
            <h4 class="card-title text-sm">{{ lead.title }}</h4>
            <div class="flex justify-between items-center text-xs text-base-content/70 mt-2">
              <span v-if="lead.value">R$ {{ lead.value }}</span>
              <span v-else>-</span>

              <span v-if="lead.probability" class="flex items-center gap-1">
                {{ lead.probability }}%
              </span>
            </div>
            
            <div class="flex flex-wrap gap-1 mt-2">
              <span v-for="et in globalEntityTags.filter((et: any) => String(et.entityId) === String(lead.id))" :key="et.id" class="badge badge-xs badge-neutral">
                {{ availableTags.find(t => t.id === et.tagId)?.name || 'Tag' }}
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="!groupedLeads[stage.id] || groupedLeads[stage.id].length === 0"
          class="flex-1 flex items-center justify-center p-4 border-2 border-dashed border-base-300 rounded-box text-base-content/40 text-sm"
        >
          Arraste leads para cá
        </div>
      </div>
    </div>
  </div>

  <dialog class="modal" :class="{ 'modal-open': isModalOpen }">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ editingItem ? 'Editar' : 'Nova' }} Lead</h3>
      <form @submit.prevent="saveItem" class="py-4 flex flex-col gap-2">
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Empresa <span class="text-xs text-base-content/50 ml-1">(opcional)</span></span>
          </label>
          <select v-model="form.companyId" class="select select-bordered w-full">
            <option disabled value="">Selecione...</option>
            <option v-for="company in companies" :key="company.id" :value="company.id">
              {{ company.name }}
            </option>
          </select>
        </div>

        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Contato <span class="text-xs text-base-content/50 ml-1">(opcional)</span></span>
          </label>
          <select v-model="form.contactId" class="select select-bordered w-full">
            <option disabled value="">Selecione...</option>
            <option v-for="contact in availableContacts" :key="contact.id" :value="contact.id">
              {{ contact.name }} - {{ contact.email }}
            </option>
          </select>
        </div>

        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Título <span class="text-error" title="Obrigatório">*</span></span>
          </label>
          <input required
            type="text"
            v-model="form.title"
            class="input input-bordered w-full"
            placeholder="Título"
          />
        </div>
        <!-- Note: Real relationships can be handled here -->
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Estágio do Pipeline <span class="text-error" title="Obrigatório">*</span></span>
          </label>
          <select required v-model="form.stageId" class="select select-bordered w-full">
            <option disabled value="">Selecione...</option>
            <option v-for="stage in stages" :key="stage.id" :value="stage.id">
              {{ stage.name }}
            </option>
          </select>
        </div>
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Valor <span class="text-xs text-base-content/50 ml-1">(opcional)</span></span>
          </label>
          <input
            type="number"
            v-model="form.value"
            class="input input-bordered w-full"
            placeholder="Valor"
          />
        </div>
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Probabilidade (%) <span class="text-xs text-base-content/50 ml-1">(opcional)</span></span>
          </label>
          <input
            type="number"
            v-model="form.probability"
            class="input input-bordered w-full"
            placeholder="Probabilidade (%)"
          />
        </div>
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Data Esperada de Fechamento <span class="text-xs text-base-content/50 ml-1">(opcional)</span></span>
          </label>
          <input
            type="date"
            v-model="form.expectedCloseDate"
            class="input input-bordered w-full"
            placeholder="Data Esperada de Fechamento"
          />
        </div>

        
        <div class="form-control w-full" v-if="session.data?.user?.role === 'admin' || session.data?.user?.role === 'manager'">
          <label class="label">
            <span class="label-text">Dono (Owner) <span class="text-error" title="Obrigatório">*</span></span>
          </label>
          <select v-model="form.ownerId" class="select select-bordered w-full" required>
            <option disabled value="">Selecione...</option>
            <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }} ({{ user.email }})</option>
          </select>
        </div>

        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Status <span class="text-error" title="Obrigatório">*</span></span>
          </label>
          <select v-model="form.status" class="select select-bordered w-full" required>
            <option disabled value="">Selecione...</option>
            <option value="open">Aberto (Open)</option>
            <option value="won">Ganho (Won)</option>
            <option value="lost">Perdido (Lost)</option>
          </select>
        </div>

        
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Tags <span class="text-xs text-base-content/50 ml-1">(opcional)</span></span>
          </label>
          <select multiple v-model="form.tags" class="select select-bordered w-full h-24">
            <option v-for="t in availableTags" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>

        <div class="modal-action">
          <button
            v-if="editingItem"
            type="button"
            class="btn btn-error btn-outline"
            @click="deleteItem(editingItem.id)"
          >
            Excluir
          </button>
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
