'use client';

import { useState } from 'react';
import { createAvailabilityRequest, submitAvailabilityDirect } from '@/app/actions/availability';
import { Button } from '@/components/ui/button';
import { X, Copy, Check, Calendar, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RequestAvailabilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    members: any[];
}

export function RequestAvailabilityModal({ isOpen, onClose, members = [] }: RequestAvailabilityModalProps) {
    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState<'7_days' | '15_days' | '30_days'>('7_days');
    const [link, setLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [selectedMember, setSelectedMember] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Direct filling mode
    const [mode, setMode] = useState<'initial' | 'direct' | 'link'>('initial');
    const [days, setDays] = useState<any[]>([]);

    const handleGenerate = async () => {
        if (!selectedMember) return;
        setLoading(true);
        try {
            const res = await createAvailabilityRequest(selectedMember, period);
            if (res.success && res.token) {
                const url = `${window.location.origin}/availability/${res.token}`;
                setLink(url);
                setMode('link');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handlePreencherAgora = () => {
        if (!selectedMember) return;
        const count = period === '7_days' ? 7 : period === '15_days' ? 15 : 30;
        const today = new Date();
        const arr = [];
        for (let i = 0; i < count; i++) {
            const date = addDays(today, i);
            arr.push({
                date: format(date, 'yyyy-MM-dd'),
                display: format(date, "dd/MM ' ('eee')'", { locale: ptBR }),
                status: 'available',
            });
        }
        setDays(arr);
        setMode('direct');
    };

    const toggleStatus = (index: number) => {
        const newDays = [...days];
        newDays[index].status = newDays[index].status === 'available' ? 'unavailable' : 'available';
        setDays(newDays);
    };

    const handleSaveDirect = async () => {
        setLoading(true);
        try {
            const availabilityData = days.map(d => ({
                date: d.date,
                type: d.status,
            }));
            const res = await submitAvailabilityDirect(selectedMember, availabilityData);
            if (res.success) {
                onClose();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const filteredMembers = members.filter(m => m.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!isOpen) return null;

    const selectedMemberData = members.find(m => m.id === selectedMember);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-md p-6 border-2 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden"
            >
                <div className="flex justify-between items-start mb-6 border-b border-zinc-100 pb-4">
                    <div className="flex items-center gap-2">
                        {mode !== 'initial' && (
                            <button onClick={() => setMode('initial')} className="hover:bg-zinc-100 p-1 rounded-full transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        )}
                        <h2 className="text-xl font-black uppercase tracking-tight">
                            {mode === 'direct' ? 'Disponibilidade' : 'Solicitar'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="hover:bg-zinc-100 p-1 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {mode === 'initial' && (
                        <motion.div
                            key="initial"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Selecione o Filiado</label>
                                <input
                                    className="w-full p-3 text-sm border-2 border-zinc-200 mb-2 focus:border-zinc-900 outline-none transition-all placeholder:text-zinc-400 font-medium"
                                    placeholder="Buscar filiado..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                <select
                                    className="w-full p-2 border-2 border-zinc-200 text-sm focus:border-zinc-900 outline-none custom-scrollbar"
                                    value={selectedMember}
                                    onChange={e => setSelectedMember(e.target.value)}
                                    size={5}
                                >
                                    {filteredMembers.map(m => (
                                        <option key={m.id} value={m.id} className="p-2 cursor-pointer hover:bg-zinc-50 font-bold uppercase text-[11px] tracking-tight">
                                            {m.fullName}
                                        </option>
                                    ))}
                                    {filteredMembers.length === 0 && <option disabled>Nenhum membro encontrado</option>}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Período de Análise</label>
                                <div className="flex gap-2">
                                    {['7_days', '15_days', '30_days'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setPeriod(p as any)}
                                            className={`flex-1 py-3 text-[10px] font-black uppercase border-2 transition-all ${period === p ? 'border-primary bg-primary/5 text-primary shadow-[2px_2px_0px_0px_rgba(155,17,30,0.1)]' : 'border-zinc-100 text-zinc-400 hover:border-zinc-300'}`}
                                        >
                                            {p.replace('_days', ' Dias')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-8">
                                <Button
                                    onClick={handleGenerate}
                                    disabled={loading || !selectedMember}
                                    variant="outline"
                                    className="rounded-none font-black uppercase border-2 border-zinc-900 h-12 text-xs tracking-widest hover:bg-zinc-50"
                                >
                                    {loading ? '...' : 'Link Público'}
                                </Button>
                                <Button
                                    onClick={handlePreencherAgora}
                                    disabled={loading || !selectedMember}
                                    className="rounded-none font-black uppercase h-12 text-xs tracking-widest"
                                >
                                    Direto na UI
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {mode === 'direct' && (
                        <motion.div
                            key="direct"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-3 p-3 bg-zinc-50 border-2 border-zinc-100">
                                <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-black">
                                    {selectedMemberData?.fullName?.[0]}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900 leading-none">
                                        {selectedMemberData?.fullName}
                                    </p>
                                    <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                                        Período de {period.replace('_days', '')} dias
                                    </p>
                                </div>
                            </div>

                            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {days.map((day, idx) => (
                                    <div key={day.date} className="flex items-center justify-between p-3 border-2 border-zinc-100 bg-white hover:border-zinc-200 transition-all">
                                        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{day.display}</span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => toggleStatus(idx)}
                                                className={`px-3 py-1.5 text-[9px] font-black uppercase border-2 transition-all ${day.status === 'available'
                                                    ? 'bg-emerald-500 text-white border-emerald-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]'
                                                    : 'bg-white text-zinc-300 border-zinc-100 hover:border-zinc-300'
                                                    }`}
                                            >
                                                Livre
                                            </button>
                                            <button
                                                onClick={() => toggleStatus(idx)}
                                                className={`px-3 py-1.5 text-[9px] font-black uppercase border-2 transition-all ${day.status === 'unavailable'
                                                    ? 'bg-red-500 text-white border-red-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]'
                                                    : 'bg-white text-zinc-300 border-zinc-100 hover:border-zinc-300'
                                                    }`}
                                            >
                                                Ocupado
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={handleSaveDirect}
                                disabled={loading}
                                className="w-full rounded-none font-black uppercase mt-4 h-12 text-xs tracking-widest"
                            >
                                {loading ? 'Salvando...' : 'Confirmar Disponibilidade'}
                            </Button>
                        </motion.div>
                    )}

                    {mode === 'link' && (
                        <motion.div
                            key="link"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <div className="p-4 bg-emerald-50 border-2 border-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest text-center">
                                Link gerado com sucesso! Envie para o filiado.
                            </div>
                            <div className="flex gap-2">
                                <input readOnly value={link} className="flex-1 p-3 text-[10px] font-medium border-2 border-zinc-100 bg-zinc-50 outline-none focus:border-zinc-900 transition-all" />
                                <Button onClick={copyToClipboard} size="icon" variant="outline" className="shrink-0 border-2 border-zinc-900 rounded-none h-auto px-4">
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                            <Button variant="ghost" onClick={() => setMode('initial')} className="w-full mt-2 text-[10px] uppercase font-black tracking-widest text-zinc-400 hover:text-zinc-900">Voltar para seleção</Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
