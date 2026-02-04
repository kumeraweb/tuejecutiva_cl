# Seguridad

## Modelo de seguridad
- El frontend es SOLO LECTURA.
- Se usa la anon key de Supabase en el cliente.
- No existe escritura desde el frontend.

## RLS
- RLS está habilitado en todas las tablas.
- `executives` tiene política pública solo para `status = 'active'`.
- `categories`, `regions`, `executive_categories`, `executive_regions` tienen lectura pública.
- `onboarding_submissions` no tiene políticas públicas (no es accesible desde el frontend).

## Service role
- La `service_role` se usará únicamente en backend futuro.
- Nunca se expone en el frontend.
