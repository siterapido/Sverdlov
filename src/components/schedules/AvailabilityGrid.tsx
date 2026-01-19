'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

interface TimeSlot {
    id: string;
    startTime: string;
    endTime: string;
}

interface DayAvailability {
    dayOfWeek: number;
    slots: TimeSlot[];
}

interface AvailabilityGridProps {
    availability: DayAvailability[];
    onChange: (availability: DayAvailability[]) => void;
    readOnly?: boolean;
}

export function AvailabilityGrid({ availability, onChange, readOnly = false }: AvailabilityGridProps) {
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const addSlot = (dayOfWeek: number) => {
        const updated = [...availability];
        const dayIndex = updated.findIndex(d => d.dayOfWeek === dayOfWeek);
        const newSlot: TimeSlot = { id: crypto.randomUUID(), startTime: '08:00', endTime: '12:00' };

        if (dayIndex >= 0) {
            updated[dayIndex].slots.push(newSlot);
        } else {
            updated.push({ dayOfWeek, slots: [newSlot] });
            updated.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
        }
        onChange(updated);
    };

    const removeSlot = (dayOfWeek: number, slotId: string) => {
        const updated = availability.map(day => {
            if (day.dayOfWeek === dayOfWeek) {
                return { ...day, slots: day.slots.filter(s => s.id !== slotId) };
            }
            return day;
        }).filter(day => day.slots.length > 0);
        onChange(updated);
    };

    const updateSlot = (dayOfWeek: number, slotId: string, field: 'startTime' | 'endTime', value: string) => {
        const updated = availability.map(day => {
            if (day.dayOfWeek === dayOfWeek) {
                return {
                    ...day,
                    slots: day.slots.map(slot => slot.id === slotId ? { ...slot, [field]: value } : slot)
                };
            }
            return day;
        });
        onChange(updated);
    };

    const copyToAllDays = (sourceDayOfWeek: number) => {
        const sourceDay = availability.find(d => d.dayOfWeek === sourceDayOfWeek);
        if (!sourceDay || sourceDay.slots.length === 0) return;

        const updated: DayAvailability[] = [];
        for (let i = 0; i < 7; i++) {
            if (i === sourceDayOfWeek) {
                updated.push(sourceDay);
            } else {
                updated.push({
                    dayOfWeek: i,
                    slots: sourceDay.slots.map(s => ({ ...s, id: crypto.randomUUID() }))
                });
            }
        }
        onChange(updated);
    };

    const getDay = (dayOfWeek: number) => availability.find(d => d.dayOfWeek === dayOfWeek);

    return (
        <div className="space-y-4">
            {/* Grid compacto */}
            <div className="grid grid-cols-7 gap-2">
                {DAYS.map((dayName, dayIndex) => {
                    const day = getDay(dayIndex);
                    const hasSlots = day && day.slots.length > 0;
                    const isSelected = selectedDay === dayIndex;

                    return (
                        <motion.button
                            key={dayIndex}
                            type="button"
                            disabled={readOnly}
                            onClick={() => setSelectedDay(isSelected ? null : dayIndex)}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-none border-2 transition-all min-h-[80px]",
                                readOnly ? "cursor-default" : "cursor-pointer",
                                isSelected
                                    ? "border-primary bg-primary text-white shadow-[4px_4px_0px_0px_rgba(0,82,255,0.1)]"
                                    : hasSlots
                                        ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                                        : "border-zinc-100 bg-white text-zinc-400 hover:border-zinc-900 hover:text-zinc-900"
                            )}
                            whileHover={readOnly ? {} : { y: -2 }}
                            whileTap={readOnly ? {} : { y: 0 }}
                        >
                            <span className="text-[11px] font-black uppercase tracking-widest">{dayName}</span>
                            {hasSlots && (
                                <div className={cn(
                                    "mt-2 text-[9px] font-black uppercase tracking-tight",
                                    isSelected ? "text-white" : "text-emerald-600"
                                )}>
                                    {day.slots.length} HORÁRIO{day.slots.length > 1 ? 'S' : ''}
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Detalhes do dia selecionado */}
            <motion.div
                initial={false}
                animate={{ height: selectedDay !== null ? 'auto' : 0, opacity: selectedDay !== null ? 1 : 0 }}
                className="overflow-hidden"
            >
                {selectedDay !== null && (
                    <div className="bg-white rounded-none p-8 border-2 border-zinc-900 mt-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center justify-between mb-8 border-b border-zinc-50 pb-4">
                            <h4 className="text-sm font-black uppercase tracking-widest text-zinc-900">{DAYS[selectedDay]} — PLANEJAMENTO DE HORÁRIOS</h4>
                            <div className="flex items-center gap-4">
                                {!readOnly && getDay(selectedDay)?.slots.length ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToAllDays(selectedDay)}
                                        leftIcon={<Copy className="w-3 h-3" />}
                                        className="text-[10px] font-black uppercase tracking-widest"
                                    >
                                        REPLICAR
                                    </Button>
                                ) : null}
                                {!readOnly && (
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => addSlot(selectedDay)}
                                        leftIcon={<Plus className="w-3 h-3" />}
                                        className="text-[10px] font-black uppercase tracking-widest"
                                    >
                                        ADICIONAR
                                    </Button>
                                )}
                            </div>
                        </div>

                        {!getDay(selectedDay)?.slots.length ? (
                            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 text-center py-10 border-2 border-dashed border-zinc-100 bg-zinc-50/50">
                                Nenhum registro técnico para este ciclo
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {getDay(selectedDay)?.slots.map(slot => (
                                    <div key={slot.id} className="flex items-center gap-4 p-3 bg-zinc-50 border-2 border-zinc-100 rounded-none group hover:border-zinc-900 transition-all">
                                        <select
                                            value={slot.startTime}
                                            onChange={e => updateSlot(selectedDay, slot.id, 'startTime', e.target.value)}
                                            disabled={readOnly}
                                            className="px-3 py-1.5 text-xs font-black bg-white border-2 border-zinc-200 focus:border-primary outline-none transition-all"
                                        >
                                            {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">ATÉ</span>
                                        <select
                                            value={slot.endTime}
                                            onChange={e => updateSlot(selectedDay, slot.id, 'endTime', e.target.value)}
                                            disabled={readOnly}
                                            className="px-3 py-1.5 text-xs font-black bg-white border-2 border-zinc-200 focus:border-primary outline-none transition-all"
                                        >
                                            {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                        {!readOnly && (
                                            <button
                                                type="button"
                                                onClick={() => removeSlot(selectedDay, slot.id)}
                                                className="ml-auto p-2 text-zinc-300 hover:text-red-600 hover:bg-red-50 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
