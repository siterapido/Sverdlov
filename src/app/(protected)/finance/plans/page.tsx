import { getPlans } from "@/app/actions/plans";
import { PlanManager } from "@/components/finance/PlanManager";
import { PageTransition } from "@/components/ui/page-transition";
import { DollarSign } from "lucide-react";

export default async function PlansPage() {
    const { data: plans } = await getPlans();

    return (
        <PageTransition>
            <div className="max-w-6xl mx-auto p-10">
                <div className="flex items-center gap-4 mb-10">
                    <div className="h-12 w-12 bg-zinc-900 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Configurações</span>
                        <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter leading-none">Planos de Assinatura</h1>
                    </div>
                </div>
                
                <PlanManager plans={(plans as any[]) || []} />
            </div>
        </PageTransition>
    );
}
