# TuEjecutiva.cl Frontend Data Contract

## Proposito
Este documento define el contrato oficial entre Supabase y el frontend.
El frontend es SOLO LECTURA y no escribe datos.

## Decisiones oficiales de exposición
Campos PÚBLICOS permitidos en frontend:
- `executives.name`
- `executives.slug`
- `executives.company`
- `executives.experience_years`
- `executives.specialty`
- `executives.description`
- `executives.photo_url`
- `executives.company_logo_url`
- `executives.coverage_all`
- `executives.plan`
- `executives.verified`
- `executives.verified_date`
- `executives.phone`
- `executives.whatsapp_message`
- `categories.*`
- `regions.*`

Campos EXPLÍCITAMENTE NO públicos:
- `onboarding_submissions.*`
- `executives.status`
- `executives.created_at`
- `executives.updated_at`

## Fuentes de datos (tablas)
- `categories`
- `regions`
- `executives`
- `executive_categories` (relacion N:N)
- `executive_regions` (relacion N:N)

Tablas fuera de alcance del frontend:
- `onboarding_submissions` (privada, no se consulta)

## Datos usados por el frontend
Las consultas se implementan en `lib/queries.ts`.

### Categories
Campos obligatorios:
- `id`
- `slug`
- `name`

Campos opcionales:
- `description`
- `icon`

Campos no usados (aunque existan en el schema):
- `created_at`

### Regions
Campos obligatorios:
- `id`
- `code`
- `name`

Campos no usados (aunque existan en el schema):
- `created_at`

### Executives
Campos obligatorios:
- `id`
- `name`
- `slug`
- `phone`
- `company`
- `coverage_all`
- `plan`

Campos opcionales:
- `experience_years`
- `specialty`
- `description`
- `whatsapp_message`
- `photo_url`
- `company_logo_url`
- `faq`
- `verified`
- `verified_date`

Estructura de `faq` (json):
- `faq` es un arreglo de objetos con forma `{ "question": string, "answer": string }`

Relaciones obligatorias:
- `executive_categories -> categories (id, slug, name)`
- `executive_regions -> regions (id, code, name)`

Campos no usados (aunque existan en el schema):
- `status` (RLS ya filtra solo `active`)
- `created_at`
- `updated_at`

## Campos no usados (global)
- `onboarding_submissions.*`
