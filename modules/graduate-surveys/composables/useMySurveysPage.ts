import { ref } from 'vue'
import type { GraduateSurveyListItem } from '../types'

type MySurveysView = 'list' | 'take' | 'results'

export const useMySurveysPage = () => {
  const currentView = ref<MySurveysView>('list')
  const selectedSurvey = ref<GraduateSurveyListItem | null>(null)

  const showSurveyForm = (survey: GraduateSurveyListItem) => {
    selectedSurvey.value = survey
    currentView.value = 'take'
  }

  const showSurveyResults = (survey: GraduateSurveyListItem) => {
    selectedSurvey.value = survey
    currentView.value = 'results'
  }

  const backToList = () => {
    currentView.value = 'list'
    selectedSurvey.value = null
  }

  const handleSurveyCompleted = () => {
    backToList()
  }

  return {
    currentView,
    selectedSurvey,
    showSurveyForm,
    showSurveyResults,
    backToList,
    handleSurveyCompleted,
  }
}
