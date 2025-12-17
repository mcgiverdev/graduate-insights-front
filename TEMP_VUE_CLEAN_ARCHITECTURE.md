# 🧼 Vue.js Clean Architecture & Mejores Prácticas (Temporal)

## 1. Principios Arquitectónicos
- **Separación de capas**: dividir UI (componentes), estado (stores/composables), lógica de negocio (servicios) y acceso a datos (API/adapters).
- **Dependencias unidireccionales**: componentes → composables → servicios → API. Nunca en sentido contrario.
- **Inversión de dependencias**: abstraer clientes HTTP/IPC detrás de interfaces (por ejemplo `BaseApiService`).
- **Single Responsibility**: cada archivo resuelve un único problema; no mezclar presentación con lógica de negocio.
- **Domain-Driven Modules**: agrupar por dominios (auth, guides, clients) en lugar de tipos (todos los componentes juntos).

## 2. Estructura de Carpetas Sugerida
```
src/
├── app/                     # Config global: main, router, plugins
├── modules/
│   ├── guides/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── composables/
│   │   ├── services/
│   │   └── types/
│   └── clients/
├── shared/
│   ├── components/
│   ├── composables/
│   ├── services/
│   └── utils/
└── infrastructure/
    ├── http/ (axios, fetch wrappers)
    ├── storage/
    └── adapters/
```

## 3. Componentes y Presentación
- **Atomic Design**: `Base*` atómicos, `modules/*/components` moleculares, `modules/*/pages` organizan layouts.
- **Prop drilling mínimo**: usar provide/inject o stores locales para compartir datos entre niveles.
- **Emits tipados** con `defineEmits<{ (e: 'submit', payload: Data): void }>()`.
- **Suspense y lazy load** para páginas pesadas (`defineAsyncComponent`).
- **Testing**: `@vue/test-utils` + Vitest para componentes críticos.

## 4. Estado y Composables
- **Composables por dominio** (`useGuides`, `useClients`) exponiendo `state + actions`.
- **No side effects en `setup`**: encapsular IO en composables y llamarlo desde lifecycle hooks.
- **Tipado fuerte** usando `ReturnType<typeof useGuides>` y tipos compartidos en `modules/*/types`.
- **Stores globales**: Pinia o composables compartidos para estado transversal (auth, user prefs).

## 5. Servicios y API Layer
- **Base service**: manejar invocaciones, errores, logging y reintentos en un solo lugar.
- **DTOs vs Domain Models**: mapear respuestas de API a objetos de dominio antes de llegar al UI.
- **Cancelación de peticiones** con `AbortController` en operaciones largas.
- **Cacheo**: composables con `shallowRef` y `Map` por clave (por ejemplo, trazabilidad por guía).

## 6. Manejo de Errores y UX
- **Error boundary** via `onErrorCaptured` + layout de fallback.
- **Notificaciones centralizadas** (`useNotifications`).
- **Form validation**: usar librerías ligeras (`zod`, `vee-validate`) con esquemas reutilizables.
- **Logging**: middleware HTTP que agrega `requestId`, tiempos y errores para enviar a monitoreo.

## 7. Performance
- **Code splitting** per route (`router/index.ts` usando `() => import('./pages/Guias.vue')`).
- **Virtual lists** cuando hay tablas extensas (Vue Virtual Scroller).
- **Memoization**: `computed` con dependencias claras, evitar `watch` innecesarios.
- **Lazy hydration** si se usa SSR.

## 8. Tooling y Calidad
- **Type checking** continuo con `vue-tsc --noEmit` en CI.
- **ESLint + Prettier** con reglas específicas (import/order, vue/no-unused-components).
- **Commit hooks** (Husky + lint-staged) para validar antes de subir código.
- **Storybook** para documentar componentes reutilizables.

## 9. Seguridad y Config
- **Env management**: usar `.env`, `.env.production` y tipar variables con `import.meta.env` (declaraciones en `vite-env.d.ts`).
- **Sanitización de entradas** antes de enviarlas al backend.
- **Autenticación**: manejar tokens en `http` layer, refresco automático y almacenamiento seguro (Memory/IndexedDB + fallback).

## 10. Migración a Web / Escalabilidad
- **Adapters**: encapsular IPC/HTTP para que el resto del sistema sea agnóstico (facilita mover a REST).
- **SSR/SSG ready**: diseñar componentes sin dependencias a `window` en setup para permitir futuros despliegues SSR.
- **Feature flags**: permitir activar nuevas funcionalidades gradualmente.

> Documento temporal generado el 2025-12-12 a solicitud del usuario.
