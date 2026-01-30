"use client";

import React, { useState } from "react";
import { MembersTable } from "./MembersTable";
import { ImportModal } from "./ImportModal";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody } from "@/components/ui/modal";
import { MemberForm } from "./member-form";
import { PageTransition } from "@/components/ui/page-transition";

import { Plus, Users, FileUp, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequestsClient } from "./RequestsClient";
import { cn } from "@/lib/utils";

interface Member {
    id: string;
    fullName: string;
    cpf: string;
    voterTitle: string | null;
    state: string;
    city: string;
    zone: string | null;
    status: string;
    nucleusName: string | null;
    createdAt: Date;
}

interface MembersClientProps {
    initialMembers: Member[];
    initialRequests: any[];
}

export function MembersClient({ initialMembers, initialRequests }: MembersClientProps) {
    const [activeTab, setActiveTab] = useState<'members' | 'requests'>('members');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isNewMemberModalOpen, setIsNewMemberModalOpen] = useState(false);

    // This would ideally revalidate or refresh data after success
    const handleSuccess = () => {
        // In a real app, we might use router.refresh() 
        // to update server components data
        window.location.reload();
    };

    const handleExport = () => {
        // Placeholder for export logic
        alert("Funcionalidade de exportação em breve.");
    };

    return (
        <PageTransition>
            <div className="flex flex-col">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-zinc-100 pb-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 bg-primary flex items-center justify-center">
                                <Users className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Gestão da Organização</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 uppercase leading-none">
                            PESSOAS
                        </h1>
                        <p className="text-zinc-500 font-medium text-sm">
                            Gerenciamento centralizado de membros, solicitações e núcleos.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {activeTab === 'members' && (
                            <>
                                <Button
                                    variant="outline"
                                    className="hidden sm:flex items-center gap-2 border-2 border-zinc-900 rounded-none font-black uppercase tracking-widest text-[10px]"
                                >
                                    RELATÓRIOS
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsImportModalOpen(true)}
                                    className="hidden sm:flex items-center gap-2 border-2 border-zinc-900 rounded-none font-black uppercase tracking-widest text-[10px]"
                                >
                                    <FileUp className="h-4 w-4" />
                                    IMPORTAR FILIADOS
                                </Button>
                                <Button
                                    onClick={() => setIsNewMemberModalOpen(true)}
                                    className="flex items-center gap-2 bg-primary hover:brightness-110 text-white border-2 border-primary rounded-none font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0px_0px_rgba(155,17,30,0.1)] transition-all active:translate-y-0.5 active:shadow-none"
                                >
                                    <Plus className="h-4 w-4" />
                                    NOVO FILIADO
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 mb-8 border-b border-zinc-200">
                    <button
                        onClick={() => setActiveTab('members')}
                        className={cn(
                            "flex items-center gap-2 pb-3 px-1 text-[11px] font-black uppercase tracking-widest border-b-[3px] transition-all",
                            activeTab === 'members'
                                ? "border-primary text-primary"
                                : "border-transparent text-zinc-400 hover:text-zinc-600 hover:border-zinc-300"
                        )}
                    >
                        <Users className="h-4 w-4" />
                        Filiados
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={cn(
                            "flex items-center gap-2 pb-3 px-1 text-[11px] font-black uppercase tracking-widest border-b-[3px] transition-all",
                            activeTab === 'requests'
                                ? "border-amber-500 text-amber-500"
                                : "border-transparent text-zinc-400 hover:text-zinc-600 hover:border-zinc-300"
                        )}
                    >
                        <UserCheck className="h-4 w-4" />
                        Solicitações
                        {initialRequests.length > 0 && (
                            <span className={cn(
                                "flex h-5 w-5 items-center justify-center rounded-full text-[9px]",
                                activeTab === 'requests' ? "bg-amber-500 text-white" : "bg-zinc-200 text-zinc-500"
                            )}>
                                {initialRequests.length}
                            </span>
                        )}
                    </button>
                </div>

                {activeTab === 'members' ? (
                    <MembersTable
                        initialMembers={initialMembers}
                        onExportClick={handleExport}
                        onNewClick={() => setIsNewMemberModalOpen(true)}
                    />
                ) : (
                    <RequestsClient initialRequests={initialRequests} />
                )}

                <ImportModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    onSuccess={handleSuccess}
                />

                <Modal open={isNewMemberModalOpen} onOpenChange={setIsNewMemberModalOpen}>
                    <ModalContent size="xl">
                        <ModalHeader onClose={() => setIsNewMemberModalOpen(false)}>
                            <ModalTitle>Novo Filiado</ModalTitle>
                        </ModalHeader>
                        <ModalBody className="pt-6 pb-12">
                            <MemberForm onSuccess={() => setIsNewMemberModalOpen(false)} />
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </div>
        </PageTransition>
    );
}
