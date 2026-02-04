"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
}

interface LeadFormClientProps {
  categories: CategoryOption[];
}

export default function LeadFormClient({ categories }: LeadFormClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [whatsAppLink, setWhatsAppLink] = useState("#");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData);

    // Dev only: capture
    // eslint-disable-next-line no-console
    console.log("Lead capture (DEV):", data);

    const text =
      `Hola *TuEjecutiva*, me gustaría postular al portal.\n\n` +
      `*Nombre:* ${data.name ?? ""}\n` +
      `*Rubro:* ${data.category ?? ""}\n` +
      `*Tel:* ${data.phone ?? ""}\n\n` +
      `Gracias.`;

    const waLink = `https://wa.me/56900000000?text=${encodeURIComponent(text)}`;
    setWhatsAppLink(waLink);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
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

        <div
          id="whatsapp-fallback"
          className={`mt-6 text-center border-t border-gray-100 pt-6 ${
            isSubmitted ? "" : "hidden"
          }`}
        >
          <p className="text-sm text-slate-500 mb-3">
            ¿Prefieres escribirnos directo?
          </p>
          <a
            id="whatsapp-btn"
            href={whatsAppLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-500 transition-colors"
          >
            <MessageCircle className="w-5 h-5" /> Enviar mensaje por WhatsApp
          </a>
        </div>
      </form>
    </div>
  );
}
