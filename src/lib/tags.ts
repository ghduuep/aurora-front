import { fetchApi, getResponseData, type PaginatedResponse } from './api'

export type EntityType = 'lead' | 'contact' | 'company'

export type Tag = {
  id: string
  name: string
}

export type EntityTag = {
  id: string
  tagId: string | null
  entityType: EntityType | null
  entityId: string
}

const PAGE_SIZE = 100

async function loadPaginatedResource<T>(path: string): Promise<T[]> {
  const items: T[] = []
  let offset = 0
  let totalPages = 1

  do {
    const data = await fetchApi<T[] | PaginatedResponse<T>>(
      `${path}?limit=${PAGE_SIZE}&offset=${offset}`,
    )
    const pageItems = getResponseData(data)
    items.push(...pageItems)

    if (!data || Array.isArray(data) || !data.meta) break

    totalPages = data.meta.total_pages
    offset += data.meta.per_page
  } while (offset / PAGE_SIZE < totalPages)

  return items
}

export async function loadAllTags() {
  return loadPaginatedResource<Tag>('/tags/')
}

export async function loadAllEntityTags() {
  return loadPaginatedResource<EntityTag>('/entity-tags/')
}

export async function saveEntityTags(entityId: string, entityType: EntityType, newTagIds: string[]) {
  if (!entityId) return

  const allETags = await loadAllEntityTags()
  const currentETags = allETags.filter((entityTag) => String(entityTag.entityId) === String(entityId))
  const currentTagIds = currentETags.map((entityTag) => entityTag.tagId).filter(Boolean)

  const toAdd = newTagIds.filter((id) => !currentTagIds.includes(id))
  const toRemove = currentETags.filter((entityTag) => !newTagIds.includes(entityTag.tagId ?? ''))

  const promises: Promise<unknown>[] = []
  for (const tagId of toAdd) {
    promises.push(
      fetchApi('/entity-tags/', {
        method: 'POST',
        body: JSON.stringify({ tagId, entityType, entityId }),
      }),
    )
  }

  for (const entityTag of toRemove) {
    promises.push(
      fetchApi(`/entity-tags/${entityTag.id}`, {
        method: 'DELETE',
      }),
    )
  }

  await Promise.all(promises)
}
