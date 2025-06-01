import { ref } from 'vue'
import { useApi } from '@/composables/useApi'

export interface User {
  id: string
  name: string
  email: string
  gender: string
  birthdate: string
  status: string
  dni: string
  phone: string
}

const users = ref<User[]>([])
const totalUsers = ref(0)
const loading = ref(false)

function mapBackendUser(u: any): User {
  return {
    id: u.dni,
    name: `${u.nombres} ${u.apellidos}`,
    email: u.correo,
    gender: u.genero,
    birthdate: u.fecha_nacimiento,
    status: u.estado,
    dni: u.dni,
    phone: u.celular,
  }
}

async function fetchUsers(page: number, size: number) {
  loading.value = true

  const realSize = size === -1 ? 1000 : size

  const { data } = await useApi<any>(
    `/graduate-insights/v1/api/user?page=${page}&size=${realSize}`,
    { method: 'GET' },
  )

  if (data.value) {
    users.value = data.value.data.map(mapBackendUser)
    totalUsers.value = data.value.paginate.totalElements
  }
  loading.value = false
}

async function addUser(user: any) {
  loading.value = true
  await useApi<any>(
    '/graduate-insights/v1/api/user',
    {
      method: 'POST',
      body: user,
    },
  )
  loading.value = false
}

async function getUser(dni: string) {
  loading.value = true

  const { data } = await useApi<any>(
    `/graduate-insights/v1/api/user/${dni}`,
    { method: 'GET' },
  )

  loading.value = false

  return data.value?.data
}

async function updateUser(dni: string, user: any) {
  loading.value = true
  await useApi<any>(
    `/graduate-insights/v1/api/user/${dni}`,
    {
      method: 'PUT',
      body: user,
    },
  )
  loading.value = false
}

export function useUserService() {
  return {
    users,
    totalUsers,
    loading,
    fetchUsers,
    addUser,
    getUser,
    updateUser,
  }
}
