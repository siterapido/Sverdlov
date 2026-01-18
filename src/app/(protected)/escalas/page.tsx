'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Filter,
    CalendarDays,
    Clock,
    Calendar,
    Users,
    X
} from 'lucide-react';
import Link from 'next/link';
import { getSchedules, ScheduleFilters } from '@/app/actions/schedules';
import { Schedule } from '@/lib/db/schema';
import { ScheduleCard, CATEGORY_LABELS } from '@/components/schedules/ScheduleCard';
import { Button } from '@/components/ui/button';
import { SearchInput, Label } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageTransition } from '@/components/ui/page-transition';

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

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        loadSchedules();
    };

    const filteredSchedules = searchTerm
        ? schedules.filter(
            (s) =>
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : schedules;

    const activeFiltersCount = Object.values(filters).filter(Boolean).length;

    return (
        <PageTransition>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-5 h-5 text-fg-secondary" />
                            <h1 className="text-2xl font-semibold text-fg-primary">
                                Escalas
                            </h1>
                        </div>
                        <p className="text-sm text-fg-secondary ml-7">
                            Gerencie turnos e atribuições
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/escalas/calendario">
                            <Button variant="ghost" size="sm" leftIcon={<CalendarDays className="w-4 h-4" />}>
                                Calendário
                            </Button>
                        </Link>
                        <Link href="/escalas/minha-agenda">
                            <Button variant="ghost" size="sm" leftIcon={<Clock className="w-4 h-4" />}>
                                Minha Agenda
                            </Button>
                        </Link>
                        <Link href="/escalas/nova">
                            <Button variant="default" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                                Nova Escala
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-md">
                            <SearchInput
                                placeholder="Buscar escalas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onSearch={handleSearch}
                                onClear={() => { setSearchTerm(''); loadSchedules(); }}
                            />
                        </div>
                        <Button
                            variant={showFilters ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            leftIcon={<Filter className="w-4 h-4" />}
                            className={activeFiltersCount > 0 ? "text-accent" : ""}
                        >
                            Filtros
                            {activeFiltersCount > 0 && (
                                <Badge variant="blue" className="ml-2 h-5 min-w-5 px-1">{activeFiltersCount}</Badge>
                            )}
                        </Button>
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
                                <div className="p-4 border border-border-default rounded-lg bg-bg-secondary grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <Label className="mb-1.5">Status</Label>
                                        <select
                                            value={filters.status || ''}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    status: e.target.value as Schedule['status'] || undefined,
                                                })
                                            }
                                            className="w-full h-8 px-2 text-sm bg-bg-primary border border-border-default rounded-[4px] focus:outline-none focus:border-accent"
                                        >
                                            <option value="">Todos</option>
                                            <option value="active">Ativas</option>
                                            <option value="draft">Rascunhos</option>
                                            <option value="completed">Concluídas</option>
                                            <option value="cancelled">Canceladas</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label className="mb-1.5">Categoria</Label>
                                        <select
                                            value={filters.category || ''}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    category: e.target.value as Schedule['category'] || undefined,
                                                })
                                            }
                                            className="w-full h-8 px-2 text-sm bg-bg-primary border border-border-default rounded-[4px] focus:outline-none focus:border-accent"
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
                                        <Label className="mb-1.5">Tipo</Label>
                                        <select
                                            value={filters.type || ''}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    type: e.target.value as Schedule['type'] || undefined,
                                                })
                                            }
                                            className="w-full h-8 px-2 text-sm bg-bg-primary border border-border-default rounded-[4px] focus:outline-none focus:border-accent"
                                        >
                                            <option value="">Todos</option>
                                            <option value="weekly">Semanal</option>
                                            <option value="monthly">Mensal</option>
                                            <option value="event">Evento</option>
                                            <option value="permanent">Permanente</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setFilters({})}
                                            className="w-full justify-center text-fg-secondary"
                                            disabled={activeFiltersCount === 0}
                                        >
                                            <X className="w-3.5 h-3.5 mr-2" />
                                            Limpar
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                                key={i}
                                className="h-40 bg-bg-secondary rounded-lg animate-pulse"
                            />
                        ))}
                    </div>
                ) : filteredSchedules.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-border-default rounded-xl bg-bg-secondary/30">
                        <div className="w-12 h-12 mx-auto mb-3 bg-bg-secondary rounded-full flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-fg-tertiary" />
                        </div>
                        <h3 className="text-sm font-medium text-fg-primary mb-1">
                            Nenhuma escala encontrada
                        </h3>
                        <p className="text-xs text-fg-secondary mb-4">
                            {searchTerm || Object.keys(filters).length > 0
                                ? 'Tente ajustar os filtros de busca'
                                : 'Comece criando sua primeira escala'}
                        </p>
                        <Link href="/escalas/nova">
                            <Button variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                                Criar Nova Escala
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredSchedules.map((schedule, index) => (
                            <ScheduleCard key={schedule.id} schedule={schedule} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
