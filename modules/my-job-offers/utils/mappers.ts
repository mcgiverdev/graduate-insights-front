import type {
  MyJobOffer,
  MyJobOfferApiResponse,
  MyJobOfferFormValues,
  MyJobOfferPayload,
} from '../types'

export const toMyJobOffer = (offer: MyJobOfferApiResponse): MyJobOffer => ({
  jobOfferId: offer.job_offers_id,
  titulo: offer.titulo,
  link: offer.link,
  descripcion: offer.descripcion,
  estado: offer.estado,
  employerName: offer.employer_name ?? '',
  employerRuc: offer.employer_ruc ?? '',
  employerDireccion: offer.employer_direccion ?? '',
  employerCorreo: offer.employer_correo ?? '',
})

export const toFormValues = (offer?: MyJobOffer | null): MyJobOfferFormValues => ({
  titulo: offer?.titulo ?? '',
  link: offer?.link ?? '',
  descripcion: offer?.descripcion ?? '',
})

export const toPayload = (values: MyJobOfferFormValues): MyJobOfferPayload => ({
  titulo: values.titulo.trim(),
  link: values.link.trim(),
  descripcion: values.descripcion.trim(),
})
