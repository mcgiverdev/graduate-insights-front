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
    to: { name: 'noticias' },
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
        to: { name: 'egresados' },
        icon: { icon: 'tabler-users' },
      },
      {
        title: 'Empleadores',
        to: { name: 'empleadores' },
        icon: { icon: 'tabler-briefcase' },
      },
      {
        title: 'Directores',
        to: { name: 'directores' },
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
        to: { name: 'centros-educativos' },
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
        to: { name: 'tipos-evento' },
        icon: { icon: 'tabler-calendar-stats' },
      },
      {
        title: 'Eventos',
        to: { name: 'eventos' },
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
        to: { name: 'empleos' },
        icon: { icon: 'tabler-briefcase-2' },
      },
      {
        title: 'Ofertas Laborales',
        to: { name: 'ofertas-empleo' },
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
        to: { name: 'encuestas' },
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
        to: 'config-correo',
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
        to: 'mi-perfil',
        icon: { icon: 'tabler-school' },
      },
      {
        title: 'Mis Encuestas',
        to: 'mis-encuestas',
        icon: { icon: 'tabler-clipboard-text' },
      },
      {
        title: 'Mis Trabajos',
        to: 'mis-empleos',
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
        to: { name: 'mis-ofertas-empleo' },
        icon: { icon: 'tabler-calendar-plus' },
      },
    ],
  },
]
