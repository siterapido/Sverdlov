"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, FormGroup, Label } from "@/components/ui/input";
import { User, Mail, Phone, MapPin, Calendar, CreditCard, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MemberFormProps {
    initialData?: any;
    isEditing?: boolean;
    onSuccess?: () => void;
}

export const MemberForm = ({ initialData, isEditing = false, onSuccess }: MemberFormProps) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const router = useRouter();

    const [formData, setFormData] = useState({
        fullName: initialData?.fullName || "",
        socialName: initialData?.socialName || "",
        cpf: initialData?.cpf || "",
        voterTitle: initialData?.voterTitle || "",
        dateOfBirth: initialData?.dateOfBirth || "",
        gender: initialData?.gender || "",
        phone: initialData?.phone || "",
        email: initialData?.email || "",
        state: initialData?.state || "",
        city: initialData?.city || "",
        zone: initialData?.zone || "",
        neighborhood: initialData?.neighborhood || "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateStep = (currentStep: number) => {
        const errors: Record<string, string> = {};

        if (currentStep === 1) {
            if (!formData.fullName) errors.fullName = "Nome civil é obrigatório";
            if (!formData.cpf) errors.cpf = "CPF é obrigatório";
            if (!formData.dateOfBirth) errors.dateOfBirth = "Data de nascimento é obrigatória";
            if (!formData.phone) errors.phone = "Telefone é obrigatório";
            if (!formData.email) errors.email = "Email é obrigatório";
        } else if (currentStep === 2) {
            if (!formData.state) errors.state = "Estado é obrigatório";
            if (!formData.city) errors.city = "Cidade é obrigatória";
            if (!formData.neighborhood) errors.neighborhood = "Bairro é obrigatório";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const isValid = validateStep(step);
        if (!isValid) {
            setError("Por favor, preencha todos os campos obrigatórios sinalizados.");
            return;
        }

        if (step === 1) {
            setStep(2);
            setError("");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const endpoint = isEditing ? `/api/members/${initialData.id}` : "/api/members";
            const method = isEditing ? "PATCH" : "POST";

            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ao ${isEditing ? "atualizar" : "cadastrar"} membro`);
            }

            router.refresh();
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pb-4">
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-10">
                {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-2 relative flex-1 last:flex-none">
                        <div className={cn(
                            "h-8 w-8 flex items-center justify-center font-black transition-all border-2 text-xs",
                            step >= i ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-200 text-zinc-300"
                        )}>
                            {i}
                        </div>
                        <div className="flex flex-col">
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest",
                                step >= i ? "text-zinc-900" : "text-zinc-300"
                            )}>
                                Passo {i}
                            </span>
                            <span className={cn(
                                "text-[10px] font-bold uppercase",
                                step >= i ? "text-zinc-500" : "text-zinc-400"
                            )}>
                                {i === 1 ? "Dados Estatutários" : "Localização"}
                            </span>
                        </div>
                        {i === 1 && (
                            <div className="mx-4 h-[1px] flex-1 bg-zinc-100 relative overflow-hidden">
                                <motion.div
                                    className="absolute inset-0 bg-zinc-900 origin-left"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: step > 1 ? 1 : 0 }}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-red-50 border-2 border-red-600 rounded-none text-red-600 flex items-center gap-4 mb-8"
                >
                    <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse shrink-0" />
                    <span className="text-[11px] font-black uppercase tracking-widest">{error}</span>
                </motion.div>
            )}

            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-10"
                        >
                            <div className="flex items-center gap-3 pb-3 border-b-2 border-zinc-900/5">
                                <User className="h-4 w-4 text-zinc-900" />
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900">Informações Estatutárias</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-y-6">
                                <FormGroup>
                                    <Label required>Nome Civil Completo</Label>
                                    <Input
                                        name="fullName"
                                        placeholder="EX: JOÃO DA SILVA"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        leftIcon={<User className="h-4 w-4" />}
                                        error={fieldErrors.fullName}
                                        required
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label>Nome Social / Identidade</Label>
                                    <Input
                                        name="socialName"
                                        placeholder="COMO PREFERE SER CHAMADO"
                                        value={formData.socialName}
                                        onChange={handleInputChange}
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label required>Cadastro de Pessoa Física (CPF)</Label>
                                    <Input
                                        name="cpf"
                                        placeholder="000.000.000-00"
                                        value={formData.cpf}
                                        onChange={handleInputChange}
                                        leftIcon={<CreditCard className="h-4 w-4" />}
                                        error={fieldErrors.cpf}
                                        required
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label>Título de Eleitor</Label>
                                    <Input
                                        name="voterTitle"
                                        placeholder="NÚMERO DO TÍTULO"
                                        value={formData.voterTitle}
                                        onChange={handleInputChange}
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label required>Data de Nascimento</Label>
                                    <Input
                                        name="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        leftIcon={<Calendar className="h-4 w-4" />}
                                        error={fieldErrors.dateOfBirth}
                                        required
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label required>Telefone / Comunicação</Label>
                                    <Input
                                        name="phone"
                                        placeholder="(11) 99999-9999"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        leftIcon={<Phone className="h-4 w-4" />}
                                        error={fieldErrors.phone}
                                        required
                                    />
                                </FormGroup>

                                <FormGroup className="md:col-span-2">
                                    <Label required>Endereço de Correio Eletrônico (Email)</Label>
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="JOAO@EXEMPLO.COM"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        leftIcon={<Mail className="h-4 w-4" />}
                                        error={fieldErrors.email}
                                        required
                                    />
                                </FormGroup>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-10"
                        >
                            <div className="flex items-center gap-3 pb-3 border-b-2 border-zinc-900/5">
                                <MapPin className="h-4 w-4 text-zinc-900" />
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900">Território e Localidade</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-y-6">
                                <FormGroup>
                                    <Label required>Unidade Federativa (UF)</Label>
                                    <div className="relative">
                                        <select
                                            name="state"
                                            className={cn(
                                                "flex h-11 w-full rounded-none border-2 bg-white px-3 py-2 text-[13px] font-black uppercase tracking-tight outline-none transition-all appearance-none",
                                                fieldErrors.state ? "border-red-500 focus:border-red-500" : "border-zinc-200 focus:border-zinc-900"
                                            )}
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">SELECIONE O ESTADO...</option>
                                            <option value="AC">ACRE</option>
                                            <option value="AL">ALAGOAS</option>
                                            <option value="AP">AMAPÁ</option>
                                            <option value="AM">AMAZONAS</option>
                                            <option value="BA">BAHIA</option>
                                            <option value="CE">CEARÁ</option>
                                            <option value="DF">DISTRITO FEDERAL</option>
                                            <option value="ES">ESPÍRITO SANTO</option>
                                            <option value="GO">GOIÁS</option>
                                            <option value="MA">MARANHÃO</option>
                                            <option value="MT">MATO GROSSO</option>
                                            <option value="MS">MATO GROSSO DO SUL</option>
                                            <option value="MG">MINAS GERAIS</option>
                                            <option value="PA">PARÁ</option>
                                            <option value="PB">PARAÍBA</option>
                                            <option value="PR">PARANÁ</option>
                                            <option value="PE">PERNAMBUCO</option>
                                            <option value="PI">PIAUÍ</option>
                                            <option value="RJ">RIO DE JANEIRO</option>
                                            <option value="RN">RIO GRANDE DO NORTE</option>
                                            <option value="RS">RIO GRANDE DO SUL</option>
                                            <option value="RO">RONDÔNIA</option>
                                            <option value="RR">RORAIMA</option>
                                            <option value="SC">SANTA CATARINA</option>
                                            <option value="SP">SÃO PAULO</option>
                                            <option value="SE">SERGIPE</option>
                                            <option value="TO">TOCANTINS</option>
                                        </select>
                                        {fieldErrors.state && (
                                            <p className="text-red-500 text-xs mt-1 font-medium">{fieldErrors.state}</p>
                                        )}
                                    </div>
                                </FormGroup>

                                <FormGroup>
                                    <Label required>Cidade</Label>
                                    <Input
                                        name="city"
                                        placeholder="EX: SÃO PAULO"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        error={fieldErrors.city}
                                        required
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label required>Bairro / Comunidade</Label>
                                    <Input
                                        name="neighborhood"
                                        placeholder="EX: PINHEIROS"
                                        value={formData.neighborhood}
                                        onChange={handleInputChange}
                                        error={fieldErrors.neighborhood}
                                        required
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label>Zona Eleitoral (Se houver)</Label>
                                    <Input
                                        name="zone"
                                        placeholder="EX: 001"
                                        value={formData.zone}
                                        onChange={handleInputChange}
                                    />
                                </FormGroup>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 border-t border-zinc-100">
                <div className="w-full sm:w-auto order-2 sm:order-1">
                    {step > 1 && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep(step - 1)}
                            className="w-full sm:w-auto border-2 border-zinc-900 rounded-none font-black uppercase tracking-widest text-[11px]"
                        >
                            Voltar
                        </Button>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    variant="default"
                    size="lg"
                    className="w-full sm:min-w-[200px] order-1 sm:order-2 bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-widest rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:translate-y-0.5 active:shadow-none"
                >
                    {loading ? "PROCESSANDO..." : (
                        <>
                            {step === 1 ? "PRÓXIMO PASSO" : (isEditing ? "SALVAR ALTERAÇÕES" : "CADASTRAR FILIADO")}
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
};

