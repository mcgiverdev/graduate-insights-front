import { ROLES } from '@/composables/useRoles'

export default [
  {
    title: 'Dashboard',
    to: { name: 'index' },
    icon: { icon: 'tabler-dashboard' },
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
    icon: { icon: 'tabler-shield-star' },
    requiredRoles: [ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
  },
  {
    title: 'Education Centers',
    to: { name: 'education-centers' },
    icon: { icon: 'tabler-school' },
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
    icon: { icon: 'tabler-file-text' },
    to: { name: 'surveys' },
    requiredRoles: [ROLES.EMPLEADOR, ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
  },
  {
    title: 'Estadísticas Detalladas',
    icon: { icon: 'tabler-chart-bar' },
    to: 'dashboard-estadisticas',
    requiredRoles: [ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
  },
  {
    title: 'Mis Encuestas',
    icon: { icon: 'tabler-clipboard-text' },
    to: 'my-surveys',
    requiredRoles: [ROLES.GRADUADO],
  },
]
