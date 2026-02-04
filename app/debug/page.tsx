import {
  getCategories,
  getExecutives,
  getExecutivesByCategory,
  getRegions,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DebugPage() {
  try {
    const [categories, regions, executives] = await Promise.all([
      getCategories(),
      getRegions(),
      getExecutives(),
    ]);

    const executivesByCategoryEntries = await Promise.all(
      categories.map(async (category) => {
        const list = await getExecutivesByCategory(category.slug);
        return [category.slug, list] as const;
      })
    );

    const executivesByCategory = Object.fromEntries(
      executivesByCategoryEntries
    );

    const payload = {
      categories,
      regions,
      executives,
      executivesByCategory,
    };

    return (
      <main style={{ padding: 24 }}>
        <h1>Debug Supabase</h1>
        <pre>{JSON.stringify(payload, null, 2)}</pre>
      </main>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <main style={{ padding: 24 }}>
        <h1>Debug Supabase</h1>
        <pre>{JSON.stringify({ error: message }, null, 2)}</pre>
      </main>
    );
  }
}
