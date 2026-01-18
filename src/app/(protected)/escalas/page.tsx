'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Plus,
    Search,
    Filter,
    CalendarDays,
    Clock,
    Users,
    MapPin,
    MoreVertical,
    ChevronRight,
    AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { getSchedules, ScheduleFilters } from '@/app/actions/schedules';
import { Schedule } from '@/lib/db/schema';

// Cores por categoria
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    vigilancia: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
    formacao: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
    agitacao: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
    administrativa: { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20' },
    financeira: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
    outras: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' },
};

const CATEGORY_LABELS: Record<string, string> = {
    vigilancia: 'Vigilância',
    formacao: 'Formação',
    agitacao: 'Agitação',
    administrativa: 'Administrativa',
    financeira: 'Financeira',
    outras: 'Outras',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    draft: { label: 'Rascunho', color: 'text-gray-500' },
    active: { label: 'Ativa', color: 'text-green-500' },
    completed: { label: 'Concluída', color: 'text-blue-500' },
    cancelled: { label: 'Cancelada', color: 'text-red-500' },
};

export default function EscalasPage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<ScheduleFilters>({});
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadSchedules();
    }, [filters]);

    async function loadSchedules() {
        setLoading(true);
        const data = await getSchedules({ ...filters, search: searchTerm });
        setSchedules(data);
        setLoading(false);
    }

    const handleSearch = () => {
        loadSchedules();
    };

    const filteredSchedules = searchTerm
        ? schedules.filter(
            (s) =>
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : schedules;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <Calendar className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Escalas de Trabalho
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Gerencie turnos e atribuições de membros
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/escalas/calendario"
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <CalendarDays className="w-4 h-4" />
                                <span className="hidden sm:inline">Calendário</span>
                            </Link>
                            <Link
                                href="/escalas/minha-agenda"
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <Clock className="w-4 h-4" />
                                <span className="hidden sm:inline">Minha Agenda</span>
                            </Link>
                            <Link
                                href="/escalas/nova"
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Nova Escala</span>
                            </Link>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="mt-4 flex items-center gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar escalas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${showFilters
                                    ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                    : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filtros</span>
                        </button>
                    </div>

                    {/* Filter Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={filters.status || ''}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    status: e.target.value as Schedule['status'] || undefined,
                                                })
                                            }
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                        >
                                            <option value="">Todos</option>
                                            <option value="active">Ativas</option>
                                            <option value="draft">Rascunhos</option>
                                            <option value="completed">Concluídas</option>
                                            <option value="cancelled">Canceladas</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Categoria
                                        </label>
                                        <select
                                            value={filters.category || ''}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    category: e.target.value as Schedule['category'] || undefined,
                                                })
                                            }
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                        >
                                            <option value="">Todas</option>
                                            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Tipo
                                        </label>
                                        <select
                                            value={filters.type || ''}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    type: e.target.value as Schedule['type'] || undefined,
                                                })
                                            }
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                        >
                                            <option value="">Todos</option>
                                            <option value="weekly">Semanal</option>
                                            <option value="monthly">Mensal</option>
                                            <option value="event">Evento</option>
                                            <option value="permanent">Permanente</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            onClick={() => setFilters({})}
                                            className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                        >
                                            Limpar Filtros
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                                key={i}
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse"
                            >
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : filteredSchedules.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Nenhuma escala encontrada
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {searchTerm || Object.keys(filters).length > 0
                                ? 'Tente ajustar os filtros de busca'
                                : 'Comece criando sua primeira escala de trabalho'}
                        </p>
                        <Link
                            href="/escalas/nova"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Criar Nova Escala
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSchedules.map((schedule, index) => (
                            <ScheduleCard key={schedule.id} schedule={schedule} index={index} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

// Componente de Card de Escala
function ScheduleCard({ schedule, index }: { schedule: Schedule; index: number }) {
    const categoryColors = CATEGORY_COLORS[schedule.category] || CATEGORY_COLORS.outras;
    const statusInfo = STATUS_LABELS[schedule.status] || STATUS_LABELS.draft;

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link href={`/escalas/${schedule.id}`}>
                <div
                    className={`group relative bg-white dark:bg-gray-800 rounded-xl border ${categoryColors.border} hover:shadow-lg transition-all duration-300 overflow-hidden`}
                >
                    {/* Category Strip */}
                    <div
                        className={`h-1.5 w-full`}
                        style={{ backgroundColor: schedule.color || '#3b82f6' }}
                    />

                    <div className="p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-red-500 transition-colors line-clamp-1">
                                    {schedule.name}
                                </h3>
                                {schedule.description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                        {schedule.description}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    // Menu de opções
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <MoreVertical className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Tags */}
                        <div className="flex items-center gap-2 mb-4">
                            <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${categoryColors.bg} ${categoryColors.text}`}
                            >
                                {CATEGORY_LABELS[schedule.category]}
                            </span>
                            <span className={`text-xs font-medium ${statusInfo.color}`}>
                                {statusInfo.label}
                            </span>
                        </div>

                        {/* Info */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                                <CalendarDays className="w-4 h-4" />
                                <span>{formatDate(schedule.startDate)}</span>
                            </div>
                            {schedule.territoryScope && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{schedule.territoryScope.split(':')[0]}</span>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {schedule.isRecurring ? 'Recorrente' : 'Único'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-red-500 group-hover:translate-x-1 transition-transform">
                                <span className="text-sm font-medium">Ver detalhes</span>
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
