import { Calendar as CalendarIcon } from "lucide-react";
import { PageTransition } from "@/components/ui/page-transition";
import { CalendarClient } from "@/components/calendar/CalendarClient";

export default function CalendarPage() {
    return (
        <PageTransition>
            <div className="max-w-7xl mx-auto py-8 px-4 md:px-0">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-zinc-100 pb-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 bg-primary flex items-center justify-center">
                                <CalendarIcon className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Agenda Nacional</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 uppercase leading-none">
                            Calendário
                        </h1>
                        <p className="text-zinc-500 font-medium text-sm">
                            Cronograma unificado de congressos, formações e agitação de rua.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-zinc-50 border-2 border-zinc-100 px-6 py-4">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Atividades este mês</p>
                            <p className="text-2xl font-black text-zinc-900 leading-none">--</p>
                        </div>
                        <div className="h-8 w-[2px] bg-zinc-200" />
                        <div className="text-left">
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Taxa de Ocupação</p>
                            <p className="text-2xl font-black text-zinc-900 leading-none">--%</p>
                        </div>
                    </div>
                </div>

                <CalendarClient />
            </div>
        </PageTransition>
    );
}
