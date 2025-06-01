<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AddNewUserDialog from '@/components/dialogs/AddNewUserDialog.vue'
import { useUserService } from '@/composables/useUserService'
import TablePagination from '@core/components/TablePagination.vue'

const itemsPerPage = ref(10)
const page = ref(1)

const { users, totalUsers, loading, fetchUsers, addUser, getUser, updateUser } = useUserService()

const paginatedUsers = computed(() => users.value)

const isAddNewUserDialogVisible = ref(false)
const userToEdit = ref<any>(null)

const handlePageChange = (newPage: number) => {
  page.value = newPage
}

watch([page, itemsPerPage], () => {
  fetchUsers(page.value, itemsPerPage.value)
}, { immediate: true })

onMounted(() => {
  fetchUsers(page.value, itemsPerPage.value)
})

const openAddUserDialog = () => {
  userToEdit.value = null
  isAddNewUserDialogVisible.value = true
}

const openEditUserDialog = async (dni: string) => {
  const user = await getUser(dni)

  userToEdit.value = user
  isAddNewUserDialogVisible.value = true
}

const saveUser = async (userData: any) => {
  if (userToEdit.value && userToEdit.value.dni)
    await updateUser(userToEdit.value.dni, userData)
  else
    await addUser(userData)

  await fetchUsers(page.value, itemsPerPage.value)
}
</script>

<template>
  <section>
    <VCard class="mb-6">
      <VCardItem class="pb-4">
        <VCardTitle>Administración de Usuarios</VCardTitle>
      </VCardItem>
      <VDivider />
      <VCardText class="d-flex flex-wrap gap-4">
        <div class="me-3 d-flex gap-3">
          <AppSelect
            :model-value="itemsPerPage"
            :items="[
              { value: 5, title: '5' },
              { value: 10, title: '10' },
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
              { value: -1, title: 'All' },
            ]"
            style="inline-size: 6.25rem;"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
          />
        </div>
        <VSpacer />
        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
          <!-- 👉 Add user button -->
          <VBtn
            prepend-icon="tabler-plus"
            color="primary"
            @click="openAddUserDialog"
          >
            Nuevo usuario
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

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
            <th>Acciones</th>
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
            <td>
              <VBtn
                icon
                size="small"
                color="primary"
                @click="openEditUserDialog(user.id)"
              >
                <VIcon icon="tabler-edit" />
              </VBtn>
            </td>
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
      <AddNewUserDialog
        v-model:is-dialog-open="isAddNewUserDialogVisible"
        :user-to-edit="userToEdit"
        @user-data="saveUser"
      />
    </VCard>
  </section>
</template>
