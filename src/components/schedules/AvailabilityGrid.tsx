'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Copy, Trash2 } from 'lucide-react';

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

                    return (
                        <motion.button
                            key={dayIndex}
                            type="button"
                            disabled={readOnly}
                            onClick={() => setSelectedDay(selectedDay === dayIndex ? null : dayIndex)}
                            className={`p-3 rounded-xl border-2 text-center transition-all ${selectedDay === dayIndex
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : hasSlots
                                        ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                            whileHover={readOnly ? {} : { scale: 1.02 }}
                            whileTap={readOnly ? {} : { scale: 0.98 }}
                        >
                            <span className="text-sm font-medium">{dayName}</span>
                            {hasSlots && (
                                <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                                    {day.slots.length} horário{day.slots.length > 1 ? 's' : ''}
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Detalhes do dia selecionado */}
            {selectedDay !== null && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">{DAYS[selectedDay]} - Horários Disponíveis</h4>
                        <div className="flex items-center gap-2">
                            {!readOnly && getDay(selectedDay)?.slots.length && (
                                <button
                                    type="button"
                                    onClick={() => copyToAllDays(selectedDay)}
                                    className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                >
                                    <Copy className="w-3 h-3" />
                                    Copiar para todos
                                </button>
                            )}
                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={() => addSlot(selectedDay)}
                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600"
                                >
                                    <Plus className="w-3 h-3" />
                                    Adicionar
                                </button>
                            )}
                        </div>
                    </div>

                    {!getDay(selectedDay)?.slots.length ? (
                        <p className="text-sm text-gray-500 text-center py-4">Nenhum horário cadastrado</p>
                    ) : (
                        <div className="space-y-2">
                            {getDay(selectedDay)?.slots.map(slot => (
                                <div key={slot.id} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg">
                                    <select
                                        value={slot.startTime}
                                        onChange={e => updateSlot(selectedDay, slot.id, 'startTime', e.target.value)}
                                        disabled={readOnly}
                                        className="px-2 py-1 text-sm border rounded bg-gray-50 dark:bg-gray-700"
                                    >
                                        {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                    <span className="text-gray-400">até</span>
                                    <select
                                        value={slot.endTime}
                                        onChange={e => updateSlot(selectedDay, slot.id, 'endTime', e.target.value)}
                                        disabled={readOnly}
                                        className="px-2 py-1 text-sm border rounded bg-gray-50 dark:bg-gray-700"
                                    >
                                        {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                    {!readOnly && (
                                        <button
                                            type="button"
                                            onClick={() => removeSlot(selectedDay, slot.id)}
                                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
