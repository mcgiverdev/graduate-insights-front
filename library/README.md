# Resource Manager Library

Una librería para crear interfaces CRUD de manera rápida y declarativa, inspirada en Laravel Nova y Filament.

## Estructura

```
library/
├── components/           # Componentes Vue reutilizables
│   ├── FormGenerator.vue    # Generador de formularios
│   ├── ResourceManager.vue  # Gestor principal de recursos
│   └── TableGenerator.vue   # Generador de tablas
├── fields/              # Definición de campos de formulario
│   ├── FormField.ts        # Clase base para campos
│   └── index.ts           # Tipos de campos específicos
├── types/               # Definiciones de tipos
│   ├── FieldType.ts       # Tipos de campo disponibles
│   └── ModelDefinition.ts # Definición del modelo
└── core/               # Núcleo de la librería
    ├── Resource.ts       # Clase base de recursos
    └── Repository.ts     # Clase base del repositorio

```

## Uso Básico

```typescript
import { Resource, Fields } from '@/library'

export class UserResource extends Resource {
  constructor() {
    super({
      name: 'users',
      resourcePath: '/api/users',
      idField: 'id',
    })

    this.setLabels('Usuario', 'Usuarios')
  }

  protected form(): FormField[] {
    return [
      Fields.text('name')
        .label('Nombre')
        .required()
        .sortable()
        .searchable()
        .placeholder('Ingrese el nombre'),

      Fields.text('email')
        .label('Correo')
        .required()
        .email()
        .sortable()
        .searchable(),

      Fields.select('role')
        .label('Rol')
        .required()
        .options([
          { value: 'admin', title: 'Administrador' },
          { value: 'user', title: 'Usuario' },
        ]),
    ]
  }
}
```

## Tipos de Campo Disponibles

### TextField
```typescript
Fields.text('field_name')
  .label('Label')           // Etiqueta del campo
  .required()               // Campo requerido
  .email()                  // Validación de email
  .numeric()               // Solo números
  .min(8)                  // Mínimo 8 caracteres
  .password()              // Campo tipo password
  .sortable()              // Habilitar ordenamiento
  .searchable()            // Habilitar búsqueda
  .placeholder('texto')    // Placeholder del campo
  .default('valor')        // Valor por defecto
  .hideOnCreate()          // Ocultar en formulario de creación
  .hideOnUpdate()          // Ocultar en formulario de edición
  .hideOnIndex()           // Ocultar en tabla
```

### SelectField
```typescript
Fields.select('field_name')
  .label('Label')
  .required()
  .options([               // Opciones del select
    { value: 'v1', title: 'Opción 1' },
    { value: 'v2', title: 'Opción 2' },
  ])
  .default('v1')          // Valor por defecto
```

### DateField
```typescript
Fields.date('field_name')
  .label('Label')
  .required()
  .format('YYYY-MM-DD')   // Formato de fecha
```

### TextareaField
```typescript
Fields.textarea('field_name')
  .label('Label')
  .required()
  .rows(5)                // Número de filas
```

### FileField
```typescript
Fields.file('field_name')
  .label('Label')
  .accept(['image/*'])    // Tipos MIME aceptados
  .maxSize(1024)          // Tamaño máximo en KB
  .directory('uploads')   // Directorio de destino
```

## Configuración del Recurso

```typescript
{
  name: string;           // Nombre del recurso
  resourcePath: string;   // Ruta base de la API
  idField: string;       // Campo ID del recurso
  perPage?: number;      // Elementos por página (default: 10)
  sortable?: boolean;    // Habilitar ordenamiento (default: true)
  filterable?: boolean;  // Habilitar filtros (default: true)
}
```

## Configuración de la API

```typescript
protected configureApi(): Partial<ApiConfig> {
  return {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    mapResponse: (data: any) => ({
      // Transformar respuesta de la API
    }),
    mapRequest: (data: any) => ({
      // Transformar datos antes de enviar
    }),
    successCodes: {
      create: [201],
      update: [204],
      delete: [204],
      list: [200],
      get: [200],
    },
  }
}
```

## Validaciones Disponibles

- `required`: Campo requerido
- `email`: Validación de correo electrónico
- `numeric`: Solo números
- `min:n`: Longitud mínima
- `date`: Validación de fecha
- `time`: Validación de hora (HH:mm)

## Personalización

### Acciones Personalizadas
```typescript
protected configureActions(): Action[] {
  return [
    {
      name: 'activate',
      label: 'Activar',
      icon: 'tabler-check',
      color: 'success',
      showOnTableRow: true,
      confirmationTitle: 'Confirmar activación',
      confirmationText: '¿Está seguro de activar este registro?',
      handler: async (item) => {
        // Lógica de activación
      },
    },
  ]
}
```

### Filtros Personalizados
```typescript
protected configureFilters(): Filter[] {
  return [
    {
      name: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'active', title: 'Activo' },
        { value: 'inactive', title: 'Inactivo' },
      ],
    },
  ]
}
```

## Eventos Disponibles

El componente `ResourceManager` emite los siguientes eventos:

- `@edit`: Cuando se solicita editar un registro
- `@delete`: Cuando se solicita eliminar un registro
- `@action`: Cuando se ejecuta una acción personalizada
- `@page-change`: Cuando cambia la página actual
- `@search`: Cuando se realiza una búsqueda
- `@filter`: Cuando se aplican filtros
- `@sort`: Cuando se cambia el ordenamiento

## Ejemplos

### Recurso con Relaciones
```typescript
export class PostResource extends Resource {
  protected form(): FormField[] {
    return [
      Fields.text('title')
        .label('Título')
        .required(),

      Fields.select('author_id')
        .label('Autor')
        .required()
        .options(async () => {
          const response = await fetch('/api/authors')
          const authors = await response.json()
          return authors.map(a => ({
            value: a.id,
            title: a.name,
          }))
        }),

      Fields.textarea('content')
        .label('Contenido')
        .required()
        .rows(10),
    ]
  }
}
```

### Recurso con Validaciones Complejas
```typescript
export class ProductResource extends Resource {
  protected form(): FormField[] {
    return [
      Fields.text('sku')
        .label('SKU')
        .required()
        .rules(['unique:products,sku']),

      Fields.text('price')
        .label('Precio')
        .required()
        .numeric()
        .min(0)
        .rules(['decimal:2']),

      Fields.file('image')
        .label('Imagen')
        .accept(['image/jpeg', 'image/png'])
        .maxSize(2048)
        .directory('products'),
    ]
  }
}
``` 
