# Onboarding Spec — TuEjecutiva.cl

Documento oficial del flujo de onboarding y administración. Este documento es definitivo y describe el comportamiento esperado del MVP sin ambigüedades.

## Flujo completo de onboarding (definitivo)
1. El admin genera manualmente un token en `onboarding_tokens`.
2. Se envía un link privado a la ejecutiva con ese token.
3. La ejecutiva accede al formulario de onboarding.
4. Completa y envía el formulario.
5. Se crea un registro en `onboarding_submissions`.
6. El admin revisa la submission.
7. El admin crea MANUALMENTE la ejecutiva en la tabla `executives`.
8. El admin decide si publica la ejecutiva (`executives.status = active`).

No existe automatización de publicación.

## Estados de onboarding_submissions.status
Estados permitidos:
- `pending`
- `reviewed`
- `approved`
- `rejected`

Significado exacto:
- `pending`: formulario enviado, sin revisar.
- `reviewed`: datos revisados, contacto iniciado.
- `approved`: datos correctos y listos para crear ejecutiva manualmente.
- `rejected`: no cumple requisitos o no continúa el proceso.

Nota importante:
- `approved` **no** significa publicada. Solo significa “lista para creación manual en `executives`”.

## Campos del formulario de onboarding
Obligatorios (mínimos para crear una ejecutiva):
- `full_name`
- `phone`
- `company`
- `experience_years`
- `specialty`
- `description`
- `coverage_all` (boolean)
- categorías (al menos una) o `custom_category` no vacío
- regiones (solo si `coverage_all = false`)
- `accepted_terms`
- `accepted_data_use`

Opcionales:
- `whatsapp_message`
- `photo_url`
- `company_logo_url`
- `faq`
- `custom_category`

## Archivos permitidos
La ejecutiva puede adjuntar:
- contrato laboral o vínculo comercial (uno o más archivos)

Formatos permitidos:
- PDF
- JPG
- PNG

Reglas:
- Los archivos se almacenan en storage.
- Se referencian en `onboarding_submission_files`.
- No son públicos.

## Admin dashboard (definición oficial)
Ubicación:
- Vive dentro del mismo proyecto Next.js.
- Ruta: `/admin/*`.

Funciones MVP:

A) Listado de onboarding submissions
Campos visibles:
- `full_name`
- `company`
- `phone`
- `status`
- `created_at`

Acciones:
- Ver detalle.
- Cambiar estado (`pending` → `reviewed` → `approved` / `rejected`).
- Generar token (si aplica).

B) Vista detalle de submission
Mostrar:
- Todos los datos enviados.
- Categorías seleccionadas.
- Regiones seleccionadas.
- Archivos adjuntos.
- Consentimientos.

Acciones:
- Cambiar estado.
- Copiar datos como referencia para creación manual en `executives`.

Acciones explícitamente prohibidas:
- Crear ejecutivas automáticamente.
- Publicar ejecutivas.
- Modificar tablas públicas desde el dashboard (por ahora).

## Seguridad (congelado)
- El frontend público nunca accede a:
  - `onboarding_tokens`
  - `onboarding_submissions`
  - `onboarding_submission_categories`
  - `onboarding_submission_regions`
  - `onboarding_submission_files`
- `anon key`: solo lectura de tablas públicas.
- `service_role`: solo backend/admin.

## Alcance del MVP
Qué sí hace el onboarding:
- Emite tokens manualmente.
- Recibe submissions completas.
- Permite revisión y cambio de estado.
- Permite crear ejecutivas manualmente en Supabase.
- Permite decidir publicación con `executives.status`.

Qué explícitamente NO hace aún:
- No crea ejecutivas automáticamente.
- No publica ejecutivas automáticamente.
- No modifica tablas públicas desde el dashboard.
- No expone datos privados en el frontend público.

Qué se deja para versiones futuras:
- Automatizaciones del flujo.
- Integraciones adicionales de verificación.
- Expansión del dashboard (más roles, permisos o analítica).
