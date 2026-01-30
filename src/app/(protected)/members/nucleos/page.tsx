import { getNuclei } from "@/app/actions/nuclei";
import { NucleiClient } from "@/components/members/NucleiClient";
import { Layers, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/page-transition";
import Link from "next/link";

export default async function NucleiPage() {
    const result = await getNuclei();
    const nuclei = result.success && result.data ? result.data : [];

    return (
        <PageTransition>
            <div className="max-w-6xl mx-auto py-8 px-4 md:px-0">
                 {/* Breadcrumb / Back */}
                 <Link 
                    href="/members" 
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-primary font-bold uppercase tracking-widest text-[10px] mb-8 transition-colors group"
                >
                    <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
                    Voltar para Filiados
                </Link>

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-zinc-100 pb-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 bg-zinc-900 flex items-center justify-center">
                                <Layers className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Estrutura Organizacional</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 uppercase leading-none">
                            Núcleos de Base
                        </h1>
                        <p className="text-zinc-500 font-medium text-sm">
                            Unidades territoriais e temáticas que compõem a espinha dorsal do partido.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button className="flex items-center gap-2 bg-primary hover:brightness-110 text-white border-2 border-primary rounded-none font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0px_0px_rgba(155,17,30,0.1)] transition-all active:translate-y-0.5 active:shadow-none">
                            <Plus className="h-4 w-4" />
                            CRIAR NÚCLEO
                        </Button>
                    </div>
                </div>

                <NucleiClient initialNuclei={nuclei as any[]} />
            </div>
        </PageTransition>
    );
}
