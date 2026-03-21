import type {
  Job,
  JobApiResponse,
  JobFormValues,
  JobPayload,
} from '../types'

const normalizeDate = (value?: string | null) => {
  if (!value)
    return ''

  return value.split('T')[0]
}

export const toJob = (job: JobApiResponse): Job => ({
  jobId: job.job_id,
  compania: job.compania,
  estado: job.estado,
  cargo: job.cargo,
  modalidad: job.modalidad,
  fechaInicio: job.fecha_inicio ?? '',
  fechaFin: job.fecha_fin ?? '',
  graduateId: job.graduate_id,
  graduateName: job.graduate_name,
})

export const toFormValues = (job?: Job | null): JobFormValues => ({
  compania: job?.compania ?? '',
  cargo: job?.cargo ?? '',
  modalidad: job?.modalidad ?? '',
  fechaInicio: normalizeDate(job?.fechaInicio),
  fechaFin: normalizeDate(job?.fechaFin),
  graduateId: job?.graduateId ?? null,
})

export const toPayload = (values: JobFormValues): JobPayload => ({
  compania: values.compania.trim(),
  cargo: values.cargo.trim(),
  modalidad: values.modalidad as JobPayload['modalidad'],
  fecha_inicio: values.fechaInicio,
  fecha_fin: values.fechaFin,
  graduate_id: Number(values.graduateId),
})
