<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useUserService } from '@/composables/useUserService'
import TablePagination from '@core/components/TablePagination.vue'

const itemsPerPage = ref(10)
const page = ref(1)

const { users, totalUsers, loading, fetchUsers } = useUserService()

const paginatedUsers = computed(() => users.value)

const handlePageChange = (newPage: number) => {
  page.value = newPage
}

watch([page, itemsPerPage], () => {
  fetchUsers(page.value, itemsPerPage.value)
}, { immediate: true })

onMounted(() => {
  fetchUsers(page.value, itemsPerPage.value)
})
</script>

<template>
  <div>
    <h1 class="text-h4 mb-6">
      Administración de Usuarios
    </h1>
    <VTable class="mb-4">
      <thead>
        <tr>
          <th>DNI</th>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Género</th>
          <th>Fecha de nacimiento</th>
          <th>Celular</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td
            colspan="7"
            class="text-center"
          >
            <VProgressCircular
              indeterminate
              color="primary"
              size="32"
              class="my-4"
            />
            <div class="mt-2">
              Cargando usuarios...
            </div>
          </td>
        </tr>
        <tr
          v-for="user in paginatedUsers"
          v-else
          :key="user.id"
        >
          <td>{{ user.dni }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.gender === 'M' ? 'Masculino' : user.gender === 'F' ? 'Femenino' : user.gender }}</td>
          <td>{{ user.birthdate }}</td>
          <td>{{ user.phone }}</td>
          <td>{{ user.status === '1' ? 'Activo' : 'Inactivo' }}</td>
        </tr>
        <tr v-if="!loading && paginatedUsers.length === 0">
          <td
            colspan="7"
            class="text-center"
          >
            No hay usuarios para mostrar.
          </td>
        </tr>
      </tbody>
    </VTable>
    <TablePagination
      :page="page"
      :items-per-page="itemsPerPage"
      :total-items="totalUsers"
      @update:page="handlePageChange"
    />
  </div>
</template>
