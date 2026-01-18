'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import { getSlotsByDateRange } from '@/app/actions/schedule-slots';

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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/escalas" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-red-500" />
                            <h1 className="text-xl font-bold">Calendário de Escalas</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={today} className="px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Hoje</button>
                        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
                        <span className="font-medium min-w-[140px] text-center">{MONTHS[month]} {year}</span>
                        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Calendar Grid */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border p-6">
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {DAYS.map(d => <div key={d} className="text-center text-sm font-medium text-gray-500 py-2">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: startOffset }).map((_, i) => <div key={`empty-${i}`} className="aspect-square" />)}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const events = getEventsForDay(day);
                                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                                const isSelected = selectedDate === dateStr;

                                return (
                                    <motion.button key={day} whileHover={{ scale: 1.05 }} onClick={() => setSelectedDate(dateStr)}
                                        className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-start gap-1 transition-colors
                                            ${isSelected ? 'bg-red-500 text-white' : isToday ? 'bg-red-50 dark:bg-red-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                        <span className={`text-sm font-medium ${isToday && !isSelected ? 'text-red-500' : ''}`}>{day}</span>
                                        {events.length > 0 && (
                                            <div className="flex gap-0.5">
                                                {events.slice(0, 3).map((e, idx) => (
                                                    <div key={idx} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isSelected ? 'white' : e.scheduleColor }} />
                                                ))}
                                            </div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Events Panel */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-red-500" />
                            {selectedDate ? new Date(selectedDate + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Selecione um dia'}
                        </h3>
                        {!selectedDate ? (
                            <p className="text-gray-500 text-sm">Clique em um dia para ver os turnos</p>
                        ) : selectedEvents.length === 0 ? (
                            <p className="text-gray-500 text-sm">Nenhum turno neste dia</p>
                        ) : (
                            <div className="space-y-3">
                                {selectedEvents.map(event => (
                                    <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        className="p-3 rounded-lg border-l-4 bg-gray-50 dark:bg-gray-700/50" style={{ borderColor: event.scheduleColor }}>
                                        <p className="font-medium text-sm">{event.name}</p>
                                        <p className="text-xs text-gray-500">{event.scheduleName}</p>
                                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.startTime} - {event.endTime}</span>
                                            {event.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
