"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CategoryOption {
  id: string;
  name: string;
}

interface RegionOption {
  id: string;
  code: string;
  name: string;
}

interface OnboardingFormClientProps {
  categories: CategoryOption[];
  regions: RegionOption[];
  token?: string;
  mode: "token" | "dev";
}

interface DraftState {
  full_name: string;
  email: string;
  phone: string;
  company: string;
  category_id: string;
  custom_category: string;
  coverage_all: boolean;
  region_ids: string[];
  accepted_terms: boolean;
  accepted_data_use: boolean;
}

const EMPTY_DRAFT: DraftState = {
  full_name: "",
  email: "",
  phone: "",
  company: "",
  category_id: "",
  custom_category: "",
  coverage_all: true,
  region_ids: [],
  accepted_terms: false,
  accepted_data_use: false,
};

function getDraftStorageKey(mode: "token" | "dev", token?: string) {
  return `onboarding_postulation_draft:${mode}:${token ?? "no-token"}`;
}

type OnboardingStage = "welcome" | "form" | "success";

export default function OnboardingFormClient({
  categories,
  regions,
  token,
  mode,
}: OnboardingFormClientProps) {
  const router = useRouter();
  const [stage, setStage] = useState<OnboardingStage>("welcome");
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ id: category.id, name: category.name })),
    [categories]
  );

  const regionOptions = useMemo(
    () => regions.map((region) => ({ id: region.id, name: region.name })),
    [regions]
  );

  const storageKey = getDraftStorageKey(mode, token);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<DraftState>;
        setDraft({ ...EMPTY_DRAFT, ...parsed });
      }
    } catch {
      // Ignore invalid localStorage payloads and keep defaults.
    } finally {
      setDraftLoaded(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!draftLoaded) return;
    window.localStorage.setItem(storageKey, JSON.stringify(draft));
  }, [draft, draftLoaded, storageKey]);

  useEffect(() => {
    if (mode !== "token") return;

    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        window.location.reload();
      }
    }

    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [mode]);

  function updateField<K extends keyof DraftState>(name: K, value: DraftState[K]) {
    setDraft((prev) => ({ ...prev, [name]: value }));
    // Clear field specific error when user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function normalizePhoneDigits(raw: string) {
    return raw.replace(/\D/g, "");
  }

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isValidPhoneDigits(value: string) {
    return /^[0-9]{9}$/.test(value);
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    if (!draft.full_name.trim()) nextErrors.full_name = "Este campo es obligatorio.";

    if (!draft.email.trim()) {
      nextErrors.email = "Este campo es obligatorio.";
    } else if (!isValidEmail(draft.email.trim())) {
      nextErrors.email = "Email inválido.";
    }

    const normalizedDigits = normalizePhoneDigits(draft.phone);
    if (!normalizedDigits) {
      nextErrors.phone = "Este campo es obligatorio.";
    } else if (!isValidPhoneDigits(normalizedDigits)) {
      nextErrors.phone = "Teléfono inválido. Debe tener 9 dígitos.";
    }

    if (!draft.company.trim()) nextErrors.company = "Este campo es obligatorio.";

    if (!draft.category_id && !draft.custom_category.trim()) {
      nextErrors.category = "Selecciona una categoría o escribe una categoría libre.";
    }

    if (!draft.coverage_all && draft.region_ids.length === 0) {
      nextErrors.region_ids = "Selecciona al menos una región o marca cobertura nacional.";
    }

    if (!draft.accepted_terms) {
      nextErrors.accepted_terms = "Debes aceptar términos y condiciones.";
    }

    if (!draft.accepted_data_use) {
      nextErrors.accepted_data_use = "Debes aceptar el uso de tus datos.";
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setError("Por favor, revisa los campos marcados antes de continuar.");
      return null;
    }

    setError(null);
    return {
      normalizedPhone: `+56${normalizedDigits}`,
      normalizedName: draft.full_name.trim(),
      normalizedEmail: draft.email.trim(),
      normalizedCompany: draft.company.trim(),
      normalizedCustomCategory: draft.custom_category.trim(),
    };
  }

  function toggleRegion(regionId: string) {
    setDraft((prev) => {
      const exists = prev.region_ids.includes(regionId);
      const region_ids = exists
        ? prev.region_ids.filter((id) => id !== regionId)
        : [...prev.region_ids, regionId];

      return {
        ...prev,
        region_ids,
      };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = validateForm();
    if (!normalized) return;

    const formData = new FormData();
    formData.set("full_name", normalized.normalizedName);
    formData.set("email", normalized.normalizedEmail);
    formData.set("phone", normalized.normalizedPhone);
    formData.set("company", normalized.normalizedCompany);
    formData.set("category_id", draft.category_id);
    formData.set("custom_category", normalized.normalizedCustomCategory);
    formData.set("coverage_all", String(draft.coverage_all));
    formData.set("accepted_terms", draft.accepted_terms ? "on" : "");
    formData.set("accepted_data_use", draft.accepted_data_use ? "on" : "");
    formData.set("mode", mode);
    if (token) formData.set("token", token);

    if (!draft.coverage_all) {
      draft.region_ids.forEach((id) => formData.append("region_ids", id));
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/onboarding/submit", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Error al enviar la postulación.");
      }

      window.localStorage.removeItem(storageKey);
      setStage("success");

      // Auto-redirect optional logic
      // setTimeout(() => {
      //   router.push("/");
      // }, 6000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- RENDER STAGES ---

  if (stage === "welcome") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-in fade-in duration-700 slide-in-from-bottom-4">
        <div className="mb-8 p-4">
          <Image
            src="/logo/logonbg.png"
            alt="TuEjecutiva.cl Logo"
            width={240}
            height={80}
            className="h-auto w-48 opacity-90 sm:w-64"
            priority
          />
        </div>

        <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Estamos muy felices de que <br className="hidden sm:block" />
          seas parte de <span className="text-emerald-600">TuEjecutiva.cl</span>
        </h1>

        <p className="mx-auto mb-10 max-w-lg text-lg text-slate-600">
          A continuación te pediremos algunos datos para tu perfil.
          Son simples, tómate tu tiempo. Nuestro equipo revisará tu postulación
          de forma manual para asegurar la calidad de nuestra red.
        </p>

        <button
          onClick={() => setStage("form")}
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-slate-900 px-8 py-3 font-medium text-white shadow-lg transition duration-300 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5"
        >
          <span className="relative">Comenzar postulación</span>
        </button>
      </div>
    );
  }

  if (stage === "success") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-in fade-in duration-700 slide-in-from-bottom-4">
        <div className="mb-8 p-4">
          <Image
            src="/logo/logonbg.png"
            alt="TuEjecutiva.cl Logo"
            width={180}
            height={60}
            className="h-auto w-40 opacity-90 grayscale-[0.2]"
          />
        </div>

        <div className="mb-6 rounded-full bg-emerald-100 p-3 text-emerald-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-slate-900">
          ¡Postulación recibida!
        </h1>

        <p className="mx-auto mb-8 max-w-md text-lg text-slate-600">
          Gracias por confiar en TuEjecutiva.cl.
          Nuestro equipo revisará tu información y se pondrá en contacto contigo a la brevedad.
        </p>

        <a
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          Ir al inicio
        </a>
      </div>
    );
  }

  // --- FORM STAGE ---

  return (
    <div className="animate-in fade-in duration-500 slide-in-from-bottom-2">
      {/* Header Form */}
      <div className="mb-8 text-center">
        <Image
          src="/logo/logonbg.png"
          alt="TuEjecutiva.cl Logo"
          width={160}
          height={50}
          className="mx-auto mb-6 h-auto w-32 opacity-80"
        />
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Datos de Postulación</h1>
        <p className="mt-2 text-slate-500">
          Completa los campos a continuación.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-200/60 ring-1 ring-slate-900/5">
        {mode === "dev" ? (
          <div className="border-b border-amber-100 bg-amber-50 px-6 py-3 text-sm text-amber-800">
            <strong>Modo desarrollo:</strong> este formulario no consume token para pruebas.
          </div>
        ) : null}

        <div className="p-6 sm:p-10">
          {error ? (
            <div className="mb-8 flex items-start gap-3 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-rose-500 mt-0.5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="font-semibold block mb-0.5">Atención</span>
                {error}
              </div>
            </div>
          ) : null}

          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Personal Info Group */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre completo</label>
                  <input
                    type="text"
                    value={draft.full_name}
                    onChange={(event) => updateField("full_name", event.target.value)}
                    className={`block w-full rounded-lg border px-3 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-colors ${fieldErrors.full_name
                        ? "border-rose-300 focus:border-rose-300 focus:ring-rose-200"
                        : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                      }`}
                    placeholder="Tu nombre completo"
                  />
                  {fieldErrors.full_name && (
                    <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    className={`block w-full rounded-lg border px-3 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-colors ${fieldErrors.email
                        ? "border-rose-300 focus:border-rose-300 focus:ring-rose-200"
                        : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                      }`}
                    placeholder="tu@email.com"
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Teléfono</label>
                  <input
                    type="tel"
                    value={draft.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    placeholder="9 1234 5678"
                    className={`block w-full rounded-lg border px-3 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-colors ${fieldErrors.phone
                        ? "border-rose-300 focus:border-rose-300 focus:ring-rose-200"
                        : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                      }`}
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.phone}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Empresa / Organización</label>
                  <input
                    type="text"
                    value={draft.company}
                    onChange={(event) => updateField("company", event.target.value)}
                    className={`block w-full rounded-lg border px-3 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-colors ${fieldErrors.company
                        ? "border-rose-300 focus:border-rose-300 focus:ring-rose-200"
                        : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                      }`}
                    placeholder="Nombre de la empresa"
                  />
                  {fieldErrors.company && (
                    <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.company}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Categoría <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <div className="relative">
                    <select
                      value={draft.category_id}
                      onChange={(event) => updateField("category_id", event.target.value)}
                      className="block w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:ring-inset sm:text-sm sm:leading-6"
                    >
                      <option value="">Seleccionar del listado...</option>
                      {categoryOptions.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Otra categoría <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={draft.custom_category}
                    onChange={(event) => updateField("custom_category", event.target.value)}
                    placeholder="Ej: Seguros PYME"
                    className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:ring-inset sm:text-sm sm:leading-6 transition-colors"
                  />
                </div>

                {fieldErrors.category ? (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium text-rose-600">{fieldErrors.category}</p>
                  </div>
                ) : null}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Coverage Section */}
            <section>
              <h2 className="text-base font-semibold leading-7 text-slate-900 mb-3">Cobertura Geográfica</h2>
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white transition-all checked:border-emerald-600 checked:bg-emerald-600 hover:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:ring-offset-1"
                      checked={draft.coverage_all}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          coverage_all: event.target.checked,
                          region_ids: event.target.checked ? [] : prev.region_ids,
                        }))
                      }
                    />
                    <svg className="absolute left-[3px] top-[3px] h-3.5 w-3.5 scale-0 stroke-white opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-800 group-hover:text-emerald-700 transition-colors">
                    Tengo cobertura en todo Chile
                  </span>
                </label>

                <div className={`mt-4 grid overflow-hidden transition-all duration-300 ease-in-out ${draft.coverage_all ? 'grid-rows-[0fr] opacity-50 grayscale' : 'grid-rows-[1fr] opacity-100'}`}>
                  <div className="min-h-0">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">Selecciona Regiones</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {regionOptions.map((region) => (
                        <label key={region.id} className="flex items-center gap-2.5 cursor-pointer group select-none">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-all checked:border-emerald-600 checked:bg-emerald-600 hover:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:ring-offset-1"
                              checked={draft.region_ids.includes(region.id)}
                              onChange={() => !draft.coverage_all && toggleRegion(region.id)}
                              disabled={draft.coverage_all}
                            />
                            <svg className="absolute left-[2px] top-[2px] h-3 w-3 scale-0 stroke-white opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </div>
                          <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors truncate">
                            {region.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {fieldErrors.region_ids ? (
                  <p className="mt-2 text-xs font-medium text-rose-600">{fieldErrors.region_ids}</p>
                ) : null}
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Terms Section */}
            <section className="space-y-4">
              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5 flex items-center">
                    <input
                      type="checkbox"
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white transition-all checked:border-slate-900 checked:bg-slate-900 hover:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:ring-offset-1"
                      checked={draft.accepted_terms}
                      onChange={(event) => updateField("accepted_terms", event.target.checked)}
                    />
                    <svg className="absolute left-[3px] top-[3px] h-3.5 w-3.5 scale-0 stroke-white opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                    Acepto los <span className="underline decoration-slate-300 underline-offset-2">términos y condiciones</span> de la plataforma.
                  </span>
                </label>
                {fieldErrors.accepted_terms ? (
                  <p className="ml-8 mt-1 text-xs font-medium text-rose-600">{fieldErrors.accepted_terms}</p>
                ) : null}
              </div>

              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5 flex items-center">
                    <input
                      type="checkbox"
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white transition-all checked:border-slate-900 checked:bg-slate-900 hover:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:ring-offset-1"
                      checked={draft.accepted_data_use}
                      onChange={(event) => updateField("accepted_data_use", event.target.checked)}
                    />
                    <svg className="absolute left-[3px] top-[3px] h-3.5 w-3.5 scale-0 stroke-white opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                    Autorizo el uso de mis datos para la revisión manual de mi postulación.
                  </span>
                </label>
                {fieldErrors.accepted_data_use ? (
                  <p className="ml-8 mt-1 text-xs font-medium text-rose-600">{fieldErrors.accepted_data_use}</p>
                ) : null}
              </div>
            </section>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  "Enviar postulación"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
