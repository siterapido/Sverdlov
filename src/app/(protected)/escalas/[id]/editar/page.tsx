'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, Save, Trash2, AlertCircle, Repeat, Palette } from 'lucide-react';
import Link from 'next/link';
import { getScheduleById, updateSchedule, deleteSchedule } from '@/app/actions/schedules';
import { ScheduleCategory, ScheduleType } from '@/lib/db/schema';

const CATEGORIES = [
    { value: 'vigilancia' as ScheduleCategory, label: 'Vigilância', color: '#ef4444' },
    { value: 'formacao' as ScheduleCategory, label: 'Formação', color: '#3b82f6' },
    { value: 'agitacao' as ScheduleCategory, label: 'Agitação', color: '#f59e0b' },
    { value: 'administrativa' as ScheduleCategory, label: 'Administrativa', color: '#6b7280' },
    { value: 'financeira' as ScheduleCategory, label: 'Financeira', color: '#10b981' },
    { value: 'outras' as ScheduleCategory, label: 'Outras', color: '#8b5cf6' },
];

const TYPES = [
    { value: 'weekly' as ScheduleType, label: 'Semanal', description: 'Repete semanalmente' },
    { value: 'monthly' as ScheduleType, label: 'Mensal', description: 'Repete mensalmente' },
    { value: 'event' as ScheduleType, label: 'Evento', description: 'Ocorrência única' },
    { value: 'permanent' as ScheduleType, label: 'Permanente', description: 'Sem data de término' },
];

export default function EditarEscalaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'outras' as ScheduleCategory,
        type: 'weekly' as ScheduleType,
        startDate: '',
        endDate: '',
        isRecurring: false,
        territoryScope: '',
        color: '#3b82f6',
    });

    useEffect(() => {
        loadSchedule();
    }, [id]);

    async function loadSchedule() {
        setLoading(true);
        const schedule = await getScheduleById(id);
        if (schedule) {
            setFormData({
                name: schedule.name,
                description: schedule.description || '',
                category: schedule.category,
                type: schedule.type,
                startDate: new Date(schedule.startDate).toISOString().split('T')[0],
                endDate: schedule.endDate ? new Date(schedule.endDate).toISOString().split('T')[0] : '',
                isRecurring: schedule.isRecurring || false,
                territoryScope: schedule.territoryScope || '',
                color: schedule.color || '#3b82f6',
            });
        }
        setLoading(false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const result = await updateSchedule(id, {
                name: formData.name,
                description: formData.description || undefined,
                category: formData.category,
                type: formData.type,
                startDate: new Date(formData.startDate),
                endDate: formData.endDate ? new Date(formData.endDate) : undefined,
                isRecurring: formData.isRecurring,
                territoryScope: formData.territoryScope || undefined,
                color: formData.color,
            });
            if (result.success) {
                router.push(`/escalas/${id}`);
            } else {
                setError(result.error || 'Erro ao atualizar escala');
            }
        } catch {
            setError('Erro inesperado');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir esta escala? Esta ação não pode ser desfeita.')) return;
        setSaving(true);
        await deleteSchedule(id);
        router.push('/escalas');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/escalas/${id}`} className="p-2 hover:bg-gray-100 rounded-none">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Editar Escala</h1>
                            <p className="text-sm text-gray-500">{formData.name}</p>
                        </div>
                    </div>
                    <button onClick={handleDelete} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-none">
                        <Trash2 className="w-4 h-4" />Excluir
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-none text-red-700">
                            <AlertCircle className="w-5 h-5" />{error}
                        </div>
                    )}

                    <div className="bg-white rounded-none border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900"><Calendar className="w-5 h-5 text-red-500" />Informações Básicas</h2>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Nome *</label>
                            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-none text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Descrição</label>
                            <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-none resize-none text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-none border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900"><Palette className="w-5 h-5 text-red-500" />Categoria</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {CATEGORIES.map(c => (
                                <button key={c.value} type="button" onClick={() => setFormData({ ...formData, category: c.value, color: c.color })}
                                    className={`p-4 rounded-none border-2 text-left ${formData.category === c.value ? 'shadow-lg' : 'border-gray-200'}`}
                                    style={{ borderColor: formData.category === c.value ? c.color : undefined }}>
                                    <div className="w-4 h-4 rounded-full mb-2" style={{ backgroundColor: c.color }} />
                                    <span className="text-sm font-medium text-gray-900">{c.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-none border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900"><Repeat className="w-5 h-5 text-red-500" />Tipo</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {TYPES.map(t => (
                                <button key={t.value} type="button" onClick={() => setFormData({ ...formData, type: t.value })}
                                    className={`p-4 rounded-none border-2 text-left ${formData.type === t.value ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                                    <span className="text-sm font-medium text-gray-900">{t.label}</span>
                                    <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                                </button>
                            ))}
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={formData.isRecurring} onChange={e => setFormData({ ...formData, isRecurring: e.target.checked })} className="w-5 h-5 rounded text-red-500 border-gray-300 focus:ring-red-500" />
                            <span className="text-sm text-gray-700">Escala recorrente</span>
                        </label>
                    </div>

                    <div className="bg-white rounded-none border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900"><Clock className="w-5 h-5 text-red-500" />Período</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Início *</label>
                                <input type="date" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-none text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Término</label>
                                <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} min={formData.startDate}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-none text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-none border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900"><MapPin className="w-5 h-5 text-red-500" />Território</h2>
                        <input type="text" value={formData.territoryScope} onChange={e => setFormData({ ...formData, territoryScope: e.target.value })} placeholder="Ex: SP ou SP:São Paulo"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-none text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Link href={`/escalas/${id}`} className="px-6 py-3 hover:bg-gray-100 rounded-none font-medium text-gray-700">Cancelar</Link>
                        <button type="submit" disabled={saving || !formData.name} className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-none hover:bg-red-600 disabled:opacity-50">
                            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </motion.form>
            </main>
        </div>
    );
}
