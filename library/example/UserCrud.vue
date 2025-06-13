<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import FormGenerator from '../components/FormGenerator.vue'
import TableGenerator from '../components/TableGenerator.vue'
import { CrudController } from '../controllers/CrudController'
import type { ModelDefinition } from '../types/ModelDefinition'

// Definición del modelo de usuario
const userModel: ModelDefinition = {
  name: 'users',
  fields: {
    name: {
      type: 'text',
      label: 'Nombre',
      required: true,
      placeholder: 'Ingrese el nombre',
    },
    email: {
      type: 'text',
      label: 'Email',
      required: true,
      placeholder: 'Ingrese el email',
    },
  },
  options: {
    perPage: 10,
    sortable: true,
    filterable: true,
  },
}

export default defineComponent({
  name: 'UserCrud',

  components: {
    FormGenerator,
    TableGenerator,
  },

  setup() {
    const crudController = new CrudController(userModel, '/api')
    const items = ref<any[]>([])
    const currentPage = ref(1)
    const hasMorePages = ref(false)
    const showForm = ref(false)
    const isEditing = ref(false)
    const formData = ref<Record<string, any>>({})

    const loadItems = async (page: number = 1) => {
      try {
        const response = await crudController.list(page)

        items.value = response.data
        hasMorePages.value = response.total > page * userModel.options!.perPage!
        currentPage.value = page
      }
      catch (error) {
        console.error('Error al cargar los usuarios:', error)
      }
    }

    const handleCreate = () => {
      isEditing.value = false
      formData.value = {}
      showForm.value = true
    }

    const handleEdit = (item: any) => {
      isEditing.value = true
      formData.value = { ...item }
      showForm.value = true
    }

    const handleDelete = async (item: any) => {
      if (!confirm('¿Está seguro de eliminar este usuario?'))
        return

      try {
        await crudController.delete(item.id)
        await loadItems(currentPage.value)
      }
      catch (error) {
        console.error('Error al eliminar el usuario:', error)
      }
    }

    const handleSubmit = async (data: Record<string, any>) => {
      try {
        if (isEditing.value)
          await crudController.update(formData.value.id, data)
        else
          await crudController.create(data)

        showForm.value = false
        await loadItems(currentPage.value)
      }
      catch (error) {
        console.error('Error al guardar el usuario:', error)
      }
    }

    const handlePageChange = (page: number) => {
      loadItems(page)
    }

    onMounted(() => {
      loadItems()
    })

    return {
      userModel,
      items,
      currentPage,
      hasMorePages,
      showForm,
      isEditing,
      formData,
      handleCreate,
      handleEdit,
      handleDelete,
      handleSubmit,
      handlePageChange,
    }
  },
})
</script>

<template>
  <div class="crud-container">
    <h1>Gestión de Usuarios</h1>

    <!-- Formulario -->
    <div
      v-if="showForm"
      class="form-section"
    >
      <h2>{{ isEditing ? 'Editar' : 'Crear' }} Usuario</h2>
      <FormGenerator
        :model-definition="userModel"
        :initial-data="formData"
        @submit="handleSubmit"
        @cancel="showForm = false"
      />
    </div>

    <!-- Tabla -->
    <div
      v-else
      class="table-section"
    >
      <button
        class="create-button"
        @click="handleCreate"
      >
        Nuevo Usuario
      </button>
      <TableGenerator
        :model-definition="userModel"
        :items="items"
        :current-page="currentPage"
        :has-more-pages="hasMorePages"
        @edit="handleEdit"
        @delete="handleDelete"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.crud-container {
  padding: 1rem;
  margin-block: 0;
  margin-inline: auto;
  max-inline-size: 1200px;
}

h1 {
  color: #1a202c;
  margin-block-end: 2rem;
}

.create-button {
  border: none;
  border-radius: 0.25rem;
  background-color: #4299e1;
  color: white;
  cursor: pointer;
  margin-block-end: 1rem;
  padding-block: 0.5rem;
  padding-inline: 1rem;
}

.create-button:hover {
  background-color: #3182ce;
}

.form-section,
 .table-section {
  padding: 1.5rem;
  border-radius: 0.5rem;
  background-color: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 10%);
}

h2 {
  color: #2d3748;
  margin-block-end: 1.5rem;
}
</style>
