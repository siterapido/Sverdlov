"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMembers } from "@/app/actions/members";
import { MemberForm } from "@/components/members/member-form";
import { PageTransition } from "@/components/ui/page-transition";
import { ChevronLeft, User, MapPin, Calendar, CreditCard } from "lucide-react";

export default function MemberProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [member, setMember] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMember = async () => {
            const result = await getMembers(); // For now just filtering from all, ideally we have getMemberById
            if (result.success) {
                const found = result.data?.find((m: any) => m.id === id);
                setMember(found);
            }
            setLoading(false);
        };
        fetchMember();
    }, [id]);

    if (loading) return <div className="p-8">Carregando...</div>;
    if (!member) return <div className="p-8">Membro não encontrado.</div>;

    return (
        <PageTransition>
            <div className="flex flex-col h-screen bg-white overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-6 px-10 py-6 border-b border-zinc-100 bg-white">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-zinc-50 rounded-none transition-all text-zinc-400 hover:text-zinc-900 border border-transparent hover:border-zinc-200"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-primary flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,82,255,0.1)]">
                            <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Ficha Cadastral</span>
                            <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter leading-none">{member.fullName}</h1>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10">
                    <div className="max-w-4xl space-y-12">
                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-zinc-900 divide-x-2 divide-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
                            <div className="p-6 bg-white">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">STATUS OPERACIONAL</p>
                                <p className="text-sm font-black uppercase text-primary">{member.status}</p>
                            </div>
                            <div className="p-6 bg-white">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">DOCUMENTO IDENTIDADE</p>
                                <p className="text-sm font-black tabular-nums">{member.cpf}</p>
                            </div>
                            <div className="p-6 bg-white">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">LOCALIDADE TÉCNICA</p>
                                <p className="text-sm font-black uppercase">{member.city} / {member.state}</p>
                            </div>
                        </div>

                        {/* Full Edit Form Section */}
                        <div className="border-2 border-zinc-900 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)]">
                            <div className="px-8 py-5 border-b-2 border-zinc-900 bg-zinc-900">
                                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Dados Estatutários e Operacionais</h3>
                            </div>
                            <div className="p-10">
                                <MemberForm initialData={member} isEditing={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
