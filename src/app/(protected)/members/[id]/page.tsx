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
            <div className="flex flex-col h-screen bg-bg-primary overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-4 px-6 py-4 border-b border-border-subtle bg-bg-primary">
                    <button
                        onClick={() => router.back()}
                        className="p-1 hover:bg-bg-hover rounded transition-colors text-fg-secondary"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        <h1 className="text-lg font-semibold text-fg-primary">{member.fullName}</h1>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-bg-secondary p-4 rounded-lg border border-border-subtle">
                                <p className="text-xs text-fg-secondary font-medium uppercase tracking-wider mb-1">Status</p>
                                <p className="text-sm font-semibold">{member.status}</p>
                            </div>
                            <div className="bg-bg-secondary p-4 rounded-lg border border-border-subtle">
                                <p className="text-xs text-fg-secondary font-medium uppercase tracking-wider mb-1">CPF</p>
                                <p className="text-sm font-semibold">{member.cpf}</p>
                            </div>
                            <div className="bg-bg-secondary p-4 rounded-lg border border-border-subtle">
                                <p className="text-xs text-fg-secondary font-medium uppercase tracking-wider mb-1">Localidade</p>
                                <p className="text-sm font-semibold">{member.city}, {member.state}</p>
                            </div>
                        </div>

                        {/* Full Edit Form */}
                        <div className="bg-bg-primary border border-border-subtle rounded-lg overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-border-subtle bg-bg-hover/30">
                                <h3 className="text-sm font-semibold text-fg-primary uppercase tracking-wider">Dados do Filiado</h3>
                            </div>
                            <div className="p-6">
                                <MemberForm initialData={member} isEditing={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
