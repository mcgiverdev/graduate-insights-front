import { computed, readonly, ref } from 'vue'
import { useApi } from '@/composables/useApi'
import type { ApiEnvelope } from '@/infrastructure/http/types'
import type { GraduateSurveyListItem } from '@/src/features/graduate-surveys'
import type { MyJob, MyJobApiResponse } from '@/src/features/my-jobs'
import type { MyJobOffer, MyJobOfferApiResponse } from '@/src/features/my-job-offers'

interface GraduateDashboardApiResponse {
  survey_stats: {
    total: number
    completed: number
    pending: number
    completion_rate: number
  }
  job_stats: {
    total_jobs: number
    active_jobs: number
  }
  profile_complete?: boolean
  pending_surveys: GraduateSurveyListItem[]
  completed_surveys: GraduateSurveyListItem[]
  jobs: MyJobApiResponse[]
  job_offers: MyJobOfferApiResponse[]
}

const jobs = ref<MyJob[]>([])
const jobOffers = ref<MyJobOffer[]>([])
const loading = ref(false)
const lastError = ref<string | null>(null)

const surveyStatsState = ref({
  total: 0,
  completed: 0,
  pending: 0,
  completionRate: 0,
})

const pendingSurveysState = ref<GraduateSurveyListItem[]>([])
const completedSurveysState = ref<GraduateSurveyListItem[]>([])

const jobStatsState = ref({
  totalJobs: 0,
  activeJobs: 0,
})

const profileCompleteState = ref(false)

const toMyJob = (job: MyJobApiResponse): MyJob => ({
  jobId: job.job_id,
  compania: job.compania,
  estado: job.estado,
  cargo: job.cargo,
  modalidad: job.modalidad,
  fechaInicio: job.fecha_inicio ?? '',
  fechaFin: job.fecha_fin ?? '',
})

const toMyJobOffer = (offer: MyJobOfferApiResponse): MyJobOffer => ({
  jobOfferId: offer.job_offers_id,
  titulo: offer.titulo,
  link: offer.link,
  descripcion: offer.descripcion,
  estado: offer.estado,
})

export const useGraduateDashboard = () => {
  const loadGraduateDashboard = async () => {
    if (loading.value)
      return

    loading.value = true
    lastError.value = null

    try {
      const response = await useApi<ApiEnvelope<GraduateDashboardApiResponse>>(
        '/graduate-insights/v1/api/graduate-dashboard',
        { method: 'GET' },
      )

      if (response.data?.success && response.data.data) {
        const payload = response.data.data

        surveyStatsState.value = {
          total: payload.survey_stats?.total ?? 0,
          completed: payload.survey_stats?.completed ?? 0,
          pending: payload.survey_stats?.pending ?? 0,
          completionRate: payload.survey_stats?.completion_rate ?? 0,
        }

        profileCompleteState.value = payload.profile_complete ?? false

        pendingSurveysState.value = payload.pending_surveys ?? []
        completedSurveysState.value = payload.completed_surveys ?? []

        jobs.value = (payload.jobs ?? []).map(toMyJob)
        jobOffers.value = (payload.job_offers ?? []).map(toMyJobOffer)

        jobStatsState.value = {
          totalJobs: payload.job_stats?.total_jobs ?? jobs.value.length,
          activeJobs: payload.job_stats?.active_jobs
            ?? jobs.value.filter(job => job.estado === '1' && !job.fechaFin).length,
        }

        return { success: true }
      }

      throw new Error(response.data?.message || 'No se pudo cargar el dashboard del graduado')
    }
    catch (error: any) {
      console.error('Error loading graduate dashboard:', error)
      lastError.value = error?.message || 'No se pudo actualizar la información del dashboard'

      return { success: false, message: lastError.value }
    }
    finally {
      loading.value = false
    }
  }

  const surveyStats = readonly(surveyStatsState)
  const pendingSurveys = readonly(pendingSurveysState)
  const completedSurveys = readonly(completedSurveysState)

  const activeJobsCount = computed(() => jobStatsState.value.activeJobs)
  const totalJobsCount = computed(() => jobStatsState.value.totalJobs)
  const profileComplete = readonly(profileCompleteState)

  return {
    loadGraduateDashboard,
    graduateDashboardLoading: readonly(loading),
    graduateDashboardError: readonly(lastError),
    surveyStats,
    pendingSurveys,
    completedSurveys,
    jobs: readonly(jobs),
    jobOffers: readonly(jobOffers),
    activeJobsCount,
    totalJobsCount,
    profileComplete,
  }
}
