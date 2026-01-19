'use client';

import { useState, FormEvent } from 'react';
import { PageTransition } from '@/components/ui/page-transition';

export default function PublicMembershipPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data = {
            fullName: formData.get('fullName'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            city: formData.get('city'),
            neighborhood: formData.get('neighborhood'),
            interest: formData.get('interest'),
            howDidYouHear: formData.get('howDidYouHear'),
        };

        try {
            // For now, just simulate success
            // In production, this would call an API endpoint
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSuccess(true);
            e.currentTarget.reset();
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Telefone/WhatsApp *</label>
                                            <input
                                                name="phone"
                                                type="tel"
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Cidade *</label>
                                            <input
                                                name="city"
                                                type="text"
                                                className="notion-input w-full"
                                                placeholder="Ex: São Paulo"
                                                required
                                            />
                                        </div>

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
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Como conheceu a UP? *</label>
                                        <select name="howDidYouHear" className="notion-input w-full" required>
                                            <option value="">Selecione...</option>
                                            <option value="redes_sociais">Redes Sociais</option>
                                            <option value="amigo">Indicação de amigo/familiar</option>
                                            <option value="evento">Evento/Atividade</option>
                                            <option value="outro">Outro</option>
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
