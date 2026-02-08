import { ExternalLink, Building2 } from "lucide-react";

interface ExecutiveCompanyInfoProps {
    companyName: string | null;
    companyLogoUrl: string | null;
    companyWebsiteUrl: string | null;
}

export default function ExecutiveCompanyInfo({
    companyName,
    companyLogoUrl,
    companyWebsiteUrl,
}: ExecutiveCompanyInfoProps) {
    if (!companyName && !companyLogoUrl && !companyWebsiteUrl) {
        return null;
    }

    return (
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    {companyLogoUrl ? (
                        <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm h-12 w-12 flex items-center justify-center">
                            <img
                                src={companyLogoUrl}
                                alt={companyName || "Empresa"}
                                className="max-h-8 max-w-full object-contain"
                            />
                        </div>
                    ) : (
                        <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm h-12 w-12 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-slate-400" />
                        </div>
                    )}
                    <div>
                        {companyName ? (
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                                {companyName}
                            </h4>
                        ) : null}
                        <p className="text-xs text-slate-500 max-w-md mt-0.5">
                            La ejecutiva gestiona planes de esta compañía.
                        </p>
                    </div>
                </div>

                {companyWebsiteUrl && (
                    <a
                        href={companyWebsiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-slate-500 hover:text-emerald-600 flex items-center gap-1.5 transition-colors"
                    >
                        Sitio oficial
                        <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200/60">
                <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                    <strong>Aviso Legal:</strong> TuEjecutiva.cl es una plataforma independiente y no representa a la empresa.
                </p>
            </div>
        </div>
    );
}
