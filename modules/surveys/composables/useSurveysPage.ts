import { ref } from 'vue'
import type { Survey } from '../types'

type SurveysView = 'list' | 'create' | 'edit'

export const useSurveysPage = () => {
  const currentView = ref<SurveysView>('list')
  const editingSurvey = ref<Survey | null>(null)

  const showCreateForm = () => {
    editingSurvey.value = null
    currentView.value = 'create'
  }

  const showEditForm = (survey: Survey) => {
    editingSurvey.value = survey
    currentView.value = 'edit'
  }

  const backToList = () => {
    currentView.value = 'list'
    editingSurvey.value = null
  }

  const handleSurveySaved = () => {
    backToList()
  }

  const handleViewSurvey = (survey: Survey) => {
    showEditForm(survey)
  }

  const handleDuplicateSurvey = (survey: Survey) => {
    const duplicatedSurvey: Survey = {
      ...survey,
      id: undefined,
      title: `${survey.title} (Copia)`,
      questions: survey.questions.map(question => ({
        ...question,
        id: undefined,
        options: question.options.map(option => ({ ...option, id: undefined })),
      })),
    }

    editingSurvey.value = duplicatedSurvey
    currentView.value = 'create'
  }

  return {
    currentView,
    editingSurvey,
    showCreateForm,
    showEditForm,
    backToList,
    handleSurveySaved,
    handleViewSurvey,
    handleDuplicateSurvey,
  }
}
