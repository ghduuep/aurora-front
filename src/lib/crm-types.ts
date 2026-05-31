export type UserRole = 'admin' | 'manager' | 'sales'

export type EditableRecord = Record<string, unknown>

export type User = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: UserRole | null
}

export type Company = {
  id: string
  name?: string | null
  document?: string | null
  phone?: string | null
  website?: string | null
}

export type Contact = {
  id: string
  companyId?: string | null
  company?: Company | null
  name?: string | null
  email?: string | null
  phone?: string | null
  position?: string | null
}

export type PipelineStage = {
  id: string
  name?: string | null
  position?: number | null
}

export type Lead = {
  id: string
  title?: string | null
  companyId?: string | null
  company?: Company | null
  contactId?: string | null
  contact?: Contact | null
  ownerId?: string | null
  owner?: User | null
  status?: 'open' | 'won' | 'lost' | null
  stageId?: string | null
  value?: string | null
  probability?: number | null
  expectedCloseDate?: string | null
  tags?: string[]
}

export type Task = {
  id: string
  leadId?: string | null
  lead?: Lead | null
  contactId?: string | null
  contact?: Contact | null
  assignedTo?: string | null
  user?: User | null
  title?: string | null
  description?: string | null
  dueDate?: string | null
  status?: 'pending' | 'in_progress' | 'done' | 'canceled' | null
}

export type Activity = {
  id: string
  leadId?: string | null
  lead?: Lead | null
  contactId?: string | null
  contact?: Contact | null
  userId?: string | null
  user?: User | null
  type?: 'call' | 'email' | 'meeting' | 'note' | 'whatsapp' | null
  description?: string | null
  activity_date?: string | null
}
