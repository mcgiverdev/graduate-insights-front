import type {
  JobOffer,
  JobOfferApiResponse,
  JobOfferFormValues,
  JobOfferPayload,
} from '../types'

export const toJobOffer = (offer: JobOfferApiResponse): JobOffer => ({
  jobOfferId: offer.job_offers_id,
  titulo: offer.titulo,
  link: offer.link,
  descripcion: offer.descripcion,
  estado: offer.estado,
  employerId: offer.employer_id,
  employerName: offer.employer_name,
})

export const toFormValues = (offer?: JobOffer | null): JobOfferFormValues => ({
  titulo: offer?.titulo ?? '',
  link: offer?.link ?? '',
  descripcion: offer?.descripcion ?? '',
  estado: offer?.estado ?? '1',
  employerId: offer?.employerId ?? null,
})

export const toPayload = (values: JobOfferFormValues): JobOfferPayload => ({
  titulo: values.titulo.trim(),
  link: values.link.trim(),
  descripcion: values.descripcion.trim(),
  estado: values.estado,
  employer_id: Number(values.employerId),
})
