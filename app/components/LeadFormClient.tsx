"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CategoryOption {
  id: string;
  name: string;
}

interface LeadFormClientProps {
  categories: CategoryOption[];
}

export default function LeadFormClient({ categories }: LeadFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const mensaje = [
      `Nombre: ${data.name ?? ""}`,
      `Teléfono: ${data.phone ?? ""}`,
      `Rubro: ${data.category ?? ""}`,
      `Correo: ${data.email ?? ""}`,
      `Mensaje: ${data.message ?? ""}`,
    ].join("\n");

    try {
      const payload = new FormData();
      payload.set("nombre", String(data.name ?? ""));
      payload.set("email", String(data.email ?? ""));
      payload.set("mensaje", mensaje);

      const response = await fetch("/api/contact", {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "No pudimos enviar tu postulación.");
      }

      setIsSubmitted(true);
      form.reset();
      setTimeout(() => {
        router.push("/");
      }, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white px-6 py-12 shadow-xl rounded-2xl border border-gray-100">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-slate-900">Inicia tu postulación</h3>
        <p className="text-sm text-slate-500 mt-2">
          Completa tus datos y te contactaremos para verificar tu perfil.
        </p>
      </div>

      <form id="lead-form" className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-semibold leading-6 text-slate-900"
          >
            Nombre completo
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="name"
              id="name"
              required
              placeholder="Ej. María Pérez"
              className="block w-full rounded-lg border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-semibold leading-6 text-slate-900"
          >
            Teléfono (WhatsApp)
          </label>
          <div className="mt-2">
            <input
              type="tel"
              name="phone"
              id="phone"
              required
              placeholder="+56 9 1234 5678"
              className="block w-full rounded-lg border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold leading-6 text-slate-900"
          >
            Correo electrónico
          </label>
          <div className="mt-2">
            <input
              type="email"
              name="email"
              id="email"
              required
              placeholder="contacto@ejemplo.com"
              className="block w-full rounded-lg border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-semibold leading-6 text-slate-900"
          >
            Rubro principal
          </label>
          <div className="mt-2">
            <select
              id="category"
              name="category"
              className="block w-full rounded-lg border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
              defaultValue=""
            >
              <option value="">Selecciona tu rubro...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
              <option value="otro">Otro / No listado</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-semibold leading-6 text-slate-900"
          >
            Cuéntanos a qué te dedicas
          </label>
          <div className="mt-2">
            <textarea
              id="message"
              name="message"
              rows={3}
              placeholder="Breve descripción de tus servicios..."
              className="block w-full rounded-lg border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div className="pt-4">
          <div
            id="status-message"
            className={`text-sm font-medium text-emerald-600 mb-3 text-center bg-emerald-50 p-2 rounded-lg ${
              isSubmitted ? "" : "hidden"
            }`}
          >
            ¡Solicitud recibida! Te contactaremos pronto.
          </div>
          {error ? (
            <div className="text-sm font-medium text-rose-600 mb-3 text-center bg-rose-50 p-2 rounded-lg">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            id="submit-btn"
            disabled={isSubmitting}
            className={`block w-full rounded-lg px-3.5 py-2.5 text-center text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-colors ${
              isSubmitted
                ? "bg-emerald-600 text-white"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {isSubmitting ? "Enviando..." : isSubmitted ? "Enviado" : "Postular Ahora"}
          </button>
        </div>
      </form>
    </div>
  );
}
