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
    title: 'Encuestas',
    to: { name: 'surveys' },
    icon: { icon: 'tabler-clipboard-text' },
    requiredRoles: [ROLES.EMPLEADOR, ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
  },
  {
    title: 'Mis Encuestas',
    to: { name: 'my-surveys' },
    icon: { icon: 'tabler-clipboard-check' },
    requiredRoles: [ROLES.GRADUADO],
  },
]
