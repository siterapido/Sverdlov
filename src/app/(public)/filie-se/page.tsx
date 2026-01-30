'use client';

import { useState, FormEvent } from 'react';
import { PageTransition } from '@/components/ui/page-transition';
import { createMemberAction } from '@/app/actions/members';

export default function PublicMembershipPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Form states for masks
    const [phone, setPhone] = useState('');
    const [cpf, setCpf] = useState('');

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
        }
        setPhone(value);
    };

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        }
        setCpf(value);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data: any = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        
        // Ensure masked values are sent correctly or the action cleans them
        data.phone = phone;
        data.cpf = cpf;

        try {
            const result = await createMemberAction(data);
            if (result.success) {
                setSuccess(true);
            } else {
                setError(result.error || 'Erro ao enviar formulário');
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar formulário');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-gradient-to-br from-[#f7f7f5] to-white py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-3 tracking-tight">Filie-se à Unidade Popular</h1>
                        <p className="text-muted-foreground text-lg">
                            Junte-se à luta por uma sociedade mais justa e igualitária.
                        </p>
                    </div>

                    {success ? (
                        <div className="bg-white rounded-none shadow-sm border border-border p-8 text-center">
                            <div className="text-5xl mb-4">✅</div>
                            <h2 className="text-2xl font-semibold mb-2">Solicitação Enviada!</h2>
                            <p className="text-muted-foreground">
                                Entraremos em contato em breve para dar continuidade ao processo de filiação.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-none shadow-sm border border-border p-8">
                            {error && (
                                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-none text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Nome Completo *</label>
                                            <input
                                                name="fullName"
                                                type="text"
                                                className="notion-input w-full"
                                                placeholder="Seu nome completo"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Nome Social (opcional)</label>
                                            <input
                                                name="socialName"
                                                type="text"
                                                className="notion-input w-full"
                                                placeholder="Como prefere ser chamado"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">CPF *</label>
                                            <input
                                                name="cpf"
                                                type="text"
                                                value={cpf}
                                                onChange={handleCpfChange}
                                                maxLength={14}
                                                className="notion-input w-full"
                                                placeholder="000.000.000-00"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Data de Nascimento *</label>
                                            <input
                                                name="dateOfBirth"
                                                type="date"
                                                className="notion-input w-full"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Telefone/WhatsApp *</label>
                                            <input
                                                name="phone"
                                                type="tel"
                                                value={phone}
                                                onChange={handlePhoneChange}
                                                maxLength={15}
                                                className="notion-input w-full"
                                                placeholder="(11) 99999-9999"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Email *</label>
                                            <input
                                                name="email"
                                                type="email"
                                                className="notion-input w-full"
                                                placeholder="seu@email.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Estado (UF) *</label>
                                            <input
                                                name="state"
                                                type="text"
                                                maxLength={2}
                                                className="notion-input w-full uppercase"
                                                placeholder="SP"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium">Cidade *</label>
                                            <input
                                                name="city"
                                                type="text"
                                                className="notion-input w-full"
                                                placeholder="Ex: São Paulo"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Bairro *</label>
                                            <input
                                                name="neighborhood"
                                                type="text"
                                                className="notion-input w-full"
                                                placeholder="Ex: Centro"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Gênero</label>
                                            <select name="gender" className="notion-input w-full">
                                                <option value="">Selecione...</option>
                                                <option value="Feminino">Feminino</option>
                                                <option value="Masculino">Masculino</option>
                                                <option value="Não-binário">Não-binário</option>
                                                <option value="Outro">Outro</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Título de Eleitor (opcional)</label>
                                            <input
                                                name="voterTitle"
                                                type="text"
                                                className="notion-input w-full"
                                                placeholder="Número do título"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Zona Eleitoral (opcional)</label>
                                            <input
                                                name="zone"
                                                type="text"
                                                className="notion-input w-full"
                                                placeholder="Ex: 001"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Como conheceu a UP? *</label>
                                        <select name="howDidYouHear" className="notion-input w-full" required>
                                            <option value="">Selecione...</option>
                                            <option value="Redes Sociais">Redes Sociais</option>
                                            <option value="Amigo/Familiar">Indicação de amigo/familiar</option>
                                            <option value="Evento/Atividade">Evento/Atividade</option>
                                            <option value="Outro">Outro</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Principal Interesse *</label>
                                        <select name="interest" className="notion-input w-full" required>
                                            <option value="">Selecione...</option>
                                            <option value="militancy">Militância ativa</option>
                                            <option value="support">Apoio político</option>
                                            <option value="education">Formação política</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-primary-foreground py-3 rounded-none font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {loading ? 'Enviando...' : 'Enviar Solicitação'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}

