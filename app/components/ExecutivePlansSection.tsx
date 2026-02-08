import type { ExecutivePlanRecord } from "@/lib/queries";

interface ExecutivePlansSectionProps {
  plans: ExecutivePlanRecord[];
}

function getFeatures(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export default function ExecutivePlansSection({ plans }: ExecutivePlansSectionProps) {
  if (plans.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-8 sm:p-10">
      <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
        <span className="h-6 w-1 bg-emerald-500 rounded-full" />
        Planes disponibles
      </h2>

      <div className="space-y-6">
        {plans.map((plan) => {
          const features = getFeatures(plan.features);

          return (
            <article key={plan.id} className="rounded-xl border border-slate-200 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                {plan.price_from ? (
                  <span className="inline-flex items-center rounded-md bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                    Desde {plan.price_from}
                  </span>
                ) : null}
              </div>

              {plan.target ? (
                <p className="mt-3 text-sm font-medium text-slate-700">{plan.target}</p>
              ) : null}

              {plan.description ? (
                <p className="mt-3 text-slate-600 leading-relaxed whitespace-pre-line">
                  {plan.description}
                </p>
              ) : null}

              {features.length > 0 ? (
                <ul className="mt-4 list-disc space-y-1 pl-5 text-slate-600">
                  {features.map((feature, index) => (
                    <li key={`${plan.id}-feature-${index}`}>{feature}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
