'use client';

import { useState } from 'react';
import { 
    format 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
    DollarSign, 
    ArrowUpRight, 
    ArrowDownLeft, 
    Calendar, 
    User, 
    FileText, 
    Filter,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Transaction {
    id: string;
    amount: string;
    paymentDate: Date;
    type: string;
    status: string;
    memberName: string | null;
    planName: string | null;
}

interface FinanceDashboardProps {
    initialTransactions: Transaction[];
}

export function FinanceDashboard({ initialTransactions }: FinanceDashboardProps) {
    const [transactions] = useState(initialTransactions);

    const totalRevenue = transactions
        .filter(t => t.status === 'completed')
        .reduce((acc, t) => acc + parseFloat(t.amount), 0);

    const pendingRevenue = transactions
        .filter(t => t.status === 'pending')
        .reduce((acc, t) => acc + parseFloat(t.amount), 0);

    return (
        <div className="space-y-10">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-zinc-900 divide-x-2 divide-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="p-8 bg-white">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">Arrecadação Total</p>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-zinc-900 tabular-nums leading-none">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
                        </span>
                        <Badge className="bg-emerald-500 text-white rounded-none font-black uppercase text-[9px] mb-1">REALIZADO</Badge>
                    </div>
                </div>
                <div className="p-8 bg-white">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">Previsão Pendente</p>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-zinc-900 tabular-nums leading-none">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingRevenue)}
                        </span>
                        <Badge className="bg-amber-500 text-white rounded-none font-black uppercase text-[9px] mb-1">EM ABERTO</Badge>
                    </div>
                </div>
                <div className="p-8 bg-zinc-50 flex flex-col justify-center">
                    <Button className="w-full bg-zinc-900 text-white hover:bg-zinc-800 rounded-none font-black uppercase tracking-widest text-[10px] h-12">
                        <Download className="h-4 w-4 mr-2" />
                        EXPORTAR RELATÓRIO
                    </Button>
                </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <h3 className="text-xl font-black uppercase tracking-tighter text-zinc-900">Transações Recentes</h3>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" className="border-2 border-zinc-900 rounded-none font-black uppercase tracking-widest text-[9px] h-8 px-4">
                            <Filter className="h-3 w-3 mr-2" />
                            FILTRAR
                        </Button>
                    </div>
                </div>

                <div className="bg-white border-2 border-zinc-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)] overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Filiado / Origem</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Valor</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-zinc-100">
                            {transactions.map((t) => (
                                <tr key={t.id} className="hover:bg-zinc-50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black text-zinc-900 uppercase">
                                                {format(new Date(t.paymentDate), "dd MMM yyyy", { locale: ptBR })}
                                            </span>
                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
                                                {format(new Date(t.paymentDate), "HH:mm")}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-zinc-100 flex items-center justify-center border border-zinc-200">
                                                <User className="h-4 w-4 text-zinc-400" />
                                            </div>
                                            <div>
                                                <p className="font-black text-zinc-900 uppercase text-xs leading-none mb-1">{t.memberName || 'Contribuição Direta'}</p>
                                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{t.planName || 'Extra/Doação'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <Badge variant="outline" className="border-2 border-zinc-200 text-zinc-500 rounded-none font-black uppercase tracking-widest text-[8px]">
                                            {t.type}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="font-black text-zinc-900 tabular-nums">
                                            R$ {parseFloat(t.amount).toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <Badge className={`${
                                            t.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                                            t.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                        } rounded-none font-black uppercase tracking-widest text-[8px] border-none px-2 py-0.5`}>
                                            {t.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
                                        Nenhuma transação registrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
