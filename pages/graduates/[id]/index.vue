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

const degreeTypes = ref<Array<{ id: number; nombre: string; codigo?: string }>>([])
const titulationModes = ref<Array<{ id: number; nombre: string }>>([])
const languages = ref<Array<{ id: number; nombre: string }>>([])
const universities = ref<Array<{ id: number; nombre: string }>>([])
const faculties = ref<Array<{ id: number; nombre: string }>>([])
const professionalSchools = ref<Array<{ id: number; facultad_id?: number; facultadId?: number; nombre: string }>>([])

const resolvedSchoolName = computed(() => {
  if (!graduate.value?.escuelaProfesionalId) return '-'
  return professionalSchools.value.find(s => s.id === graduate.value!.escuelaProfesionalId)?.nombre || '-'
})

const resolvedFacultyName = computed(() => {
  if (!graduate.value?.escuelaProfesionalId) return '-'
  const school = professionalSchools.value.find(s => s.id === graduate.value!.escuelaProfesionalId)
  if (!school) return '-'
  const fId = school.facultad_id ?? school.facultadId
  if (!fId) return '-'
  return faculties.value.find(f => f.id === fId)?.nombre || '-'
})

const { graduate, loading, notFound } = useGraduateDetail(graduateId)

const formatDate = (value?: string | null) => {
  if (!value) return '-'
  const datePart = value.trim().split(/[T ]/)[0]
  if (!datePart) return '-'
  const [year, month, day] = datePart.split('-')
  if (!year || !month || !day) return datePart
  return `${day}/${month}/${year}`
}

const formatDateRange = (start?: string | null, end?: string | null) => {
  const s = formatDate(start)
  const e = formatDate(end)
  if (s === '-' && e === '-') return '-'
  if (e === '-') return s
  return `${s} — ${e}`
}

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
    { label: 'Facultad', value: resolvedFacultyName.value },
    { label: 'Escuela profesional', value: resolvedSchoolName.value },
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

  return (graduate.value.grados || []).map((item, index) => {
    const tipoObj = degreeTypes.value.find(t => t.id === item.tipo_grado_id)
    const tipoNombre = tipoObj?.nombre || '-'
    const isOtro = tipoObj?.codigo === 'OTRO' || tipoObj?.nombre === 'Otro'
    const isTitulado = tipoObj?.codigo === 'TITULADO' || tipoObj?.nombre === 'Titulado'

    // Resolver modalidad de titulación
    const modalidadNombre = titulationModes.value.find(m => m.id === item.titulacion?.modalidad_titulacion_id)?.nombre
      || item.titulacion?.modalidad_otro
      || ''

    // Construir nombre del tipo de grado
    let tipo = tipoNombre
    if (isOtro && item.otro_grado_nombre?.trim()) {
      tipo = `${tipoNombre}: ${item.otro_grado_nombre.trim()}`
    }
    else if (isTitulado && modalidadNombre) {
      tipo = `${tipoNombre} (${modalidadNombre})`
    }

    return {
      id: `${index}-${item.tipo_grado_id || 'na'}`,
      tipo,
      universidad: universities.value.find(u => u.id === item.universidad_id)?.nombre || '-',
      fecha: formatDate(item.fecha_grado),
    }
  })
})

const languageRows = computed(() => {
  if (!graduate.value)
    return []

  return (graduate.value.idiomas || []).map((item, index) => ({
    id: `${index}-${item.idioma_id || 'na'}`,
    idioma: languages.value.find(language => language.id === item.idioma_id)?.nombre || '-',
    nivel: item.nivel || '-',
    aprendizaje: item.aprendizaje || '-',
    vigencia: formatDateRange(item.fecha_inicio, item.fecha_fin),
  }))
})

const complementaryTrainingRows = computed(() => {
  if (!graduate.value)
    return []

  return (graduate.value.formacionesComplementarias || []).map((item, index) => ({
    id: `${index}-${item.nombre_curso || 'na'}`,
    curso: item.nombre_curso || '-',
    institucion: item.institucion || '-',
    vigencia: formatDateRange(item.fecha_inicio, item.fecha_fin),
  }))
})

const workTrajectoryRows = computed(() => {
  if (!graduate.value)
    return []

  return (graduate.value.trayectoriasLaborales || []).map((item, index) => ({
    id: `${index}-${item.empresa || 'na'}`,
    empresa: item.empresa || '-',
    cargo: item.cargo || '-',
    modalidad: item.modalidad || '-',
    vigencia: formatDateRange(item.fecha_inicio, item.fecha_fin),
    estado: item.fecha_fin ? 'Finalizado' : 'En curso',
  }))
})

const loadCatalogs = async () => {
  const [loadedDegreeTypes, loadedTitulationModes, loadedLanguages, loadedUniversities, loadedFaculties, loadedSchools] = await Promise.all([
    graduateService.fetchDegreeTypes(),
    graduateService.fetchTitulationModes(),
    graduateService.fetchLanguagesCatalog(),
    graduateService.fetchUniversities(),
    graduateService.fetchFaculties(),
    graduateService.fetchProfessionalSchools(),
  ])

  degreeTypes.value = loadedDegreeTypes
  titulationModes.value = loadedTitulationModes
  languages.value = loadedLanguages
  universities.value = loadedUniversities
  faculties.value = loadedFaculties
  professionalSchools.value = loadedSchools
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
              <div><strong>Nacimiento:</strong> {{ formatDate(graduate?.fechaNacimiento) }}</div>
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
              <VTab value="formacion-complementaria">
                Formacion complementaria
              </VTab>
              <VTab value="trayectoria-laboral">
                Trayectoria laboral
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
                      <th scope="col">Tipo de grado</th>
                      <th scope="col">Universidad</th>
                      <th scope="col">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="row in degreeRows"
                      :key="row.id"
                    >
                      <td>{{ row.tipo }}</td>
                      <td>{{ row.universidad }}</td>
                      <td>{{ row.fecha }}</td>
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

              <VWindowItem value="formacion-complementaria">
                <VAlert
                  v-if="complementaryTrainingRows.length === 0"
                  type="info"
                  variant="tonal"
                >
                  No hay formaciones complementarias registradas.
                </VAlert>

                <VTable v-else>
                  <thead>
                    <tr>
                      <th scope="col">Curso</th>
                      <th scope="col">Institucion</th>
                      <th scope="col">Vigencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="row in complementaryTrainingRows"
                      :key="row.id"
                    >
                      <td>{{ row.curso }}</td>
                      <td>{{ row.institucion }}</td>
                      <td>{{ row.vigencia }}</td>
                    </tr>
                  </tbody>
                </VTable>
              </VWindowItem>

              <VWindowItem value="trayectoria-laboral">
                <VAlert
                  v-if="workTrajectoryRows.length === 0"
                  type="info"
                  variant="tonal"
                >
                  No hay trayectorias laborales registradas.
                </VAlert>

                <VTable v-else>
                  <thead>
                    <tr>
                      <th scope="col">Empresa</th>
                      <th scope="col">Cargo</th>
                      <th scope="col">Modalidad</th>
                      <th scope="col">Vigencia</th>
                      <th scope="col">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="row in workTrajectoryRows"
                      :key="row.id"
                    >
                      <td>{{ row.empresa }}</td>
                      <td>{{ row.cargo }}</td>
                      <td>{{ row.modalidad }}</td>
                      <td>{{ row.vigencia }}</td>
                      <td>{{ row.estado }}</td>
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
