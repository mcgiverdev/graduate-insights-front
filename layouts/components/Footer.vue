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
  </div>
</template>
