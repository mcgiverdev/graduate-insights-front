export interface Column {
  key: string
  label: string
  align?: 'start' | 'center' | 'end'
  sortable?: boolean
  width?: string
  formatter?: (item: any, key: string) => string
}

export interface TableActions {
  edit?: (item: any) => void
  delete?: (item: any) => void
  custom?: Array<{
    icon: string
    color: string
    onClick: (item: any) => void
  }>
}

export interface TableProps {
  columns: Column[]
  items: any[]
  loading?: boolean
  emptyMessage?: string
  actions?: TableActions
}

export interface TableEmits {
  (e: 'update:sort', value: { key: string; order: 'asc' | 'desc' }): void
  (e: 'update:page', value: number): void
  (e: 'update:itemsPerPage', value: number): void
}
