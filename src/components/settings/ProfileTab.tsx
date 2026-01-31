'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, FormGroup, Label } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { updateUserProfile, updatePassword } from '@/app/actions/settings';
import { User, Mail, Lock, Upload, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserSettings {
    id: string;
    fullName: string;
    email: string;
    profilePhoto: string | null;
    theme: 'light' | 'dark' | 'system';
    language: 'pt' | 'es' | 'en';
    notificationsEnabled: boolean;
}

interface ProfileTabProps {
    settings: UserSettings;
    onSettingsUpdate: (settings: Partial<UserSettings>) => void;
}

export function ProfileTab({ settings, onSettingsUpdate }: ProfileTabProps) {
    const [fullName, setFullName] = useState(settings.fullName);
    const [email, setEmail] = useState(settings.email);
    const [profilePhoto, setProfilePhoto] = useState<string | null>(settings.profilePhoto);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    const handleProfilePhotoChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // For now, store as base64 (in production, use proper file upload)
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            setLoading(true);
            const result = await updateUserProfile({ profilePhoto: base64 });
            setLoading(false);

            if (result.success) {
                setProfilePhoto(base64);
                onSettingsUpdate({ profilePhoto: base64 });
                setMessage({ type: 'success', text: 'Foto atualizada com sucesso!' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: result.error || 'Erro ao atualizar foto' });
            }
        };
        reader.readAsDataURL(file);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const result = await updateUserProfile({
            fullName: fullName !== settings.fullName ? fullName : undefined,
            email: email !== settings.email ? email : undefined,
        });

        setLoading(false);

        if (result.success) {
            onSettingsUpdate({ fullName, email });
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
            setTimeout(() => setMessage(null), 3000);
        } else {
            setMessage({ type: 'error', text: result.error || 'Erro ao atualizar perfil' });
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não conferem' });
            setLoading(false);
            return;
        }

        if (newPassword.length < 8) {
            setMessage({ type: 'error', text: 'A senha deve ter no mínimo 8 caracteres' });
            setLoading(false);
            return;
        }

        const result = await updatePassword(currentPassword, newPassword);
        setLoading(false);

        if (result.success) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
            setTimeout(() => setMessage(null), 3000);
        } else {
            setMessage({ type: 'error', text: result.error || 'Erro ao alterar senha' });
        }
    };

    return (
        <div className="space-y-6">
            {/* Message Alert */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex items-center gap-3 p-4 rounded border-l-4 ${
                        message.type === 'success'
                            ? 'bg-green-50 border-green-400 text-green-800'
                            : 'bg-red-50 border-red-400 text-red-800'
                    }`}
                >
                    {message.type === 'success' ? (
                        <Check className="h-5 w-5" />
                    ) : (
                        <AlertCircle className="h-5 w-5" />
                    )}
                    {message.text}
                </motion.div>
            )}

            {/* Profile Photo Section */}
            <Card className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-lg">Foto de Perfil</h3>
                        <p className="text-sm text-zinc-500 mt-1">
                            Adicione uma foto de perfil para personalizar sua conta
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {profilePhoto ? (
                        <img
                            src={profilePhoto}
                            alt="Profile"
                            className="h-24 w-24 rounded-full object-cover border-2 border-zinc-200"
                        />
                    ) : (
                        <div className="h-24 w-24 rounded-full bg-zinc-100 flex items-center justify-center border-2 border-dashed border-zinc-300">
                            <User className="h-10 w-10 text-zinc-400" />
                        </div>
                    )}

                    <label className="cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePhotoChange}
                            disabled={loading}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            className="flex items-center gap-2"
                            disabled={loading}
                            onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                input?.click();
                            }}
                        >
                            <Upload className="h-4 w-4" />
                            Alterar Foto
                        </Button>
                    </label>
                </div>
            </Card>

            {/* Personal Information Section */}
            <Card className="p-6">
                <h3 className="font-bold text-lg mb-6">Informações Pessoais</h3>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <FormGroup>
                        <Label htmlFor="fullName" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Nome Completo
                        </Label>
                        <Input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Seu nome completo"
                            disabled={loading}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu.email@exemplo.com"
                            disabled={loading}
                        />
                    </FormGroup>

                    <Button
                        type="submit"
                        disabled={
                            loading ||
                            (fullName === settings.fullName && email === settings.email)
                        }
                    >
                        Salvar Alterações
                    </Button>
                </form>
            </Card>

            {/* Change Password Section */}
            <Card className="p-6">
                <h3 className="font-bold text-lg mb-6">Alterar Senha</h3>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <FormGroup>
                        <Label htmlFor="currentPassword" className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Senha Atual
                        </Label>
                        <Input
                            id="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Digite sua senha atual"
                            disabled={loading}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="newPassword" className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Nova Senha
                        </Label>
                        <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Digite sua nova senha"
                            disabled={loading}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Confirmar Nova Senha
                        </Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirme sua nova senha"
                            disabled={loading}
                        />
                    </FormGroup>

                    <Button
                        type="submit"
                        disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                    >
                        Alterar Senha
                    </Button>
                </form>
            </Card>
        </div>
    );
}
