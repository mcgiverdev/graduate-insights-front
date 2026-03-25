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
  employerRuc: offer.employer_ruc ?? '',
  employerDireccion: offer.employer_direccion ?? '',
  employerCorreo: offer.employer_correo ?? '',
})

export const toFormValues = (offer?: JobOffer | null): JobOfferFormValues => ({
  titulo: offer?.titulo ?? '',
  link: offer?.link ?? '',
  descripcion: offer?.descripcion ?? '',
  employerId: offer?.employerId ?? null,
})

export const toPayload = (values: JobOfferFormValues): JobOfferPayload => ({
  titulo: values.titulo.trim(),
  link: values.link.trim(),
  descripcion: values.descripcion.trim(),
  employer_id: Number(values.employerId),
})
