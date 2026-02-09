import { BadgeCheck, MessageCircle, Briefcase, Building2 } from "lucide-react";
import TrackedWhatsappLink from "@/app/components/TrackedWhatsappLink";

interface ExecutiveHeroProps {
    name: string;
    specialty: string | null;
    description: string | null;
    experienceYears: number | null;
    photoUrl: string;
    verified: boolean;
    whatsappLink: string;
    companyName: string | null;
    companyLogoUrl: string | null;
    showNonEmergencyNotice: boolean;
    hasPlans: boolean;
    className?: string;
}

export default function ExecutiveHero({
    name,
    specialty,
    description,
    experienceYears,
    photoUrl,
    verified,
    whatsappLink,
    companyName,
    companyLogoUrl,
    showNonEmergencyNotice,
    hasPlans,
    className = "",
}: ExecutiveHeroProps) {
    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 ${className}`}>
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                <div className="relative shrink-0">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-slate-50 shadow-md">
                        <img
                            src={photoUrl}
                            alt={name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {verified && (
                        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-sm border border-slate-100">
                            <BadgeCheck className="w-6 h-6 text-emerald-500 fill-emerald-50" />
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                            {name}
                        </h1>

                        {companyName || companyLogoUrl ? (
                            <div className="mt-4 flex items-center justify-center sm:justify-start gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <div className="h-16 w-16 sm:h-20 sm:w-20 p-2 sm:p-2.5 flex items-center justify-center rounded-lg bg-white border border-slate-200 shrink-0 shadow-sm">
                                    {companyLogoUrl ? (
                                        <img
                                            src={companyLogoUrl}
                                            alt={companyName || "Empresa"}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    ) : (
                                        <Building2 className="w-6 h-6 text-slate-400" />
                                    )}
                                </div>
                                {companyName ? (
                                    <p className="text-lg sm:text-xl font-semibold text-slate-900 leading-tight">
                                        {companyName}
                                    </p>
                                ) : null}
                            </div>
                        ) : null}

                        <p className="mt-3 text-sm font-semibold text-slate-800">
                            {companyName
                                ? `Contratación de planes en ${companyName}`
                                : "Contratación de planes con ejecutiva verificada"}
                        </p>

                        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-left">
                            <p className="text-xs text-slate-700 leading-relaxed">
                                Plataforma independiente. No vende planes ni representa a la empresa.
                                La contratación final es directa con la ejecutiva y su empresa.
                            </p>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            {specialty ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                    {specialty}
                                </span>
                            ) : null}

                            {experienceYears !== null ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                    <Briefcase className="w-3.5 h-3.5" />
                                    {experienceYears} años de experiencia
                                </span>
                            ) : null}

                            {verified ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    <BadgeCheck className="w-3.5 h-3.5" />
                                    Verificada
                                </span>
                            ) : null}
                        </div>

                        {description ? (
                            <p className="text-slate-600 text-sm sm:text-base mt-4 max-w-2xl mx-auto sm:mx-0 leading-relaxed whitespace-pre-line">
                                {description}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <TrackedWhatsappLink
                            href={whatsappLink}
                            target="_blank"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 w-full sm:w-auto"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Cotizar con {name.split(" ")[0]}
                        </TrackedWhatsappLink>
                        {hasPlans ? (
                            <a
                                href="#planes-disponibles"
                                className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors w-full sm:w-auto"
                            >
                                Ver planes disponibles
                            </a>
                        ) : null}
                    </div>

                    {showNonEmergencyNotice ? (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left">
                            <p className="text-sm font-medium text-amber-900">
                                No es un servicio de emergencia.
                            </p>
                            <p className="text-sm text-amber-800">
                                Solo orientación y contratación de planes.
                            </p>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
