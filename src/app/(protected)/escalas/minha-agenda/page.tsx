'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, Check, X, AlertCircle, CheckCircle, XCircle, User } from 'lucide-react';
import Link from 'next/link';
import { getAssignmentsByMember, confirmAssignment, declineAssignment, getMemberParticipationStats, AssignmentWithDetails } from '@/app/actions/slot-assignments';

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Check; color: string; bg: string }> = {
    pending: { label: 'Pendente', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
    confirmed: { label: 'Confirmado', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    declined: { label: 'Recusado', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
    attended: { label: 'Presente', icon: Check, color: 'text-blue-500', bg: 'bg-blue-50' },
    absent: { label: 'Ausente', icon: X, color: 'text-red-500', bg: 'bg-red-50' },
    excused: { label: 'Justificado', icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50' },
};

export default function MinhaAgendaPage() {
    const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
    const [stats, setStats] = useState({ total: 0, attended: 0, absent: 0, excused: 0, pending: 0, attendanceRate: 100 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'upcoming' | 'all' | 'pending'>('upcoming');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // TODO: Obter memberId do usuário logado
    const memberId = 'current-user-member-id';

    useEffect(() => { loadData(); }, [filter]);

    async function loadData() {
        setLoading(true);
        const [assignmentsData, statsData] = await Promise.all([
            getAssignmentsByMember(memberId, { upcoming: filter === 'upcoming', status: filter === 'pending' ? 'pending' : undefined }),
            getMemberParticipationStats(memberId),
        ]);
        setAssignments(assignmentsData);
        setStats(statsData);
        setLoading(false);
    }

    const handleConfirm = async (id: string) => {
        setActionLoading(id);
        await confirmAssignment(id);
        await loadData();
        setActionLoading(null);
    };

    const handleDecline = async (id: string) => {
        const reason = prompt('Motivo da recusa (opcional):');
        setActionLoading(id);
        await declineAssignment(id, reason || undefined);
        await loadData();
        setActionLoading(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/escalas" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-none">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <User className="w-6 h-6 text-red-500" />
                        <h1 className="text-xl font-bold">Minha Agenda</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-none p-4 border">
                        <p className="text-sm text-gray-500">Total de Escalas</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-none p-4 border">
                        <p className="text-sm text-gray-500">Presenças</p>
                        <p className="text-2xl font-bold text-green-500">{stats.attended}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-none p-4 border">
                        <p className="text-sm text-gray-500">Pendentes</p>
                        <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-none p-4 border">
                        <p className="text-sm text-gray-500">Taxa de Presença</p>
                        <p className="text-2xl font-bold">{stats.attendanceRate}%</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    {[
                        { value: 'upcoming', label: 'Próximas' },
                        { value: 'pending', label: 'Pendentes' },
                        { value: 'all', label: 'Todas' },
                    ].map(f => (
                        <button key={f.value} onClick={() => setFilter(f.value as typeof filter)}
                            className={`px-4 py-2 rounded-none text-sm font-medium transition-colors ${filter === f.value ? 'bg-red-500 text-white' : 'bg-white dark:bg-gray-800 border hover:bg-gray-50'}`}>
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Assignments List */}
                <div className="bg-white dark:bg-gray-800 rounded-none border overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        </div>
                    ) : assignments.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Nenhuma escala encontrada</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {assignments.map((a, i) => {
                                const statusConfig = STATUS_CONFIG[a.status];
                                const StatusIcon = statusConfig.icon;
                                const isPast = new Date(a.slotDate) < new Date();

                                return (
                                    <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                        className={`p-4 ${isPast ? 'opacity-60' : ''}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium">{a.slotName}</span>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                                                        <StatusIcon className="w-3 h-3" />{statusConfig.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500">{a.scheduleName}</p>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{a.slotDate}</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{a.slotTime}</span>
                                                </div>
                                            </div>
                                            {a.status === 'pending' && !isPast && (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleConfirm(a.id)} disabled={actionLoading === a.id}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-none text-sm hover:bg-green-600 disabled:opacity-50">
                                                        <Check className="w-4 h-4" />Confirmar
                                                    </button>
                                                    <button onClick={() => handleDecline(a.id)} disabled={actionLoading === a.id}
                                                        className="flex items-center gap-1 px-3 py-1.5 border border-red-500 text-red-500 rounded-none text-sm hover:bg-red-50 disabled:opacity-50">
                                                        <X className="w-4 h-4" />Recusar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
