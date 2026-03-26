import { ROLES } from '@/composables/useRoles'

export default [
  // ── Inicio ─────────────────────────────────────────────
  {
    title: 'Inicio',
    to: { name: 'index' },
    icon: { icon: 'tabler-home' },
  },

  // ── Feed ───────────────────────────────────────────────
  {
    title: 'Feed',
    to: { name: 'feed' },
    icon: { icon: 'tabler-news' },
    requiredRoles: [ROLES.GRADUADO, ROLES.DIRECTOR],
  },

  // ── Gestión de Usuarios (Director / Admin) ─────────────
  {
    title: 'Usuarios',
    icon: { icon: 'tabler-users-group' },
    requiredRoles: [ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
    children: [
      {
        title: 'Graduados',
        to: { name: 'graduates' },
        icon: { icon: 'tabler-users' },
      },
      {
        title: 'Empleadores',
        to: { name: 'employers' },
        icon: { icon: 'tabler-briefcase' },
      },
      {
        title: 'Directores',
        to: { name: 'directors' },
        icon: { icon: 'tabler-shield-star' },
      },
    ],
  },

  // ── Académico (Director / Admin) ───────────────────────
  {
    title: 'Académico',
    icon: { icon: 'tabler-building-community' },
    requiredRoles: [ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
    children: [
      {
        title: 'Centros Educativos',
        to: { name: 'education-centers' },
        icon: { icon: 'tabler-school' },
      },
    ],
  },

  // ── Eventos (Director) ─────────────────────────────────
  {
    title: 'Eventos',
    icon: { icon: 'tabler-calendar-event' },
    requiredRoles: [ROLES.DIRECTOR],
    children: [
      {
        title: 'Tipos de Eventos',
        to: { name: 'event-types' },
        icon: { icon: 'tabler-calendar-stats' },
      },
      {
        title: 'Eventos',
        to: { name: 'events' },
        icon: { icon: 'tabler-calendar' },
      },
    ],
  },

  // ── Empleo (Director / Admin) ──────────────────────────
  {
    title: 'Empleo',
    icon: { icon: 'tabler-building-skyscraper' },
    requiredRoles: [ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
    children: [
      {
        title: 'Trabajos de Egresados',
        to: { name: 'jobs' },
        icon: { icon: 'tabler-briefcase-2' },
      },
      {
        title: 'Ofertas Laborales',
        to: { name: 'job-offers' },
        icon: { icon: 'tabler-clipboard-list' },
      },
    ],
  },

  // ── Encuestas (Director / Admin) ───────────────────────
  {
    title: 'Encuestas',
    icon: { icon: 'tabler-file-text' },
    requiredRoles: [ROLES.DIRECTOR, ROLES.ADMINISTRADOR],
    children: [
      {
        title: 'Gestión de Encuestas',
        to: { name: 'surveys' },
        icon: { icon: 'tabler-clipboard-check' },
      },
    ],
  },

  // ── Configuración (Director) ───────────────────────────
  {
    title: 'Configuración',
    icon: { icon: 'tabler-settings' },
    requiredRoles: [ROLES.DIRECTOR],
    children: [
      {
        title: 'Configuración Email',
        to: 'email-config',
        icon: { icon: 'tabler-mail-cog' },
      },
    ],
  },

  // ── Mi Espacio (Graduado) ──────────────────────────────
  {
    title: 'Mi Espacio',
    icon: { icon: 'tabler-user-circle' },
    requiredRoles: [ROLES.GRADUADO],
    children: [
      {
        title: 'Mi Perfil Académico',
        to: 'my-profile',
        icon: { icon: 'tabler-school' },
      },
      {
        title: 'Mis Encuestas',
        to: 'my-surveys',
        icon: { icon: 'tabler-clipboard-text' },
      },
      {
        title: 'Mis Trabajos',
        to: 'my-jobs',
        icon: { icon: 'tabler-briefcase' },
      },
    ],
  },

  // ── Mis Ofertas (Empleador) ────────────────────────────
  {
    title: 'Mis Ofertas',
    icon: { icon: 'tabler-clipboard-plus' },
    requiredRoles: [ROLES.EMPLEADOR],
    children: [
      {
        title: 'Gestionar Ofertas',
        to: { name: 'my-job-offers' },
        icon: { icon: 'tabler-calendar-plus' },
      },
    ],
  },
]
