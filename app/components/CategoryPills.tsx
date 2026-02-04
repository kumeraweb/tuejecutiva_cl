import Link from "next/link";
import type { ElementType } from "react";
import {
  Ambulance,
  HeartHandshake,
  Stethoscope,
  Shield,
  Scale,
  Wrench,
} from "lucide-react";
import { getCategoriesWithExecutives } from "@/lib/queries";

const iconMap: Record<string, ElementType> = {
  "planes-de-rescate-y-ambulancia": Ambulance,
  "planes-de-salud": Stethoscope,
  "planes-funerarios": Shield,
  "planes-y-seguros-automotrices": Wrench,
  "planes-y-seguros-de-vida": HeartHandshake,
  "asesoria-legal": Scale,
};

export default async function CategoryPills() {
  const categories = await getCategoriesWithExecutives();

  return (
    <section id="buscar" className="py-12 bg-white border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
          ¿Qué estás buscando?
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 justify-center">
          {categories.map((category) => {
            const Icon = iconMap[category.slug] || Shield;
            return (
              <Link
                key={category.id}
                href={`/servicios/${category.slug}`}
                className="group flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-slate-50 text-slate-600 hover:bg-white hover:text-emerald-600 hover:shadow-md ring-1 ring-slate-900/5 hover:ring-emerald-500/20 transition-all duration-300 text-center h-full min-h-[120px]"
              >
                <Icon
                  className="w-8 h-8 opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-transform"
                  strokeWidth={1.5}
                />
                <span className="text-xs sm:text-sm font-semibold leading-tight text-balance">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
