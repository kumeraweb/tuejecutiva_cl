"use client";

import { useMemo, useState } from "react";
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

const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
const allowedPhotoTypes = ["image/jpeg", "image/png"];

export default function OnboardingFormClient({
  categories,
  regions,
  token,
  mode,
}: OnboardingFormClientProps) {
  const router = useRouter();
  const [coverageAll, setCoverageAll] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const regionDisabled = coverageAll;

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ id: category.id, name: category.name })),
    [categories]
  );

  const regionOptions = useMemo(
    () => regions.map((region) => ({ id: region.id, name: region.name })),
    [regions]
  );

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function toggleRegion(id: string) {
    setSelectedRegions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);

    const requiredFields = [
      "full_name",
      "email",
      "phone",
      "company",
      "experience_years",
      "specialty",
      "description",
    ];
    const missing = requiredFields.filter((field) => {
      const value = formData.get(field);
      if (typeof value !== "string") return true;
      return value.trim().length === 0;
    });
    const nextErrors: Record<string, string> = {};
    missing.forEach((field) => {
      nextErrors[field] = "Este campo es obligatorio.";
    });

    const acceptedTerms = formData.get("accepted_terms");
    const acceptedDataUse = formData.get("accepted_data_use");
    if (!acceptedTerms) {
      nextErrors.accepted_terms = "Debes aceptar términos y condiciones.";
    }
    if (!acceptedDataUse) {
      nextErrors.accepted_data_use = "Debes aceptar el uso de tus datos.";
    }

    if (selectedCategories.length === 0 && !customCategory.trim()) {
      nextErrors.category = "Selecciona una categoría o escribe una libre.";
    }

    if (!coverageAll && selectedRegions.length === 0) {
      nextErrors.regions = "Selecciona al menos una región.";
    }

    selectedCategories.forEach((id) => formData.append("category_ids", id));
    if (!coverageAll) {
      selectedRegions.forEach((id) => formData.append("region_ids", id));
    }
    formData.set("coverage_all", String(coverageAll));
    formData.set("custom_category", customCategory.trim());
    formData.set("mode", mode);
    if (token) formData.set("token", token);

    const files = formData.getAll("supporting_files");
    const validFiles = files.filter((item) => item instanceof File && item.size > 0) as File[];
    if (validFiles.length === 0) {
      nextErrors.supporting_files = "Debes adjuntar al menos un archivo.";
    }
    for (const file of validFiles) {
      if (!allowedMimeTypes.includes(file.type)) {
        nextErrors.supporting_files = "Formato de archivo no permitido.";
        break;
      }
    }

    const photoFileEntry = formData.get("photo_file");
    if (photoFileEntry instanceof File && photoFileEntry.size > 0) {
      if (!allowedPhotoTypes.includes(photoFileEntry.type)) {
        nextErrors.photo_file = "Formato de foto no permitido.";
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setError("Revisa los campos marcados.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/onboarding/submit", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Error al enviar el formulario.");
      }
      setSuccess(true);
      form.reset();
      setSelectedCategories([]);
      setSelectedRegions([]);
      setCoverageAll(true);
      setCustomCategory("");
      setTimeout(() => {
        router.push("/");
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      {mode === "dev" ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Modo desarrollo
        </div>
      ) : null}

      <h1 className="text-2xl font-bold text-slate-900">
        Postulación de ejecutiva
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Completa tus datos para iniciar el proceso de verificación.
      </p>

      {error ? (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-900">
              Nombre completo (Obligatorio)
            </label>
            <input
              name="full_name"
              type="text"
              placeholder="Ej. María Pérez"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            {fieldErrors.full_name ? (
              <p className="mt-1 text-xs text-rose-600">{fieldErrors.full_name}</p>
            ) : null}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900">
              Email (Obligatorio)
            </label>
            <input
              name="email"
              type="email"
              placeholder="Ej. maria@empresa.cl"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            {fieldErrors.email ? (
              <p className="mt-1 text-xs text-rose-600">{fieldErrors.email}</p>
            ) : null}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900">
              Teléfono (Obligatorio)
            </label>
            <input
              name="phone"
              type="tel"
              placeholder="Ej. +56 9 1234 5678"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            {fieldErrors.phone ? (
              <p className="mt-1 text-xs text-rose-600">{fieldErrors.phone}</p>
            ) : null}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900">
              Empresa (Obligatorio)
            </label>
            <input
              name="company"
              type="text"
              placeholder="Ej. Seguros VidaPlus"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            {fieldErrors.company ? (
              <p className="mt-1 text-xs text-rose-600">{fieldErrors.company}</p>
            ) : null}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900">
              Años de experiencia (Obligatorio)
            </label>
            <input
              name="experience_years"
              type="number"
              min={0}
              placeholder="Ej. 5"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            {fieldErrors.experience_years ? (
              <p className="mt-1 text-xs text-rose-600">{fieldErrors.experience_years}</p>
            ) : null}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900">
              Especialidad (Obligatorio)
            </label>
            <input
              name="specialty"
              type="text"
              placeholder="Ej. Planes de salud"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            {fieldErrors.specialty ? (
              <p className="mt-1 text-xs text-rose-600">{fieldErrors.specialty}</p>
            ) : null}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900">
            Descripción (Obligatorio)
          </label>
          <textarea
            name="description"
            rows={4}
            placeholder="Ej. Atiendo empresas y personas en planes complementarios..."
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          {fieldErrors.description ? (
            <p className="mt-1 text-xs text-rose-600">{fieldErrors.description}</p>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900">
            Mensaje de WhatsApp (Opcional)
          </label>
          <textarea
            name="whatsapp_message"
            rows={3}
            placeholder="Ej. Hola, soy María y te puedo ayudar con..."
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900">
            Fotografía de perfil (Opcional)
          </label>
          <input
            name="photo_file"
            type="file"
            accept="image/jpeg,image/png"
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <p className="mt-2 text-xs text-slate-500">
            Formatos permitidos: JPG o PNG.
          </p>
          {fieldErrors.photo_file ? (
            <p className="mt-1 text-xs text-rose-600">{fieldErrors.photo_file}</p>
          ) : null}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Categorías (Obligatorio)
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Selecciona una o más. Si no existe tu categoría, escríbela abajo.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {categoryOptions.map((category) => (
              <button
                type="button"
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition ${
                  selectedCategories.includes(category.id)
                    ? "bg-emerald-600 text-white ring-emerald-600"
                    : "bg-slate-100 text-slate-600 ring-slate-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-slate-900">
              Categoría libre (Opcional)
            </label>
            <input
              name="custom_category"
              type="text"
              value={customCategory}
              onChange={(event) => setCustomCategory(event.target.value)}
              placeholder="Ej. Seguros de salud"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          {fieldErrors.category ? (
            <p className="mt-2 text-xs text-rose-600">{fieldErrors.category}</p>
          ) : null}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <input
              type="checkbox"
              checked={coverageAll}
              onChange={(event) => {
                setCoverageAll(event.target.checked);
                if (event.target.checked) setSelectedRegions([]);
              }}
            />
            Cobertura nacional (Obligatorio)
          </label>
          <p className="mt-1 text-xs text-slate-500">
            Puedes dejar cobertura nacional activada o desmarcarla y elegir solo
            las regiones donde atiendes.
          </p>
        </div>

        <div className={regionDisabled ? "opacity-50 pointer-events-none" : ""}>
          <h2 className="text-sm font-semibold text-slate-900">
            Regiones (Obligatorio si no es cobertura nacional)
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {regionOptions.map((region) => (
              <button
                type="button"
                key={region.id}
                onClick={() => toggleRegion(region.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition ${
                  selectedRegions.includes(region.id)
                    ? "bg-emerald-600 text-white ring-emerald-600"
                    : "bg-slate-100 text-slate-600 ring-slate-200"
                }`}
              >
                {region.name}
              </button>
            ))}
          </div>
          {fieldErrors.regions ? (
            <p className="mt-2 text-xs text-rose-600">{fieldErrors.regions}</p>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900">
            Archivo de respaldo (Obligatorio)
          </label>
          <p className="mt-1 text-xs text-slate-500">
            Se usará para validar que trabajas con la empresa que representas.
            Formatos permitidos: PDF, JPG, PNG.
          </p>
          <input
            name="supporting_files"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            className="mt-2 w-full rounded-lg border border-dashed border-emerald-300 bg-emerald-50/40 px-4 py-3 text-sm text-emerald-800 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:bg-emerald-50"
          />
          {fieldErrors.supporting_files ? (
            <p className="mt-2 text-xs text-rose-600">{fieldErrors.supporting_files}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input name="accepted_terms" type="checkbox" />
            Acepto términos y condiciones (Obligatorio)
          </label>
          {fieldErrors.accepted_terms ? (
            <p className="ml-6 text-xs text-rose-600">{fieldErrors.accepted_terms}</p>
          ) : null}
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input name="accepted_data_use" type="checkbox" />
            Acepto el uso de mis datos (Obligatorio)
          </label>
          {fieldErrors.accepted_data_use ? (
            <p className="ml-6 text-xs text-rose-600">{fieldErrors.accepted_data_use}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Enviando..." : "Enviar postulación"}
        </button>

        {success ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            ¡Solicitud recibida! El equipo revisará tu información. Serás redirigida al inicio en 5 segundos.
          </div>
        ) : null}
      </form>
    </div>
  );
}
