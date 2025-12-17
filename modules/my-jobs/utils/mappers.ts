import type {
  MyJob,
  MyJobApiResponse,
  MyJobFormValues,
  MyJobPayload,
} from '../types'

const normalizeDate = (value?: string | null) => {
  if (!value)
    return ''

  return value.split('T')[0]
}

export const toMyJob = (job: MyJobApiResponse): MyJob => ({
  jobId: job.job_id,
  compania: job.compania,
  estado: job.estado,
  cargo: job.cargo,
  modalidad: job.modalidad,
  fechaInicio: job.fecha_inicio ?? '',
  fechaFin: job.fecha_fin ?? '',
})

export const toFormValues = (job?: MyJob | null): MyJobFormValues => ({
  compania: job?.compania ?? '',
  cargo: job?.cargo ?? '',
  modalidad: job?.modalidad ?? '',
  fechaInicio: normalizeDate(job?.fechaInicio),
  fechaFin: normalizeDate(job?.fechaFin),
  estado: job?.estado ?? '1',
})

export const toPayload = (values: MyJobFormValues): MyJobPayload => ({
  compania: values.compania.trim(),
  cargo: values.cargo.trim(),
  modalidad: values.modalidad as MyJobPayload['modalidad'],
  fecha_inicio: values.fechaInicio,
  fecha_fin: values.fechaFin,
  estado: values.estado,
})
