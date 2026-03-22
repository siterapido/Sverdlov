'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ShiftCell {
    dayOfWeek: number;
    shift: 'manha' | 'tarde' | 'noite';
    active: boolean;
    startTime?: string;
    endTime?: string;
}

interface ShiftAvailabilityGridProps {
    value?: ShiftCell[];
    onChange?: (cells: ShiftCell[]) => void;
    readOnly?: boolean;
}

const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const dayValues = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun (0=Sunday in JS)

const shiftConfig = [
    { id: 'manha' as const, label: 'Manhã', defaultStart: '06:00', defaultEnd: '12:00' },
    { id: 'tarde' as const, label: 'Tarde', defaultStart: '12:00', defaultEnd: '18:00' },
    { id: 'noite' as const, label: 'Noite', defaultStart: '18:00', defaultEnd: '23:59' },
];

function getInitialCells(existing?: ShiftCell[]): ShiftCell[] {
    const cells: ShiftCell[] = [];
    for (const shift of shiftConfig) {
        for (const day of dayValues) {
            const existing_cell = existing?.find(c => c.dayOfWeek === day && c.shift === shift.id);
            cells.push({
                dayOfWeek: day,
                shift: shift.id,
                active: existing_cell?.active || false,
                startTime: existing_cell?.startTime || shift.defaultStart,
                endTime: existing_cell?.endTime || shift.defaultEnd,
            });
        }
    }
    return cells;
}

export function ShiftAvailabilityGrid({ value, onChange, readOnly = false }: ShiftAvailabilityGridProps) {
    const [cells, setCells] = useState<ShiftCell[]>(() => getInitialCells(value));

    const toggleCell = (dayOfWeek: number, shift: 'manha' | 'tarde' | 'noite') => {
        if (readOnly) return;
        const updated = cells.map(c =>
            c.dayOfWeek === dayOfWeek && c.shift === shift
                ? { ...c, active: !c.active }
                : c
        );
        setCells(updated);
        onChange?.(updated.filter(c => c.active));
    };

    const getCell = (dayOfWeek: number, shift: 'manha' | 'tarde' | 'noite') => {
        return cells.find(c => c.dayOfWeek === dayOfWeek && c.shift === shift);
    };

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="w-20 p-2 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                Turno
                            </th>
                            {dayNames.map((day, idx) => (
                                <th key={day} className="p-2 text-center text-[10px] font-black uppercase tracking-wider text-zinc-600">
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {shiftConfig.map(shift => (
                            <tr key={shift.id}>
                                <td className="p-2 text-xs font-bold text-zinc-500 whitespace-nowrap">
                                    {shift.label}
                                    <span className="block text-[9px] text-zinc-300 font-normal">
                                        {shift.defaultStart}-{shift.defaultEnd}
                                    </span>
                                </td>
                                {dayValues.map((day, idx) => {
                                    const cell = getCell(day, shift.id);
                                    const isActive = cell?.active || false;
                                    return (
                                        <td key={day} className="p-1">
                                            <button
                                                onClick={() => toggleCell(day, shift.id)}
                                                disabled={readOnly}
                                                className={cn(
                                                    "w-full h-12 border-2 transition-all text-xs font-bold uppercase",
                                                    isActive
                                                        ? "bg-emerald-500 text-white border-emerald-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                                                        : "bg-white border-zinc-200 text-zinc-300 hover:border-zinc-400",
                                                    readOnly && "cursor-default"
                                                )}
                                            >
                                                {isActive ? 'OK' : '-'}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center gap-4 text-[10px] font-bold uppercase text-zinc-400">
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-emerald-500 border border-emerald-600" />
                    Disponível
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-white border-2 border-zinc-200" />
                    Indisponível
                </div>
            </div>
        </div>
    );
}

// Helper to convert grid cells to memberAvailability format
export function cellsToAvailability(cells: ShiftCell[], memberId: string) {
    return cells.filter(c => c.active).map(c => {
        const shift = shiftConfig.find(s => s.id === c.shift)!;
        return {
            memberId,
            dayOfWeek: c.dayOfWeek,
            shift: c.shift,
            startTime: c.startTime || shift.defaultStart,
            endTime: c.endTime || shift.defaultEnd,
            isAvailable: true,
        };
    });
}

// Helper to convert memberAvailability to grid cells
export function availabilityToCells(availability: any[]): ShiftCell[] {
    return availability.map(a => ({
        dayOfWeek: a.dayOfWeek,
        shift: a.shift || deriveShift(a.startTime),
        active: a.isAvailable !== false,
        startTime: a.startTime,
        endTime: a.endTime,
    }));
}

function deriveShift(startTime: string): 'manha' | 'tarde' | 'noite' {
    if (!startTime) return 'manha';
    const hour = parseInt(startTime.split(':')[0]);
    if (hour < 12) return 'manha';
    if (hour < 18) return 'tarde';
    return 'noite';
}
