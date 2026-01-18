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
                                "flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all min-h-[70px]",
                                readOnly ? "cursor-default" : "cursor-pointer",
                                isSelected
                                    ? "border-accent bg-accent-light text-accent"
                                    : hasSlots
                                        ? "border-success-light bg-success-light/30 text-fg-primary"
                                        : "border-border-default bg-bg-primary text-fg-secondary hover:border-border-strong"
                            )}
                            whileHover={readOnly ? {} : { scale: 1.02 }}
                            whileTap={readOnly ? {} : { scale: 0.98 }}
                        >
                            <span className="text-xs font-medium uppercase tracking-wide">{dayName}</span>
                            {hasSlots && (
                                <div className={cn(
                                    "mt-1 text-[10px] font-medium",
                                    isSelected ? "text-accent" : "text-success"
                                )}>
                                    {day.slots.length} horário{day.slots.length > 1 ? 's' : ''}
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
                    <div className="bg-bg-secondary rounded-lg p-4 border border-border-default mt-2">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-fg-primary">{DAYS[selectedDay]} - Horários Disponíveis</h4>
                            <div className="flex items-center gap-2">
                                {!readOnly && getDay(selectedDay)?.slots.length ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToAllDays(selectedDay)}
                                        leftIcon={<Copy className="w-3 h-3" />}
                                    >
                                        Copiar para todos
                                    </Button>
                                ) : null}
                                {!readOnly && (
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => addSlot(selectedDay)}
                                        leftIcon={<Plus className="w-3 h-3" />}
                                    >
                                        Adicionar
                                    </Button>
                                )}
                            </div>
                        </div>

                        {!getDay(selectedDay)?.slots.length ? (
                            <p className="text-sm text-fg-muted text-center py-6 border border-dashed border-border-default rounded-lg">
                                Nenhum horário cadastrado para este dia
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {getDay(selectedDay)?.slots.map(slot => (
                                    <div key={slot.id} className="flex items-center gap-3 p-2 bg-bg-primary border border-border-default rounded-md">
                                        <select
                                            value={slot.startTime}
                                            onChange={e => updateSlot(selectedDay, slot.id, 'startTime', e.target.value)}
                                            disabled={readOnly}
                                            className="px-2 py-1 text-sm border border-border-default rounded bg-bg-secondary focus:border-accent outline-none"
                                        >
                                            {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                        <span className="text-fg-tertiary text-xs">até</span>
                                        <select
                                            value={slot.endTime}
                                            onChange={e => updateSlot(selectedDay, slot.id, 'endTime', e.target.value)}
                                            disabled={readOnly}
                                            className="px-2 py-1 text-sm border border-border-default rounded bg-bg-secondary focus:border-accent outline-none"
                                        >
                                            {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                        {!readOnly && (
                                            <button
                                                type="button"
                                                onClick={() => removeSlot(selectedDay, slot.id)}
                                                className="ml-auto p-1.5 text-fg-tertiary hover:text-danger hover:bg-danger-light rounded-md transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
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
