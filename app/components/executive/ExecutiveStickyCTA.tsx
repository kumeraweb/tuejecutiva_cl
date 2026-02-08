import { MessageCircle } from "lucide-react";

interface ExecutiveStickyCTAProps {
    whatsappLink: string;
    name: string;
}

export default function ExecutiveStickyCTA({ whatsappLink, name }: ExecutiveStickyCTAProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 md:hidden">
            <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm active:scale-[0.98] transition-transform"
            >
                <MessageCircle className="w-5 h-5" />
                Contactar a {name.split(" ")[0]}
            </a>
        </div>
    );
}
