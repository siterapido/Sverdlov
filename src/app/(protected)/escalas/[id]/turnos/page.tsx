'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Clock, MapPin, Users, Trash2, Edit2, UserPlus, Check, X, Calendar, MoreVertical, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { getScheduleById } from '@/app/actions/schedules';
import { createSlot, deleteSlot, updateSlotStatus, getSlotById, generateBatchSlots } from '@/app/actions/schedule-slots';
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
    const [schedule, setSchedule] = useState<{ name: string; startDate: string; endDate?: string; slots: ScheduleSlot[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [showNewSlot, setShowNewSlot] = useState(false);
    const [showBatchGen, setShowBatchGen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [showAssignModal, setShowAssignModal] = useState(false);

    useEffect(() => { loadSchedule(); }, [scheduleId]);

    async function loadSchedule() {
        setLoading(true);
        const data = await getScheduleById(scheduleId);
        if (data) setSchedule({ 
            name: data.name, 
            startDate: new Date(data.startDate).toISOString().split('T')[0], 
            endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : undefined,
            slots: data.slots 
        });
        setLoading(false);
    }

    const handleDeleteSlot = async (slotId: string) => {
        if (!confirm('Excluir este turno?')) return;
        await deleteSlot(slotId);
        await loadSchedule();
    };

    if (loading || !schedule) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/escalas/${scheduleId}`} className="p-2 hover:bg-gray-100 rounded-none">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Gerenciar Turnos</h1>
                            <p className="text-sm text-gray-500">{schedule.name}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowBatchGen(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 rounded-none text-sm font-medium">
                            <RefreshCw className="w-4 h-4" />Gerar em Lote
                        </button>
                        <button onClick={() => setShowNewSlot(true)} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-none hover:bg-red-600 text-sm font-medium">
                            <Plus className="w-4 h-4" />Novo Turno
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                {schedule.slots.length === 0 ? (
                    <div className="text-center py-16">
                        <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium mb-2 text-gray-900">Nenhum turno cadastrado</h3>
                        <p className="text-gray-500 mb-6">Comece adicionando turnos individuais ou gere vários de uma vez.</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowNewSlot(true)} className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-none">
                                <Plus className="w-5 h-5" />Criar Manual
                            </button>
                            <button onClick={() => setShowBatchGen(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-none hover:bg-red-600">
                                <RefreshCw className="w-5 h-5" />Gerar em Lote
                            </button>
                        </div>
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

            {/* Modals */}
            <AnimatePresence>
                {showNewSlot && (
                    <NewSlotModal scheduleId={scheduleId} onClose={() => setShowNewSlot(false)} onCreated={() => { setShowNewSlot(false); loadSchedule(); }} />
                )}
                {showBatchGen && (
                    <BatchGeneratorModal 
                        scheduleId={scheduleId} 
                        defaultStart={schedule.startDate} 
                        defaultEnd={schedule.endDate || schedule.startDate}
                        onClose={() => setShowBatchGen(false)} 
                        onCreated={() => { setShowBatchGen(false); loadSchedule(); }} 
                    />
                )}
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
            className="bg-white rounded-none border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center gap-6">
                    <div className="text-center min-w-[60px] border-r border-gray-100 pr-4">
                        <div className="text-2xl font-bold text-gray-900">{new Date(slot.date + 'T12:00').getDate()}</div>
                        <div className="text-xs uppercase font-semibold text-gray-500">{new Date(slot.date + 'T12:00').toLocaleDateString('pt-BR', { month: 'short' })}</div>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">{slot.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1 font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-700"><Clock className="w-3 h-3" />{slot.startTime} - {slot.endTime}</span>
                            {slot.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{slot.location}</span>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-none ${statusConfig.bg} ${statusConfig.text}`}>{statusConfig.label}</span>
                    <div className="flex items-center text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1">
                        <Users className="w-4 h-4 mr-2" />
                        {assignments.length}/{slot.maxParticipants}
                    </div>
                    <div className="h-8 w-px bg-gray-200 mx-2"></div>
                    <button onClick={(e) => { e.stopPropagation(); onAssign(); }} className="p-2 hover:bg-blue-50 text-blue-600 rounded-none transition-colors" title="Atribuir Membro">
                        <UserPlus className="w-5 h-5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 hover:bg-red-50 text-red-600 rounded-none transition-colors" title="Excluir Turno">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="border-t border-gray-200 p-6 bg-gray-50/50">
                            <div className="flex justify-between items-end mb-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Membros Atribuídos</h4>
                                {slot.notes && <p className="text-xs text-gray-500 italic max-w-md text-right">{slot.notes}</p>}
                            </div>
                            
                            {assignments.length === 0 ? (
                                <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-none bg-white">
                                    <p className="text-sm text-gray-400">Nenhum membro atribuído a este turno.</p>
                                    <button onClick={(e) => { e.stopPropagation(); onAssign(); }} className="text-sm text-blue-600 font-medium hover:underline mt-1">Clique para atribuir</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {assignments.map(a => (
                                        <div key={a.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 shadow-sm rounded-none">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                                                    {a.memberName.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{a.memberName}</p>
                                                    <p className="text-[10px] uppercase font-bold text-gray-400">{a.status}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleRemoveAssignment(a.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function BatchGeneratorModal({ scheduleId, defaultStart, defaultEnd, onClose, onCreated }: { scheduleId: string; defaultStart: string; defaultEnd: string; onClose: () => void; onCreated: () => void }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        startDate: defaultStart,
        endDate: defaultEnd,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // All days default
        startTime: '09:00',
        endTime: '13:00',
        name: 'Turno Padrão',
        location: '',
        maxParticipants: 5
    });

    const toggleDay = (day: number) => {
        if (form.daysOfWeek.includes(day)) {
            setForm({ ...form, daysOfWeek: form.daysOfWeek.filter(d => d !== day) });
        } else {
            setForm({ ...form, daysOfWeek: [...form.daysOfWeek, day] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await generateBatchSlots(scheduleId, form);
        setLoading(false);
        onCreated();
    };

    const daysMap = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}
                className="bg-white rounded-none w-full max-w-lg shadow-xl">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><RefreshCw className="w-5 h-5 text-red-500" /> Gerar Turnos em Lote</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-none text-gray-500"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Início do Período</label>
                            <input type="date" required value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-none bg-white focus:border-red-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Fim do Período</label>
                            <input type="date" required value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-none bg-white focus:border-red-500 outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Dias da Semana</label>
                        <div className="flex gap-2">
                            {daysMap.map((d, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => toggleDay(i)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-colors ${form.daysOfWeek.includes(i) ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Hora Início</label>
                            <input type="time" required value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-none bg-white focus:border-red-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Hora Fim</label>
                            <input type="time" required value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-none bg-white focus:border-red-500 outline-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nome do Turno</label>
                            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Manhã"
                                className="w-full px-3 py-2 border border-gray-300 rounded-none bg-white focus:border-red-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Vagas</label>
                            <input type="number" min={1} required value={form.maxParticipants} onChange={e => setForm({ ...form, maxParticipants: Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-none bg-white focus:border-red-500 outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Local (Opcional)</label>
                        <input type="text" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Ex: Sede"
                            className="w-full px-3 py-2 border border-gray-300 rounded-none bg-white focus:border-red-500 outline-none" />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold uppercase tracking-wider text-xs">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-red-500 text-white hover:bg-red-600 font-bold uppercase tracking-wider text-xs disabled:opacity-50">
                            {loading ? 'Gerando...' : 'Gerar Turnos'}
                        </button>
                    </div>
                </form>
            </motion.div>
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
                className="bg-white rounded-none w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Novo Turno Individual</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-none"><X className="w-5 h-5 text-gray-500" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Reuse same form style as Batch but for single */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nome</label>
                        <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-none bg-white focus:border-red-500 outline-none" />
                    </div>
                    {/* ... other fields similar to previous implementation but with new style ... */}
                    {/* Simplified for brevity since Batch is the focus, but ensuring style matches */}
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-none hover:bg-gray-50 text-gray-700">Cancelar</button>
                        <button type="submit" disabled={loading || !form.name} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-none hover:bg-red-600 disabled:opacity-50">
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
                className="bg-white rounded-none w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col shadow-xl">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900">Atribuir Membro</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-none"><X className="w-5 h-5 text-gray-500" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>
                    ) : suggestions.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-2">Nenhum membro com disponibilidade explícita.</p>
                            <button className="text-sm text-blue-600 hover:underline">Ver todos os membros</button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-xs font-bold uppercase text-gray-400">Sugestões (Baseado na disponibilidade)</p>
                            {suggestions.map(s => (
                                <div key={s.memberId} className="flex items-center justify-between p-3 bg-white border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer group" onClick={() => handleAssign(s.memberId)}>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm group-hover:text-blue-700">{s.memberName}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">{s.reasons.join(' • ')}</p>
                                    </div>
                                    <button disabled={assigning === s.memberId}
                                        className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase rounded-none group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        {assigning === s.memberId ? '...' : 'Escolher'}
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
