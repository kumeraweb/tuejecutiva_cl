import { MessageCircle } from "lucide-react";
import TrackedWhatsappLink from "@/app/components/TrackedWhatsappLink";

interface ExecutiveStickyCTAProps {
    whatsappLink: string;
    name: string;
    hasPlans: boolean;
}

export default function ExecutiveStickyCTA({ whatsappLink, name, hasPlans }: ExecutiveStickyCTAProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 md:hidden">
            <div className="flex flex-col gap-2">
                <TrackedWhatsappLink
                    href={whatsappLink}
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm active:scale-[0.98] transition-transform"
                >
                    <MessageCircle className="w-5 h-5" />
                    Contactar a {name.split(" ")[0]}
                </TrackedWhatsappLink>
                {hasPlans ? (
                    <a
                        href="#planes-disponibles"
                        className="flex items-center justify-center w-full bg-slate-100 text-slate-700 font-semibold py-2.5 px-4 rounded-xl"
                    >
                        Contratar planes
                    </a>
                ) : null}
            </div>
        </div>
    );
}
