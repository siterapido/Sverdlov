'use client';

import { useEffect, useState } from 'react';
import { Download, Filter } from 'lucide-react';

interface ReportData {
    reportType: string;
    data?: any[];
    total?: number;
    transactionCount?: number;
    byMethod?: Array<{ method: string; amount: number; count: number }>;
}

export default function ReportsPage() {
    const [reportType, setReportType] = useState('summary');
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ type: reportType });
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await fetch(`/api/finances/reports?${params}`);
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [reportType]);

    const exportCSV = () => {
        if (!data) return;

        let csv = '';
        if (reportType === 'summary') {
            csv = 'Métrica,Valor\nTotal,R$ ' + data.total?.toFixed(2) + '\nTransações,' + data.transactionCount + '\n';
            data.byMethod?.forEach(m => {
                csv += `Método: ${m.method},R$ ${m.amount.toFixed(2)} (${m.count})\n`;
            });
        } else if (data.data) {
            const keys = Object.keys(data.data[0] || {});
            csv = keys.join(',') + '\n';
            data.data.forEach(row => {
                csv += keys.map(key => {
                    const value = row[key];
                    if (typeof value === 'number') return value.toFixed(2);
                    return value;
                }).join(',') + '\n';
            });
        }

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-black mb-2">Relatórios Financeiros</h1>
                <p className="text-gray-600">Gere relatórios detalhados sobre suas finanças</p>
            </div>

            <div className="border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                <h2 className="font-bold text-lg mb-4">Filtros</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-bold mb-2">Tipo de Relatório</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full border-2 border-gray-900 p-2"
                        >
                            <option value="summary">Resumo</option>
                            <option value="by-plan">Por Plano</option>
                            <option value="by-type">Por Tipo</option>
                            <option value="top-members">Top Membros</option>
                            <option value="daily-summary">Resumo Diário</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Data Inicial</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full border-2 border-gray-900 p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Data Final</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full border-2 border-gray-900 p-2"
                        />
                    </div>

                    <div className="flex items-end gap-2">
                        <button
                            onClick={fetchReport}
                            disabled={loading}
                            className="flex-1 border-2 border-gray-900 bg-gray-900 text-white font-bold p-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] disabled:opacity-50"
                        >
                            <Filter className="w-4 h-4 inline mr-2" />
                            Filtrar
                        </button>
                        <button
                            onClick={exportCSV}
                            disabled={!data}
                            className="flex-1 border-2 border-gray-900 font-bold p-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] disabled:opacity-50"
                        >
                            <Download className="w-4 h-4 inline mr-2" />
                            CSV
                        </button>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] text-center">
                    <p className="text-gray-600">Carregando relatório...</p>
                </div>
            )}

            {data && reportType === 'summary' && (
                <div className="border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <h2 className="font-bold text-lg mb-4">Resumo Financeiro</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-sm text-gray-600">Total Arrecadado</p>
                            <p className="text-3xl font-black">R$ {data.total?.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Número de Transações</p>
                            <p className="text-3xl font-black">{data.transactionCount}</p>
                        </div>
                    </div>

                    {data.byMethod && data.byMethod.length > 0 && (
                        <div className="border-t-2 border-gray-900 pt-4">
                            <h3 className="font-bold mb-3">Por Método de Pagamento</h3>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-900">
                                        <th className="text-left font-bold py-2">Método</th>
                                        <th className="text-right font-bold py-2">Valor</th>
                                        <th className="text-right font-bold py-2">Transações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.byMethod.map((m, i) => (
                                        <tr key={i} className="border-b border-gray-200">
                                            <td className="py-2 capitalize">{m.method}</td>
                                            <td className="text-right py-2">R$ {m.amount.toFixed(2)}</td>
                                            <td className="text-right py-2">{m.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {data && reportType === 'by-plan' && data.data && (
                <div className="border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <h2 className="font-bold text-lg mb-4">Arrecadação por Plano</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-gray-900">
                                    <th className="text-left font-bold py-2 px-3">Plano</th>
                                    <th className="text-right font-bold py-2 px-3">Total</th>
                                    <th className="text-right font-bold py-2 px-3">Completo</th>
                                    <th className="text-right font-bold py-2 px-3">Pendente</th>
                                    <th className="text-right font-bold py-2 px-3">Falha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.data.map((row: any, i: number) => (
                                    <tr key={i} className="border-b border-gray-200">
                                        <td className="py-2 px-3">{row.planName || 'Sem plano'}</td>
                                        <td className="text-right py-2 px-3 font-semibold">R$ {parseFloat(row.totalAmount).toFixed(2)}</td>
                                        <td className="text-right py-2 px-3">{row.completedCount}</td>
                                        <td className="text-right py-2 px-3 text-yellow-600">{row.pendingCount}</td>
                                        <td className="text-right py-2 px-3 text-red-600">{row.failedCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {data && reportType === 'top-members' && data.data && (
                <div className="border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <h2 className="font-bold text-lg mb-4">Top 20 Membros por Contribuição</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-gray-900">
                                    <th className="text-left font-bold py-2 px-3">Nome</th>
                                    <th className="text-left font-bold py-2 px-3">Email</th>
                                    <th className="text-right font-bold py-2 px-3">Total</th>
                                    <th className="text-right font-bold py-2 px-3">Pagamentos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.data.map((row: any, i: number) => (
                                    <tr key={i} className="border-b border-gray-200">
                                        <td className="py-2 px-3 font-semibold">{row.memberName}</td>
                                        <td className="py-2 px-3 text-gray-600">{row.memberEmail}</td>
                                        <td className="text-right py-2 px-3">R$ {parseFloat(row.totalContributed).toFixed(2)}</td>
                                        <td className="text-right py-2 px-3">{row.paymentCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {data && reportType === 'by-type' && data.data && (
                <div className="border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <h2 className="font-bold text-lg mb-4">Arrecadação por Tipo</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {data.data.map((row: any, i: number) => (
                            <div key={i} className="border-2 border-gray-900 p-4 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                                <p className="text-sm font-bold capitalize mb-2">{row.type}</p>
                                <p className="text-2xl font-black">R$ {parseFloat(row.totalAmount).toFixed(2)}</p>
                                <p className="text-xs text-gray-600 mt-1">{row.count} transações</p>
                                <p className="text-xs text-gray-600">Média: R$ {parseFloat(row.avgAmount).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {data && reportType === 'daily-summary' && data.data && (
                <div className="border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <h2 className="font-bold text-lg mb-4">Resumo Diário</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-gray-900">
                                    <th className="text-left font-bold py-2 px-3">Data</th>
                                    <th className="text-right font-bold py-2 px-3">Total</th>
                                    <th className="text-right font-bold py-2 px-3">Transações</th>
                                    <th className="text-right font-bold py-2 px-3">Completo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.data.map((row: any, i: number) => (
                                    <tr key={i} className="border-b border-gray-200">
                                        <td className="py-2 px-3">{row.date}</td>
                                        <td className="text-right py-2 px-3 font-semibold">R$ {parseFloat(row.totalAmount).toFixed(2)}</td>
                                        <td className="text-right py-2 px-3">{row.transactionCount}</td>
                                        <td className="text-right py-2 px-3">{row.completedCount}</td>
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
