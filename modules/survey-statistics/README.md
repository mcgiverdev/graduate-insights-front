# Módulo de Estadísticas de Encuestas

Este módulo proporciona una interfaz completa para visualizar y analizar las estadísticas de las encuestas de seguimiento de egresados.

## Características Principales

### 📊 Resumen General
- Métricas clave de la encuesta (tasa de respuesta, completitud, etc.)
- Información general de la encuesta y centro educativo
- Indicadores visuales de progreso

### 📈 Gráficos Demográficos
- **Distribución por Ubicación**: Gráfico de barras mostrando respuestas por ciudad/región
- **Distribución por Industria**: Gráfico de donut con sectores laborales
- **Estado Laboral**: Gráfico de barras horizontales (empleado, desempleado, emprendedor)
- **Rango Salarial**: Gráfico de donut con rangos de salarios
- **Evolución Mensual**: Gráfico de líneas mostrando respuestas por mes
- **Distribución por Género**: Gráfico de donut

### 🔍 Análisis por Pregunta
- Estadísticas detalladas para cada pregunta de la encuesta
- Gráficos específicos según el tipo de pregunta
- Métricas estadísticas (promedio, mediana, moda, desviación estándar)
- Distribución de respuestas con porcentajes

## Estructura del Módulo

```
modules/survey-statistics/
├── components/
│   ├── StatisticsOverview.vue      # Resumen general de la encuesta
│   ├── StatisticsCharts.vue        # Gráficos demográficos
│   └── QuestionStatistics.vue      # Análisis por pregunta
├── index.ts                        # Exportaciones del módulo
└── README.md                       # Esta documentación
```

## Componentes

### StatisticsOverview
Muestra un resumen ejecutivo de la encuesta con métricas clave y información general.

**Props:**
- `statistics: SurveyStatistics | null` - Datos de estadísticas de la encuesta

### StatisticsCharts
Renderiza múltiples gráficos para mostrar la distribución demográfica de las respuestas.

**Props:**
- `statistics: SurveyStatistics | null` - Datos de estadísticas de la encuesta

**Gráficos incluidos:**
- Respuestas por ubicación (Gráfico de barras)
- Respuestas por industria (Gráfico de donut)
- Estado laboral (Gráfico de barras horizontales)
- Rango salarial (Gráfico de donut)
- Evolución mensual (Gráfico de líneas)

### QuestionStatistics
Proporciona análisis detallado de cada pregunta individual de la encuesta.

**Props:**
- `statistics: SurveyStatistics | null` - Datos de estadísticas de la encuesta

**Características:**
- Estadísticas descriptivas para preguntas numéricas
- Distribución de respuestas con porcentajes
- Gráficos dinámicos según el tipo de pregunta

## Servicios

### useSurveyStatisticsService
Composable que maneja la comunicación con la API de estadísticas.

**Métodos:**
- `fetchSurveyStatistics(surveyId: number)` - Obtiene estadísticas de una encuesta
- `clearStatistics()` - Limpia los datos del estado

**Estado:**
- `statistics` - Datos de estadísticas actuales
- `loadingStatistics` - Estado de carga

## API Endpoint

### GET /survey-statistics/{surveyId}

Obtiene las estadísticas completas de una encuesta específica.

**Respuesta:**
```typescript
interface SurveyStatistics {
  survey_id: number
  survey_title: string
  survey_description: string
  survey_type: string
  graduation_year: number
  education_center_name: string
  education_center_id: number
  survey_created_at: string
  last_response_at: string
  data_generated_at: string
  total_graduates: number
  total_responses: number
  pending_responses: number
  response_rate: number
  completion_rate: number
  total_questions: number
  answered_questions: number
  responses_by_location: Record<string, number>
  responses_by_industry: Record<string, number>
  responses_by_salary_range: Record<string, number>
  responses_by_gender: Record<string, number>
  responses_by_employment_status: Record<string, number>
  responses_by_month: Record<string, number>
  question_statistics: QuestionStatistic[]
}
```

## Uso

### En una página
```vue
<script setup>
import { useSurveyStatisticsService } from '@/modules/survey-statistics/composables/useSurveyStatisticsService'
import StatisticsOverview from '@/modules/survey-statistics/components/StatisticsOverview.vue'
import StatisticsCharts from '@/modules/survey-statistics/components/StatisticsCharts.vue'
import QuestionStatistics from '@/modules/survey-statistics/components/QuestionStatistics.vue'

const { statistics, loadingStatistics, fetchSurveyStatistics } = useSurveyStatisticsService()

onMounted(() => {
  fetchSurveyStatistics(surveyId)
})
</script>

<template>
  <div>
    <StatisticsOverview :statistics="statistics" />
    <StatisticsCharts :statistics="statistics" />
    <QuestionStatistics :statistics="statistics" />
  </div>
</template>
```

### Navegación
La página de estadísticas está accesible en: `/survey-statistics/{id}`

Donde `{id}` es el ID de la encuesta a analizar.

## Permisos

El acceso a las estadísticas requiere uno de los siguientes roles:
- `EMPLEADOR`
- `DIRECTOR` 
- `ADMINISTRADOR`

## Tecnologías Utilizadas

- **Vue 3** - Framework de interfaz
- **Vuetify 3** - Componentes de UI
- **Chart.js** - Librería de gráficos
- **vue-chartjs** - Wrapper de Chart.js para Vue
- **TypeScript** - Tipado estático

## Futuras Mejoras

- [ ] Exportación de reportes en PDF/Excel
- [ ] Filtros avanzados por fecha/demografía
- [ ] Comparación entre múltiples encuestas
- [ ] Alertas automáticas por baja participación
- [ ] Integración con herramientas de BI externas 

