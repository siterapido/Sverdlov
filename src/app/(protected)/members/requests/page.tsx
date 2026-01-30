import { getPendingMembers } from "@/app/actions/members";
import { RequestsClient } from "@/components/members/RequestsClient";
import { UserCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageTransition } from "@/components/ui/page-transition";

export default async function MemberRequestsPage() {
    const result = await getPendingMembers();
    const requests = result.success && result.data ? result.data : [];

    return (
        <PageTransition>
            <div className="max-w-5xl mx-auto py-8 px-4 md:px-0">
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
                            <div className="h-5 w-5 bg-amber-500 flex items-center justify-center">
                                <UserCheck className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Fluxo de Entrada</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 uppercase leading-none">
                            Solicitações de Filiação
                        </h1>
                        <p className="text-zinc-500 font-medium text-sm">
                            Interessados que preencheram o formulário público e aguardam triagem.
                        </p>
                    </div>

                    <div className="bg-zinc-50 border-2 border-zinc-100 px-4 py-3 flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Pendentes</p>
                            <p className="text-2xl font-black text-zinc-900 leading-none">{requests.length}</p>
                        </div>
                        <div className="h-8 w-[2px] bg-zinc-200" />
                        <div className="text-left">
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Média Semanal</p>
                            <p className="text-2xl font-black text-zinc-900 leading-none">--</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <RequestsClient initialRequests={requests as any[]} />
            </div>
        </PageTransition>
    );
}
