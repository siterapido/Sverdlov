'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, Users, AlertCircle, DollarSign, Target } from 'lucide-react';

interface KPI {
    monthlyCollected: number;
    monthlyCount: number;
    pendingAmount: number;
    activeMembers: number;
    delinquentCount: number;
    delinquencyRate: string;
    avgContribution: number;
    medianContribution: number;
}

interface Trend {
    month: string;
    amount: number;
    count: number;
}

interface DelinquentMember {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    daysOverdue: number;
}

interface DashboardData {
    kpis: KPI;
    trends: Trend[];
    delinquent: DelinquentMember[];
}

export function FinanceDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const response = await fetch('/api/finances/dashboard');
                if (!response.ok) throw new Error('Failed to fetch');
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error loading dashboard');
            } finally {
                setLoading(false);
            }
        }

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-32 bg-gray-200 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-200 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="border-2 border-red-500 bg-red-50 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-700 font-semibold">{error || 'Failed to load dashboard'}</p>
                </div>
            </div>
        );
    }

    const { kpis, trends, delinquent } = data;
    const monthlyCollectionAvg = trends.length > 0
        ? trends.reduce((sum, t) => sum + t.amount, 0) / trends.length
        : 0;
    const projectedMonthlyRevenue = (monthlyCollectionAvg * 1.1).toFixed(2);

    return (
        <div className="space-y-8">
            {parseFloat(kpis.delinquencyRate) > 15 && (
                <div className="border-2 border-yellow-600 bg-yellow-50 p-4 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-yellow-900">Alerta de Inadimplência</h3>
                            <p className="text-sm text-yellow-800">
                                {kpis.delinquentCount} membro(s) em atraso ({kpis.delinquencyRate}%)
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-sm text-gray-700">Arrecadação Mês</h3>
                        <DollarSign className="w-4 h-4 text-gray-600" />
                    </div>
                    <p className="text-2xl font-black">R$ {kpis.monthlyCollected.toFixed(2)}</p>
                    <p className="text-xs text-gray-600">{kpis.monthlyCount} transações</p>
                </div>

                <div className="border-2 border-red-600 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-sm text-gray-700">Pendente</h3>
                        <AlertCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <p className="text-2xl font-black text-red-600">R$ {kpis.pendingAmount.toFixed(2)}</p>
                    <p className="text-xs text-gray-600">Aguardando pagamento</p>
                </div>

                <div className="border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-sm text-gray-700">Membros Ativos</h3>
                        <Users className="w-4 h-4 text-gray-600" />
                    </div>
                    <p className="text-2xl font-black">{kpis.activeMembers}</p>
                    <p className="text-xs text-gray-600">{kpis.delinquentCount} em atraso</p>
                </div>

                <div className="border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-sm text-gray-700">Taxa Inadimplência</h3>
                        <TrendingUp className="w-4 h-4 text-gray-600" />
                    </div>
                    <p className="text-2xl font-black">{kpis.delinquencyRate}%</p>
                    <p className="text-xs text-gray-600">De membros ativos</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <h3 className="font-bold text-sm text-gray-700 mb-3">Média de Contribuição</h3>
                    <div>
                        <p className="text-xs text-gray-600 mb-1">Média</p>
                        <p className="text-xl font-black">R$ {kpis.avgContribution.toFixed(2)}</p>
                    </div>
                    <div className="border-t-2 border-gray-900 pt-3 mt-3">
                        <p className="text-xs text-gray-600 mb-1">Mediana</p>
                        <p className="text-lg font-bold">R$ {kpis.medianContribution.toFixed(2)}</p>
                    </div>
                </div>

                <div className="border-2 border-green-600 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-sm text-gray-700">Projeção Próx. Mês</h3>
                        <Target className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-black text-green-600">R$ {projectedMonthlyRevenue}</p>
                    <p className="text-xs text-gray-600">+10% vs. média histórica</p>
                </div>

                <div className="border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <h3 className="font-bold text-sm text-gray-700 mb-3">Taxa de Coleta</h3>
                    {trends.length > 0 && (
                        <>
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Este mês</p>
                                <p className="text-xl font-black">{kpis.monthlyCount} coletas</p>
                            </div>
                            <div className="border-t-2 border-gray-900 pt-3 mt-3">
                                <p className="text-xs text-gray-600 mb-1">Média histórica</p>
                                <p className="text-lg font-bold">
                                    {(trends.reduce((sum, t) => sum + t.count, 0) / trends.length).toFixed(0)} coletas
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                <h3 className="font-bold text-lg mb-6">Arrecadação Últimos 12 Meses</h3>
                {trends.length > 0 ? (
                    <>
                        <div className="flex items-end justify-between h-48 gap-1 mb-4">
                            {trends.map((trend, i) => {
                                const maxAmount = Math.max(...trends.map(t => t.amount)) || 1;
                                const height = (trend.amount / maxAmount) * 100;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                        <div
                                            className="w-full bg-gray-900 border-2 border-gray-900"
                                            style={{ height: `${height}%`, minHeight: '4px' }}
                                            title={trend.month}
                                        />
                                        <span className="text-xs text-gray-600">{trend.month.substring(5)}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="border-t-2 border-gray-900 pt-4 text-xs text-gray-600">
                            <p>Total 12 meses: <span className="font-bold">R$ {trends.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}</span></p>
                            <p>Média mensal: <span className="font-bold">R$ {monthlyCollectionAvg.toFixed(2)}</span></p>
                        </div>
                    </>
                ) : (
                    <p className="text-gray-500 text-sm">Sem dados</p>
                )}
            </div>

            {delinquent.length > 0 && (
                <div className="border-2 border-red-600 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-2 mb-6">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h3 className="font-bold text-lg">Membros em Atraso ({delinquent.length})</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-red-600">
                                    <th className="text-left font-bold py-2 px-3">Nome</th>
                                    <th className="text-left font-bold py-2 px-3">Email</th>
                                    <th className="text-left font-bold py-2 px-3">Telefone</th>
                                    <th className="text-right font-bold py-2 px-3">Dias</th>
                                </tr>
                            </thead>
                            <tbody>
                                {delinquent.map((member) => (
                                    <tr key={member.id} className="border-b border-gray-200">
                                        <td className="py-3 px-3 font-semibold">{member.fullName}</td>
                                        <td className="py-3 px-3 text-gray-600">{member.email}</td>
                                        <td className="py-3 px-3 text-gray-600">{member.phone}</td>
                                        <td className="py-3 px-3 text-right font-bold text-red-600">{member.daysOverdue}d</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
