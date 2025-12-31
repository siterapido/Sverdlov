'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

export const MemberForm = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data = {
            fullName: formData.get('fullName'),
            socialName: formData.get('socialName'),
            cpf: formData.get('cpf'),
            dateOfBirth: formData.get('dateOfBirth'),
            gender: formData.get('gender'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            state: formData.get('state'),
            city: formData.get('city'),
            zone: formData.get('zone'),
            neighborhood: formData.get('neighborhood'),
        };

        try {
            const response = await fetch('/api/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao cadastrar membro');
            }

            alert('Membro cadastrado com sucesso!');
            e.currentTarget.reset();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 notion-card">
            <h2 className="text-2xl font-semibold mb-6 text-fg-primary">Cadastro de Novo Membro</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-fg-secondary">Nome Completo</label>
                        <input name="fullName" type="text" className="notion-input" placeholder="Ex: João Silva" required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-fg-secondary">Nome Social</label>
                        <input name="socialName" type="text" className="notion-input" placeholder="Opcional" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-fg-secondary">CPF</label>
                        <input name="cpf" type="text" className="notion-input" placeholder="000.000.000-00" required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-fg-secondary">Data de Nascimento</label>
                        <input name="dateOfBirth" type="date" className="notion-input" required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-fg-secondary">Telefone/WhatsApp</label>
                        <input name="phone" type="tel" className="notion-input" placeholder="(11) 99999-9999" required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-fg-secondary">Email</label>
                        <input name="email" type="email" className="notion-input" placeholder="email@exemplo.com" required />
                    </div>
                </div>

                <div className="border-t border-border-subtle pt-6 mt-6">
                    <h3 className="text-lg font-medium mb-4 text-fg-primary">Informação Territorial</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-fg-secondary">Estado</label>
                            <select name="state" className="notion-input" required>
                                <option value="">Selecione...</option>
                                <option value="SP">São Paulo</option>
                                <option value="RJ">Rio de Janeiro</option>
                                <option value="MG">Minas Gerais</option>
                                <option value="BA">Bahia</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-fg-secondary">Cidade</label>
                            <input name="city" type="text" className="notion-input" placeholder="Ex: São Paulo" required />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-fg-secondary">Bairro</label>
                            <input name="neighborhood" type="text" className="notion-input" placeholder="Ex: Centro" required />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-fg-secondary">Zona (Opcional)</label>
                            <input name="zone" type="text" className="notion-input" placeholder="Ex: Zona Sul" />
                        </div>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    variant="default"
                    className="w-full"
                >
                    {loading ? 'Processando...' : 'Cadastrar Membro'}
                </Button>
            </form>
        </div>
    );
};
