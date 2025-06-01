<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { VForm } from 'vuetify/components'

interface Emit {
  (e: 'update:isDialogOpen', value: boolean): void
  (e: 'userData', value: any): void
}

interface Props {
  isDialogOpen: boolean
  userToEdit?: any
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const isFormValid = ref(false)
const refForm = ref<VForm>()

const nombres = ref('')
const apellidos = ref('')
const fechaNacimiento = ref('')
const genero = ref('M')
const correo = ref('')
const dni = ref('')
const celular = ref('')
const contrasena = ref('')

const required = (v: string) => !!v || 'Este campo es obligatorio'
const emailValidator = (v: string) => /.[^\n\r@\u2028\u2029]*@.+\..+/.test(v) || 'Correo inválido'

watch(() => props.userToEdit, user => {
  if (user) {
    nombres.value = user.nombres || ''
    apellidos.value = user.apellidos || ''
    fechaNacimiento.value = user.fecha_nacimiento || ''
    genero.value = user.genero || 'M'
    correo.value = user.correo || ''
    dni.value = user.dni || ''
    celular.value = user.celular || ''
    contrasena.value = user.contrasena || ''
  }
  else {
    nombres.value = ''
    apellidos.value = ''
    fechaNacimiento.value = ''
    genero.value = 'M'
    correo.value = ''
    dni.value = ''
    celular.value = ''
    contrasena.value = ''
  }
}, { immediate: true })

const closeDialog = () => {
  emit('update:isDialogOpen', false)
  nextTick(() => {
    refForm.value?.reset()
    refForm.value?.resetValidation()
  })
}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      const userPayload = {
        nombres: nombres.value,
        apellidos: apellidos.value,
        fecha_nacimiento: fechaNacimiento.value,
        genero: genero.value,
        correo: correo.value,
        dni: dni.value,
        celular: celular.value,
        contrasena: contrasena.value,
      }

      emit('userData', userPayload)
      emit('update:isDialogOpen', false)
      nextTick(() => {
        refForm.value?.reset()
        refForm.value?.resetValidation()
      })
    }
  })
}

const handleDialogModelValueUpdate = (val: boolean) => {
  emit('update:isDialogOpen', val)
}
</script>

<template>
  <VDialog
    :model-value="props.isDialogOpen"
    max-width="500"
    @update:model-value="handleDialogModelValueUpdate"
  >
    <VCard>
      <VCardTitle class="text-h5">
        {{ props.userToEdit ? 'Editar usuario' : 'Agregar nuevo usuario' }}
      </VCardTitle>
      <VDivider />
      <VCardText>
        <VForm
          ref="refForm"
          v-model="isFormValid"
          @submit.prevent="onSubmit"
        >
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="nombres"
                :rules="[required]"
                label="Nombres"
                placeholder="Ej: Juan"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="apellidos"
                :rules="[required]"
                label="Apellidos"
                placeholder="Ej: Pérez"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="fechaNacimiento"
                :rules="[required]"
                label="Fecha de nacimiento"
                type="date"
              />
            </VCol>
            <VCol cols="12">
              <AppSelect
                v-model="genero"
                :items="[{ title: 'Masculino', value: 'M' }, { title: 'Femenino', value: 'F' }]"
                label="Género"
                :rules="[required]"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="correo"
                :rules="[required, emailValidator]"
                label="Correo"
                placeholder="correo@ejemplo.com"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="dni"
                :rules="[required]"
                label="DNI"
                placeholder="12345678"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="celular"
                :rules="[required]"
                label="Celular"
                placeholder="987654321"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="contrasena"
                :rules="[required]"
                label="Contraseña"
                type="password"
              />
            </VCol>
            <VCol
              cols="12"
              class="d-flex justify-end gap-2"
            >
              <VBtn
                type="submit"
                color="primary"
              >
                Guardar
              </VBtn>
              <VBtn
                type="reset"
                variant="tonal"
                color="error"
                @click="closeDialog"
              >
                Cancelar
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
