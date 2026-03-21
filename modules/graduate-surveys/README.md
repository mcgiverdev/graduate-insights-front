# Módulo de Encuestas para Graduados

Este módulo permite a los graduados gestionar sus encuestas asignadas, responderlas y ver sus respuestas una vez completadas.

## Características

- ✅ **Lista de encuestas asignadas** - Ver todas las encuestas disponibles para el graduado
- ✅ **Estadísticas de progreso** - Visualizar el progreso de completado de encuestas
- ✅ **Responder encuestas** - Interfaz intuitiva para completar encuestas
- ✅ **Ver resultados** - Revisar respuestas de encuestas completadas
- ✅ **Validaciones** - Validación de campos requeridos antes del envío
- ✅ **Estados de carga** - Indicadores visuales durante las operaciones

## Estructura del Módulo

```
modules/graduate-surveys/
├── types/
│   └── index.ts                 # Tipos TypeScript
├── components/
│   ├── GraduateSurveyList.vue  # Lista de encuestas
│   ├── SurveyForm.vue          # Formulario para responder
│   └── SurveyResults.vue       # Vista de resultados
└── README.md                   # Documentación
```

## Composables

### `useGraduateSurveyService`

Composable principal para gestionar las encuestas de graduados.

```typescript
import { useGraduateSurveyService } from '@/composables/useGraduateSurveyService'

const { 
  surveys,              // Lista de encuestas
  currentSurvey,        // Encuesta actual
  loadingList,          // Estado de carga de lista
  loadingDetail,        // Estado de carga de detalle
  loadingSubmit,        // Estado de envío
  fetchSurveys,         // Obtener lista de encuestas
  fetchSurveyDetail,    // Obtener detalle de encuesta
  submitSurveyResponses // Enviar respuestas
} = useGraduateSurveyService()
```

## Componentes

### GraduateSurveyList

Muestra la lista de encuestas del graduado con estadísticas.

```vue
<GraduateSurveyList
  @take-survey="handleTakeSurvey"
  @view-results="handleViewResults"
/>
```

**Eventos:**
- `take-survey`: Se emite cuando el usuario quiere responder una encuesta
- `view-results`: Se emite cuando el usuario quiere ver los resultados

**Características:**
- Dashboard con estadísticas de progreso
- Separación visual entre encuestas pendientes y completadas
- Información detallada de cada encuesta
- Estados de carga y vacío

### SurveyForm

Formulario interactivo para responder encuestas.

```vue
<SurveyForm
  :survey-id="surveyId"
  @completed="handleCompleted"
  @cancel="handleCancel"
/>
```

**Props:**
- `surveyId`: ID de la encuesta a responder

**Eventos:**
- `completed`: Se emite cuando la encuesta se completa exitosamente
- `cancel`: Se emite cuando el usuario cancela

**Características:**
- Navegación pregunta por pregunta
- Validación en tiempo real
- Barra de progreso
- Soporte para múltiples tipos de pregunta
- Confirmación antes del envío

### SurveyResults

Muestra los resultados de una encuesta completada.

```vue
<SurveyResults
  :survey-id="surveyId"
  @back="handleBack"
/>
```

**Props:**
- `surveyId`: ID de la encuesta completada

**Eventos:**
- `back`: Se emite cuando el usuario quiere volver a la lista

**Características:**
- Vista detallada de cada respuesta
- Información de la encuesta
- Fechas de creación y completado
- Diseño visualmente atractivo

## Tipos de Preguntas Soportados

1. **TEXT** - Respuesta de texto libre
2. **NUMERIC** - Respuesta numérica
3. **SINGLE_CHOICE** - Selección única entre opciones
4. **MULTIPLE_CHOICE** - Selección múltiple entre opciones

## API Endpoints

### Obtener lista de encuestas
```
GET /graduate-insights/v1/api/graduate-surveys
```

**Respuesta:**
```json
{
  success: true,
  message: 'Todas las encuestas obtenidas exitosamente',
  data: [
    {
      survey_id: 1,
      title: 'Encuesta de Satisfacción',
      description: 'Evaluación de satisfacción laboral',
      survey_type: 'EMPLOYMENT_SATISFACTION',
      completed: false,
      created_date: '2025-01-15T10:30:00',
      question_count: 5,
    }
  ],
}
```

### Obtener detalle de encuesta
```
GET /graduate-insights/v1/api/graduate-surveys/{id}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Detalle de la encuesta obtenido exitosamente",
  "data": {
    "survey_id": 1,
    "survey_title": "Encuesta de Satisfacción",
    "survey_description": "Evaluación de satisfacción laboral",
    "survey_type": "EMPLOYMENT_SATISFACTION",
    "completed": false,
    "submitted_at": null,
    "created_date": "2025-01-15T10:30:00",
    "questions": [...]
  }
}
```

### Enviar respuestas
```
POST /graduate-insights/v1/api/survey-responses
```

**Body:**
```json
{
  surveyId: 1,
  responses: [
    {
      questionId: 1,
      textResponse: 'Mi respuesta',
      selectedOptionIds: [1, 2],
    }
  ],
}
```

## Uso en Páginas

```vue
<script setup lang="ts">
import { ref } from 'vue'
import GraduateSurveyList from '@/modules/graduate-surveys/components/GraduateSurveyList.vue'
import SurveyForm from '@/modules/graduate-surveys/components/SurveyForm.vue'
import SurveyResults from '@/modules/graduate-surveys/components/SurveyResults.vue'
import RoleGuard from '@/components/RoleGuard.vue'
import { ROLES } from '@/composables/useRoles'

const currentView = ref('list')
const selectedSurvey = ref(null)

function showSurveyForm(survey) {
  selectedSurvey.value = survey
  currentView.value = 'take'
}

function showSurveyResults(survey) {
  selectedSurvey.value = survey
  currentView.value = 'results'
}

function backToList() {
  currentView.value = 'list'
  selectedSurvey.value = null
}
</script>

<template>
  <RoleGuard :roles="[ROLES.GRADUADO]">
    <GraduateSurveyList
      v-if="currentView === 'list'"
      @take-survey="showSurveyForm"
      @view-results="showSurveyResults"
    />

    <SurveyForm
      v-else-if="currentView === 'take'"
      :survey-id="selectedSurvey.survey_id"
      @completed="backToList"
      @cancel="backToList"
    />

    <SurveyResults
      v-else-if="currentView === 'results'"
      :survey-id="selectedSurvey.survey_id"
      @back="backToList"
    />
  </RoleGuard>
</template>
```

## Control de Acceso

Este módulo está protegido por roles y solo es accesible para usuarios con el rol de **Graduado**.

- Utiliza `RoleGuard` component para controlar el acceso
- La navegación se muestra solo para graduados
- Las rutas están protegidas por middleware de autenticación

## Estados de la Aplicación

### Estados de Carga
- `loadingList` - Cargando lista de encuestas
- `loadingDetail` - Cargando detalle de encuesta
- `loadingSubmit` - Enviando respuestas

### Estados de Datos
- Lista vacía - No hay encuestas asignadas
- Encuestas pendientes - Encuestas por completar
- Encuestas completadas - Encuestas ya respondidas

## Mejores Prácticas

1. **Validación**: Siempre validar campos requeridos antes del envío
2. **Estados de carga**: Mostrar indicadores durante las operaciones
3. **Manejo de errores**: Mostrar mensajes claros al usuario
4. **Navegación**: Permitir cancelar y volver en cualquier momento
5. **Persistencia**: Las respuestas se guardan al completar la encuesta

## Personalización

### Colores por Tipo de Encuesta
```typescript
const getSurveyTypeColor = (type: string) => {
  const colors = {
    'EMPLOYMENT_STATUS': 'primary',
    'EMPLOYMENT_SATISFACTION': 'success',
    'SATISFACTION': 'info',
    'FEEDBACK': 'warning',
    'EVALUATION': 'secondary',
    'CUSTOM': 'purple'
  }
  return colors[type] || 'grey'
}
```

### Etiquetas de Tipo
```typescript
const getSurveyTypeLabel = (type: string) => {
  const types = {
    'EMPLOYMENT_STATUS': 'Estado Laboral',
    'EMPLOYMENT_SATISFACTION': 'Satisfacción Laboral',
    'SATISFACTION': 'Satisfacción',
    'FEEDBACK': 'Retroalimentación',
    'EVALUATION': 'Evaluación',
    'CUSTOM': 'Personalizada'
  }
  return types[type] || type
}
``` 
