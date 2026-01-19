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
import { cn } from '@/lib/utils';
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
            <div className="max-w-6xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-zinc-100 pb-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 bg-primary flex items-center justify-center">
                                <Calendar className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Execução e Planejamento</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-zinc-900 uppercase leading-none">
                            Escalas
                        </h1>
                        <p className="text-zinc-500 font-medium text-sm">
                            Gestão técnica de turnos, atribuições de militantes e prontidão operacional.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/escalas/calendario">
                            <Button variant="ghost" size="sm" className="font-black uppercase tracking-widest text-[10px] text-zinc-400 hover:text-zinc-900" leftIcon={<CalendarDays className="w-4 h-4" />}>
                                CALENDÁRIO
                            </Button>
                        </Link>
                        <Link href="/escalas/minha-agenda">
                            <Button variant="ghost" size="sm" className="font-black uppercase tracking-widest text-[10px] text-zinc-400 hover:text-zinc-900" leftIcon={<Clock className="w-4 h-4" />}>
                                MINHA AGENDA
                            </Button>
                        </Link>
                        <Link href="/escalas/nova">
                            <Button variant="default" size="sm" className="bg-primary hover:brightness-110 text-white border-2 border-primary rounded-none font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0px_0px_rgba(0,82,255,0.1)] transition-all" leftIcon={<Plus className="w-4 h-4" />}>
                                NOVA ESCALA
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col gap-4 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 max-w-xl">
                            <SearchInput
                                placeholder="BUSCAR ESCALAS POR NOME OU DESCRIÇÃO..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onSearch={handleSearch}
                                onClear={() => { setSearchTerm(''); loadSchedules(); }}
                                className="rounded-none border-zinc-900 border-2"
                            />
                        </div>
                        <Button
                            variant={showFilters ? "secondary" : "outline"}
                            size="lg"
                            onClick={() => setShowFilters(!showFilters)}
                            leftIcon={<Filter className="w-4 h-4" />}
                            className={cn(
                                "rounded-none border-2 border-zinc-900 font-black uppercase tracking-widest text-[10px]",
                                activeFiltersCount > 0 ? "bg-primary text-white border-primary" : ""
                            )}
                        >
                            FILTROS
                            {activeFiltersCount > 0 && (
                                <Badge variant="blue" className="ml-2 h-4 min-w-4 px-1 border-white">{activeFiltersCount}</Badge>
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
                                <div className="p-8 border-2 border-zinc-900 bg-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
                                    <div className="space-y-3">
                                        <Label>STATUS</Label>
                                        <select
                                            value={filters.status || ''}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    status: e.target.value as Schedule['status'] || undefined,
                                                })
                                            }
                                            className="w-full h-11 px-3 text-[13px] font-bold bg-zinc-50 border-2 border-zinc-200 focus:border-primary outline-none transition-all"
                                        >
                                            <option value="">TODOS</option>
                                            <option value="active">ATIVAS</option>
                                            <option value="draft">RASCUNHOS</option>
                                            <option value="completed">CONCLUÍDAS</option>
                                            <option value="cancelled">CANCELADAS</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <Label>CATEGORIA</Label>
                                        <select
                                            value={filters.category || ''}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    category: e.target.value as Schedule['category'] || undefined,
                                                })
                                            }
                                            className="w-full h-11 px-3 text-[13px] font-bold bg-zinc-50 border-2 border-zinc-200 focus:border-primary outline-none transition-all"
                                        >
                                            <option value="">TODAS</option>
                                            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label.toUpperCase()}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <Label>TIPO</Label>
                                        <select
                                            value={filters.type || ''}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    type: e.target.value as Schedule['type'] || undefined,
                                                })
                                            }
                                            className="w-full h-11 px-3 text-[13px] font-bold bg-zinc-50 border-2 border-zinc-200 focus:border-primary outline-none transition-all"
                                        >
                                            <option value="">TODOS</option>
                                            <option value="weekly">SEMANAL</option>
                                            <option value="monthly">MENSAL</option>
                                            <option value="event">EVENTO</option>
                                            <option value="permanent">PERMANENTE</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <Button
                                            variant="ghost"
                                            size="lg"
                                            onClick={() => setFilters({})}
                                            className="w-full justify-center text-zinc-400 font-black uppercase tracking-widest text-[10px] hover:bg-red-50 hover:text-red-600"
                                            disabled={activeFiltersCount === 0}
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            LIMPAR FILTROS
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                                key={i}
                                className="h-56 bg-zinc-50 border-2 border-zinc-100 animate-pulse"
                            />
                        ))}
                    </div>
                ) : filteredSchedules.length === 0 ? (
                    <div className="text-center py-24 border-2 border-dashed border-zinc-200 bg-zinc-50/50">
                        <div className="w-16 h-16 mx-auto mb-6 bg-white border-2 border-zinc-100 flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-zinc-300" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 mb-2">
                            Nenhuma escala encontrada
                        </h3>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-8 max-w-[300px] mx-auto">
                            {searchTerm || Object.keys(filters).length > 0
                                ? 'Ajuste os critérios de filtragem técnica para localizar registros.'
                                : 'Inicie o planejamento operacional criando sua primeira escala.'}
                        </p>
                        <Link href="/escalas/nova">
                            <Button variant="outline" size="lg" className="rounded-none border-2 border-zinc-900 font-black uppercase tracking-widest text-[10px]" leftIcon={<Plus className="w-4 h-4" />}>
                                CRIAR NOVA ESCALA
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredSchedules.map((schedule, index) => (
                            <ScheduleCard key={schedule.id} schedule={schedule} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
