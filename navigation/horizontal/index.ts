import { ROLES } from '@/composables/useRoles'

export default [
  {
    title: 'Inicio',
    to: { name: 'index' },
    icon: { icon: 'tabler-home' },
  },
  {
    title: 'Graduados',
    to: { name: 'egresados' },
    icon: { icon: 'tabler-graduation-cap' },
    requiredRoles: [ROLES.EMPLEADOR, ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
  },
  {
    title: 'Empleadores',
    to: { name: 'empleadores' },
    icon: { icon: 'tabler-briefcase' },
    requiredRoles: [ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
  },
  {
    title: 'Directores',
    to: { name: 'directores' },
    icon: { icon: 'tabler-shield-star' },
    requiredRoles: [ROLES.ADMINISTRADOR],
  },
  {
    title: 'Centros Educativos',
    to: { name: 'centros-educativos' },
    icon: { icon: 'tabler-school' },
    requiredRoles: [ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
  },
  {
    title: 'Encuestas',
    to: { name: 'encuestas' },
    icon: { icon: 'tabler-clipboard-text' },
    requiredRoles: [ROLES.EMPLEADOR, ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
  },
  {
    title: 'Mis Encuestas',
    to: { name: 'mis-encuestas' },
    icon: { icon: 'tabler-clipboard-check' },
    requiredRoles: [ROLES.GRADUADO],
  },
]
