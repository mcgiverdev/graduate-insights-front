import { ROLES } from '@/composables/useRoles'

export default [
  {
    title: 'Inicio',
    to: { name: 'index' },
    icon: { icon: 'tabler-home' },
  },
  {
    title: 'Graduados',
    to: { name: 'graduates' },
    icon: { icon: 'tabler-users' },
    requiredRoles: [ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
  },
  {
    title: 'Empleadores',
    to: { name: 'employers' },
    icon: { icon: 'tabler-briefcase' },
    requiredRoles: [ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
  },
  {
    title: 'Directores',
    to: { name: 'directors' },
    icon: { icon: 'tabler-shield-star' },
    requiredRoles: [ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
  },
  {
    title: 'Centros Educativos',
    to: { name: 'education-centers' },
    icon: { icon: 'tabler-school' },
    requiredRoles: [ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
  },
  {
    title: 'Tipos de Eventos',
    to: { name: 'event-types' },
    icon: { icon: 'tabler-calendar-stats' },
    requiredRoles: [ROLES.DIRECTOR],
  },
  {
    title: 'Eventos',
    to: { name: 'events' },
    icon: { icon: 'tabler-calendar' },
    requiredRoles: [ROLES.DIRECTOR],
  },
  {
    title: 'Trabajos de egresado',
    to: { name: 'jobs' },
    icon: { icon: 'tabler-briefcase-2' },
    requiredRoles: [ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
  },
  {
    title: 'Ofertas Laborales',
    to: { name: 'job-offers' },
    icon: { icon: 'tabler-calendar-event' },
    requiredRoles: [ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
  },
  {
    title: 'Mis Ofertas Laborales',
    to: { name: 'my-job-offers' },
    icon: { icon: 'tabler-calendar-plus' },
    requiredRoles: [ROLES.EMPLEADOR],
  },
  {
    title: 'Encuestas',
    icon: { icon: 'tabler-file-text' },
    to: { name: 'surveys' },
    requiredRoles: [ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
  },
  {
    title: 'Mi Perfil Academico',
    icon: { icon: 'tabler-school' },
    to: 'my-profile',
    requiredRoles: [ROLES.GRADUADO],
  },
  {
    title: 'Mis Encuestas',
    icon: { icon: 'tabler-clipboard-text' },
    to: 'my-surveys',
    requiredRoles: [ROLES.GRADUADO],
  },
  {
    title: 'Mis Trabajos',
    icon: { icon: 'tabler-briefcase' },
    to: 'my-jobs',
    requiredRoles: [ROLES.GRADUADO],
  },
  {
    title: 'Feed',
    to: { name: 'feed' },
    icon: { icon: 'tabler-news' },
    roles: ['GRADUATE', 'DIRECTOR'],
  },
]
