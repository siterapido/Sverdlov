'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Mail, Phone, MapPin, RefreshCw, Save, TrendingDown } from 'lucide-react';
import { markDelinquencyReminder, registerPartialPayment, updateFinancialStatus } from '@/app/actions/delinquency';

interface DelinquentMember {
    memberId: string;
    fullName: string;
    email: string;
    phone: string;
    state: string;
    city: string;
    lastPaymentDate: string | null;
    daysOverdue: number;
    totalOwed: number;
    totalContributed: number;
    financialStatus: string;
    status: string;
}

interface DashboardData {
    summary: {
        totalDelinquent: number;
        totalOwed: number;
    };
    delinquent: DelinquentMember[];
}

export default function DelinquencyPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [daysOverdue, setDaysOverdue] = useState(30);
    const [selectedMember, setSelectedMember] = useState<DelinquentMember | null>(null);
    const [partialPaymentAmount, setPartialPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('pix');

    const fetchDelinquent = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/finances/delinquent?daysOverdue=${daysOverdue}`);
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching delinquent:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDelinquent();
    }, [daysOverdue]);

    const handleSendReminder = async (member: DelinquentMember, type: 'email' | 'sms' | 'whatsapp') => {
        const result = await markDelinquencyReminder(member.memberId, type);
        if (result.success) {
            fetchDelinquent();
            alert(`Aviso enviado via ${type}`);
        }
    };

    const handlePartialPayment = async (member: DelinquentMember) => {
        if (!partialPaymentAmount || parseFloat(partialPaymentAmount) <= 0) {
            alert('Insira um valor válido');
            return;
        }

        const result = await registerPartialPayment(
            member.memberId,
            parseFloat(partialPaymentAmount),
            paymentMethod
        );

        if (result.success) {
            fetchDelinquent();
            setPartialPaymentAmount('');
            setSelectedMember(null);
            alert('Pagamento registrado com sucesso');
        }
    };

    const handleStatusUpdate = async (member: DelinquentMember, status: 'up_to_date' | 'at_risk' | 'delinquent' | 'negotiating') => {
        const result = await updateFinancialStatus(member.memberId, status);
        if (result.success) {
            fetchDelinquent();
        }
    };

    if (loading) {
        return (
            <div className="border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                <p className="text-gray-600">Carregando...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="border-2 border-red-500 bg-red-50 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                <p className="text-red-700 font-semibold">Erro ao carregar dados</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-black mb-2">Gestão de Inadimplência</h1>
                <p className="text-gray-600">Acompanhe membros em atraso e gerencie cobranças</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-red-600 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h3 className="font-bold text-lg">Total em Atraso</h3>
                    </div>
                    <p className="text-3xl font-black text-red-600">{data.summary.totalDelinquent}</p>
                    <p className="text-sm text-gray-600">membros</p>
                </div>

                <div className="border-2 border-red-600 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingDown className="w-5 h-5 text-red-600" />
                        <h3 className="font-bold text-lg">Total Adeudo</h3>
                    </div>
                    <p className="text-3xl font-black text-red-600">R$ {data.summary.totalOwed.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Em transações pendentes</p>
                </div>
            </div>

            <div className="border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                <h2 className="font-bold text-lg mb-4">Filtrar</h2>
                <div className="flex gap-4 items-end">
                    <div>
                        <label className="block text-sm font-bold mb-2">Dias de Atraso Mínimo</label>
                        <select
                            value={daysOverdue}
                            onChange={(e) => setDaysOverdue(parseInt(e.target.value))}
                            className="border-2 border-gray-900 p-2"
                        >
                            <option value={7}>7 dias</option>
                            <option value={15}>15 dias</option>
                            <option value={30}>30 dias</option>
                            <option value={60}>60 dias</option>
                            <option value={90}>90 dias</option>
                        </select>
                    </div>
                    <button
                        onClick={fetchDelinquent}
                        className="border-2 border-gray-900 bg-gray-900 text-white font-bold px-4 py-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                    >
                        <RefreshCw className="w-4 h-4 inline mr-2" />
                        Atualizar
                    </button>
                </div>
            </div>

            <div className="border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                <h2 className="font-bold text-lg mb-4">Membros em Atraso</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-gray-900">
                                <th className="text-left font-bold py-2 px-3">Nome</th>
                                <th className="text-left font-bold py-2 px-3">Email</th>
                                <th className="text-right font-bold py-2 px-3">Dias Atraso</th>
                                <th className="text-right font-bold py-2 px-3">Adeudo</th>
                                <th className="text-left font-bold py-2 px-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.delinquent.map((member) => (
                                <tr key={member.memberId} className={`border-b border-gray-200 ${member.daysOverdue > 60 ? 'bg-red-50' : member.daysOverdue > 30 ? 'bg-yellow-50' : ''}`}>
                                    <td className="py-3 px-3 font-semibold">{member.fullName}</td>
                                    <td className="py-3 px-3 text-gray-600">{member.email}</td>
                                    <td className="py-3 px-3 text-right font-bold text-red-600">{member.daysOverdue}d</td>
                                    <td className="py-3 px-3 text-right font-semibold">R$ {member.totalOwed.toFixed(2)}</td>
                                    <td className="py-3 px-3">
                                        <button
                                            onClick={() => setSelectedMember(member)}
                                            className="border border-gray-900 px-3 py-1 text-xs font-bold hover:bg-gray-900 hover:text-white"
                                        >
                                            Gerenciar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedMember && (
                <div className="border-2 border-blue-600 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <h2 className="font-bold text-lg mb-4">Gerenciar: {selectedMember.fullName}</h2>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border-b-2 border-gray-900 pb-4">
                                <p className="text-sm text-gray-600 mb-2">Email</p>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-600" />
                                    <p className="font-semibold">{selectedMember.email}</p>
                                </div>
                            </div>
                            <div className="border-b-2 border-gray-900 pb-4">
                                <p className="text-sm text-gray-600 mb-2">Telefone</p>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-600" />
                                    <p className="font-semibold">{selectedMember.phone}</p>
                                </div>
                            </div>
                            <div className="border-b-2 border-gray-900 pb-4">
                                <p className="text-sm text-gray-600 mb-2">Localização</p>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-600" />
                                    <p className="font-semibold">{selectedMember.city}, {selectedMember.state}</p>
                                </div>
                            </div>
                            <div className="border-b-2 border-gray-900 pb-4">
                                <p className="text-sm text-gray-600 mb-2">Último Pagamento</p>
                                <p className="font-semibold">{selectedMember.lastPaymentDate ? new Date(selectedMember.lastPaymentDate).toLocaleDateString('pt-BR') : 'Nunca'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t-2 border-gray-900 pt-4">
                            <button
                                onClick={() => handleSendReminder(selectedMember, 'email')}
                                className="border-2 border-gray-900 px-4 py-2 font-bold shadow-[2px_2px_0px_rgba(0,0,0,0.1)] hover:bg-gray-100"
                            >
                                <Mail className="w-4 h-4 inline mr-2" />
                                Enviar Email
                            </button>
                            <button
                                onClick={() => handleSendReminder(selectedMember, 'sms')}
                                className="border-2 border-gray-900 px-4 py-2 font-bold shadow-[2px_2px_0px_rgba(0,0,0,0.1)] hover:bg-gray-100"
                            >
                                <Phone className="w-4 h-4 inline mr-2" />
                                Enviar SMS
                            </button>
                            <button
                                onClick={() => handleSendReminder(selectedMember, 'whatsapp')}
                                className="border-2 border-gray-900 px-4 py-2 font-bold shadow-[2px_2px_0px_rgba(0,0,0,0.1)] hover:bg-gray-100"
                            >
                                Enviar WhatsApp
                            </button>
                        </div>

                        <div className="border-t-2 border-gray-900 pt-4">
                            <h3 className="font-bold mb-3">Registrar Pagamento Parcial</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-bold mb-1">Valor (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={partialPaymentAmount}
                                        onChange={(e) => setPartialPaymentAmount(e.target.value)}
                                        className="w-full border-2 border-gray-900 p-2"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Método</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full border-2 border-gray-900 p-2"
                                    >
                                        <option value="pix">PIX</option>
                                        <option value="cash">Dinheiro</option>
                                        <option value="transfer">Transferência</option>
                                        <option value="credit_card">Cartão</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => handlePartialPayment(selectedMember)}
                                        className="w-full border-2 border-green-600 bg-green-600 text-white font-bold p-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                                    >
                                        <Save className="w-4 h-4 inline mr-2" />
                                        Registrar
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="border-t-2 border-gray-900 pt-4">
                            <h3 className="font-bold mb-3">Atualizar Status Financeiro</h3>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => handleStatusUpdate(selectedMember, 'up_to_date')}
                                    className="border-2 border-green-600 px-3 py-2 font-bold text-sm shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                                >
                                    Até Dia
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedMember, 'at_risk')}
                                    className="border-2 border-yellow-600 px-3 py-2 font-bold text-sm shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                                >
                                    Em Risco
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedMember, 'delinquent')}
                                    className="border-2 border-red-600 px-3 py-2 font-bold text-sm shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                                >
                                    Inadimplente
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedMember, 'negotiating')}
                                    className="border-2 border-blue-600 px-3 py-2 font-bold text-sm shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                                >
                                    Negociando
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedMember(null)}
                            className="border-2 border-gray-900 px-4 py-2 font-bold w-full shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
