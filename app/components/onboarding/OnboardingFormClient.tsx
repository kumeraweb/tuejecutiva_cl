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

const steps = [
  "Datos personales",
  "Vínculo empresa",
  "Mensaje de WhatsApp",
  "Foto de perfil",
  "Categoría y cobertura",
  "Vínculo legal",
  "Revisión final",
];

export default function OnboardingFormClient({
  categories,
  regions,
  token,
  mode,
}: OnboardingFormClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [coverageAll, setCoverageAll] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState("");
  const [supportingFiles, setSupportingFiles] = useState<File[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [formState, setFormState] = useState({
    full_name: "",
    email: "",
    phone: "",
    company: "",
    experience_years: "",
    specialty: "",
    description: "",
    whatsapp_message: "",
    accepted_terms: false,
    accepted_data_use: false,
  });
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

  function updateField(name: keyof typeof formState, value: string | boolean) {
    setFormState((prev) => ({ ...prev, [name]: value }));
  }

  function validateStep(currentStep: number) {
    const nextErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formState.full_name.trim()) nextErrors.full_name = "Este campo es obligatorio.";
      if (!formState.email.trim()) nextErrors.email = "Este campo es obligatorio.";
      if (!formState.phone.trim()) nextErrors.phone = "Este campo es obligatorio.";
    }

    if (currentStep === 2) {
      if (!formState.company.trim()) nextErrors.company = "Este campo es obligatorio.";
      if (!formState.experience_years.trim()) {
        nextErrors.experience_years = "Este campo es obligatorio.";
      } else if (!Number.isFinite(Number(formState.experience_years))) {
        nextErrors.experience_years = "Ingresa un número válido.";
      }
      if (!formState.specialty.trim()) nextErrors.specialty = "Este campo es obligatorio.";
      if (!formState.description.trim()) nextErrors.description = "Este campo es obligatorio.";
    }

    if (currentStep === 4 && photoFile) {
      if (!allowedPhotoTypes.includes(photoFile.type)) {
        nextErrors.photo_file = "Formato de foto no permitido.";
      }
    }

    if (currentStep === 5) {
      if (selectedCategories.length === 0 && !customCategory.trim()) {
        nextErrors.category = "Selecciona una categoría o escribe una libre.";
      }
      if (!coverageAll && selectedRegions.length === 0) {
        nextErrors.regions = "Selecciona al menos una región.";
      }
    }

    if (currentStep === 6) {
      if (supportingFiles.length === 0) {
        nextErrors.supporting_files = "Debes adjuntar al menos un archivo.";
      }
      for (const file of supportingFiles) {
        if (!allowedMimeTypes.includes(file.type)) {
          nextErrors.supporting_files = "Formato de archivo no permitido.";
          break;
        }
      }
    }

    if (currentStep === 7) {
      if (!formState.accepted_terms) {
        nextErrors.accepted_terms = "Debes aceptar términos y condiciones.";
      }
      if (!formState.accepted_data_use) {
        nextErrors.accepted_data_use = "Debes aceptar el uso de tus datos.";
      }
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setError("Revisa los campos marcados.");
      return false;
    }

    setError(null);
    return true;
  }

  function handleNext() {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, steps.length));
    }
  }

  function handleBack() {
    setError(null);
    setFieldErrors({});
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateStep(7)) return;

    const formData = new FormData();
    formData.set("full_name", formState.full_name.trim());
    formData.set("email", formState.email.trim());
    formData.set("phone", formState.phone.trim());
    formData.set("company", formState.company.trim());
    formData.set("experience_years", formState.experience_years.trim());
    formData.set("specialty", formState.specialty.trim());
    formData.set("description", formState.description.trim());
    formData.set("whatsapp_message", formState.whatsapp_message.trim());
    formData.set("coverage_all", String(coverageAll));
    formData.set("custom_category", customCategory.trim());
    formData.set("accepted_terms", formState.accepted_terms ? "on" : "");
    formData.set("accepted_data_use", formState.accepted_data_use ? "on" : "");
    formData.set("mode", mode);
    if (token) formData.set("token", token);

    selectedCategories.forEach((id) => formData.append("category_ids", id));
    if (!coverageAll) {
      selectedRegions.forEach((id) => formData.append("region_ids", id));
    }

    supportingFiles.forEach((file) => formData.append("supporting_files", file));
    if (photoFile) {
      formData.append("photo_file", photoFile);
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
      setTimeout(() => {
        router.push("/");
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  }

  const summaryCategories =
    selectedCategories.length > 0
      ? categoryOptions
          .filter((category) => selectedCategories.includes(category.id))
          .map((category) => category.name)
      : [];

  const summaryRegions =
    coverageAll || selectedRegions.length === 0
      ? ["Cobertura nacional"]
      : regionOptions
          .filter((region) => selectedRegions.includes(region.id))
          .map((region) => region.name);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      {mode === "dev" ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Modo desarrollo
        </div>
      ) : null}

      <h1 className="text-2xl font-bold text-slate-900">Postulación de ejecutiva</h1>
      <p className="mt-2 text-sm text-slate-600">
        Completa tus datos para iniciar el proceso de verificación.
      </p>

      <div className="mt-6">
        <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
          {steps.map((label, index) => {
            const current = index + 1;
            const isActive = current === step;
            const isDone = current < step;
            return (
              <div
                key={label}
                className={`rounded-full px-3 py-1 ring-1 ring-inset ${
                  isActive
                    ? "bg-emerald-600 text-white ring-emerald-600"
                    : isDone
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : "bg-slate-100 text-slate-500 ring-slate-200"
                }`}
              >
                {current}. {label}
              </div>
            );
          })}
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        {step === 1 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-900">
                Nombre completo (Obligatorio)
              </label>
              <input
                name="full_name"
                type="text"
                value={formState.full_name}
                onChange={(event) => updateField("full_name", event.target.value)}
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
                value={formState.email}
                onChange={(event) => updateField("email", event.target.value)}
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
                value={formState.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="Ej. +56 9 1234 5678"
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              {fieldErrors.phone ? (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.phone}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-900">
                  Empresa (Obligatorio)
                </label>
                <input
                  name="company"
                  type="text"
                  value={formState.company}
                  onChange={(event) => updateField("company", event.target.value)}
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
                  value={formState.experience_years}
                  onChange={(event) => updateField("experience_years", event.target.value)}
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
                  value={formState.specialty}
                  onChange={(event) => updateField("specialty", event.target.value)}
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
                value={formState.description}
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="Ej. Atiendo empresas y personas en planes complementarios..."
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              {fieldErrors.description ? (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.description}</p>
              ) : null}
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div>
              <label className="block text-sm font-semibold text-slate-900">
                Mensaje de WhatsApp (Opcional)
              </label>
              <textarea
                name="whatsapp_message"
                rows={3}
                value={formState.whatsapp_message}
                onChange={(event) => updateField("whatsapp_message", event.target.value)}
                placeholder="Ej. Hola, soy María y te puedo ayudar con..."
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="rounded-xl border border-dashed border-gray-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              Placeholder imagen explicativa de WhatsApp
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <div>
              <label className="block text-sm font-semibold text-slate-900">
                Fotografía de perfil (Opcional)
              </label>
              <input
                name="photo_file"
                type="file"
                accept="image/jpeg,image/png"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setPhotoFile(file);
                }}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <p className="mt-2 text-xs text-slate-500">
                Formatos permitidos: JPG o PNG. Si no subes foto se usará la letra de tu nombre.
              </p>
              {fieldErrors.photo_file ? (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.photo_file}</p>
              ) : null}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-dashed border-gray-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Placeholder card con foto
              </div>
              <div className="rounded-xl border border-dashed border-gray-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Placeholder card sin foto
              </div>
            </div>
          </>
        ) : null}

        {step === 5 ? (
          <>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Categorías (Obligatorio)</h2>
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
                Puedes dejar cobertura nacional activada o desmarcarla y elegir solo las regiones donde atiendes.
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
          </>
        ) : null}

        {step === 6 ? (
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Archivo de respaldo (Obligatorio)
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Se usará para validar que trabajas con la empresa que representas. Formatos permitidos: PDF, JPG, PNG.
            </p>
            <input
              name="supporting_files"
              type="file"
              multiple
              accept={allowedMimeTypes.join(",")}
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                setSupportingFiles(files);
              }}
              className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            {fieldErrors.supporting_files ? (
              <p className="mt-2 text-xs text-rose-600">{fieldErrors.supporting_files}</p>
            ) : null}
          </div>
        ) : null}

        {step === 7 ? (
          <>
            <section className="rounded-xl border border-gray-200 bg-slate-50 p-4 text-sm text-slate-700">
              <h2 className="text-sm font-semibold text-slate-900">Resumen</h2>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div><strong>Nombre:</strong> {formState.full_name || "-"}</div>
                <div><strong>Email:</strong> {formState.email || "-"}</div>
                <div><strong>Teléfono:</strong> {formState.phone || "-"}</div>
                <div><strong>Empresa:</strong> {formState.company || "-"}</div>
                <div><strong>Experiencia:</strong> {formState.experience_years || "-"}</div>
                <div><strong>Especialidad:</strong> {formState.specialty || "-"}</div>
                <div className="sm:col-span-2"><strong>Descripción:</strong> {formState.description || "-"}</div>
                <div className="sm:col-span-2"><strong>WhatsApp:</strong> {formState.whatsapp_message || "-"}</div>
                <div className="sm:col-span-2">
                  <strong>Categorías:</strong> {summaryCategories.length > 0 ? summaryCategories.join(", ") : "-"}
                </div>
                <div className="sm:col-span-2">
                  <strong>Categoría libre:</strong> {customCategory || "-"}
                </div>
                <div className="sm:col-span-2">
                  <strong>Regiones:</strong> {summaryRegions.join(", ")}
                </div>
                <div><strong>Foto:</strong> {photoFile ? photoFile.name : "No enviada"}</div>
                <div><strong>Archivos respaldo:</strong> {supportingFiles.length}</div>
              </div>
            </section>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  name="accepted_terms"
                  type="checkbox"
                  checked={formState.accepted_terms}
                  onChange={(event) => updateField("accepted_terms", event.target.checked)}
                />
                Acepto términos y condiciones (Obligatorio)
              </label>
              {fieldErrors.accepted_terms ? (
                <p className="ml-6 text-xs text-rose-600">{fieldErrors.accepted_terms}</p>
              ) : null}
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  name="accepted_data_use"
                  type="checkbox"
                  checked={formState.accepted_data_use}
                  onChange={(event) => updateField("accepted_data_use", event.target.checked)}
                />
                Acepto el uso de mis datos (Obligatorio)
              </label>
              {fieldErrors.accepted_data_use ? (
                <p className="ml-6 text-xs text-rose-600">{fieldErrors.accepted_data_use}</p>
              ) : null}
            </div>
          </>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
          >
            Volver
          </button>

          {step < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting ? "Enviando..." : "Enviar postulación"}
            </button>
          )}
        </div>

        {success ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            ¡Solicitud recibida! El equipo revisará tu información. Serás redirigida al inicio en 5 segundos.
          </div>
        ) : null}
      </form>
    </div>
  );
}
