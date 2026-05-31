import { createAuthClient } from 'better-auth/vue'
import { API_BASE_URL } from './api'

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  fetchOptions: {
    credentials: 'include',
  },
})
