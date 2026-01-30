import { DollarSign, Settings } from "lucide-react";
import { PageTransition } from "@/components/ui/page-transition";
import { getAllFinances } from "@/app/actions/finances";
import { FinanceDashboard } from "@/components/finance/FinanceDashboard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function FinancePage() {
    const result = await getAllFinances();
    const transactions = result.success && result.data ? result.data : [];

    return (
        <PageTransition>
            <div className="max-w-7xl mx-auto py-8 px-4 md:px-0">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-zinc-100 pb-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 bg-primary flex items-center justify-center">
                                <DollarSign className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Gestão de Recursos</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 uppercase leading-none">
                            Tesouraria
                        </h1>
                        <p className="text-zinc-500 font-medium text-sm">
                            Controle estatutário de contribuições, tesouraria e prestação de contas.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="outline" className="border-2 border-zinc-900 rounded-none font-black uppercase tracking-widest text-[10px] h-12 px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-none transition-all" asChild>
                            <Link href="/finance/plans">
                                <Settings className="h-4 w-4 mr-2" />
                                GERENCIAR PLANOS
                            </Link>
                        </Button>
                        <Button className="bg-primary hover:brightness-110 text-white border-2 border-primary rounded-none font-black uppercase tracking-widest text-[10px] h-12 px-6 shadow-[4px_4px_0px_0px_rgba(155,17,30,0.1)] transition-all active:translate-y-0.5 active:shadow-none">
                            NOVA ENTRADA
                        </Button>
                    </div>
                </div>

                <FinanceDashboard initialTransactions={transactions as any[]} />
            </div>
        </PageTransition>
    );
}
