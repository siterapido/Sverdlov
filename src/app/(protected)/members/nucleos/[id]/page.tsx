import { getNucleusById } from "@/app/actions/nuclei";
import { NucleusDetailClient } from "@/components/members/NucleusDetailClient";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageTransition } from "@/components/ui/page-transition";

export default async function NucleusPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const result = await getNucleusById(id);

    if (!result.success || !result.data) {
        return <div className="p-10">Núcleo não encontrado.</div>;
    }

    return (
        <PageTransition>
            <div className="max-w-6xl mx-auto py-8 px-4 md:px-0">
                {/* Breadcrumb / Back */}
                <Link
                    href="/members/nucleos"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-primary font-bold uppercase tracking-widest text-[10px] mb-8 transition-colors group"
                >
                    <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
                    Voltar para Núcleos
                </Link>

                <NucleusDetailClient nucleus={result.data as any} />
            </div>
        </PageTransition>
    );
}
