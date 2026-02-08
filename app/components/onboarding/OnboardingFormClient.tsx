"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function OnboardingFormClient({
  categories,
  regions,
  token,
  mode,
}: OnboardingFormClientProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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

  function updateField<K extends keyof DraftState>(name: K, value: DraftState[K]) {
    setDraft((prev) => ({ ...prev, [name]: value }));
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
      setError("Revisa los campos marcados.");
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

      setSuccess(true);
      window.localStorage.removeItem(storageKey);
      setTimeout(() => {
        router.push("/");
      }, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5 sm:p-10">
      {mode === "dev" ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Modo desarrollo:</strong> este formulario no consume token para pruebas.
        </div>
      ) : null}

      <h1 className="text-2xl font-bold text-slate-900">Postulación de Ejecutiva</h1>
      <p className="mt-2 text-sm text-slate-600">
        Completa esta postulación breve. La validación y publicación se realizan manualmente por el equipo.
      </p>

      {error ? (
        <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Postulación enviada correctamente. Te contactaremos pronto.
        </div>
      ) : null}

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Nombre completo *</label>
            <input
              type="text"
              value={draft.full_name}
              onChange={(event) => updateField("full_name", event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {fieldErrors.full_name ? (
              <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.full_name}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Email *</label>
            <input
              type="email"
              value={draft.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {fieldErrors.email ? (
              <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.email}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Teléfono *</label>
            <input
              type="tel"
              value={draft.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="Ej: 9 1234 5678"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {fieldErrors.phone ? (
              <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.phone}</p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Empresa *</label>
            <input
              type="text"
              value={draft.company}
              onChange={(event) => updateField("company", event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {fieldErrors.company ? (
              <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.company}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Categoría existente (opcional)</label>
            <select
              value={draft.category_id}
              onChange={(event) => updateField("category_id", event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Seleccionar categoría</option>
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Categoría libre (opcional)</label>
            <input
              type="text"
              value={draft.custom_category}
              onChange={(event) => updateField("custom_category", event.target.value)}
              placeholder="Ej: Seguros PYME"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {fieldErrors.category ? (
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-rose-600">{fieldErrors.category}</p>
            </div>
          ) : null}
        </div>

        <section className="rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Cobertura</h2>

          <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={draft.coverage_all}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  coverage_all: event.target.checked,
                  region_ids: event.target.checked ? [] : prev.region_ids,
                }))
              }
            />
            Cobertura en todo Chile
          </label>

          {!draft.coverage_all ? (
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {regionOptions.map((region) => (
                <label key={region.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={draft.region_ids.includes(region.id)}
                    onChange={() => toggleRegion(region.id)}
                  />
                  {region.name}
                </label>
              ))}
            </div>
          ) : null}

          {fieldErrors.region_ids ? (
            <p className="mt-2 text-xs font-medium text-rose-600">{fieldErrors.region_ids}</p>
          ) : null}
        </section>

        <section className="space-y-2 rounded-lg border border-gray-200 p-4">
          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={draft.accepted_terms}
              onChange={(event) => updateField("accepted_terms", event.target.checked)}
              className="mt-0.5"
            />
            Acepto los términos y condiciones. *
          </label>
          {fieldErrors.accepted_terms ? (
            <p className="text-xs font-medium text-rose-600">{fieldErrors.accepted_terms}</p>
          ) : null}

          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={draft.accepted_data_use}
              onChange={(event) => updateField("accepted_data_use", event.target.checked)}
              className="mt-0.5"
            />
            Autorizo el uso de mis datos para revisión de postulación. *
          </label>
          {fieldErrors.accepted_data_use ? (
            <p className="text-xs font-medium text-rose-600">{fieldErrors.accepted_data_use}</p>
          ) : null}
        </section>

        <button
          type="submit"
          disabled={isSubmitting || success}
          className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Enviando..." : "Enviar postulación"}
        </button>
      </form>
    </div>
  );
}
