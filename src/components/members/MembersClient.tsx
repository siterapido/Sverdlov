"use client";

import React, { useState } from "react";
import { MembersTable } from "./MembersTable";
import { ImportModal } from "./ImportModal";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody } from "@/components/ui/modal";
import { MemberForm } from "./member-form";
import { PageTransition } from "@/components/ui/page-transition";

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
}

export function MembersClient({ initialMembers }: MembersClientProps) {
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isNewMemberModalOpen, setIsNewMemberModalOpen] = useState(false);

    // This would ideally revalidate or refresh data after success
    const handleSuccess = () => {
        // In a real app, we might use router.refresh() 
        // to update server components data
        window.location.reload();
    };

    return (
        <PageTransition>
            <div className="flex flex-col">
                <MembersTable
                    initialMembers={initialMembers}
                    onImportClick={() => setIsImportModalOpen(true)}
                    onNewClick={() => setIsNewMemberModalOpen(true)}
                />

                <ImportModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    onSuccess={handleSuccess}
                />

                <Modal open={isNewMemberModalOpen} onOpenChange={setIsNewMemberModalOpen}>
                    <ModalContent size="lg">
                        <ModalHeader>
                            <ModalTitle>Novo Filiado</ModalTitle>
                        </ModalHeader>
                        <ModalBody>
                            <MemberForm />
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </div>
        </PageTransition>
    );
}
