📘 TuEjecutiva.cl — Especificación Oficial de Datos (MVP)

1. Objetivo del documento

Este documento define de forma definitiva:
	•	El modelo de datos del proyecto TuEjecutiva.cl
	•	El flujo de onboarding y publicación de ejecutivas
	•	Qué partes del sistema son automáticas y cuáles 100% manuales
	•	Qué puede y qué NO puede hacer el frontend

Este documento es la única referencia válida para:
	•	Desarrollo frontend
	•	Configuración de Supabase
	•	Uso de herramientas de IA (Codex, ChatGPT, etc.)

⸻

2. Principios fundamentales (NO negociables)
	1.	El frontend nunca escribe en la base de datos
	2.	No existen inserts automáticos a executives
	3.	La publicación de ejecutivas es siempre manual
	4.	Supabase es una base de datos publicada, no un backend abierto
	5.	La seguridad es prioritaria al MVP
	6.	Una sola fuente de verdad por concepto

⸻

3. Flujo completo del negocio (visión real)

3.1 Postulación inicial (Lead)
	•	Una ejecutiva postula mediante un formulario público.
	•	Ese formulario:
	•	NO toca la base de datos
	•	NO crea registros
	•	SOLO envía un correo interno

Objetivo: contacto comercial, no onboarding técnico.

⸻

3.2 Proceso comercial (manual)
	•	Se contacta a la ejecutiva.
	•	Se explican planes y condiciones.
	•	Existen dos caminos:
	•	❌ No contrata → correo de cierre cordial
	•	✅ Contrata → se habilita onboarding

⸻

3.3 Onboarding con token (solo UX)
	•	Se envía un link con token y expiración.
	•	El token:
	•	NO da permisos de base de datos
	•	SOLO permite acceder al formulario

⸻

3.4 Onboarding (recolección de datos)
	•	La ejecutiva completa un formulario detallado.
	•	Al enviarlo:
	•	NO se crea ninguna ejecutiva publicada
	•	NO se modifican tablas públicas
	•	Los datos se almacenan SOLO en una tabla de espera

⸻

3.5 Revisión y publicación (manual)
	•	El equipo revisa los datos en Supabase.
	•	Si todo es correcto:
	•	Se crea manualmente la ejecutiva publicada
	•	Se asignan categorías y regiones
	•	La ejecutiva pasa a estar visible en el sitio.

⸻

4. Modelo de datos definitivo (MVP)

4.1 Tablas públicas (lectura desde frontend)

Estas tablas sí se leen desde el frontend, pero nunca se escriben desde él.

categories
	•	Rubros disponibles en el sitio.

Campos:
	•	id (uuid, PK)
	•	slug (text, unique)
	•	name (text)
	•	description (text)
	•	icon (text)
	•	created_at (timestamptz)

⸻

regions
	•	Regiones de Chile.

Campos:
	•	id (uuid, PK)
	•	code (text, unique) — Ej: RM, V, VIII
	•	name (text)
	•	created_at (timestamptz)

⸻

executives
	•	Ejecutivas publicadas y visibles en el sitio.

Campos:
	•	id (uuid, PK)
	•	name (text)
	•	slug (text, unique)
	•	phone (text)
	•	company (text)
	•	specialty (text, nullable)
	•	description (text, nullable)
	•	photo_url (text, nullable)
	•	company_logo_url (text, nullable)
	•	faq (jsonb, nullable)
	•	coverage_all (boolean, default false)
	•	verified (boolean, default false)
	•	verified_date (date)
	•	status (text: draft | pending | active | inactive)
	•	created_at (timestamptz)
	•	updated_at (timestamptz)

⸻

executive_categories
	•	Relación N:N entre ejecutivas y categorías.

Campos:
	•	executive_id (uuid, FK)
	•	category_id (uuid, FK)
	•	PK compuesta

⸻

executive_regions
	•	Relación N:N entre ejecutivas y regiones.

Campos:
	•	executive_id (uuid, FK)
	•	region_id (uuid, FK)
	•	PK compuesta

Regla:
	•	Si coverage_all = true, no es obligatorio tener regiones asociadas.

⸻

4.2 Tablas de staging (espera / onboarding)

Estas tablas NO se usan para render público.

onboarding_submissions
	•	Datos enviados por la ejecutiva en onboarding.

Campos:
	•	id (uuid, PK)
	•	full_name
	•	phone
	•	company
	•	specialty
	•	description
	•	whatsapp_message
	•	photo_url (nullable)
	•	company_logo_url (nullable)
	•	faq (jsonb, nullable)
	•	coverage_all (boolean)
	•	created_at

⸻

⚠️ Estas tablas no generan publicación automática.

⸻

5. Reglas de negocio clave
	1.	Nada se publica automáticamente
	2.	Todo onboarding es revisado manualmente
	3.	El frontend es solo lectura
	4.	La base de datos no valida negocio, solo estructura
	5.	Los defaults “inteligentes” (avatar, logos) se deciden manualmente
	6.	La seguridad prima sobre la automatización

⸻

6. Contratos del frontend

El frontend puede:
	•	Leer ejecutivas
	•	Leer categorías
	•	Leer regiones
	•	Filtrar por región y cobertura
	•	Mostrar perfiles

El frontend NO puede:
	•	Crear ejecutivas
	•	Editar ejecutivas
	•	Crear relaciones
	•	Ejecutar inserts
	•	Tocar staging o producción

⸻

7. Alcance del MVP

Incluido:
	•	Landing funcional
	•	Listado de ejecutivas
	•	Filtros por categoría y región
	•	Onboarding como recolección de datos

Fuera de alcance (por ahora):
	•	Auth
	•	Panel admin propio
	•	Automatización de aprobación
	•	Pagos integrados
	•	Roles

⸻

8. Regla final

Si algo no está descrito en este documento, no existe en el sistema.

⸻
El SQL exacto (1:1) con el documento oficial que definimos se encuentra en mvp.sql en esta msima carpeta . Está pensado para pegarlo completo en Supabase → SQL Editor (proyecto nuevo).

Incluye:
	•	Tablas: categories, regions, executives, executive_categories, executive_regions, onboarding_submissions
	•	Constraints y defaults según el documento
	•	Trigger updated_at
	•	Índices básicos
	•	RLS activado + políticas SOLO de lectura para anon en las tablas públicas
	•	Sin políticas en onboarding_submissions (queda privada: ni lectura ni escritura desde el frontend)

Nota: service_role siempre puede escribir aunque RLS esté activo, así que más adelante tu backend (Next.js) podrá insertar submissions con SUPABASE_SERVICE_ROLE_KEY sin abrir nada al público.


