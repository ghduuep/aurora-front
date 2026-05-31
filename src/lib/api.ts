export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

type ApiErrorResponse = {
  message?: string
  error?: string
}

export type PaginatedResponse<T> = {
  data: T[]
  meta?: {
    current_page: number
    per_page: number
    total_items: number
    total_pages: number
  }
}

export function getResponseData<T>(response: T[] | PaginatedResponse<T> | null): T[] {
  if (!response) return []
  return Array.isArray(response) ? response : response.data
}

export function getCreatedResourceId(response: unknown): string | null {
  if (!response || typeof response !== 'object') return null

  if ('id' in response && typeof response.id === 'string') {
    return response.id
  }

  if ('data' in response) {
    const { data } = response
    if (data && typeof data === 'object' && 'id' in data && typeof data.id === 'string') {
      return data.id
    }
  }

  return null
}

export async function fetchApi<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T | null> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    let errorMsg = 'An error occurred'
    try {
      const error = (await response.json()) as ApiErrorResponse
      errorMsg = error.message || error.error || errorMsg
    } catch {}
    throw new Error(errorMsg)
  }

  // Some endpoints might return empty body on 204 or DELETE
  if (response.status === 204) return null
  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}
