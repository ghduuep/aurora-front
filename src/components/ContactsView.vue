<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from './PageHeader.vue'
import { fetchApi } from '@/lib/api'
import { loadAllTags, loadAllEntityTags, saveEntityTags } from '@/lib/tags'
import LoadingView from './LoadingView.vue'
import { formatPhone, unformatNumbers } from '@/lib/formatters'

const items = ref([])
const isLoading = ref(false)

const availableTags = ref<any[]>([])
const globalEntityTags = ref<any[]>([])

async function loadTagsData() {
  const [t, et] = await Promise.all([loadAllTags(), loadAllEntityTags()])
  availableTags.value = t
  globalEntityTags.value = et
}

// Companies data
const companies = ref<any[]>([])
const isCompaniesLoading = ref(false)

// Modal state
const isModalOpen = ref(false)
const editingItem = ref<any>(null)
const form = ref<any>({})

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

async function openModal(item?: any) {
  // Load companies so the select can be populated when the modal opens
  await loadCompanies()

  if (item) {
    editingItem.value = item
    // Normalize company id into form.companyId, supporting either companyId or nested company object
    const companyId = item.companyId ?? item.company?.id ?? ''
    form.value = { ...item, companyId }
    const eTags = globalEntityTags.value.filter((et: any) => String(et.entityId) === String(item.id))
    form.value.tags = eTags.map((et: any) => et.tagId)

    if (form.value.phone) form.value.phone = formatPhone(form.value.phone)
  } else {
    editingItem.value = null
    form.value = { companyId: '' }
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
    const tagsToSave = payload.tags || []
    delete payload.tags

    Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null })
    
    if (payload.phone) payload.phone = unformatNumbers(payload.phone)
    if (!payload.companyId) payload.companyId = null

    if (editingItem.value) {
      await fetchApi(`/contacts/${editingItem.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      await saveEntityTags(editingItem.value.id, "contact", tagsToSave)
    } else {
      const res = await fetchApi('/contacts/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const newId = res?.id || res?.data?.id;
      if (newId) await saveEntityTags(newId, "contact", tagsToSave)
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
    await loadTagsData();
    const data = await fetchApi('/contacts/')
    items.value = Array.isArray(data) ? data : data.data || []
  } catch (error) {
    console.error('Error loading items:', error)
  } finally {
    isLoading.value = false
  }
}

async function deleteItem(id: string) {
  if (!confirm('Tem certeza que deseja excluir este item?')) return
  try {
    await fetchApi(`/contacts/${id}`, { method: 'DELETE' })
    await loadItems()
  } catch (error) {
    console.error('Error deleting item:', error)
    alert('Erro ao excluir o item: ' + (error as Error).message)
  }
}
</script>

<template>
  <PageHeader title="Contatos" paragraph="Gerencie os registros de Contatos do sistema">
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
            <th>email</th>
            <th>phone</th>
            <th>position</th>
            <th>Tags</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0">
            <td colspan="5" class="text-center py-4 text-base-content/50">
              Nao ha registros por aqui
            </td>
          </tr>
          <tr v-else v-for="item in items" :key="item.id">
            <td>{{ (item as any)['name'] }}</td>
            <td>{{ (item as any)['email'] || '-' }}</td>
            <td>{{ formatPhone((item as any)['phone']) || '-' }}</td>
            <td>{{ (item as any)['position'] || '-' }}</td>
            
            <td>
              <div class="flex flex-wrap gap-1">
                <span v-for="et in globalEntityTags.filter((et: any) => String(et.entityId) === String(item.id))" :key="et.id" class="badge badge-sm badge-neutral">
                  {{ availableTags.find(t => t.id === et.tagId)?.name || 'Tag' }}
                </span>
              </div>
            </td>
<td>
              <button class="btn btn-sm btn-ghost" @click="openModal(item)">Editar</button>
              <button
                class="btn btn-sm btn-error btn-ghost text-error"
                @click="deleteItem(item.id)"
              >
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <dialog class="modal" :class="{ 'modal-open': isModalOpen }">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ editingItem ? 'Editar' : 'Nova' }} Contato</h3>
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
            <span class="label-text">Nome <span class="text-error" title="Obrigatório">*</span></span>
          </label>
          <input required
            type="text"
            v-model="form.name"
            class="input input-bordered w-full"
            placeholder="Nome"
          />
        </div>
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Email <span class="text-xs text-base-content/50 ml-1">(opcional)</span></span>
          </label>
          <input
            type="email"
            v-model="form.email"
            class="input input-bordered w-full"
            placeholder="Email"
          />
        </div>
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Telefone <span class="text-xs text-base-content/50 ml-1">(opcional)</span></span>
          </label>
          <input
            type="text"
            v-model="form.phone"
            @input="form.phone = formatPhone(($event.target as HTMLInputElement).value)"
            class="input input-bordered w-full"
            placeholder="Telefone"
          />
        </div>
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Cargo <span class="text-xs text-base-content/50 ml-1">(opcional)</span></span>
          </label>
          <select v-model="form.position" class="select select-bordered w-full">
            <option disabled value="">Selecione...</option>
            <option value="ceo">ceo</option>
            <option value="cto">cto</option>
            <option value="manager">manager</option>
            <option value="sales">sales</option>
            <option value="marketing">marketing</option>
            <option value="other">other</option>
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
