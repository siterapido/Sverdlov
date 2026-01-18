'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Clock, MapPin, Users, Trash2, Edit2, UserPlus, Check, X, Calendar } from 'lucide-react';
import Link from 'next/link';
import { getScheduleById } from '@/app/actions/schedules';
import { createSlot, deleteSlot, updateSlotStatus, getSlotById } from '@/app/actions/schedule-slots';
import { assignMemberToSlot, removeAssignment, getAssignmentsBySlot, getAvailableMembersForSlot } from '@/app/actions/slot-assignments';
import { ScheduleSlot, NewScheduleSlot } from '@/lib/db/schema';

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
    open: { bg: 'bg-green-100', text: 'text-green-700', label: 'Aberto' },
    full: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Lotado' },
    in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Em andamento' },
    completed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Concluído' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelado' },
};

export default function TurnosPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: scheduleId } = use(params);
    const [schedule, setSchedule] = useState<{ name: string; slots: ScheduleSlot[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [showNewSlot, setShowNewSlot] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [showAssignModal, setShowAssignModal] = useState(false);

    useEffect(() => { loadSchedule(); }, [scheduleId]);

    async function loadSchedule() {
        setLoading(true);
        const data = await getScheduleById(scheduleId);
        if (data) setSchedule({ name: data.name, slots: data.slots });
        setLoading(false);
    }

    const handleDeleteSlot = async (slotId: string) => {
        if (!confirm('Excluir este turno?')) return;
        await deleteSlot(slotId);
        await loadSchedule();
    };

    if (loading || !schedule) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/escalas/${scheduleId}`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold">Gerenciar Turnos</h1>
                            <p className="text-sm text-gray-500">{schedule.name}</p>
                        </div>
                    </div>
                    <button onClick={() => setShowNewSlot(true)} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                        <Plus className="w-4 h-4" />Novo Turno
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                {schedule.slots.length === 0 ? (
                    <div className="text-center py-16">
                        <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium mb-2">Nenhum turno cadastrado</h3>
                        <p className="text-gray-500 mb-6">Adicione turnos para organizar as atividades da escala</p>
                        <button onClick={() => setShowNewSlot(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600">
                            <Plus className="w-5 h-5" />Criar Primeiro Turno
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {schedule.slots.map((slot, i) => (
                            <SlotCard key={slot.id} slot={slot} index={i} onDelete={() => handleDeleteSlot(slot.id)}
                                onAssign={() => { setSelectedSlot(slot.id); setShowAssignModal(true); }}
                                onReload={loadSchedule} />
                        ))}
                    </div>
                )}
            </main>

            {/* Modal Novo Turno */}
            <AnimatePresence>
                {showNewSlot && (
                    <NewSlotModal scheduleId={scheduleId} onClose={() => setShowNewSlot(false)} onCreated={() => { setShowNewSlot(false); loadSchedule(); }} />
                )}
            </AnimatePresence>

            {/* Modal Atribuir Membro */}
            <AnimatePresence>
                {showAssignModal && selectedSlot && (
                    <AssignMemberModal slotId={selectedSlot} onClose={() => { setShowAssignModal(false); setSelectedSlot(null); }} onAssigned={() => { setShowAssignModal(false); setSelectedSlot(null); loadSchedule(); }} />
                )}
            </AnimatePresence>
        </div>
    );
}

function SlotCard({ slot, index, onDelete, onAssign, onReload }: { slot: ScheduleSlot; index: number; onDelete: () => void; onAssign: () => void; onReload: () => void }) {
    const [assignments, setAssignments] = useState<{ id: string; memberName: string; status: string }[]>([]);
    const [expanded, setExpanded] = useState(false);
    const statusConfig = STATUS_COLORS[slot.status];

    useEffect(() => {
        if (expanded) loadAssignments();
    }, [expanded]);

    async function loadAssignments() {
        const data = await getAssignmentsBySlot(slot.id);
        setAssignments(data.map(a => ({ id: a.id, memberName: a.memberName, status: a.status })));
    }

    const handleRemoveAssignment = async (assignmentId: string) => {
        await removeAssignment(assignmentId);
        await loadAssignments();
        onReload();
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                        <div className="text-2xl font-bold">{new Date(slot.date + 'T12:00').getDate()}</div>
                        <div className="text-xs text-gray-500">{new Date(slot.date + 'T12:00').toLocaleDateString('pt-BR', { month: 'short' })}</div>
                    </div>
                    <div>
                        <h3 className="font-medium">{slot.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{slot.startTime} - {slot.endTime}</span>
                            {slot.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{slot.location}</span>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}>{statusConfig.label}</span>
                    <span className="text-sm text-gray-500"><Users className="w-4 h-4 inline mr-1" />0/{slot.maxParticipants}</span>
                    <button onClick={(e) => { e.stopPropagation(); onAssign(); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-blue-500">
                        <UserPlus className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-red-500">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="border-t p-4 bg-gray-50 dark:bg-gray-700/30">
                            <h4 className="text-sm font-medium mb-3">Membros Atribuídos</h4>
                            {assignments.length === 0 ? (
                                <p className="text-sm text-gray-500">Nenhum membro atribuído</p>
                            ) : (
                                <div className="space-y-2">
                                    {assignments.map(a => (
                                        <div key={a.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
                                            <span className="text-sm">{a.memberName}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">{a.status}</span>
                                                <button onClick={() => handleRemoveAssignment(a.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {slot.notes && <p className="text-sm text-gray-500 mt-4"><strong>Notas:</strong> {slot.notes}</p>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function NewSlotModal({ scheduleId, onClose, onCreated }: { scheduleId: string; onClose: () => void; onCreated: () => void }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', date: new Date().toISOString().split('T')[0], startTime: '08:00', endTime: '12:00', location: '', maxParticipants: 10, notes: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await createSlot({ scheduleId, ...form, maxParticipants: Number(form.maxParticipants) });
        setLoading(false);
        onCreated();
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Novo Turno</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome do Turno *</label>
                        <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Turno Manhã"
                            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Data *</label>
                        <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Início *</label>
                            <input type="time" required value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Término *</label>
                            <input type="time" required value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Local</label>
                        <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Ex: Sede do partido"
                            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Máximo de Participantes</label>
                        <input type="number" min={1} value={form.maxParticipants} onChange={e => setForm({ ...form, maxParticipants: Number(e.target.value) })}
                            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Observações</label>
                        <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 resize-none" />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
                        <button type="submit" disabled={loading || !form.name} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50">
                            {loading ? 'Criando...' : 'Criar Turno'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

function AssignMemberModal({ slotId, onClose, onAssigned }: { slotId: string; onClose: () => void; onAssigned: () => void }) {
    const [suggestions, setSuggestions] = useState<{ memberId: string; memberName: string; score: number; reasons: string[] }[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState<string | null>(null);

    useEffect(() => { loadSuggestions(); }, [slotId]);

    async function loadSuggestions() {
        setLoading(true);
        const data = await getAvailableMembersForSlot(slotId);
        setSuggestions(data);
        setLoading(false);
    }

    const handleAssign = async (memberId: string) => {
        setAssigning(memberId);
        // TODO: Obter usuário logado
        await assignMemberToSlot(slotId, memberId, 'current-user-id');
        setAssigning(null);
        onAssigned();
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Atribuir Membro</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>
                    ) : suggestions.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Nenhum membro disponível encontrado</p>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500 mb-4">Sugestões baseadas em disponibilidade:</p>
                            {suggestions.map(s => (
                                <div key={s.memberId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div>
                                        <p className="font-medium">{s.memberName}</p>
                                        <p className="text-xs text-gray-500">{s.reasons.join(' • ')}</p>
                                    </div>
                                    <button onClick={() => handleAssign(s.memberId)} disabled={assigning === s.memberId}
                                        className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50">
                                        {assigning === s.memberId ? '...' : 'Atribuir'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
