import Image from "next/image";
import { UserCheck, Star } from "lucide-react";
import LeadForm from "../components/LeadForm";

export default function PostularPage() {
  return (
    <main className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Postula al Portal
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Únete a la red de ejecutivas verificadas más grande de Chile.
            Aumenta tu visibilidad y genera confianza en tus futuros clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Beneficios de estar verificada
            </h2>
            <ul className="space-y-6">
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Image
                    src="/images/certification.png"
                    alt="Sello Verificado"
                    className="w-16 h-16 object-contain"
                    width={64}
                    height={64}
                  />
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-slate-900">Sello de Confianza</h3>
                  <p className="text-slate-600 text-sm">
                    Tu perfil tendrá el badge de verificación interna de TuEjecutiva.cl, lo que
                    aumenta drásticamente la confianza del cliente.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-slate-900">Leads Calificados</h3>
                  <p className="text-slate-600 text-sm">
                    Recibe contactos de personas que realmente están buscando
                    contratar, no solo &quot;curiosos&quot;.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Star className="w-6 h-6" fill="currentColor" />
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-slate-900">Perfil Profesional</h3>
                  <p className="text-slate-600 text-sm">
                    Tú eliges cómo presentarte: destaca tu experiencia, tu
                    especialidad y tu propuesta de valor.
                  </p>
                </div>
              </li>
            </ul>

            <div className="mt-16 pt-10 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Cómo funciona el proceso
              </h2>
              <div className="relative pl-4 border-l-2 border-emerald-100 space-y-8">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                  <h3 className="text-base font-semibold text-slate-900">
                    1. Contacto
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Nos contactas a través del formulario simple de esta página.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                  <h3 className="text-base font-semibold text-slate-900">
                    2. Evaluación
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Evaluamos tu perfil y nos cuentas a qué te dedicas.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                  <h3 className="text-base font-semibold text-slate-900">
                    3. Propuesta
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Te mostramos los planes disponibles y eliges el mejor para
                    ti.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                  <h3 className="text-base font-semibold text-slate-900">
                    4. Verificación
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Nos envías tu documentación para validar tu identidad.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                  <h3 className="text-base font-semibold text-slate-900">
                    5. Creación
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Te enviamos un enlace único para que crees tu perfil.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                  <h3 className="text-base font-semibold text-slate-900">
                    6. ¡Publicada!
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Aprobamos tu perfil y ya estás visible para recibir clientes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky top-24">
            <LeadForm />
          </div>
        </div>
      </div>
    </main>
  );
}
