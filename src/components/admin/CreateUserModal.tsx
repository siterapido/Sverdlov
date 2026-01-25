'use client';

import { useState, useEffect } from 'react';
import { CreateUserData, createUser } from '@/app/actions/users';
import { getNuclei } from '@/app/actions/nuclei';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

// BR States list
const STATES = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateUserModal({ isOpen, onClose }: UserModalProps) {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [nucleiList, setNucleiList] = useState<any[]>([]);

    const [formData, setFormData] = useState<CreateUserData>({
        fullName: '',
        email: '',
        role: 'LOCAL_COORD',
        scopeState: '',
        scopeCity: '',
        scopeZone: '',
        scopeNucleusId: '',
    });

    useEffect(() => {
        if (isOpen) {
            getNuclei().then(res => {
                if (res.success && res.data) setNucleiList(res.data);
            });
        }
    }, [isOpen]);

    const handleChange = (field: keyof CreateUserData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createUser(formData);
            addToast({ title: 'Usuário criado com sucesso', type: 'success' });
            onClose();
        } catch (error) {
            addToast({ title: 'Erro ao criar usuário', description: String(error), type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={isOpen} onOpenChange={onClose}>
            <ModalContent>
                <ModalHeader>
                    <ModalTitle>Novo Usuário</ModalTitle>
                </ModalHeader>
                <form onSubmit={handleSubmit}>
                    <ModalBody className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nome Completo</label>
                            <Input
                                required
                                value={formData.fullName}
                                onChange={(e) => handleChange('fullName', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nível de Acesso (Cargo)</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                                value={formData.role}
                                onChange={(e) => handleChange('role', e.target.value as any)}
                            >
                                <option value="ADMIN">Admin Geral</option>
                                <option value="STATE_COORD">Coordenador Estadual</option>
                                <option value="CITY_COORD">Coordenador Municipal</option>
                                <option value="ZONE_COORD">Coordenador Zonal</option>
                                <option value="LOCAL_COORD">Coordenador Local</option>
                            </select>
                        </div>

                        {/* Dynamic Fields */}
                        {(formData.role === 'STATE_COORD' || formData.role === 'CITY_COORD' || formData.role === 'ZONE_COORD') && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Estado</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                                    value={formData.scopeState || ''}
                                    onChange={(e) => handleChange('scopeState', e.target.value)}
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        )}

                        {(formData.role === 'CITY_COORD' || formData.role === 'ZONE_COORD') && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cidade</label>
                                <Input
                                    value={formData.scopeCity || ''}
                                    onChange={(e) => handleChange('scopeCity', e.target.value)}
                                    required
                                    placeholder="Nome da Cidade"
                                />
                            </div>
                        )}

                        {formData.role === 'ZONE_COORD' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Zona</label>
                                <Input
                                    value={formData.scopeZone || ''}
                                    onChange={(e) => handleChange('scopeZone', e.target.value)}
                                    required
                                    placeholder="Nome da Zona"
                                />
                            </div>
                        )}

                        {formData.role === 'LOCAL_COORD' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Núcleo</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                                    value={formData.scopeNucleusId || ''}
                                    onChange={(e) => handleChange('scopeNucleusId', e.target.value)}
                                    required
                                >
                                    <option value="">Selecione o Núcleo...</option>
                                    {nucleiList.map(n => (
                                        <option key={n.id} value={n.id}>{n.name} ({n.city}/{n.state})</option>
                                    ))}
                                </select>
                            </div>
                        )}

                    </ModalBody>
                    <ModalFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Criar Usuário'}</Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}
