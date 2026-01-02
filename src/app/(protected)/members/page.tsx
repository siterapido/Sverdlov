"use client";

import React, { useState, useEffect } from "react";
import { MembersTable } from "@/components/members/MembersTable";
import { ImportModal } from "@/components/members/ImportModal";
import { PageTransition } from "@/components/ui/page-transition";
import { getMembers } from "@/app/actions/members";
import { MemberForm } from "@/components/members/member-form";
import { X } from "lucide-react";

export default function MembersPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isNewMemberModalOpen, setIsNewMemberModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchMembers = async () => {
        setLoading(true);
        const result = await getMembers();
        if (result.success) {
            setMembers(result.data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    return (
        <PageTransition>
            <div className="flex flex-col">
                <MembersTable
                    initialMembers={members}
                    onImportClick={() => setIsImportModalOpen(true)}
                    onNewClick={() => setIsNewMemberModalOpen(true)}
                />

                <ImportModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    onSuccess={fetchMembers}
                />

                {/* New Member Slide-over/Modal */}
                {isNewMemberModalOpen && (
                    <div className="fixed inset-0 z-[100] flex justify-end bg-black/20 backdrop-blur-sm">
                        <div className="bg-bg-primary w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
                                <h2 className="text-lg font-semibold text-fg-primary">Novo Filiado</h2>
                                <button onClick={() => setIsNewMemberModalOpen(false)} className="text-fg-secondary hover:bg-bg-hover p-1 rounded transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                <MemberForm />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}

