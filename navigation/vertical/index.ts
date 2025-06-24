import { ROLES } from '@/composables/useRoles'

export default [
  {
    title: 'Home',
    to: { name: 'index' },
    icon: { icon: 'tabler-smart-home' },
  },
  {
    title: 'Graduates',
    to: { name: 'graduates' },
    icon: { icon: 'tabler-users' },
    requiredRoles: [ROLES.EMPLEADOR, ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
  },
  {
    title: 'Employers',
    to: { name: 'employers' },
    icon: { icon: 'tabler-briefcase' },
    requiredRoles: [ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
  },
  {
    title: 'Directors',
    to: { name: 'directors' },
    icon: { icon: 'tabler-briefcase' },
    requiredRoles: [ROLES.ADMINISTRADOR],
  },
  {
    title: 'Education Centers',
    to: { name: 'education-centers' },
    icon: { icon: 'tabler-briefcase' },
    requiredRoles: [ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
  },
  {
    title: 'Jobs',
    to: { name: 'jobs' },
    icon: { icon: 'tabler-briefcase-2' },
    requiredRoles: [ROLES.EMPLEADOR, ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
  },
  {
    title: 'Encuestas',
    icon: { icon: 'mdi-poll' },
    to: 'surveys',
  },
  {
    title: 'Dashboard Estadísticas',
    icon: { icon: 'mdi-view-dashboard' },
    to: 'dashboard-estadisticas',
  },
  {
    title: 'Mis Encuestas',
    icon: { icon: 'mdi-clipboard-text' },
    to: 'my-surveys',
  },
]
