<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  graduateService,
  useGraduateDetail,
} from '@/src/features/graduates'
import defaultAvatar from '@images/avatars/avatar-1.png'

definePageMeta({
  middleware: ['auth', 'role'],
  layout: 'default',
})

const route = useRoute()
const router = useRouter()

const graduateId = computed(() => {
  const rawId = (route.params as Record<string, unknown>).id
  const normalizedId = Array.isArray(rawId) ? rawId[0] : rawId
  const parsed = Number(normalizedId)
  const isValidNumber = Number.isFinite(parsed)

  return isValidNumber && parsed > 0 ? parsed : null
})

const activeTab = ref('resumen-academico')

const degreeTypes = ref<Array<{ id: number; nombre: string }>>([])
const titulationModes = ref<Array<{ id: number; nombre: string }>>([])
const languages = ref<Array<{ id: number; nombre: string }>>([])
const universities = ref<Array<{ id: number; nombre: string }>>([])

const { graduate, loading, notFound } = useGraduateDetail(graduateId)

const pageTitle = computed(() => {
  if (!graduate.value)
    return 'Detalle de graduado'

  return `${graduate.value.nombres} ${graduate.value.apellidos}`
})

const avatarSrc = computed(() => graduate.value?.cvPath || defaultAvatar)

const summaryItems = computed(() => {
  if (!graduate.value)
    return []

  return [
    { label: 'Codigo universitario', value: graduate.value.codigoUniversitario || '-' },
    { label: 'Facultad', value: graduate.value.facultad || '-' },
    { label: 'Escuela profesional', value: graduate.value.escuelaProfesional || '-' },
    { label: 'Anio de ingreso', value: graduate.value.anioIngreso || '-' },
    { label: 'Anio de egreso', value: graduate.value.anioEgreso || '-' },
    { label: 'Nacionalidad', value: graduate.value.nacionalidad || '-' },
    { label: 'Estado civil', value: graduate.value.estadoCivil || '-' },
    { label: 'LinkedIn', value: graduate.value.linkedin || '-' },
    { label: 'Portafolio', value: graduate.value.portafolio || '-' },
  ]
})

const degreeRows = computed(() => {
  if (!graduate.value)
    return []

  return (graduate.value.grados || []).map((item, index) => ({
    id: `${index}-${item.tipo_grado_id || 'na'}`,
    tipo: degreeTypes.value.find(type => type.id === item.tipo_grado_id)?.nombre || '-',
    universidad: universities.value.find(university => university.id === item.universidad_id)?.nombre || '-',
    fecha: item.fecha_grado || '-',
    modalidad: titulationModes.value.find(mode => mode.id === item.titulacion?.modalidad_titulacion_id)?.nombre || item.titulacion?.modalidad_otro || '-',
    nombre: item.otro_grado_nombre || '-',
  }))
})

const languageRows = computed(() => {
  if (!graduate.value)
    return []

  return (graduate.value.idiomas || []).map((item, index) => ({
    id: `${index}-${item.idioma_id || 'na'}`,
    idioma: languages.value.find(language => language.id === item.idioma_id)?.nombre || '-',
    nivel: item.nivel || '-',
    aprendizaje: item.aprendizaje || '-',
    vigencia: item.fecha_inicio && item.fecha_fin ? `${item.fecha_inicio} - ${item.fecha_fin}` : '-',
  }))
})

const loadCatalogs = async () => {
  const [loadedDegreeTypes, loadedTitulationModes, loadedLanguages, loadedUniversities] = await Promise.all([
    graduateService.fetchDegreeTypes(),
    graduateService.fetchTitulationModes(),
    graduateService.fetchLanguagesCatalog(),
    graduateService.fetchUniversities(),
  ])

  degreeTypes.value = loadedDegreeTypes
  titulationModes.value = loadedTitulationModes
  languages.value = loadedLanguages
  universities.value = loadedUniversities
}

const openEditWizard = async () => {
  if (!graduate.value)
    return

  await router.push({
    name: 'graduates-id-edit',
    params: { id: graduate.value.graduateId },
  })
}

onMounted(async () => {
  await loadCatalogs()
})
</script>

<template>
  <section>
    <VAlert
      v-if="notFound"
      type="warning"
      variant="tonal"
    >
      No se encontro el graduado solicitado.
    </VAlert>

    <VRow v-else>
      <VCol cols="12" md="4">
        <VCard>
          <VCardText class="d-flex flex-column align-center text-center gap-4">
            <VAvatar
              :image="avatarSrc"
              size="112"
            />

            <div>
              <div class="text-h6">
                {{ pageTitle }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ graduate?.correo || '-' }}
              </div>
            </div>

            <VDivider class="w-100" />

            <div class="w-100 d-flex flex-column align-start gap-2 text-left">
              <div><strong>DNI:</strong> {{ graduate?.dni || '-' }}</div>
              <div><strong>Celular:</strong> {{ graduate?.celular || '-' }}</div>
              <div><strong>Genero:</strong> {{ graduate?.genero || '-' }}</div>
              <div><strong>Nacimiento:</strong> {{ graduate?.fechaNacimiento || '-' }}</div>
              <div><strong>Direccion:</strong> {{ graduate?.direccionActual || '-' }}</div>
              <div><strong>Ciudad:</strong> {{ graduate?.ciudad || '-' }}</div>
              <div><strong>Departamento:</strong> {{ graduate?.departamento || '-' }}</div>
              <div><strong>Pais:</strong> {{ graduate?.paisResidencia || '-' }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="8">
        <VCard>
          <VCardTitle class="d-flex justify-space-between align-center flex-wrap gap-2">
            <span class="text-h6">Ficha informativa del graduado</span>

            <div class="d-flex gap-2">
              <VBtn
                variant="tonal"
                color="secondary"
                :to="{ path: '/graduates' }"
              >
                Volver
              </VBtn>
              <VBtn
                color="primary"
                :disabled="!graduate"
                @click="openEditWizard"
              >
                Editar informacion
              </VBtn>
            </div>
          </VCardTitle>

          <VDivider />

          <VCardText>
            <VProgressLinear
              v-if="loading"
              indeterminate
              color="primary"
              class="mb-4"
            />

            <VTabs
              v-model="activeTab"
              color="primary"
            >
              <VTab value="resumen-academico">
                Resumen academico
              </VTab>
              <VTab value="grados">
                Grados
              </VTab>
              <VTab value="idiomas">
                Idiomas
              </VTab>
            </VTabs>

            <VWindow
              v-model="activeTab"
              class="mt-4"
            >
              <VWindowItem value="resumen-academico">
                <VRow>
                  <VCol
                    v-for="item in summaryItems"
                    :key="item.label"
                    cols="12"
                    md="6"
                  >
                    <VCard
                      flat
                      border
                    >
                      <VCardText>
                        <div class="text-caption text-medium-emphasis">
                          {{ item.label }}
                        </div>
                        <div class="text-body-1">
                          {{ item.value }}
                        </div>
                      </VCardText>
                    </VCard>
                  </VCol>
                </VRow>
              </VWindowItem>

              <VWindowItem value="grados">
                <VAlert
                  v-if="degreeRows.length === 0"
                  type="info"
                  variant="tonal"
                >
                  No hay grados registrados.
                </VAlert>

                <VTable v-else>
                  <thead>
                    <tr>
                      <th scope="col">Tipo</th>
                      <th scope="col">Nombre</th>
                      <th scope="col">Universidad</th>
                      <th scope="col">Fecha</th>
                      <th scope="col">Modalidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="row in degreeRows"
                      :key="row.id"
                    >
                      <td>{{ row.tipo }}</td>
                      <td>{{ row.nombre }}</td>
                      <td>{{ row.universidad }}</td>
                      <td>{{ row.fecha }}</td>
                      <td>{{ row.modalidad }}</td>
                    </tr>
                  </tbody>
                </VTable>
              </VWindowItem>

              <VWindowItem value="idiomas">
                <VAlert
                  v-if="languageRows.length === 0"
                  type="info"
                  variant="tonal"
                >
                  No hay idiomas registrados.
                </VAlert>

                <VTable v-else>
                  <thead>
                    <tr>
                      <th scope="col">Idioma</th>
                      <th scope="col">Nivel</th>
                      <th scope="col">Aprendizaje</th>
                      <th scope="col">Vigencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="row in languageRows"
                      :key="row.id"
                    >
                      <td>{{ row.idioma }}</td>
                      <td>{{ row.nivel }}</td>
                      <td>{{ row.aprendizaje }}</td>
                      <td>{{ row.vigencia }}</td>
                    </tr>
                  </tbody>
                </VTable>
              </VWindowItem>
            </VWindow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </section>
</template>
