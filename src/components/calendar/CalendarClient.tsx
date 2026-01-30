'use client';

import { useState, useEffect } from 'react';
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval, 
    isSameMonth, 
    isSameDay, 
    addMonths, 
    subMonths,
    parseISO,
    isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Filter, Users, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSlotsByDateRange } from '@/app/actions/schedule-slots';

interface Slot {
    id: string;
    name: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    scheduleName: string;
    scheduleCategory: string;
    scheduleColor: string;
}

export function CalendarClient() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(true);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: ptBR });
    const endDate = endOfWeek(monthEnd, { locale: ptBR });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    useEffect(() => {
        const fetchSlots = async () => {
            setLoading(true);
            const startStr = format(startDate, 'yyyy-MM-dd');
            const endStr = format(endDate, 'yyyy-MM-dd');
            const result = await getSlotsByDateRange(startStr, endStr);
            setSlots(result as any[]);
            setLoading(false);
        };
        fetchSlots();
    }, [currentMonth]);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const getSlotsForDay = (day: Date) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        return slots.filter(s => s.date === dayStr);
    };

    return (
        <div className="space-y-8">
            {/* Calendar Toolbar */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex border-2 border-zinc-900 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <button 
                            onClick={prevMonth}
                            className="p-3 bg-white hover:bg-zinc-50 border-r-2 border-zinc-900 transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="px-6 py-3 bg-white flex items-center min-w-[200px] justify-center">
                            <span className="font-black uppercase tracking-tighter text-lg text-zinc-900">
                                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                            </span>
                        </div>
                        <button 
                            onClick={nextMonth}
                            className="p-3 bg-white hover:bg-zinc-50 border-l-2 border-zinc-900 transition-colors"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                    <Button 
                        variant="outline"
                        onClick={() => setCurrentMonth(new Date())}
                        className="border-2 border-zinc-900 rounded-none font-black uppercase tracking-widest text-[10px] h-12 px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-none transition-all"
                    >
                        HOJE
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-1 border-2 border-zinc-900 bg-white px-3 py-2">
                        <Filter className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mr-2">Filtrar:</span>
                        <select className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer">
                            <option>Todas as Categorias</option>
                            <option>Vigilância</option>
                            <option>Formação</option>
                            <option>Agitação</option>
                        </select>
                    </div>
                    <Button className="bg-primary hover:brightness-110 text-white border-2 border-primary rounded-none font-black uppercase tracking-widest text-[10px] h-12 px-6 shadow-[4px_4px_0px_0px_rgba(155,17,30,0.1)] transition-all active:translate-y-0.5 active:shadow-none">
                        <Plus className="h-4 w-4 mr-2" />
                        NOVA ESCALA
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white border-2 border-zinc-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)]">
                {/* Day Names */}
                <div className="grid grid-cols-7 border-b-2 border-zinc-900 bg-zinc-900 text-white">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                        <div key={day} className="py-3 text-center text-[10px] font-black uppercase tracking-[0.2em]">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 auto-rows-[minmax(140px,auto)] divide-x-2 divide-y-2 divide-zinc-100 border-b-2 border-zinc-100">
                    {calendarDays.map((day, idx) => {
                        const daySlots = getSlotsForDay(day);
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        
                        return (
                            <div 
                                key={day.toString()} 
                                className={`p-3 transition-colors hover:bg-zinc-50/50 flex flex-col gap-2 ${!isCurrentMonth ? 'bg-zinc-50/30' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-sm font-black tabular-nums ${
                                        isToday(day) 
                                            ? 'h-7 w-7 bg-primary text-white flex items-center justify-center -mt-1 -ml-1' 
                                            : !isCurrentMonth ? 'text-zinc-300' : 'text-zinc-900'
                                    }`}>
                                        {format(day, 'd')}
                                    </span>
                                    {daySlots.length > 0 && (
                                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                                            {daySlots.length} Turnos
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1.5 overflow-hidden">
                                    {daySlots.slice(0, 3).map(slot => (
                                        <div 
                                            key={slot.id}
                                            className="group relative cursor-pointer"
                                        >
                                            <div 
                                                className="h-1 absolute left-0 top-0 bottom-0 w-0.5 rounded-full" 
                                                style={{ backgroundColor: slot.scheduleColor }} 
                                            />
                                            <div 
                                                className="pl-2 pr-1.5 py-1 text-[9px] font-bold uppercase tracking-tight leading-tight truncate hover:bg-white hover:border border-zinc-200 transition-all"
                                                style={{ color: slot.scheduleColor }}
                                            >
                                                {slot.startTime.substring(0, 5)} {slot.scheduleName}
                                            </div>
                                        </div>
                                    ))}
                                    {daySlots.length > 3 && (
                                        <div className="text-[9px] font-black text-primary uppercase tracking-widest pl-2 pt-1">
                                            + {daySlots.length - 3} mais
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend / Info */}
            <div className="flex flex-wrap gap-6 pt-4 border-t border-zinc-100">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-red-500 rounded-none border border-zinc-900" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Agitação</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-primary/100 rounded-none border border-zinc-900" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Vigilância</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-emerald-500 rounded-none border border-zinc-900" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Formação</span>
                </div>
            </div>
        </div>
    );
}
