<template>
  <div class="h-100 d-flex align-center justify-md-space-between justify-center">
    <!-- 👉 Footer: left content -->
    <span class="d-flex align-center text-medium-emphasis">
      &copy;
      {{ new Date().getFullYear() }}
      Sistema de Egresados
      <VIcon
        icon="tabler-graduation-cap"
        color="primary"
        size="1.25rem"
        class="mx-2"
      />
      Gestión Educativa
    </span>
    <!-- 👉 Footer: right content -->
    <span class="d-md-flex gap-x-4 text-primary d-none">
      <a
        href="javascript:void(0)"
        target="noopener noreferrer"
      >Privacidad</a>
      <a
        href="javascript:void(0)"
        target="noopener noreferrer"
      >Términos</a>
      <a
        href="javascript:void(0)"
        target="noopener noreferrer"
      >Soporte</a>
      <a
        href="javascript:void(0)"
        target="noopener noreferrer"
      >Ayuda</a>
    </span>
  </div>
</template>
