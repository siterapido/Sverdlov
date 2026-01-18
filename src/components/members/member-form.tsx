"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, FormGroup, Label } from "@/components/ui/input";
import { User, Mail, Phone, MapPin, Calendar, CreditCard, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface MemberFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export const MemberForm = ({ initialData, isEditing = false }: MemberFormProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const data = {
            fullName: formData.get("fullName"),
            socialName: formData.get("socialName"),
            cpf: formData.get("cpf"),
            voterTitle: formData.get("voterTitle"),
            dateOfBirth: formData.get("dateOfBirth"),
            gender: formData.get("gender"),
            phone: formData.get("phone"),
            email: formData.get("email"),
            state: formData.get("state"),
            city: formData.get("city"),
            zone: formData.get("zone"),
            neighborhood: formData.get("neighborhood"),
        };

        try {
            const endpoint = isEditing ? `/api/members/${initialData.id}` : "/api/members";
            const method = isEditing ? "PATCH" : "POST";

            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ao ${isEditing ? "atualizar" : "cadastrar"} membro`);
            }

            if (!isEditing) {
                e.currentTarget.reset();
            }
            router.refresh();
            // Dispatch a custom event or use a callback to close modal if needed
            // For now, let's assume the client component handles this via refresh
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 py-2">
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-danger-500/10 border border-danger-500/20 rounded-xl text-danger-500 text-sm flex items-center gap-2"
                >
                    <div className="h-2 w-2 rounded-full bg-danger-500 animate-pulse" />
                    {error}
                </motion.div>
            )}

            <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
                    <div className="h-8 w-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-500" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-fg-secondary">Informações Pessoais</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormGroup>
                        <Label required>Nome Completo</Label>
                        <Input
                            name="fullName"
                            placeholder="Ex: João da Silva"
                            defaultValue={initialData?.fullName}
                            leftIcon={<User className="h-4 w-4" />}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Nome Social</Label>
                        <Input
                            name="socialName"
                            placeholder="Como prefere ser chamado"
                            defaultValue={initialData?.socialName}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label required>CPF</Label>
                        <Input
                            name="cpf"
                            placeholder="000.000.000-00"
                            defaultValue={initialData?.cpf}
                            leftIcon={<CreditCard className="h-4 w-4" />}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Título de Eleitor</Label>
                        <Input
                            name="voterTitle"
                            placeholder="Número do título"
                            defaultValue={initialData?.voterTitle}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label required>Data de Nascimento</Label>
                        <Input
                            name="dateOfBirth"
                            type="date"
                            defaultValue={initialData?.dateOfBirth}
                            leftIcon={<Calendar className="h-4 w-4" />}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label required>Telefone / WhatsApp</Label>
                        <Input
                            name="phone"
                            placeholder="(11) 99999-9999"
                            defaultValue={initialData?.phone}
                            leftIcon={<Phone className="h-4 w-4" />}
                            required
                        />
                    </FormGroup>

                    <FormGroup className="md:col-span-2">
                        <Label required>Email</Label>
                        <Input
                            name="email"
                            type="email"
                            placeholder="joao@exemplo.com"
                            defaultValue={initialData?.email}
                            leftIcon={<Mail className="h-4 w-4" />}
                            required
                        />
                    </FormGroup>
                </div>
            </div>

            <div className="space-y-6 pt-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
                    <div className="h-8 w-8 rounded-lg bg-secondary-500/10 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-secondary-500" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-fg-secondary">Localização</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormGroup>
                        <Label required>Estado (UF)</Label>
                        <select
                            name="state"
                            className="flex h-11 w-full rounded-xl border border-border-subtle bg-bg-primary px-3 py-2 text-sm text-fg-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none"
                            defaultValue={initialData?.state || ""}
                            required
                        >
                            <option value="">Selecione...</option>
                            <option value="AC">Acre</option>
                            <option value="AL">Alagoas</option>
                            <option value="AP">Amapá</option>
                            <option value="AM">Amazonas</option>
                            <option value="BA">Bahia</option>
                            <option value="CE">Ceará</option>
                            <option value="DF">Distrito Federal</option>
                            <option value="ES">Espírito Santo</option>
                            <option value="GO">Goiás</option>
                            <option value="MA">Maranhão</option>
                            <option value="MT">Mato Grosso</option>
                            <option value="MS">Mato Grosso do Sul</option>
                            <option value="MG">Minas Gerais</option>
                            <option value="PA">Pará</option>
                            <option value="PB">Paraíba</option>
                            <option value="PR">Paraná</option>
                            <option value="PE">Pernambuco</option>
                            <option value="PI">Piauí</option>
                            <option value="RJ">Rio de Janeiro</option>
                            <option value="RN">Rio Grande do Norte</option>
                            <option value="RS">Rio Grande do Sul</option>
                            <option value="RO">Rondônia</option>
                            <option value="RR">Roraima</option>
                            <option value="SC">Santa Catarina</option>
                            <option value="SP">São Paulo</option>
                            <option value="SE">Sergipe</option>
                            <option value="TO">Tocantins</option>
                        </select>
                    </FormGroup>

                    <FormGroup>
                        <Label required>Cidade</Label>
                        <Input
                            name="city"
                            placeholder="Ex: São Paulo"
                            defaultValue={initialData?.city}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label required>Bairro</Label>
                        <Input
                            name="neighborhood"
                            placeholder="Ex: Pinheiros"
                            defaultValue={initialData?.neighborhood}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Zona (Opcional)</Label>
                        <Input
                            name="zone"
                            placeholder="Ex: 001"
                            defaultValue={initialData?.zone}
                        />
                    </FormGroup>
                </div>
            </div>

            <div className="pt-6 flex items-center justify-end gap-3">
                <Button
                    type="submit"
                    disabled={loading}
                    variant="default"
                    size="lg"
                    className="w-full md:w-auto min-w-[200px]"
                >
                    {loading ? "Processando..." : (
                        <>
                            {isEditing ? "Salvar Alterações" : "Cadastrar Membro"}
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
};

