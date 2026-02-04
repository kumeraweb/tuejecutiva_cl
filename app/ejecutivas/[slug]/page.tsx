import Link from "next/link";
import {
  Home,
  ChevronRight,
  BadgeCheck,
  MessageCircle,
  Phone,
} from "lucide-react";
import { notFound } from "next/navigation";
import {
  getExecutiveBySlug,
  type ExecutiveCategoryJoin,
  type ExecutiveRegionJoin,
} from "@/lib/queries";
import { getExecutivePhotoUrl } from "@/lib/executivePhoto";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface ExecutiveFaqItem {
  question: string;
  answer: string;
}

export default async function ExecutiveDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const safeSlug = decodeURIComponent(slug).trim();

  const executive = await getExecutiveBySlug(safeSlug);
  if (!executive) {
    notFound();
  }

  const exec = executive;

  const categories = (exec.executive_categories ?? [])
    .map((item) => item.categories)
    .filter(Boolean) as Array<NonNullable<ExecutiveCategoryJoin["categories"]>>;
  const category = categories[0] ?? { name: "General", slug: "general" };

  const coverageRegions = (exec.executive_regions ?? [])
    .map((item) => item.regions)
    .filter(Boolean) as Array<NonNullable<ExecutiveRegionJoin["regions"]>>;

  const coverageLabel = exec.coverage_all
    ? "Cobertura: Todo Chile"
    : coverageRegions.length > 0
      ? `Cobertura: ${coverageRegions.map((region) => region.name).join(", ")}`
      : "Cobertura: Sin definir";

  const safePhone = exec.phone || "";
  const safeWhatsapp = exec.whatsapp_message || "";
  const safePhotoUrl =
    getExecutivePhotoUrl(exec.photo_url) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(exec.name)}&background=ecfeff&color=155e75&size=200`;
  const waLink = safePhone
    ? `https://wa.me/${safePhone}?text=${encodeURIComponent(safeWhatsapp)}`
    : "#";
  const telLink = safePhone ? `tel:${safePhone}` : "#";
  const safeDescription = exec.description || "Sin descripción.";
  const safeSpecialty = exec.specialty || "Sin especialidad";
  const safeCompany = exec.company || "Sin empresa";
  const experienceLabel =
    exec.experience_years === null || exec.experience_years === undefined
      ? "—"
      : exec.experience_years;
  const verifiedDateLabel = exec.verified_date || "sin fecha";

  const faq = Array.isArray(exec.faq)
    ? (exec.faq as ExecutiveFaqItem[])
    : [];

  return (
    <main className="bg-slate-50 py-12 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol role="list" className="flex items-center space-x-4">
            <li>
              <div>
                <Link href="/" className="text-slate-400 hover:text-slate-500">
                  <span className="sr-only">Home</span>
                  <Home className="h-5 w-5 flex-shrink-0" />
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-300" />
                <Link
                  href={`/servicios/${category.slug}`}
                  className="ml-4 text-sm font-medium text-slate-500 hover:text-slate-700"
                >
                  {category.name}
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-300" />
                <span
                  className="ml-4 text-sm font-medium text-slate-700"
                  aria-current="page"
                >
                  {exec.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar / Digital Credential */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-900/5 overflow-hidden sticky top-24 relative">
              {/* Decorative Top Bar */}
              <div className="h-2 w-full bg-gradient-to-r from-emerald-500 to-emerald-400" />

              <div className="p-8 text-center relative z-10">
                {/* Seal Watermark */}
                {exec.verified && (
                  <div className="absolute top-4 right-4 opacity-5 pointer-events-none">
                    <img src="/images/certification.png" alt="" className="w-32 h-32" />
                  </div>
                )}

                <div className="relative inline-block mx-auto">
                  <img
                    className="h-32 w-32 rounded-full object-cover ring-4 ring-white shadow-lg mx-auto"
                    src={safePhotoUrl}
                    alt={exec.name}
                  />
                  {exec.verified && (
                    <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md" title="Verificada">
                      <img src="/images/certification.png" alt="Verificada" className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                  {exec.name}
                </h1>

                <p className="mt-2 text-slate-500 text-sm font-medium uppercase tracking-wide">
                  {exec.company || "Ejecutiva Independiente"}
                </p>

                <p className="mt-4 text-emerald-700 bg-emerald-50 rounded-lg py-1.5 px-3 inline-flex items-center gap-2 text-sm font-semibold border border-emerald-100/50">
                  {exec.verified ? "Ejecutiva Verificada" : "Perfil Profesional"}
                </p>

                <p className="mt-4 text-slate-500 text-sm">{coverageLabel}</p>

                <div className="mt-8 flex flex-col gap-3">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full rounded-lg bg-emerald-600 px-3.5 py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-emerald-500 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp Directo
                  </a>
                  <a
                    href={telLink}
                    className="w-full rounded-lg bg-white px-3.5 py-3 text-center text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Llamar
                  </a>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                  <div className="text-center">
                    <span className="block text-2xl font-bold text-slate-900">
                      {experienceLabel}
                    </span>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Años Exp.</span>
                  </div>
                  <div className="text-center border-l border-slate-100">
                    <span className="block text-2xl font-bold text-emerald-600">
                      100%
                    </span>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Verificado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-8 sm:p-10">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="h-6 w-1 bg-emerald-500 rounded-full" />
                Sobre mi servicio
              </h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg">
                  {safeDescription}
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">
                  Especialidad
                </h3>
                <span className="inline-flex items-center rounded-md bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                  {safeSpecialty}
                </span>
              </div>
            </div>

            {faq.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-8 sm:p-10 text-pretty">
                <h2 className="text-xl font-bold text-slate-900 mb-8">
                  Preguntas Frecuentes
                </h2>
                <dl className="space-y-8">
                  {faq.map((item, index) => (
                    <div key={`${item.question}-${index}`} className="group">
                      <dt className="font-semibold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                        {item.question}
                      </dt>
                      <dd className="mt-3 text-slate-600 leading-relaxed">{item.answer}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            {/* Digital Certificate Block */}
            <div className="relative bg-white rounded-2xl p-8 border border-emerald-100 overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-[0.03]">
                <img src="/images/certification.png" alt="" className="w-64 h-64" />
              </div>

              <div className="flex items-start gap-4 relative z-10">
                <div className="flex-shrink-0">
                  <img src="/images/certification.png" alt="Sello" className="w-16 h-16 object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Certificado de Verificación</h3>
                  <p className="text-sm text-slate-500 mb-4">Emitido el {verifiedDateLabel}</p>

                  <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      <strong className="text-emerald-700">Identidad Confirmada:</strong> Se ha validado documentos de identidad y antecedentes comerciales.<br />
                      <strong className="text-emerald-700">Relación Contractual:</strong> Se ha verificado su vínculo con la empresa representante.<br />
                      <strong className="text-emerald-700">Contacto Real:</strong> WhatsApp y teléfono operativos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
