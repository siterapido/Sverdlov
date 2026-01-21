'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Plus, Edit, Trash2, Play, Check, MoreVertical, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getScheduleById, toggleScheduleStatus, deleteSchedule, ScheduleWithSlots } from '@/app/actions/schedules';
import { getAssignmentsBySlot, AssignmentWithDetails } from '@/app/actions/slot-assignments';
import { ScheduleSlot } from '@/lib/db/schema';
import { CATEGORY_VARIANTS } from '@/components/schedules';

const VARIANT_COLORS: Record<string, string> = {
    red: 'bg-danger',
    blue: 'bg-accent',
    yellow: 'bg-warning',
    green: 'bg-success',
    gray: 'bg-fg-muted',
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
    draft: { label: 'Rascunho', bg: 'bg-gray-100', text: 'text-gray-600' },
    active: { label: 'Ativa', bg: 'bg-green-100', text: 'text-green-700' },
    completed: { label: 'Concluída', bg: 'bg-blue-100', text: 'text-blue-700' },
    cancelled: { label: 'Cancelada', bg: 'bg-red-100', text: 'text-red-700' },
};

export default function ScheduleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [schedule, setSchedule] = useState<ScheduleWithSlots | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => { loadSchedule(); }, [id]);

    async function loadSchedule() {
        setLoading(true);
        const data = await getScheduleById(id);
        setSchedule(data);
        setLoading(false);
    }

    const handleActivate = async () => {
        if (!schedule) return;
        setActionLoading(true);
        await toggleScheduleStatus(id, schedule.status === 'active' ? 'draft' : 'active');
        await loadSchedule();
        setActionLoading(false);
    };

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir esta escala?')) return;
        setActionLoading(true);
        await deleteSchedule(id);
        router.push('/escalas');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!schedule) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Escala não encontrada</h2>
                <Link href="/escalas" className="text-red-500 hover:underline">Voltar</Link>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[schedule.status];
    const categoryVariant = CATEGORY_VARIANTS[schedule.category] || 'gray';

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/escalas" className="p-2 hover:bg-gray-100 rounded-none">
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${VARIANT_COLORS[categoryVariant]}`} />
                                <h1 className="text-xl font-bold text-gray-900">{schedule.name}</h1>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}>{statusConfig.label}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleActivate} disabled={actionLoading}
                                className="flex items-center gap-2 px-4 py-2 rounded-none border border-gray-200 hover:bg-gray-50 text-gray-700 bg-white">
                                {schedule.status === 'active' ? <><Check className="w-4 h-4" />Pausar</> : <><Play className="w-4 h-4" />Ativar</>}
                            </button>
                            <Link href={`/escalas/${id}/editar`} className="flex items-center gap-2 px-4 py-2 rounded-none border border-gray-200 hover:bg-gray-50 text-gray-700 bg-white">
                                <Edit className="w-4 h-4" />Editar
                            </Link>
                            <button onClick={handleDelete} disabled={actionLoading} className="p-2 text-red-500 hover:bg-red-50 rounded-none border border-transparent hover:border-red-100">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
                {/* Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-none p-4 border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 mb-1"><Calendar className="w-4 h-4" />Início</div>
                        <p className="font-semibold text-gray-900">{new Date(schedule.startDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="bg-white rounded-none p-4 border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 mb-1"><Clock className="w-4 h-4" />Tipo</div>
                        <p className="font-semibold capitalize text-gray-900">{schedule.type}</p>
                    </div>
                    <div className="bg-white rounded-none p-4 border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 mb-1"><MapPin className="w-4 h-4" />Território</div>
                        <p className="font-semibold text-gray-900">{schedule.territoryScope || 'Nacional'}</p>
                    </div>
                    <div className="bg-white rounded-none p-4 border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 mb-1"><Users className="w-4 h-4" />Turnos</div>
                        <p className="font-semibold text-gray-900">{schedule.slotsCount} turnos</p>
                    </div>
                </div>

                {schedule.description && (
                    <div className="bg-white rounded-none p-6 border border-gray-200">
                        <h3 className="font-medium mb-2 text-gray-900">Descrição</h3>
                        <p className="text-gray-600">{schedule.description}</p>
                    </div>
                )}

                {/* Slots */}
                <div className="bg-white rounded-none border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h3 className="font-semibold flex items-center gap-2 text-gray-900"><Clock className="w-5 h-5 text-red-500" />Turnos da Escala</h3>
                        <Link href={`/escalas/${id}/turnos`} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-none hover:bg-red-600">
                            <Plus className="w-4 h-4" />Adicionar Turno
                        </Link>
                    </div>
                    {schedule.slots.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Nenhum turno cadastrado</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {schedule.slots.map((slot) => <SlotRow key={slot.id} slot={slot} />)}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function SlotRow({ slot }: { slot: ScheduleSlot }) {
    const STATUS_COLORS: Record<string, string> = {
        open: 'bg-green-500', full: 'bg-amber-500', in_progress: 'bg-blue-500', completed: 'bg-gray-400', cancelled: 'bg-red-500',
    };
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-4 hover:bg-gray-50 bg-white">
            <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[slot.status]}`} />
                <div>
                    <p className="font-medium text-gray-900">{slot.name}</p>
                    <p className="text-sm text-gray-500">{slot.date} • {slot.startTime} - {slot.endTime}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                {slot.location && <span className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-4 h-4" />{slot.location}</span>}
                <span className="text-sm text-gray-600"><Users className="w-4 h-4 inline mr-1" />0/{slot.maxParticipants}</span>
                <Link href={`/escalas/${slot.scheduleId}/turnos?slot=${slot.id}`} className="p-2 hover:bg-gray-100 rounded-none text-gray-500 hover:text-gray-900">
                    <UserPlus className="w-4 h-4" />
                </Link>
            </div>
        </motion.div>
    );
}
