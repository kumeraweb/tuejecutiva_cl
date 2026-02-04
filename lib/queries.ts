import { supabase } from "./supabaseClient";

/**
 * Campos devueltos por la tabla `categories`.
 * - id, slug, name: identificadores y etiquetas visibles.
 * - description, icon: metadatos opcionales para UI.
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, description, icon")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`getCategories failed: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Campos devueltos por la tabla `regions`.
 * - id, code, name: identificadores y etiquetas visibles.
 */
export async function getRegions() {
  const { data, error } = await supabase
    .from("regions")
    .select("id, code, name")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`getRegions failed: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Categoria individual por slug.
 */
export async function getCategoryBySlug(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, description, icon")
    .eq("slug", normalizedSlug)
    .maybeSingle();

  if (error) {
    throw new Error(`getCategoryBySlug failed: ${error.message}`);
  }

  if (data) return data;

  // Fallback: find in full list to avoid false 404 if slug mismatch/casing
  const categories = await getCategories();
  return categories.find(
    (category) => category.slug.toLowerCase() === normalizedSlug
  );
}

/**
 * Campos devueltos por `executives` y relaciones N:N.
 * - experience_years, plan, coverage_all: reglas de negocio clave.
 * - executive_categories: categorias asociadas (vía join table).
 * - executive_regions: regiones asociadas (vía join table).
 */
export async function getExecutives() {
  const executivesSelect = [
    "id",
    "name",
    "slug",
    "phone",
    "company",
    "experience_years",
    "specialty",
    "description",
    "whatsapp_message",
    "photo_url",
    "company_logo_url",
    "faq",
    "coverage_all",
    "plan",
    "verified",
    "verified_date",
    "executive_categories ( categories ( id, slug, name ) )",
    "executive_regions ( regions ( id, code, name ) )",
  ].join(",");

  const { data, error } = await supabase
    .from("executives")
    .select(executivesSelect)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`getExecutives failed: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Ejecutivas filtradas por categoria (slug).
 * Respeta el esquema N:N mediante `executive_categories`.
 */
export async function getExecutivesByCategory(slug: string) {
  const category = await getCategoryBySlug(slug);
  if (!category) return [];

  const executivesSelect = [
    "id",
    "name",
    "slug",
    "phone",
    "company",
    "experience_years",
    "specialty",
    "description",
    "whatsapp_message",
    "photo_url",
    "company_logo_url",
    "faq",
    "coverage_all",
    "plan",
    "verified",
    "verified_date",
    "executive_categories ( categories ( id, slug, name ) )",
    "executive_regions ( regions ( id, code, name ) )",
  ].join(",");

  const { data, error } = await supabase
    .from("executive_categories")
    .select(
      [
        `executives ( ${executivesSelect} )`,
        "categories ( id, slug, name )",
      ].join(",")
    )
    .eq("category_id", category.id);

  if (error) {
    throw new Error(`getExecutivesByCategory failed: ${error.message}`);
  }

  const executives = (data ?? [])
    .map((row) => row.executives)
    .filter(Boolean) as Array<{ id: string } & Record<string, unknown>>;

  const unique = new Map<string, (typeof executives)[number]>();
  executives.forEach((executive) => {
    unique.set(executive.id, executive);
  });

  return Array.from(unique.values());
}

/**
 * Ejecutiva individual por slug.
 */
export async function getExecutiveBySlug(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase();

  const executivesSelect = [
    "id",
    "name",
    "slug",
    "phone",
    "company",
    "experience_years",
    "specialty",
    "description",
    "whatsapp_message",
    "photo_url",
    "company_logo_url",
    "faq",
    "coverage_all",
    "plan",
    "verified",
    "verified_date",
    "executive_categories ( categories ( id, slug, name ) )",
    "executive_regions ( regions ( id, code, name ) )",
  ].join(",");

  const { data, error } = await supabase
    .from("executives")
    .select(executivesSelect)
    .eq("slug", normalizedSlug)
    .maybeSingle();

  if (error) {
    throw new Error(`getExecutiveBySlug failed: ${error.message}`);
  }

  return data;
}
