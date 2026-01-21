"use client";

import React, { useState } from "react";
import { Plus, Edit2, Archive, Check, X } from "lucide-react";
import { createPlan, updatePlan, togglePlanStatus } from "@/app/actions/plans";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Plan {
    id: string;
    name: string;
    frequency: 'monthly' | 'biweekly' | 'bimonthly' | 'semiannual' | 'annual';
    amount: string;
    description: string | null;
    active: boolean;
}

export function PlanManager({ plans }: { plans: Plan[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(false);

    // Form Status
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [frequency, setFrequency] = useState<Plan['frequency']>("monthly");
    const [description, setDescription] = useState("");

    const openCreateModal = () => {
        setEditingPlan(null);
        setName("");
        setAmount("");
        setFrequency("monthly");
        setDescription("");
        setIsModalOpen(true);
    };

    const openEditModal = (plan: Plan) => {
        setEditingPlan(plan);
        setName(plan.name);
        setAmount(plan.amount.toString());
        setFrequency(plan.frequency);
        setDescription(plan.description || "");
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const data = {
                name,
                amount: amount, // Drizzle expects string for decimal usually or number
                frequency,
                description,
            };

            if (editingPlan) {
                await updatePlan(editingPlan.id, data);
            } else {
                await createPlan(data as any); // Type cast simplified for now
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar plano");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        if (!confirm("Tem certeza?")) return;
        await togglePlanStatus(id, !currentStatus);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold uppercase">Planos de Assinatura</h2>
                <Button onClick={openCreateModal}>
                    <Plus className="h-4 w-4 mr-2" /> Novo Plano
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className={`border-2 border-zinc-900 p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${!plan.active ? 'opacity-60' : ''}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-black text-lg">{plan.name}</h3>
                                <Badge variant={plan.active ? "default" : "outline"} className="mt-1">
                                    {plan.active ? "ATIVO" : "INATIVO"}
                                </Badge>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black">R$ {plan.amount}</p>
                                <p className="text-xs uppercase text-zinc-500 font-bold">{plan.frequency}</p>
                            </div>
                        </div>
                        <p className="text-sm text-zinc-600 mb-6 min-h-[40px]">{plan.description || "Sem descrição"}</p>
                        
                        <div className="flex gap-2 pt-4 border-t border-zinc-100">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditModal(plan)}>
                                <Edit2 className="h-3 w-3 mr-2" /> Editar
                            </Button>
                            <Button 
                                variant={plan.active ? "ghost" : "outline"} 
                                size="sm" 
                                className="px-2"
                                onClick={() => handleToggleStatus(plan.id, plan.active)}
                            >
                                {plan.active ? <Archive className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
                <ModalContent>
                    <ModalHeader onClose={() => setIsModalOpen(false)}>
                        <ModalTitle>{editingPlan ? "Editar Plano" : "Novo Plano"}</ModalTitle>
                    </ModalHeader>
                    <ModalBody className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase mb-1 block">Nome do Plano</label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Contribuição Mensal" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase mb-1 block">Valor (R$)</label>
                                <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase mb-1 block">Frequência</label>
                                <select 
                                    className="flex h-10 w-full rounded-none border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={frequency}
                                    onChange={(e) => setFrequency(e.target.value as any)}
                                >
                                    <option value="monthly">Mensal</option>
                                    <option value="biweekly">Quinzenal</option>
                                    <option value="bimonthly">Bimestral</option>
                                    <option value="semiannual">Semestral</option>
                                    <option value="annual">Anual</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase mb-1 block">Descrição</label>
                            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes do plano" />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSubmit} loading={loading}>Salvar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
