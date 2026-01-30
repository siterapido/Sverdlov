"use client";

import React, { useState, useEffect } from "react";
import { getMemberFinancialHistory, registerPayment, updateMemberPlan } from "@/app/actions/finances";
import { getPlans } from "@/app/actions/plans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { CreditCard, Calendar, Plus, AlertCircle, CheckCircle } from "lucide-react";

export function MemberFinancialTab({ memberId, memberData }: { memberId: string, memberData: any }) {
    const [history, setHistory] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Payment Modal
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentRefDate, setPaymentRefDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentType, setPaymentType] = useState("subscription");

    // Plan Selection
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState(memberData.planId || "");

    useEffect(() => {
        loadData();
    }, [memberId]);

    const loadData = async () => {
        const h = await getMemberFinancialHistory(memberId);
        if (h.success) setHistory(h.data || []);
        
        const p = await getPlans();
        if (p.success) setPlans(p.data || []);
    };

    const handleRegisterPayment = async () => {
        setLoading(true);
        try {
            await registerPayment({
                memberId,
                amount: paymentAmount, // Drizzle expects string or number, casting usually handled by validation or implicit
                paymentDate: new Date(paymentDate),
                referenceDate: paymentRefDate, 
                type: paymentType as any,
                status: 'completed',
                paymentMethod: 'pix'
            });
            setIsPaymentModalOpen(false);
            loadData();
            window.location.reload(); // Refresh to update status if changed
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePlan = async () => {
        setLoading(true);
        try {
            await updateMemberPlan(memberId, selectedPlanId, new Date().toISOString());
            setIsPlanModalOpen(false);
            window.location.reload();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const currentPlan = plans.find(p => p.id === memberData.planId);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Status Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-2 border-zinc-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">PLANO ATUAL</p>
                            <h3 className="text-xl font-black uppercase text-zinc-900">{currentPlan ? currentPlan.name : "Nenhum Plano"}</h3>
                            {currentPlan && <p className="text-sm font-medium text-zinc-500">R$ {currentPlan.amount} / {currentPlan.frequency}</p>}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setIsPlanModalOpen(true)}>
                            {currentPlan ? "Trocar" : "Selecionar"}
                        </Button>
                    </div>
                </div>

                <div className="border-2 border-zinc-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                    <div className="flex justify-between items-start">
                         <div>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">STATUS FINANCEIRO</p>
                             <div className="flex items-center gap-2">
                                {memberData.financialStatus === 'up_to_date' ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                )}
                                <h3 className="text-xl font-black uppercase text-zinc-900">
                                    {memberData.financialStatus === 'up_to_date' ? "EM DIA" : "PENDENTE"}
                                </h3>
                            </div>
                        </div>
                         <Button onClick={() => setIsPaymentModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" /> Pagamento
                        </Button>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div>
                 <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider mb-4">Histórico de Transações</h3>
                 <div className="border border-zinc-200 bg-white">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 border-b border-zinc-100 text-xs uppercase font-black text-zinc-500">
                            <tr>
                                <th className="px-4 py-3">Data</th>
                                <th className="px-4 py-3">Referência</th>
                                <th className="px-4 py-3">Tipo</th>
                                <th className="px-4 py-3">Valor</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {history.length === 0 ? (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-400 italic">Nenhuma transação registrada</td></tr>
                            ) : (
                                history.map((h) => (
                                    <tr key={h.id}>
                                        <td className="px-4 py-3">{new Date(h.paymentDate).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-4 py-3">{h.referenceDate ? new Date(h.referenceDate).toLocaleDateString('pt-BR') : '-'}</td>
                                        <td className="px-4 py-3 capitalize">{h.type === 'subscription' ? 'Mensalidade' : h.type}</td>
                                        <td className="px-4 py-3 font-bold">R$ {h.amount}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={h.status === 'completed' ? 'default' : 'outline'}>{h.status}</Badge>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                 </div>
            </div>

            {/* Modals */}
            <Modal open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
                <ModalContent>
                    <ModalHeader onClose={() => setIsPlanModalOpen(false)}>
                        <ModalTitle>Alterar Plano</ModalTitle>
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-2">
                             {plans.map(plan => (
                                 <div 
                                    key={plan.id} 
                                    onClick={() => setSelectedPlanId(plan.id)}
                                    className={`p-4 border-2 cursor-pointer transition-all ${selectedPlanId === plan.id ? 'border-primary bg-primary/10' : 'border-zinc-100 hover:border-zinc-300'}`}
                                >
                                    <div className="flex justify-between">
                                        <span className="font-bold">{plan.name}</span>
                                        <span className="font-bold">R$ {plan.amount}</span>
                                    </div>
                                    <p className="text-xs text-zinc-500 uppercase">{plan.frequency}</p>
                                 </div>
                             ))}
                        </div>
                    </ModalBody>
                    <ModalFooter>
                         <Button onClick={handleUpdatePlan} loading={loading}>Confirmar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <ModalContent>
                    <ModalHeader onClose={() => setIsPaymentModalOpen(false)}>
                        <ModalTitle>Registrar Pagamento</ModalTitle>
                    </ModalHeader>
                    <ModalBody className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase mb-1 block">Valor (R$)</label>
                            <Input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs font-bold uppercase mb-1 block">Data Pagamento</label>
                                <Input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase mb-1 block">Data Referência</label>
                                <Input type="date" value={paymentRefDate} onChange={e => setPaymentRefDate(e.target.value)} />
                            </div>
                        </div>
                        <div>
                             <label className="text-xs font-bold uppercase mb-1 block">Tipo</label>
                             <select 
                                className="w-full h-10 border border-zinc-200 px-3 text-sm"
                                value={paymentType}
                                onChange={e => setPaymentType(e.target.value)}
                            >
                                <option value="subscription">Mensalidade / Plano</option>
                                <option value="extra">Contribuição Extra</option>
                                <option value="donation">Doação</option>
                             </select>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={handleRegisterPayment} loading={loading}>Registrar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
