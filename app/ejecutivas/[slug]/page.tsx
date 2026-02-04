import Link from "next/link";
import {
  Home,
  ChevronRight,
  BadgeCheck,
  MessageCircle,
  Phone,
} from "lucide-react";
import { notFound } from "next/navigation";
import { getExecutiveBySlug } from "@/lib/queries";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface ExecutiveCategoryJoin {
  categories: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface ExecutiveRegionJoin {
  regions: {
    id: string;
    code: string;
    name: string;
  } | null;
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

  const exec = executive as {
    executive_categories?: ExecutiveCategoryJoin[];
    executive_regions?: ExecutiveRegionJoin[];
    coverage_all: boolean;
    phone: string | null;
    whatsapp_message: string | null;
    photo_url: string | null;
    name: string;
    description: string | null;
    specialty: string | null;
    company: string | null;
    experience_years: number | null;
    verified: boolean;
    verified_date: string | null;
    faq: unknown;
  };

  const categories = (exec.executive_categories ?? [])
    .map((item: ExecutiveCategoryJoin) => item.categories)
    .filter(Boolean);
  const category = categories[0] ?? { name: "General", slug: "general" };

  const coverageRegions = (exec.executive_regions ?? [])
    .map((item: ExecutiveRegionJoin) => item.regions)
    .filter(Boolean);

  const coverageLabel = exec.coverage_all
    ? "Cobertura: Todo Chile"
    : coverageRegions.length > 0
      ? `Cobertura: ${coverageRegions.map((region) => region.name).join(", ")}`
      : "Cobertura: Sin definir";

  const safePhone = exec.phone || "";
  const safeWhatsapp = exec.whatsapp_message || "";
  const safePhotoUrl =
    exec.photo_url ||
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
    <main className="bg-gray-50 py-12 sm:py-24">
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
                  {executive.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-6 text-center sticky top-24">
              <img
                className="mx-auto h-32 w-32 rounded-full ring-4 ring-emerald-50"
                src={safePhotoUrl}
                alt={executive.name}
              />
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                {executive.name}
              </h1>
              <p className="text-sm font-medium text-emerald-600 bg-emerald-50 rounded-full py-1 px-3 inline-flex items-center gap-1 mt-2">
                {executive.verified ? (
                  <>
                    <BadgeCheck className="w-4 h-4" /> Ejecutiva Verificada
                  </>
                ) : (
                  "Perfil"
                )}
              </p>
              <p className="mt-4 text-slate-600 text-sm">
                Especialista en {category.name}
              </p>
              <p className="mt-2 text-slate-600 text-sm">{coverageLabel}</p>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                  Representante de
                </p>
                <div className="flex items-center justify-center gap-2">
                  {executive.company_logo_url ? (
                    <img
                      src={executive.company_logo_url}
                      alt={safeCompany}
                      className="h-8 max-w-[120px] object-contain"
                    />
                  ) : (
                    <span className="text-slate-900 font-bold">{safeCompany}</span>
                  )}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full rounded-md bg-emerald-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  Hablar por WhatsApp
                </a>
                <a
                  href={telLink}
                  className="w-full rounded-md bg-white px-3.5 py-2.5 text-center text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Llamar Ahora
                </a>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-center gap-8 text-center bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-2xl">
                <div>
                  <span className="block text-xl font-bold text-slate-900">
                    {experienceLabel}
                  </span>
                  <span className="text-xs text-slate-500">Años Exp.</span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-slate-900">
                    100%
                  </span>
                  <span className="text-xs text-slate-500">Verificado</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                ¿En qué te puedo ayudar?
              </h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {safeDescription}
              </p>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  Especialidad
                </h3>
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  {safeSpecialty}
                </span>
              </div>
            </div>

            {faq.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Preguntas Frecuentes
                </h2>
                <dl className="space-y-6">
                  {faq.map((item, index) => (
                    <div key={`${item.question}-${index}`}>
                      <dt className="font-semibold text-slate-900">
                        {item.question}
                      </dt>
                      <dd className="mt-2 text-slate-600">{item.answer}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
              <h3 className="font-semibold text-emerald-900 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Estado de Verificación
              </h3>
              <p className="text-sm text-emerald-800 mt-2">
                Esta ejecutiva fue verificada el <strong>{verifiedDateLabel}</strong>.
                <br />
                Se validó: Identidad, Antecedentes laborales y Canales de contacto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
