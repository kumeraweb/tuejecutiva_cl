export interface ExecutiveRegion {
  code: string;
  name: string;
}

export interface ExecutiveRegionJoin {
  regions: ExecutiveRegion | null;
}

export interface Executive {
  id: string;
  name: string;
  slug: string;
  phone: string;
  company: string;
  experience_years: number | null;
  specialty: string | null;
  description: string | null;
  whatsapp_message: string | null;
  photo_url: string | null;
  coverage_all: boolean;
  plan: "bronce" | "plata" | "oro";
  verified: boolean | null;
  executive_regions?: ExecutiveRegionJoin[] | null;
}

interface ExecutiveCardProps {
  executive: Executive;
}

export default function ExecutiveCard({ executive }: ExecutiveCardProps) {
  const isGold = executive.plan === "oro";
  const isSilver = executive.plan === "plata";
  const isBronze = executive.plan === "bronce";

  const coverageRegions = (executive.executive_regions ?? [])
    .map((join) => join?.regions)
    .filter((region): region is ExecutiveRegion => Boolean(region));

  const coverageLabel = executive.coverage_all
    ? "Cobertura: Todo Chile"
    : coverageRegions.length > 0
      ? `Cobertura: ${coverageRegions.map((region) => region.name).join(", ")}`
      : "Cobertura: Sin definir";

  let containerClass =
    "relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 hover:shadow-md transition-shadow duration-300";
  if (isGold) {
    containerClass =
      "relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-amber-200 transform hover:-translate-y-1 transition-all duration-300";
  } else if (isSilver) {
    containerClass =
      "relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-300 hover:shadow-lg transition-all duration-300";
  } else if (isBronze) {
    containerClass =
      "relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 hover:shadow-md transition-shadow duration-300";
  }

  const safePhone = executive.phone || "";
  const safeWhatsapp = executive.whatsapp_message || "";
  const safePhotoUrl =
    executive.photo_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(executive.name)}&background=ecfeff&color=155e75&size=200`;

  const waLink = safePhone
    ? `https://wa.me/${safePhone}?text=${encodeURIComponent(safeWhatsapp)}`
    : "#";
  const telLink = safePhone ? `tel:${safePhone}` : "#";

  const safeDescription = executive.description || "Sin descripción.";
  const safeSpecialty = executive.specialty || "Sin especialidad";
  const experienceLabel =
    executive.experience_years === null || executive.experience_years === undefined
      ? "—"
      : executive.experience_years;

  return (
    <article
      className={containerClass}
      data-executive-card="true"
      data-coverage-all={executive.coverage_all ? "true" : "false"}
      data-coverage-regions={coverageRegions.map((region) => region.code).join(",")}
    >
      {isGold ? (
        <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 px-3 py-1 text-xs font-bold rounded-bl-lg z-10">
          DESTACADA
        </div>
      ) : null}
      {isSilver ? (
        <div className="absolute top-0 right-0 bg-slate-100 text-slate-600 px-3 py-1 text-xs font-bold rounded-bl-lg z-10">
          MÁS ELEGIDA
        </div>
      ) : null}

      <div className="p-6 flex flex-col h-full">
        <div className="flex items-start gap-4 mb-4">
          <img
            src={safePhotoUrl}
            alt={executive.name}
            className={`h-16 w-16 rounded-full object-cover ring-2 ${
              isGold
                ? "ring-amber-400"
                : isSilver
                  ? "ring-slate-300"
                  : "ring-transparent"
            }`}
          />
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              <a href={`/ejecutivas/${executive.slug}`}>
                <span className="absolute inset-0" />
                {executive.name}
              </a>
            </h3>
            <p className="text-sm text-slate-500 mt-1">{coverageLabel}</p>

            {executive.verified ? (
              <div className="mt-1 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                Verificada
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex-1">
          <p className="text-sm text-slate-600 line-clamp-3 mb-4">
            {safeDescription}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
              {experienceLabel} años exp.
            </span>
            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
              {safeSpecialty}
            </span>
          </div>
        </div>

        <div className="mt-auto flex gap-3 pt-4 border-t border-gray-100 relative z-20">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            WhatsApp
          </a>
          <a
            href={telLink}
            className="rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
          >
            Llamar
          </a>
        </div>
      </div>
    </article>
  );
}
