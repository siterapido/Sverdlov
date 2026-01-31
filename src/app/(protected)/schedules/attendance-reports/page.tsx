'use client';

import { useEffect, useState } from 'react';
import { Download, Filter, BarChart3 } from 'lucide-react';

interface AttendanceData {
    reportType: string;
    summary?: {
        totalAssignments: number;
        totalAttended: number;
        totalAbsent: number;
        totalExcused: number;
        totalPending: number;
        attendanceRate: string;
    };
    data?: any[];
}

export default function AttendanceReportsPage() {
    const [reportType, setReportType] = useState('summary');
    const [data, setData] = useState<AttendanceData | null>(null);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ type: reportType });
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await fetch(`/api/schedules/attendance?${params}`);
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
        if (reportType === 'summary' && data.summary) {
            csv = 'Métrica,Valor\nTotal de Atribuições,' + data.summary.totalAssignments + '\nPresentes,' + data.summary.totalAttended + '\nAusentes,' + data.summary.totalAbsent + '\nJustificados,' + data.summary.totalExcused + '\nPendentes,' + data.summary.totalPending + '\nTaxa de Presença,' + data.summary.attendanceRate + '%\n';
        } else if (data.data) {
            const keys = Object.keys(data.data[0] || {});
            csv = keys.join(',') + '\n';
            data.data.forEach(row => {
                csv += keys.map(key => {
                    const value = row[key];
                    if (typeof value === 'number') return value;
                    return value || '';
                }).join(',') + '\n';
            });
        }

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-presenca-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-black mb-2">Relatórios de Presença</h1>
                <p className="text-gray-600">Analise dados de presença em turnos e escalas</p>
            </div>

            <div className="border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                <h2 className="font-bold text-lg mb-4">Filtros</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-bold mb-2">Tipo de Relatório</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full border-2 border-gray-900 p-2"
                        >
                            <option value="summary">Resumo</option>
                            <option value="by-member">Por Membro</option>
                            <option value="by-schedule">Por Escala</option>
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
                    </div>

                    <div>
                        <button
                            onClick={exportCSV}
                            disabled={!data}
                            className="w-full border-2 border-gray-900 font-bold p-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] disabled:opacity-50"
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

            {data && reportType === 'summary' && data.summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                        <h3 className="font-bold text-sm text-gray-700 mb-2">Total de Atribuições</h3>
                        <p className="text-3xl font-black">{data.summary.totalAssignments}</p>
                    </div>

                    <div className="border-2 border-green-600 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                        <h3 className="font-bold text-sm text-gray-700 mb-2">Taxa de Presença</h3>
                        <p className="text-3xl font-black text-green-600">{data.summary.attendanceRate}%</p>
                    </div>

                    <div className="border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                        <h3 className="font-bold text-sm text-gray-700 mb-2">Distribuição</h3>
                        <div className="text-sm space-y-1">
                            <p>Presentes: {data.summary.totalAttended}</p>
                            <p>Ausentes: {data.summary.totalAbsent}</p>
                            <p>Justificados: {data.summary.totalExcused}</p>
                        </div>
                    </div>
                </div>
            )}

            {data && reportType === 'by-member' && data.data && (
                <div className="border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <h2 className="font-bold text-lg mb-4">Presença por Membro</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-gray-900">
                                    <th className="text-left font-bold py-2 px-3">Nome</th>
                                    <th className="text-right font-bold py-2 px-3">Presentes</th>
                                    <th className="text-right font-bold py-2 px-3">Ausentes</th>
                                    <th className="text-right font-bold py-2 px-3">Justificados</th>
                                    <th className="text-right font-bold py-2 px-3">Total</th>
                                    <th className="text-right font-bold py-2 px-3">Taxa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.data.map((member, i) => (
                                    <tr key={i} className="border-b border-gray-200">
                                        <td className="py-2 px-3 font-semibold">{member.fullName}</td>
                                        <td className="text-right py-2 px-3">{member.attended}</td>
                                        <td className="text-right py-2 px-3 text-red-600">{member.absent}</td>
                                        <td className="text-right py-2 px-3 text-yellow-600">{member.excused}</td>
                                        <td className="text-right py-2 px-3">{member.total}</td>
                                        <td className="text-right py-2 px-3 font-bold">{member.attendanceRate}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {data && reportType === 'by-schedule' && data.data && (
                <div className="border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                    <h2 className="font-bold text-lg mb-4">Presença por Escala</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-gray-900">
                                    <th className="text-left font-bold py-2 px-3">Escala</th>
                                    <th className="text-right font-bold py-2 px-3">Presentes</th>
                                    <th className="text-right font-bold py-2 px-3">Ausentes</th>
                                    <th className="text-right font-bold py-2 px-3">Justificados</th>
                                    <th className="text-right font-bold py-2 px-3">Pendentes</th>
                                    <th className="text-right font-bold py-2 px-3">Taxa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.data.map((schedule, i) => (
                                    <tr key={i} className="border-b border-gray-200">
                                        <td className="py-2 px-3 font-semibold">{schedule.scheduleName}</td>
                                        <td className="text-right py-2 px-3">{schedule.attended}</td>
                                        <td className="text-right py-2 px-3 text-red-600">{schedule.absent}</td>
                                        <td className="text-right py-2 px-3 text-yellow-600">{schedule.excused}</td>
                                        <td className="text-right py-2 px-3 text-blue-600">{schedule.pending}</td>
                                        <td className="text-right py-2 px-3 font-bold">{schedule.attendanceRate}%</td>
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
