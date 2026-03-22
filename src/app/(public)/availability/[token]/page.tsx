'use client';

import { useState, useEffect } from 'react';
import { getAvailabilityRequest, submitAvailability, saveShiftAvailabilityPublic } from '@/app/actions/availability';
import { Button } from '@/components/ui/button';
import { ShiftAvailabilityGrid, cellsToAvailability, availabilityToCells } from '@/components/schedules/ShiftAvailabilityGrid';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type ViewMode = 'shifts' | 'dates';

export default function AvailabilityPage({ params }: { params: Promise<{ token: string }> }) {
    const [token, setToken] = useState<string>('');
    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('shifts');
    const [days, setDays] = useState<any[]>([]);
    const [shiftCells, setShiftCells] = useState<any[]>([]);

    useEffect(() => {
        params.then(p => {
            setToken(p.token);
            loadRequest(p.token);
        });
    }, []);

    const loadRequest = async (t: string) => {
        const res = await getAvailabilityRequest(t);
        if (res.success && res.data) {
            setRequest(res.data);
            generateDays(res.data.period);
        }
        setLoading(false);
    };

    const generateDays = (period: string) => {
        const count = period === '7_days' ? 7 : period === '15_days' ? 15 : 30;
        const today = new Date();
        const arr = [];
        for (let i = 0; i < count; i++) {
            const date = addDays(today, i);
            arr.push({
                date: format(date, 'yyyy-MM-dd'),
                display: format(date, 'dd/MM (EEEE)', { locale: ptBR }),
                status: 'available',
                startTime: null,
                endTime: null,
            });
        }
        setDays(arr);
    };

    const toggleStatus = (index: number) => {
        const newDays = [...days];
        newDays[index].status = newDays[index].status === 'available' ? 'unavailable' : 'available';
        setDays(newDays);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            let res;
            if (viewMode === 'shifts') {
                const shifts = cellsToAvailability(shiftCells, '');
                res = await saveShiftAvailabilityPublic(token, shifts);
            } else {
                const availabilityData = days.map(d => ({
                    date: d.date,
                    type: d.status,
                }));
                res = await submitAvailability(token, availabilityData);
            }
            if (res.success) {
                setSubmitted(true);
            } else {
                alert(res.error || 'Erro ao enviar.');
            }
        } catch (e) {
            console.error(e);
            alert('Erro ao enviar.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="bg-zinc-50 min-h-screen flex items-center justify-center">
            <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest">Carregando...</p>
        </div>
    );

    if (!request) return (
        <div className="bg-zinc-50 min-h-screen flex items-center justify-center">
            <div className="max-w-sm mx-auto text-center p-8 bg-white border-2 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-red-600 font-bold uppercase">Solicitação inválida ou expirada.</p>
            </div>
        </div>
    );

    if (submitted) return (
        <div className="bg-zinc-50 min-h-screen flex items-center justify-center">
            <div className="max-w-sm mx-auto text-center p-8 bg-white border-2 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="h-16 w-16 bg-emerald-500 flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-black">✓</span>
                </div>
                <h2 className="text-lg font-black uppercase mb-2">Disponibilidade Enviada!</h2>
                <p className="text-sm text-zinc-500">Obrigado, <strong>{request.member.fullName}</strong>. Sua disponibilidade foi registrada com sucesso.</p>
            </div>
        </div>
    );

    return (
        <div className="bg-zinc-50 min-h-screen py-10 px-4">
            <div className="max-w-xl mx-auto bg-white border-2 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                {/* Header */}
                <div className="px-6 py-5 border-b-2 border-zinc-900 bg-zinc-900">
                    <h1 className="text-lg font-black uppercase text-white text-center tracking-widest">
                        Disponibilidade
                    </h1>
                </div>

                <div className="p-6">
                    <p className="text-center text-sm text-zinc-500 mb-6">
                        Olá <strong>{request.member.fullName}</strong>, informe sua disponibilidade semanal por turno ou para datas específicas.
                    </p>

                    {/* View mode toggle */}
                    <div className="flex border-2 border-zinc-200 mb-6">
                        <button
                            onClick={() => setViewMode('shifts')}
                            className={cn(
                                "flex-1 py-2.5 text-xs font-black uppercase tracking-wider transition-all",
                                viewMode === 'shifts'
                                    ? "bg-zinc-900 text-white"
                                    : "bg-white text-zinc-400 hover:text-zinc-600"
                            )}
                        >
                            Grade de Turnos
                        </button>
                        <button
                            onClick={() => setViewMode('dates')}
                            className={cn(
                                "flex-1 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-l-2 border-zinc-200",
                                viewMode === 'dates'
                                    ? "bg-zinc-900 text-white"
                                    : "bg-white text-zinc-400 hover:text-zinc-600"
                            )}
                        >
                            Datas Específicas
                        </button>
                    </div>

                    {viewMode === 'shifts' ? (
                        <ShiftAvailabilityGrid
                            onChange={(cells) => setShiftCells(cells)}
                        />
                    ) : (
                        <div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto">
                            {days.map((day, idx) => (
                                <div key={day.date} className="flex items-center justify-between p-3 border border-zinc-200 bg-zinc-50/50">
                                    <span className="text-sm font-bold uppercase">{day.display}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleStatus(idx)}
                                            className={cn(
                                                "px-3 py-1 text-xs font-bold uppercase border-2 transition-all",
                                                day.status === 'available'
                                                    ? 'bg-emerald-500 text-white border-emerald-700'
                                                    : 'bg-white text-zinc-300 border-zinc-200'
                                            )}
                                        >
                                            Disponível
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(idx)}
                                            className={cn(
                                                "px-3 py-1 text-xs font-bold uppercase border-2 transition-all",
                                                day.status === 'unavailable'
                                                    ? 'bg-red-500 text-white border-red-700'
                                                    : 'bg-white text-zinc-300 border-zinc-200'
                                            )}
                                        >
                                            Ocupado
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full bg-primary text-white font-black uppercase tracking-widest py-6 rounded-none text-lg hover:brightness-110 mt-6"
                    >
                        {submitting ? 'Enviando...' : 'Confirmar Disponibilidade'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
