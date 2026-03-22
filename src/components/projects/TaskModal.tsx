'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from '@/components/ui/modal';
import { createProjectTask, updateProjectTask, deleteProjectTask } from '@/app/actions/projects';
import { TaskAssigneesPanel } from './TaskAssigneesPanel';
import { X, Search, Users, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAvailableMembersForTask } from '@/app/actions/availability-scoring';
import type { TaskData } from './TaskCard';

interface TaskModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    task?: TaskData | null;
    defaultStatus?: string;
    projectMembers?: any[];
}

const categoryOptions = [
    { value: 'outras', label: 'Outras' },
    { value: 'vigilancia', label: 'Vigilância' },
    { value: 'formacao', label: 'Formação' },
    { value: 'agitacao', label: 'Agitação' },
    { value: 'administrativa', label: 'Administrativa' },
    { value: 'financeira', label: 'Financeira' },
];

const turnoOptions = [
    { value: '', label: 'Nenhum' },
    { value: 'manha', label: 'Manhã (06-12h)' },
    { value: 'tarde', label: 'Tarde (12-18h)' },
    { value: 'noite', label: 'Noite (18-00h)' },
];

const frequencyOptions = [
    { value: 'pontual', label: 'Pontual' },
    { value: 'semanal', label: 'Semanal' },
    { value: 'quinzenal', label: 'Quinzenal' },
    { value: 'mensal', label: 'Mensal' },
    { value: 'continua', label: 'Contínua' },
];

const dayOptions = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda' },
    { value: 2, label: 'Terça' },
    { value: 3, label: 'Quarta' },
    { value: 4, label: 'Quinta' },
    { value: 5, label: 'Sexta' },
    { value: 6, label: 'Sábado' },
];

export function TaskModal({ open, onOpenChange, projectId, task, defaultStatus, projectMembers }: TaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [status, setStatus] = useState('todo');
    const [category, setCategory] = useState('outras');
    const [turno, setTurno] = useState('');
    const [dayOfWeek, setDayOfWeek] = useState<number | ''>('');
    const [frequency, setFrequency] = useState('pontual');
    const [location, setLocation] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [memberSearch, setMemberSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'assignees'>('details');

    // Reset form when task or open changes
    useEffect(() => {
        if (open) {
            if (task) {
                setTitle(task.title || '');
                setDescription(task.description || '');
                setPriority(task.priority || 'medium');
                setStatus(task.status || 'todo');
                setCategory(task.category || 'outras');
                setTurno(task.turno || '');
                setDayOfWeek(task.dayOfWeek !== null && task.dayOfWeek !== undefined ? task.dayOfWeek : '');
                setFrequency(task.frequency || 'pontual');
                setLocation(task.location || '');
                setStartTime(task.startTime || '');
                setEndTime(task.endTime || '');
                setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
                setSelectedMemberIds((task.assignees || []).map(a => a.memberId));
                setActiveTab('details');
            } else {
                setTitle('');
                setDescription('');
                setPriority('medium');
                setStatus(defaultStatus || 'todo');
                setCategory('outras');
                setTurno('');
                setDayOfWeek('');
                setFrequency('pontual');
                setLocation('');
                setStartTime('');
                setEndTime('');
                setDueDate('');
                setSelectedMemberIds([]);
                setActiveTab('details');
            }
        }
    }, [open, task, defaultStatus]);

    const handleSubmit = async () => {
        if (!title.trim()) return;
        setLoading(true);
        try {
            const data = {
                title,
                description,
                priority,
                status,
                category,
                turno: turno || undefined,
                dayOfWeek: dayOfWeek !== '' ? dayOfWeek : undefined,
                frequency,
                location: location || undefined,
                startTime: startTime || undefined,
                endTime: endTime || undefined,
                dueDate: dueDate || undefined,
                projectId,
                assigneeIds: selectedMemberIds,
            };

            if (task) {
                await updateProjectTask(task.id, data);
            } else {
                await createProjectTask(data);
            }
            onOpenChange(false);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!task || !confirm('Tem certeza que deseja excluir esta tarefa?')) return;
        setLoading(true);
        try {
            await deleteProjectTask(task.id);
            onOpenChange(false);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const toggleMember = (memberId: string) => {
        setSelectedMemberIds(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleSuggest = async () => {
        if (!task) return;
        const suggestions = await getAvailableMembersForTask(task.id);
        if (suggestions.length > 0) {
            const suggestedIds = suggestions.slice(0, 5).map(s => s.memberId);
            setSelectedMemberIds(prev => {
                const combined = new Set([...prev, ...suggestedIds]);
                return Array.from(combined);
            });
        }
    };

    const filteredMembers = (projectMembers || []).filter(pm => {
        const name = (pm.member?.fullName || '').toLowerCase();
        return name.includes(memberSearch.toLowerCase());
    });

    const inputClass = "w-full p-2 border-2 border-zinc-200 text-sm focus:border-zinc-900 focus:outline-none transition-colors";
    const labelClass = "text-[10px] font-black uppercase tracking-widest text-zinc-400";

    return (
        <Modal open={open} onOpenChange={onOpenChange}>
            <ModalContent size="2xl">
                <ModalHeader>
                    <ModalTitle>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</ModalTitle>
                    <ModalDescription>
                        {task ? 'Atualize os detalhes da tarefa' : 'Defina os detalhes e escale responsáveis'}
                    </ModalDescription>
                </ModalHeader>

                <ModalBody className="max-h-[70vh] overflow-y-auto">
                    {/* Tabs */}
                    <div className="flex gap-0 mb-6 border-b-2 border-zinc-200">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={cn(
                                "px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors",
                                activeTab === 'details'
                                    ? 'text-zinc-900 border-b-2 border-zinc-900 -mb-[2px]'
                                    : 'text-zinc-400 hover:text-zinc-600'
                            )}
                        >
                            Detalhes
                        </button>
                        <button
                            onClick={() => setActiveTab('assignees')}
                            className={cn(
                                "px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1.5",
                                activeTab === 'assignees'
                                    ? 'text-zinc-900 border-b-2 border-zinc-900 -mb-[2px]'
                                    : 'text-zinc-400 hover:text-zinc-600'
                            )}
                        >
                            <Users className="h-3 w-3" />
                            Responsáveis
                            {selectedMemberIds.length > 0 && (
                                <span className="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5">
                                    {selectedMemberIds.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {activeTab === 'details' && (
                        <div className="space-y-4">
                            {/* Title */}
                            <div className="space-y-1">
                                <label className={labelClass}>Título</label>
                                <input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className={inputClass}
                                    placeholder="Título da tarefa..."
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-1">
                                <label className={labelClass}>Descrição</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className={cn(inputClass, "h-20 resize-none")}
                                    placeholder="Detalhes da tarefa..."
                                />
                            </div>

                            {/* Priority + Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className={labelClass}>Prioridade</label>
                                    <select value={priority} onChange={e => setPriority(e.target.value)} className={inputClass}>
                                        <option value="low">Baixa</option>
                                        <option value="medium">Média</option>
                                        <option value="high">Alta</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClass}>Status</label>
                                    <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
                                        <option value="todo">A Fazer</option>
                                        <option value="in_progress">Em Andamento</option>
                                        <option value="review">Revisão</option>
                                        <option value="done">Concluída</option>
                                    </select>
                                </div>
                            </div>

                            {/* Category + Frequency */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className={labelClass}>Categoria</label>
                                    <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass}>
                                        {categoryOptions.map(o => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClass}>Frequência</label>
                                    <select value={frequency} onChange={e => setFrequency(e.target.value)} className={inputClass}>
                                        {frequencyOptions.map(o => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Turno + Day of Week (visible when recurring) */}
                            {frequency !== 'pontual' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className={labelClass}>Turno</label>
                                        <select value={turno} onChange={e => setTurno(e.target.value)} className={inputClass}>
                                            {turnoOptions.map(o => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelClass}>Dia da Semana</label>
                                        <select
                                            value={dayOfWeek}
                                            onChange={e => setDayOfWeek(e.target.value === '' ? '' : Number(e.target.value))}
                                            className={inputClass}
                                        >
                                            <option value="">Nenhum</option>
                                            {dayOptions.map(d => (
                                                <option key={d.value} value={d.value}>{d.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Time range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className={labelClass}>Hora Início</label>
                                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputClass} />
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClass}>Hora Fim</label>
                                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputClass} />
                                </div>
                            </div>

                            {/* Due date + Location */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className={labelClass}>Data de Vencimento</label>
                                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputClass} />
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClass}>Local</label>
                                    <input
                                        value={location}
                                        onChange={e => setLocation(e.target.value)}
                                        className={inputClass}
                                        placeholder="Local da tarefa..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'assignees' && (
                        <div className="space-y-4">
                            {/* Search + Suggest */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar membros..."
                                        value={memberSearch}
                                        onChange={e => setMemberSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border-2 border-zinc-200 text-sm focus:border-zinc-900 focus:outline-none"
                                    />
                                </div>
                                {task && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSuggest}
                                        className="rounded-none text-[10px] font-bold uppercase tracking-wider gap-1"
                                    >
                                        <Zap className="h-3 w-3" />
                                        Sugerir
                                    </Button>
                                )}
                            </div>

                            {/* Selected chips */}
                            {selectedMemberIds.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedMemberIds.map(id => {
                                        const pm = projectMembers?.find(p => p.memberId === id || p.member?.id === id);
                                        const name = pm?.member?.fullName || 'Membro';
                                        return (
                                            <span
                                                key={id}
                                                className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-white text-[10px] font-bold uppercase"
                                            >
                                                {name}
                                                <button onClick={() => toggleMember(id)} className="hover:opacity-70">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Member list */}
                            <div className="border-2 border-zinc-200 max-h-60 overflow-y-auto divide-y divide-zinc-100">
                                {filteredMembers.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-zinc-400 font-bold uppercase">
                                        {projectMembers?.length === 0 ? 'Adicione membros ao projeto primeiro' : 'Nenhum membro encontrado'}
                                    </div>
                                ) : (
                                    filteredMembers.map(pm => {
                                        const member = pm.member;
                                        if (!member) return null;
                                        const isSelected = selectedMemberIds.includes(member.id);
                                        return (
                                            <label
                                                key={member.id}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 cursor-pointer transition-colors",
                                                    isSelected ? 'bg-primary/5' : 'hover:bg-zinc-50'
                                                )}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleMember(member.id)}
                                                    className="h-4 w-4 accent-primary"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-zinc-900 truncate">{member.fullName}</p>
                                                    <p className="text-[10px] text-zinc-400 uppercase">
                                                        {member.militancyLevel === 'leader' ? 'Liderança' :
                                                         member.militancyLevel === 'militant' ? 'Militante' : 'Simpatizante'}
                                                    </p>
                                                </div>
                                            </label>
                                        );
                                    })
                                )}
                            </div>

                            {/* Existing assignees panel (for editing) */}
                            {task && task.assignees && task.assignees.length > 0 && (
                                <TaskAssigneesPanel
                                    assignees={task.assignees}
                                    taskId={task.id}
                                />
                            )}
                        </div>
                    )}
                </ModalBody>

                <ModalFooter>
                    {task && (
                        <Button
                            onClick={handleDelete}
                            disabled={loading}
                            variant="destructive"
                            className="rounded-none font-bold uppercase text-xs tracking-wider mr-auto"
                        >
                            Excluir
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="rounded-none"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !title.trim()}
                        className="rounded-none font-black uppercase tracking-wider"
                    >
                        {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
