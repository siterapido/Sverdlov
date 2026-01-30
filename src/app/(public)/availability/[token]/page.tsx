'use client';

import { useState, useEffect } from 'react';
import { getAvailabilityRequest, submitAvailability } from '@/app/actions/availability';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AvailabilityPage({ params }: { params: Promise<{ token: string }> }) {
    const [token, setToken] = useState<string>('');
    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [days, setDays] = useState<any[]>([]);

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
        } else {
            // Handle error
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
                status: 'available', // default
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
            const availabilityData = days.map(d => ({
                date: d.date,
                type: d.status,
            }));
            const res = await submitAvailability(token, availabilityData);
            if (res.success) {
                alert('Disponibilidade enviada com sucesso!');
                window.close(); // Or redirect
            } else {
                alert('Erro ao enviar.');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-10 flex justifying-center">Carregando...</div>;
    if (!request) return <div className="p-10 text-red-500">Solicitação inválida ou expirada.</div>;

    return (
        <div className="bg-zinc-50 min-h-screen py-10 px-4">
            <div className="max-w-md mx-auto bg-white border-2 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                <h1 className="text-xl font-black uppercase text-center mb-2">Informe sua Disponibilidade</h1>
                <p className="text-center text-sm text-zinc-500 mb-6">Olá <strong>{request.member.fullName}</strong>, por favor confirme seus dias disponíveis para as próximas escalas.</p>

                <div className="space-y-3 mb-8">
                    {days.map((day, idx) => (
                        <div key={day.date} className="flex items-center justify-between p-3 border border-zinc-200 bg-zinc-50/50">
                            <span className="text-sm font-bold uppercase">{day.display}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleStatus(idx)}
                                    className={`px-3 py-1 text-xs font-bold uppercase border-2 ${day.status === 'available'
                                        ? 'bg-green-500 text-white border-green-700'
                                        : 'bg-white text-zinc-300 border-zinc-200'
                                        }`}
                                >
                                    Disponível
                                </button>
                                <button
                                    onClick={() => toggleStatus(idx)}
                                    className={`px-3 py-1 text-xs font-bold uppercase border-2 ${day.status === 'unavailable'
                                        ? 'bg-red-500 text-white border-red-700'
                                        : 'bg-white text-zinc-300 border-zinc-200'
                                        }`}
                                >
                                    Ocupado
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full bg-primary text-white font-black uppercase tracking-widest py-6 rounded-none text-lg hover:brightness-110"
                >
                    {submitting ? 'Enviando...' : 'Confirmar Disponibilidade'}
                </Button>
            </div>
        </div>
    );
}
