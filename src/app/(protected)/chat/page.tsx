import { MessageSquare } from "lucide-react";
import { PageTransition } from "@/components/ui/page-transition";

export default function ChatPage() {
    return (
        <PageTransition>
            <div className="max-w-6xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-zinc-100 pb-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 bg-primary flex items-center justify-center">
                                <MessageSquare className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Comunicação Interna</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 uppercase leading-none">
                            Chat
                        </h1>
                        <p className="text-zinc-500 font-medium text-sm">
                            Canal seguro para comunicação entre núcleos e coordenações.
                        </p>
                    </div>
                </div>

                <div className="border-2 border-dashed border-zinc-200 bg-zinc-50/50 py-24 text-center">
                    <div className="h-16 w-16 bg-white border-2 border-zinc-100 flex items-center justify-center mx-auto mb-6">
                        <MessageSquare className="h-8 w-8 text-zinc-300" />
                    </div>
                    <p className="text-xl font-black uppercase tracking-tight text-zinc-900">Módulo em construção</p>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mt-2">Plataforma de mensagens em desenvolvimento.</p>
                </div>
            </div>
        </PageTransition>
    );
}
