"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
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
const allowedPhotoTypes = ["image/jpeg", "image/png", "image/webp"];

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

  function normalizePhoneDigits(raw: string) {
    return raw.replace(/\D/g, "");
  }

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isValidPhoneDigits(value: string) {
    return /^[0-9]{9}$/.test(value);
  }

  function validateAll() {
    const nextErrors: Record<string, string> = {};

    if (!formState.full_name.trim()) nextErrors.full_name = "Este campo es obligatorio.";
    if (!formState.email.trim()) {
      nextErrors.email = "Este campo es obligatorio.";
    } else if (!isValidEmail(formState.email.trim())) {
      nextErrors.email = "Email inválido.";
    }

    const normalizedDigits = normalizePhoneDigits(formState.phone);
    if (!normalizedDigits) {
      nextErrors.phone = "Este campo es obligatorio.";
    } else if (!isValidPhoneDigits(normalizedDigits)) {
      nextErrors.phone = "Teléfono inválido. Debe tener 9 dígitos.";
    }

    if (!formState.company.trim()) nextErrors.company = "Este campo es obligatorio.";

    if (!formState.experience_years.trim()) {
      nextErrors.experience_years = "Este campo es obligatorio.";
    } else if (!Number.isFinite(Number(formState.experience_years))) {
      nextErrors.experience_years = "Ingresa un número válido.";
    } else if (Number(formState.experience_years) < 0 || Number(formState.experience_years) > 60) {
      nextErrors.experience_years = "Ingresa un número válido.";
    }

    if (!formState.specialty.trim()) nextErrors.specialty = "Este campo es obligatorio.";
    if (!formState.description.trim()) nextErrors.description = "Este campo es obligatorio.";

    if (selectedCategories.length === 0 && !customCategory.trim()) {
      nextErrors.category = "Selecciona una categoría o escribe una libre.";
    }
    if (!coverageAll && selectedRegions.length === 0) {
      nextErrors.regions = "Selecciona al menos una región.";
    }

    if (supportingFiles.length === 0) {
      nextErrors.supporting_files = "Debes adjuntar al menos un archivo.";
    } else {
      for (const file of supportingFiles) {
        if (!allowedMimeTypes.includes(file.type)) {
          nextErrors.supporting_files = "Formato de archivo no permitido.";
          break;
        }
      }
    }

    if (photoFile && !allowedPhotoTypes.includes(photoFile.type)) {
      nextErrors.photo_file = "Formato de foto no permitido.";
    }

    if (!formState.accepted_terms) {
      nextErrors.accepted_terms = "Debes aceptar términos y condiciones.";
    }
    if (!formState.accepted_data_use) {
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
      normalizedEmail: formState.email.trim(),
      normalizedName: formState.full_name.trim(),
      normalizedCompany: formState.company.trim(),
      normalizedSpecialty: formState.specialty.trim(),
      normalizedDescription: formState.description.trim(),
      normalizedWhatsapp: formState.whatsapp_message.trim(),
      normalizedExperience: formState.experience_years.trim(),
      normalizedCategory: customCategory.trim(),
    };
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
    const normalized = validateAll();
    if (!normalized) return;

    const formData = new FormData();
    formData.set("full_name", normalized.normalizedName);
    formData.set("email", normalized.normalizedEmail);
    formData.set("phone", normalized.normalizedPhone);
    formData.set("company", normalized.normalizedCompany);
    formData.set("experience_years", normalized.normalizedExperience);
    formData.set("specialty", normalized.normalizedSpecialty);
    formData.set("description", normalized.normalizedDescription);
    formData.set("whatsapp_message", normalized.normalizedWhatsapp);
    formData.set("coverage_all", String(coverageAll));
    formData.set("custom_category", normalized.normalizedCategory);
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
    <div className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-900/5 p-8 sm:p-10 relative overflow-hidden transition-all duration-300">
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-400" />

      {mode === "dev" ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Modo desarrollo:</strong> Estás viendo esto porque el entorno es de pruebas o la URL incluye /dev.
        </div>
      ) : null}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Postulación de Ejecutiva</h1>
        <p className="mt-2 text-sm text-slate-500">
          Paso {step} de {steps.length}: <span className="font-semibold text-emerald-600">{steps[step - 1]}</span>
        </p>

        {/* Improved Progress Bar */}
        <div className="mt-4 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
          <span className="text-xl">⚠️</span> {error}
        </div>
      ) : null}

      <form className="mt-6 space-y-8" onSubmit={handleSubmit}>
        {step === 1 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <h3 className="text-base font-semibold text-slate-900 mb-1">Datos de Contacto</h3>
              <p className="text-xs text-slate-500 mb-4">Esta información (excepto tu email) será visible en tu perfil público.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre completo <span className="text-rose-500">*</span>
              </label>
              <input
                name="full_name"
                type="text"
                value={formState.full_name}
                onChange={(event) => updateField("full_name", event.target.value)}
                placeholder="Ej. María Pérez"
                className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6 transition-all"
              />
              {fieldErrors.full_name && <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.full_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email <span className="text-rose-500">*</span>
              </label>
              <p className="mb-1 text-xs text-slate-400">No será público, solo para notificaciones.</p>
              <input
                name="email"
                type="email"
                value={formState.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="Ej. maria@empresa.cl"
                className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6 transition-all"
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.email}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Teléfono móvil <span className="text-rose-500">*</span>
              </label>
              <p className="mb-1 text-xs text-slate-500">
                Ingresa tu número sin el +56. Ejemplo: 912345678.
              </p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-slate-500 sm:text-sm">+56</span>
                </div>
                <input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  value={formState.phone}
                  onChange={(event) => updateField("phone", normalizePhoneDigits(event.target.value))}
                  placeholder="9 1234 5678"
                  className="block w-full rounded-lg border-0 py-2.5 pl-12 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6 transition-all"
                />
              </div>
              {fieldErrors.phone && <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.phone}</p>}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Empresa o Institución <span className="text-rose-500">*</span>
                </label>
                <input
                  name="company"
                  type="text"
                  value={formState.company}
                  onChange={(event) => updateField("company", event.target.value)}
                  placeholder="Ej. Seguros VidaPlus"
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6 transition-all"
                />
                {fieldErrors.company && <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.company}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Años de experiencia <span className="text-rose-500">*</span>
                </label>
                <input
                  name="experience_years"
                  type="number"
                  min={0}
                  value={formState.experience_years}
                  onChange={(event) => updateField("experience_years", event.target.value)}
                  placeholder="Ej. 5"
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6 transition-all"
                />
                {fieldErrors.experience_years && <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.experience_years}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Especialidad Principal <span className="text-rose-500">*</span>
                </label>
                <input
                  name="specialty"
                  type="text"
                  value={formState.specialty}
                  onChange={(event) => updateField("specialty", event.target.value)}
                  placeholder="Ej. Planes de salud para familias"
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6 transition-all"
                />
                {fieldErrors.specialty && <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.specialty}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descripción de tu Perfil <span className="text-rose-500">*</span>
              </label>
              <p className="mb-1 text-xs text-slate-500">Esta descripción aparecerá en tu ficha pública. Sé clara y profesional.</p>
              <textarea
                name="description"
                rows={4}
                value={formState.description}
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="Ej. Me especializo en asesorar a familias jóvenes para encontrar el mejor plan de salud. Cuento con 5 años de experiencia..."
                className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6 transition-all"
              />
              {fieldErrors.description && <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.description}</p>}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mensaje de Bienvenida WhatsApp (Opcional)
              </label>
              <p className="mb-1 text-xs text-slate-500">
                Este mensaje aparecerá pre-escrito cuando un cliente haga clic en "Contactar por WhatsApp".
              </p>
              <textarea
                name="whatsapp_message"
                rows={3}
                value={formState.whatsapp_message}
                onChange={(event) => updateField("whatsapp_message", event.target.value)}
                placeholder="Ej. ¡Hola! Vi tu perfil en TuEjecutiva.cl y me gustaría cotizar un plan..."
                className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6 transition-all"
              />
            </div>

            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 flex flex-col items-center justify-center text-center">
              <Image
                src="/images/wsppex.png"
                alt="Ejemplo de mensaje de WhatsApp"
                width={720}
                height={480}
                className="w-full max-w-md h-auto rounded-lg"
              />
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fotografía de perfil (Opcional)
              </label>
              <p className="text-xs text-slate-500 mb-3">
                La foto es opcional. Si no subes una, se mostrarán tus iniciales con un placeholder.
              </p>

              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    <p className="mb-2 text-sm text-slate-500"><span className="font-semibold text-emerald-600">Haz clic para subir</span> o arrastra la imagen</p>
                    <p className="text-xs text-slate-400">JPG o PNG (MAX. 2MB)</p>
                  </div>
              <input
                name="photo_file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setPhotoFile(file);
                    }}
                  />
                </label>
              </div>

              {photoFile && (
                <div className="mt-2 flex items-center gap-2 p-2 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg">
                  <span>✓</span> Foto seleccionada: {photoFile.name}
                </div>
              )}

              {fieldErrors.photo_file && <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.photo_file}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm h-48 flex items-center justify-center">
                <Image
                  src="/images/ejecutivaf.png"
                  alt="Ejemplo de ejecutiva con foto"
                  width={480}
                  height={360}
                  className="w-full max-w-[220px] h-auto rounded-lg"
                />
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm h-48 flex items-center justify-center">
                <Image
                  src="/images/ejecutivasf.png"
                  alt="Ejemplo de ejecutiva sin foto"
                  width={480}
                  height={360}
                  className="w-full max-w-[220px] h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="space-y-8">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Categorías de Servicio <span className="text-rose-500">*</span></h2>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((category) => (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`rounded-lg px-4 py-2.5 text-sm font-medium border transition-all shadow-sm ${selectedCategories.includes(category.id)
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-emerald-500/20 translate-y-[1px]"
                      : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700 hover:bg-slate-50"
                      }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              <div className="mt-4 max-w-sm">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  ¿No encuentras tu categoría? Agrégala aquí:
                </label>
                <input
                  name="custom_category"
                  type="text"
                  value={customCategory}
                  onChange={(event) => setCustomCategory(event.target.value)}
                  placeholder="Ej. Seguros de mascotas"
                  className="block w-full rounded-lg border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 text-sm transition-all"
                />
              </div>
              {fieldErrors.category && <p className="mt-2 text-xs text-rose-600 font-medium">{fieldErrors.category}</p>}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-slate-500 text-xs mb-3">
                Desmarca esta casilla si solo atiendes regiones específicas.
              </p>
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-6 items-center">
                  <input
                    id="coverage_all"
                    type="checkbox"
                    checked={coverageAll}
                    onChange={(event) => {
                      setCoverageAll(event.target.checked);
                      if (event.target.checked) setSelectedRegions([]);
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                  />
                </div>
                <div className="text-sm leading-6">
                  <label htmlFor="coverage_all" className="font-semibold text-slate-900">
                    Tengo cobertura en todo Chile
                  </label>
                </div>
              </div>

              <div className={`transition-all duration-300 ${regionDisabled ? "opacity-40 pointer-events-none grayscale" : "opacity-100"}`}>
                <h2 className="text-sm font-semibold text-slate-900 mb-3">
                  Selecciona tus Regiones
                </h2>
                <div className="flex flex-wrap gap-2">
                  {regionOptions.map((region) => (
                    <button
                      type="button"
                      key={region.id}
                      onClick={() => toggleRegion(region.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${selectedRegions.includes(region.id)
                        ? "bg-slate-800 text-white border-slate-800"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                        }`}
                    >
                      {region.name}
                    </button>
                  ))}
                </div>
                {fieldErrors.regions && <p className="mt-2 text-xs text-rose-600 font-medium">{fieldErrors.regions}</p>}
              </div>
            </div>
          </div>
        ) : null}

        {step === 6 ? (
          <div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <h2 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                📄 Documentación Requerida
              </h2>
              <p className="mt-1 text-xs text-blue-700 leading-relaxed">
                Debes validar tu relación laboral con la empresa que indicaste. Ejemplos: contrato de trabajo o certificado de cotizaciones. Es <strong>obligatorio</strong> y esta información es <strong>privada</strong>; no se comparte con nadie.
              </p>
            </div>

            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-10 h-10 mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  <p className="mb-2 text-sm text-slate-500 font-medium">Subir archivo de respaldo</p>
                  <p className="text-xs text-slate-400">PDF, JPG o PNG</p>
                </div>
                <input
                  name="supporting_files"
                  type="file"
                  multiple
                  accept={allowedMimeTypes.join(",")}
                  className="hidden"
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    setSupportingFiles(files);
                  }}
                />
              </label>
            </div>

            {supportingFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {supportingFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-md shadow-sm">
                    <span className="text-xl">📎</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {fieldErrors.supporting_files && <p className="mt-2 text-xs text-rose-600 font-medium">{fieldErrors.supporting_files}</p>}
          </div>
        ) : null}

        {step === 7 ? (
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 text-sm">
              <h2 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">Resumen de la solicitud</h2>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div><dt className="text-xs text-slate-500 uppercase tracking-wide">Nombre</dt><dd className="font-medium text-slate-900">{formState.full_name}</dd></div>
                <div><dt className="text-xs text-slate-500 uppercase tracking-wide">Email</dt><dd className="font-medium text-slate-900">{formState.email}</dd></div>
                <div><dt className="text-xs text-slate-500 uppercase tracking-wide">Teléfono</dt><dd className="font-medium text-slate-900">{formState.phone}</dd></div>
                <div><dt className="text-xs text-slate-500 uppercase tracking-wide">Empresa</dt><dd className="font-medium text-slate-900">{formState.company}</dd></div>

                <div className="sm:col-span-2 bg-white p-3 rounded-lg border border-slate-100">
                  <dt className="text-xs text-slate-500 uppercase tracking-wide mb-1">Descripción</dt>
                  <dd className="text-slate-700 italic">"{formState.description}"</dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="text-xs text-slate-500 uppercase tracking-wide">Categorías</dt>
                  <dd className="mt-1 flex flex-wrap gap-1">
                    {summaryCategories.map(c => <span key={c} className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10">{c}</span>)}
                    {customCategory && <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">{customCategory}</span>}
                  </dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="text-xs text-slate-500 uppercase tracking-wide">Regiones</dt>
                  <dd className="mt-1 text-slate-700">{summaryRegions.join(", ")}</dd>
                </div>
              </dl>
            </section>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="flex h-6 items-center">
                  <input
                    id="accepted_terms"
                    name="accepted_terms"
                    type="checkbox"
                    checked={formState.accepted_terms}
                    onChange={(event) => {
                      updateField("accepted_terms", event.target.checked);
                      if (event.target.checked) {
                        setFieldErrors((prev) => ({ ...prev, accepted_terms: "" }));
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                  />
                </div>
                <div className="text-sm leading-6">
                  <label htmlFor="accepted_terms" className="font-medium text-slate-900">
                    Acepto los términos y condiciones
                  </label>
                  {fieldErrors.accepted_terms && <p className="text-xs text-rose-600">{fieldErrors.accepted_terms}</p>}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 items-center">
                  <input
                    id="accepted_data_use"
                    name="accepted_data_use"
                    type="checkbox"
                    checked={formState.accepted_data_use}
                    onChange={(event) => {
                      updateField("accepted_data_use", event.target.checked);
                      if (event.target.checked) {
                        setFieldErrors((prev) => ({ ...prev, accepted_data_use: "" }));
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                  />
                </div>
                <div className="text-sm leading-6">
                  <label htmlFor="accepted_data_use" className="font-medium text-slate-900">
                    Acepto que mis datos sean procesados para la verificación
                  </label>
                  {fieldErrors.accepted_data_use && <p className="text-xs text-rose-600">{fieldErrors.accepted_data_use}</p>}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 mt-8">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="w-full sm:w-auto rounded-lg px-6 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
          >
            ← Volver
          </button>

          {step < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="w-full sm:w-auto rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-all"
            >
              Continuar
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto rounded-lg bg-slate-900 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:opacity-70 disabled:cursor-wait transition-all"
            >
              {isSubmitting ? "Enviando solicitud..." : "Finalizar Postulación"}
            </button>
          )}
        </div>

        {success ? (
          <div className="rounded-lg bg-emerald-50 p-4 text-center animate-fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-3">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-emerald-800">¡Solicitud Enviada con Éxito!</h3>
            <p className="mt-1 text-sm text-emerald-700">El equipo revisará tus datos. Redirigiendo...</p>
          </div>
        ) : null}
      </form>
    </div>
  );
}
