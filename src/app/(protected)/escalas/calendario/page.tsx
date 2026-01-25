'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Users, Plus, X, UserPlus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getSlotsByDateRange } from '@/app/actions/schedule-slots';
import { assignMemberToSlot, getAvailableMembersForSlot, removeAssignment, getAssignmentsBySlot } from '@/app/actions/slot-assignments';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

interface SlotEvent {
    id: string; name: string; date: string; startTime: string; endTime: string;
    scheduleName: string; scheduleCategory: string; scheduleColor: string; location: string | null;
}

export default function CalendarioPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [slots, setSlots] = useState<SlotEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<SlotEvent | null>(null);
    const [showAssignModal, setShowAssignModal] = useState(false);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    useEffect(() => {
        loadSlots();
    }, [month, year]);

    async function loadSlots() {
        setLoading(true);
        const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const end = `${year}-${String(month + 1).padStart(2, '0')}-${daysInMonth}`;
        const data = await getSlotsByDateRange(start, end);
        setSlots(data as SlotEvent[]);
        setLoading(false);
    }

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const today = () => setCurrentDate(new Date());

    const getEventsForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return slots.filter(s => s.date === dateStr);
    };

    const selectedEvents = selectedDate ? slots.filter(s => s.date === selectedDate) : [];

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/escalas" className="p-2 hover:bg-gray-100 rounded-none">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-red-500" />
                            <h1 className="text-xl font-bold text-gray-900">Calendário de Escalas</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={today} className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded-none bg-white text-gray-700 border border-gray-200">Hoje</button>
                        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-none text-gray-600"><ChevronLeft className="w-5 h-5" /></button>
                        <span className="font-medium min-w-[140px] text-center text-gray-900">{MONTHS[month]} {year}</span>
                        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-none text-gray-600"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Calendar Grid */}
                    <div className="lg:col-span-2 bg-white rounded-none border border-gray-200 p-6 shadow-sm">
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {DAYS.map(d => <div key={d} className="text-center text-sm font-bold text-gray-400 py-2 uppercase">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: startOffset }).map((_, i) => <div key={`empty-${i}`} className="aspect-square bg-gray-50/30" />)}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const events = getEventsForDay(day);
                                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                                const isSelected = selectedDate === dateStr;

                                return (
                                    <motion.button key={day} whileHover={{ scale: 1.05 }} onClick={() => setSelectedDate(dateStr)}
                                        className={`aspect-square rounded-none p-1 flex flex-col items-center justify-start gap-1 transition-all border
                                            ${isSelected ? 'bg-red-500 text-white border-red-500 shadow-md ring-2 ring-red-200' : isToday ? 'bg-red-50 text-red-600 border-red-100' : 'bg-white hover:bg-gray-50 border-gray-100 text-gray-700'}`}>
                                        <span className={`text-sm font-bold ${isToday && !isSelected ? 'text-red-500' : ''}`}>{day}</span>
                                        {events.length > 0 && (
                                            <div className="flex gap-0.5 mt-auto mb-1">
                                                {events.slice(0, 3).map((e, idx) => (
                                                    <div key={idx} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isSelected ? 'white' : e.scheduleColor }} />
                                                ))}
                                                {events.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                                            </div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Events Panel */}
                    <div className="bg-white rounded-none border border-gray-200 p-6 shadow-sm h-fit">
                        <h3 className="font-semibold mb-6 flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-4">
                            <Clock className="w-5 h-5 text-red-500" />
                            {selectedDate ? new Date(selectedDate + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Selecione um dia'}
                        </h3>
                        {!selectedDate ? (
                            <div className="text-center py-8 text-gray-400">
                                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">Clique em um dia para ver os turnos e atribuir membros</p>
                            </div>
                        ) : selectedEvents.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <p className="text-sm">Nenhum turno neste dia</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedEvents.map(event => (
                                    <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        className="p-4 rounded-none border border-gray-200 hover:border-gray-300 bg-white transition-all shadow-sm group">
                                        <div className="flex items-start justify-between">
                                            <div className="border-l-4 pl-3" style={{ borderColor: event.scheduleColor }}>
                                                <p className="font-bold text-gray-900">{event.name}</p>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">{event.scheduleName}</p>
                                            </div>
                                            <button 
                                                onClick={() => { setSelectedSlot(event); setShowAssignModal(true); }}
                                                className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-none transition-colors"
                                                title="Gerenciar Atribuições"
                                            >
                                                <Users className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
                                            <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded"><Clock className="w-3.5 h-3.5 text-gray-400" />{event.startTime} - {event.endTime}</span>
                                            {event.location && <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded"><MapPin className="w-3.5 h-3.5 text-gray-400" />{event.location}</span>}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal Atribuir Membro */}
            <AnimatePresence>
                {showAssignModal && selectedSlot && (
                    <AssignMemberModal slot={selectedSlot} onClose={() => { setShowAssignModal(false); setSelectedSlot(null); }} onUpdated={loadSlots} />
                )}
            </AnimatePresence>
        </div>
    );
}

function AssignMemberModal({ slot, onClose, onUpdated }: { slot: SlotEvent; onClose: () => void; onUpdated: () => void }) {
    const [suggestions, setSuggestions] = useState<{ memberId: string; memberName: string; score: number; reasons: string[] }[]>([]);
    const [assignments, setAssignments] = useState<{ id: string; memberName: string; status: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'assigned' | 'available'>('assigned');

    useEffect(() => { loadData(); }, [slot.id]);

    async function loadData() {
        setLoading(true);
        const [avail, assigned] = await Promise.all([
            getAvailableMembersForSlot(slot.id),
            getAssignmentsBySlot(slot.id)
        ]);
        setSuggestions(avail);
        setAssignments(assigned.map(a => ({ id: a.id, memberName: a.memberName, status: a.status })));
        setLoading(false);
        // Switch to available tab if no assignments yet
        if (assigned.length === 0 && avail.length > 0) setActiveTab('available');
    }

    const handleAssign = async (memberId: string) => {
        setAssigning(memberId);
        await assignMemberToSlot(slot.id, memberId, 'current-user-id');
        setAssigning(null);
        await loadData();
        onUpdated();
    };

    const handleRemove = async (assignmentId: string) => {
        if (!confirm('Remover membro do turno?')) return;
        await removeAssignment(assignmentId);
        await loadData();
        onUpdated();
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}
                className="bg-white rounded-none w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col shadow-xl">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{slot.name}</h2>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">{new Date(slot.date + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-none text-gray-500"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-600 font-medium">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{slot.startTime} - {slot.endTime}</span>
                        {slot.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{slot.location}</span>}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button 
                        onClick={() => setActiveTab('assigned')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'assigned' ? 'text-red-600 border-b-2 border-red-600 bg-white' : 'text-gray-500 bg-gray-50 hover:bg-gray-100'}`}
                    >
                        Atribuídos ({assignments.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('available')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'available' ? 'text-primary border-b-2 border-primary bg-white' : 'text-gray-500 bg-gray-50 hover:bg-gray-100'}`}
                    >
                        Disponíveis ({suggestions.length})
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-0 bg-white">
                    {loading ? (
                        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" /></div>
                    ) : (
                        <>
                            {activeTab === 'assigned' && (
                                <div className="divide-y divide-gray-100">
                                    {assignments.length === 0 ? (
                                        <div className="text-center py-12 px-6">
                                            <Users className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                                            <p className="text-gray-500 text-sm">Nenhum membro atribuído a este turno.</p>
                                            <button onClick={() => setActiveTab('available')} className="mt-2 text-primary font-bold text-xs uppercase hover:underline">Adicionar Membros</button>
                                        </div>
                                    ) : (
                                        assignments.map(a => (
                                            <div key={a.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                                                        {a.memberName.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{a.memberName}</p>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 uppercase">
                                                            {a.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleRemove(a.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'available' && (
                                <div className="divide-y divide-gray-100">
                                    {suggestions.length === 0 ? (
                                        <div className="text-center py-12 px-6">
                                            <p className="text-gray-500 text-sm">Nenhum membro disponível encontrado.</p>
                                        </div>
                                    ) : (
                                        suggestions.map(s => (
                                            <div key={s.memberId} className="flex items-center justify-between p-4 hover:bg-primary/10 transition-colors group">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{s.memberName}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                                                        {s.reasons.join(' • ')}
                                                    </p>
                                                </div>
                                                <button 
                                                    onClick={() => handleAssign(s.memberId)} 
                                                    disabled={assigning === s.memberId}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-bold uppercase rounded-none hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-50"
                                                >
                                                    {assigning === s.memberId ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <><Plus className="w-3 h-3" /> Atribuir</>}
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
