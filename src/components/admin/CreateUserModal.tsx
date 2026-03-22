'use client';

import { useState, useMemo, useCallback } from 'react';
import { CreateUserData, createUser } from '@/app/actions/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

const STATES = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

function generatePassword(): string {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const symbols = '!@#$%&*';
    const all = upper + lower + digits + symbols;

    // Guarantee at least one of each type
    const required = [
        upper[Math.floor(Math.random() * upper.length)],
        lower[Math.floor(Math.random() * lower.length)],
        digits[Math.floor(Math.random() * digits.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
    ];

    const rest = Array.from({ length: 8 }, () => all[Math.floor(Math.random() * all.length)]);
    const chars = [...required, ...rest];

    // Shuffle
    for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join('');
}

interface City {
    id: string;
    name: string;
    state: string;
}

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    cities: City[];
}

export default function CreateUserModal({ isOpen, onClose, cities }: UserModalProps) {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [createdUser, setCreatedUser] = useState<{ name: string; email: string; password: string } | null>(null);

    const [formData, setFormData] = useState<CreateUserData>({
        fullName: '',
        email: '',
        password: generatePassword(),
        role: 'LOCAL_COORD',
        scopeState: '',
        scopeCity: '',
        scopeZone: '',
    });

    const filteredCities = useMemo(() => {
        if (!formData.scopeState) return [];
        return cities.filter(c => c.state === formData.scopeState);
    }, [cities, formData.scopeState]);

    const handleChange = (field: keyof CreateUserData, value: string) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'scopeState') {
                updated.scopeCity = '';
                updated.scopeZone = '';
            }
            if (field === 'role') {
                updated.scopeZone = '';
            }
            return updated;
        });
    };

    const handleRegenerate = useCallback(() => {
        setFormData(prev => ({ ...prev, password: generatePassword() }));
    }, []);

    const handleCopy = useCallback(async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createUser(formData);
            setCreatedUser({
                name: formData.fullName,
                email: formData.email,
                password: formData.password,
            });
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            addToast({ title: 'Erro ao criar usuário', description: msg, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setCreatedUser(null);
        setCopied(false);
        setFormData({
            fullName: '',
            email: '',
            password: generatePassword(),
            role: 'LOCAL_COORD',
            scopeState: '',
            scopeCity: '',
            scopeZone: '',
        });
        onClose();
    };

    const selectClass = "flex h-10 w-full rounded-none border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50";

    // Success screen after creation
    if (createdUser) {
        return (
            <Modal open={isOpen} onOpenChange={handleClose}>
                <ModalContent>
                    <ModalHeader>
                        <ModalTitle>Usuário Criado</ModalTitle>
                    </ModalHeader>
                    <ModalBody className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded space-y-1">
                            <p className="text-sm font-medium text-green-800">
                                {createdUser.name} foi criado com sucesso!
                            </p>
                            <p className="text-xs text-green-600">{createdUser.email}</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Senha de acesso</label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 p-3 bg-zinc-100 border border-zinc-200 text-sm font-mono tracking-wider select-all">
                                    {createdUser.password}
                                </code>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopy(createdUser.password)}
                                    className="shrink-0"
                                >
                                    {copied ? 'Copiado!' : 'Copiar'}
                                </Button>
                            </div>
                            <p className="text-xs text-zinc-500">
                                Envie esta senha ao usuário. Ela não poderá ser visualizada novamente.
                            </p>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={handleClose}>Fechar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        );
    }

    return (
        <Modal open={isOpen} onOpenChange={handleClose}>
            <ModalContent>
                <ModalHeader>
                    <ModalTitle>Novo Usuário</ModalTitle>
                </ModalHeader>
                <form onSubmit={handleSubmit}>
                    <ModalBody className="space-y-4">
                        {/* 1. Dados pessoais */}
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

                        {/* 2. Localização: Estado + Cidade */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Estado</label>
                                <select
                                    className={selectClass}
                                    value={formData.scopeState || ''}
                                    onChange={(e) => handleChange('scopeState', e.target.value)}
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cidade</label>
                                {!formData.scopeState ? (
                                    <select className={selectClass} disabled>
                                        <option>Selecione o estado</option>
                                    </select>
                                ) : filteredCities.length > 0 ? (
                                    <select
                                        className={selectClass}
                                        value={formData.scopeCity || ''}
                                        onChange={(e) => handleChange('scopeCity', e.target.value)}
                                        required
                                    >
                                        <option value="">Selecione...</option>
                                        {filteredCities.map(c => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <Input
                                        value={formData.scopeCity || ''}
                                        onChange={(e) => handleChange('scopeCity', e.target.value)}
                                        required
                                        placeholder="Digite a cidade"
                                    />
                                )}
                            </div>
                        </div>
                        {formData.scopeState && filteredCities.length === 0 && (
                            <p className="text-xs text-zinc-400 -mt-2">
                                Nenhuma cidade cadastrada para {formData.scopeState}. Cadastre na aba Cidades ou digite manualmente.
                            </p>
                        )}

                        {/* 3. Nível de acesso */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nível de Acesso</label>
                            <select
                                className={selectClass}
                                value={formData.role}
                                onChange={(e) => handleChange('role', e.target.value as any)}
                            >
                                <option value="LOCAL_COORD">Coordenador Local</option>
                                <option value="ZONE_COORD">Coordenador Zonal</option>
                                <option value="CITY_COORD">Coordenador Municipal</option>
                                <option value="STATE_COORD">Coordenador Estadual</option>
                                <option value="ADMIN">Admin Geral</option>
                            </select>
                        </div>

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

                        {/* 4. Senha gerada */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Senha</label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 p-2.5 bg-zinc-50 border border-zinc-200 text-sm font-mono tracking-wider select-all">
                                    {formData.password}
                                </code>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopy(formData.password)}
                                    className="shrink-0"
                                >
                                    {copied ? 'Copiado!' : 'Copiar'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRegenerate}
                                    className="shrink-0"
                                    title="Gerar nova senha"
                                >
                                    ↻
                                </Button>
                            </div>
                            <p className="text-xs text-zinc-400">
                                Senha gerada automaticamente. Copie antes de criar o usuário.
                            </p>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Criar Usuário'}</Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}
