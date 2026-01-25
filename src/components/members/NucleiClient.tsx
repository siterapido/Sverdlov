'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getNuclei, createNucleus, updateNucleus, deleteNuclei, updateNucleiBulk } from '@/app/actions/nuclei';
import { Plus, Users, MapPin, Search, Filter, Layers, Trash2, Edit3, CheckSquare, Square, X, Check } from 'lucide-react';
import { ConfirmDialog, Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

interface Nucleus {
    id: string;
    name: string;
    type: 'territorial' | 'thematic';
    state: string;
    city: string;
    status: string;
    memberCount: number;
}

interface NucleiClientProps {
    initialNuclei: Nucleus[];
}

export function NucleiClient({ initialNuclei }: NucleiClientProps) {
    const { addToast } = useToast();
    const [nuclei, setNuclei] = useState(initialNuclei);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'territorial' | 'thematic'>('all');
    
    // Selection state
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    
    // Bulk edit state
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
    const [bulkEditData, setBulkEditData] = useState({
        status: '',
        type: '' as 'territorial' | 'thematic' | '',
    });
    const [isUpdating, setIsUpdating] = useState(false);

    const filteredNuclei = nuclei.filter(n => {
        const matchesSearch = n.name.toLowerCase().includes(search.toLowerCase()) ||
            n.city.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'all' || n.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredNuclei.length && filteredNuclei.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredNuclei.map(n => n.id));
        }
    };

    const handleDeleteBulk = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteNuclei(selectedIds);
            if (result.success) {
                addToast({ type: 'success', title: 'Sucesso', description: result.message || 'Núcleos excluídos com sucesso' });
                setNuclei(prev => prev.filter(n => !selectedIds.includes(n.id)));
                setSelectedIds([]);
            } else {
                addToast({ type: 'error', title: 'Erro', description: result.error || 'Erro ao excluir núcleos' });
            }
        } catch (error) {
            addToast({ type: 'error', title: 'Erro', description: 'Erro ao processar solicitação' });
        } finally {
            setIsDeleting(false);
            setIsDeleteConfirmOpen(false);
        }
    };

    const handleBulkUpdate = async () => {
        if (!bulkEditData.status && !bulkEditData.type) {
            addToast({ type: 'error', title: 'Atenção', description: 'Selecione pelo menos um campo para atualizar' });
            return;
        }

        setIsUpdating(true);
        try {
            const dataToUpdate: any = {};
            if (bulkEditData.status) dataToUpdate.status = bulkEditData.status;
            if (bulkEditData.type) dataToUpdate.type = bulkEditData.type;

            const result = await updateNucleiBulk(selectedIds, dataToUpdate);
            if (result.success) {
                addToast({ type: 'success', title: 'Sucesso', description: result.message || 'Núcleos atualizados com sucesso' });
                setNuclei(prev => prev.map(n => 
                    selectedIds.includes(n.id) ? { ...n, ...dataToUpdate } : n
                ));
                setSelectedIds([]);
                setIsBulkEditOpen(false);
                setBulkEditData({ status: '', type: '' });
            } else {
                addToast({ type: 'error', title: 'Erro', description: result.error || 'Erro ao atualizar núcleos' });
            }
        } catch (error) {
            addToast({ type: 'error', title: 'Erro', description: 'Erro ao processar solicitação' });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Mass Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-zinc-900 text-white px-6 py-4 flex items-center gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-slide-up">
                    <div className="flex items-center gap-3 pr-6 border-r border-zinc-700">
                        <div className="h-6 w-6 bg-primary text-zinc-900 flex items-center justify-center font-black text-xs">
                            {selectedIds.length}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Selecionados</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button 
                            variant="ghost" 
                            className="text-white hover:bg-zinc-800 rounded-none h-10 px-4 gap-2 text-[10px] font-black uppercase tracking-widest"
                            onClick={() => setIsBulkEditOpen(true)}
                        >
                            <Edit3 className="h-4 w-4" />
                            Editar em massa
                        </Button>
                        <Button 
                            variant="destructive" 
                            className="rounded-none h-10 px-4 gap-2 text-[10px] font-black uppercase tracking-widest"
                            onClick={() => setIsDeleteConfirmOpen(true)}
                        >
                            <Trash2 className="h-4 w-4" />
                            Excluir selecionados
                        </Button>
                        <button 
                            onClick={() => setSelectedIds([])}
                            className="p-2 hover:bg-zinc-800 transition-colors ml-2"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-50 border-2 border-zinc-900 p-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button 
                        onClick={toggleSelectAll}
                        className="h-10 w-10 bg-white border-2 border-zinc-900 flex items-center justify-center transition-colors hover:bg-zinc-50 shrink-0"
                        title={selectedIds.length === filteredNuclei.length ? "Desmarcar todos" : "Selecionar todos"}
                    >
                        {selectedIds.length === filteredNuclei.length && filteredNuclei.length > 0 ? (
                            <CheckSquare className="h-5 w-5" />
                        ) : (
                            <Square className="h-5 w-5 text-zinc-300" />
                        )}
                    </button>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou cidade..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="notion-input w-full pl-10 h-10 bg-white"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex border-2 border-zinc-900 overflow-hidden">
                        <button
                            onClick={() => setTypeFilter('all')}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${typeFilter === 'all' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900 hover:bg-zinc-50'}`}
                        >
                            TUDO
                        </button>
                        <button
                            onClick={() => setTypeFilter('territorial')}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-l-2 border-zinc-900 transition-colors ${typeFilter === 'territorial' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900 hover:bg-zinc-50'}`}
                        >
                            TERRITORIAL
                        </button>
                        <button
                            onClick={() => setTypeFilter('thematic')}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-l-2 border-zinc-900 transition-colors ${typeFilter === 'thematic' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900 hover:bg-zinc-50'}`}
                        >
                            TEMÁTICO
                        </button>
                    </div>
                </div>
            </div>

            {/* Nuclei Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNuclei.map((n) => (
                    <div 
                        key={n.id} 
                        className={`bg-white border-2 border-zinc-900 p-6 flex flex-col justify-between group transition-all relative ${
                            selectedIds.includes(n.id) 
                            ? 'shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] -translate-x-1 -translate-y-1 bg-zinc-50' 
                            : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                    >
                        {/* Selection Checkbox */}
                        <button 
                            onClick={() => toggleSelect(n.id)}
                            className={`absolute top-4 right-4 h-6 w-6 border-2 border-zinc-900 transition-colors flex items-center justify-center z-10 ${
                                selectedIds.includes(n.id) ? 'bg-zinc-900 text-white' : 'bg-white hover:bg-zinc-50'
                            }`}
                        >
                            {selectedIds.includes(n.id) && <Check className="h-4 w-4" />}
                        </button>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-start justify-between">
                                <div className="h-10 w-10 bg-zinc-100 flex items-center justify-center border border-zinc-200">
                                    <Layers className="h-5 w-5 text-zinc-400 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="pr-8">
                                    <Badge className="bg-zinc-100 text-zinc-500 rounded-none font-black uppercase tracking-widest text-[8px] border-none px-2 py-0.5">
                                        {n.status}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter text-zinc-900 leading-none mb-1">
                                    {n.name}
                                </h3>
                                <div className="flex items-center gap-1 text-zinc-400">
                                    <MapPin className="h-3 w-3" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{n.city} / {n.state}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">{n.memberCount} FILIADOS</span>
                                </div>
                                <div className="h-4 w-[1px] bg-zinc-100" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{n.type}</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full border-2 border-zinc-900 rounded-none font-black uppercase tracking-widest text-[9px] h-9 transition-all hover:bg-zinc-900 hover:text-white"
                            asChild
                        >
                            <a href={`/members/nucleos/${n.id}`}>GERENCIAR NÚCLEO</a>
                        </Button>
                    </div>
                ))}


                {/* Create New Card */}
                <button className="bg-zinc-50 border-2 border-dashed border-zinc-300 p-6 flex flex-col items-center justify-center gap-4 transition-colors hover:bg-zinc-100 hover:border-zinc-400 min-h-[220px]">
                    <div className="h-12 w-12 rounded-full bg-white border-2 border-zinc-200 flex items-center justify-center">
                        <Plus className="h-6 w-6 text-zinc-300" />
                    </div>
                    <div className="text-center">
                        <p className="font-black uppercase tracking-widest text-[10px] text-zinc-400">Novo Núcleo</p>
                        <p className="text-[9px] font-bold text-zinc-300 uppercase mt-1">Clique para expandir a organização</p>
                    </div>
                </button>
            </div>

            {/* Mass Delete Confirmation */}
            <ConfirmDialog 
                open={isDeleteConfirmOpen}
                onOpenChange={setIsDeleteConfirmOpen}
                title="Excluir Núcleos"
                description={`Você tem certeza que deseja excluir ${selectedIds.length} núcleos selecionados? Os filiados vinculados ficarão sem núcleo.`}
                confirmLabel="Excluir permanentemente"
                cancelLabel="Cancelar"
                onConfirm={handleDeleteBulk}
                variant="danger"
                loading={isDeleting}
            />

            {/* Mass Edit Modal */}
            <Modal open={isBulkEditOpen} onOpenChange={setIsBulkEditOpen}>
                <ModalContent size="md">
                    <ModalHeader>
                        <ModalTitle>Edição em Massa</ModalTitle>
                        <ModalDescription>Atualize {selectedIds.length} núcleos selecionados</ModalDescription>
                    </ModalHeader>
                    <ModalBody className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Novo Status</label>
                            <select 
                                value={bulkEditData.status}
                                onChange={(e) => setBulkEditData(prev => ({ ...prev, status: e.target.value }))}
                                className="notion-input w-full bg-white h-10"
                            >
                                <option value="">Não alterar</option>
                                <option value="dispersed">Disperso</option>
                                <option value="pre_nucleus">Pré-Núcleo</option>
                                <option value="in_formation">Em Formação</option>
                                <option value="active">Ativo</option>
                                <option value="consolidated">Consolidado</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Novo Tipo</label>
                            <select 
                                value={bulkEditData.type}
                                onChange={(e) => setBulkEditData(prev => ({ ...prev, type: e.target.value as any }))}
                                className="notion-input w-full bg-white h-10"
                            >
                                <option value="">Não alterar</option>
                                <option value="territorial">Territorial</option>
                                <option value="thematic">Temático</option>
                            </select>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button 
                            variant="ghost" 
                            onClick={() => setIsBulkEditOpen(false)}
                            disabled={isUpdating}
                        >
                            CANCELAR
                        </Button>
                        <Button 
                            onClick={handleBulkUpdate}
                            loading={isUpdating}
                            disabled={!bulkEditData.status && !bulkEditData.type}
                        >
                            ATUALIZAR SELECIONADOS
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
