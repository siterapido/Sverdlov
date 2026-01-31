'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/input';
import { updateUserPreferences } from '@/app/actions/settings';
import { useTheme } from '@/components/layout/ThemeProvider';
import { Sun, Moon, Monitor, Globe, Bell, Check, AlertCircle } from 'lucide-react';
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

interface PreferencesTabProps {
    settings: UserSettings;
    onSettingsUpdate: (settings: Partial<UserSettings>) => void;
}

type Theme = 'light' | 'dark' | 'system';
type Language = 'pt' | 'es' | 'en';

const THEMES: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Claro', icon: <Sun className="h-5 w-5" /> },
    { value: 'dark', label: 'Escuro', icon: <Moon className="h-5 w-5" /> },
    { value: 'system', label: 'Sistema', icon: <Monitor className="h-5 w-5" /> },
];

const LANGUAGES: { value: Language; label: string; code: string }[] = [
    { value: 'pt', label: 'Português', code: 'PT-BR' },
    { value: 'es', label: 'Español', code: 'ES' },
    { value: 'en', label: 'English', code: 'EN' },
];

export function PreferencesTab({ settings, onSettingsUpdate }: PreferencesTabProps) {
    const { setTheme: setAppTheme } = useTheme();
    const [theme, setTheme] = useState<Theme>(settings.theme);
    const [language, setLanguage] = useState<Language>(settings.language);
    const [notificationsEnabled, setNotificationsEnabled] = useState(
        settings.notificationsEnabled
    );

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    const handleThemeChange = async (newTheme: Theme) => {
        setTheme(newTheme);
        setAppTheme(newTheme);
        setLoading(true);

        const result = await updateUserPreferences({ theme: newTheme });
        setLoading(false);

        if (result.success) {
            onSettingsUpdate({ theme: newTheme });
            setMessage({ type: 'success', text: 'Tema atualizado com sucesso!' });
            setTimeout(() => setMessage(null), 3000);
        } else {
            setTheme(settings.theme);
            setAppTheme(settings.theme);
            setMessage({ type: 'error', text: result.error || 'Erro ao atualizar tema' });
        }
    };

    const handleLanguageChange = async (newLanguage: Language) => {
        setLanguage(newLanguage);
        setLoading(true);

        const result = await updateUserPreferences({ language: newLanguage });
        setLoading(false);

        if (result.success) {
            onSettingsUpdate({ language: newLanguage });
            setMessage({ type: 'success', text: 'Idioma atualizado com sucesso!' });
            setTimeout(() => setMessage(null), 3000);
        } else {
            setLanguage(settings.language);
            setMessage({ type: 'error', text: result.error || 'Erro ao atualizar idioma' });
        }
    };

    const handleNotificationsChange = async () => {
        const newValue = !notificationsEnabled;
        setNotificationsEnabled(newValue);
        setLoading(true);

        const result = await updateUserPreferences({
            notificationsEnabled: newValue,
        });
        setLoading(false);

        if (result.success) {
            onSettingsUpdate({ notificationsEnabled: newValue });
            setMessage({
                type: 'success',
                text: newValue
                    ? 'Notificações ativadas!'
                    : 'Notificações desativadas!',
            });
            setTimeout(() => setMessage(null), 3000);
        } else {
            setNotificationsEnabled(settings.notificationsEnabled);
            setMessage({
                type: 'error',
                text: result.error || 'Erro ao atualizar notificações',
            });
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

            {/* Theme Preference */}
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Sun className="h-5 w-5 text-zinc-600" />
                    <h3 className="font-bold text-lg">Aparência</h3>
                </div>

                <div className="space-y-3">
                    <p className="text-sm text-zinc-600">Escolha o tema da sua interface</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {THEMES.map((t) => (
                            <motion.button
                                key={t.value}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleThemeChange(t.value)}
                                disabled={loading}
                                className={`p-4 rounded border-2 transition-all flex flex-col items-center gap-2 ${
                                    theme === t.value
                                        ? 'border-primary bg-primary/5'
                                        : 'border-zinc-200 hover:border-zinc-300'
                                }`}
                            >
                                <div
                                    className={`${
                                        theme === t.value ? 'text-primary' : 'text-zinc-600'
                                    }`}
                                >
                                    {t.icon}
                                </div>
                                <span className="text-sm font-medium">{t.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Language Preference */}
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Globe className="h-5 w-5 text-zinc-600" />
                    <h3 className="font-bold text-lg">Idioma</h3>
                </div>

                <div className="space-y-3">
                    <p className="text-sm text-zinc-600">Selecione seu idioma preferido</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {LANGUAGES.map((lang) => (
                            <motion.button
                                key={lang.value}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleLanguageChange(lang.value)}
                                disabled={loading}
                                className={`p-4 rounded border-2 transition-all flex flex-col items-center gap-2 ${
                                    language === lang.value
                                        ? 'border-primary bg-primary/5'
                                        : 'border-zinc-200 hover:border-zinc-300'
                                }`}
                            >
                                <span className="font-bold text-sm">{lang.code}</span>
                                <span className="text-sm font-medium">{lang.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Notifications */}
            <Card className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-zinc-600" />
                        <div>
                            <h3 className="font-bold text-lg">Notificações</h3>
                            <p className="text-sm text-zinc-600 mt-1">
                                Receba alertas e atualizações sobre atividades do sistema
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNotificationsChange}
                        disabled={loading}
                        className={`w-full p-4 rounded border-2 transition-all flex items-center justify-between ${
                            notificationsEnabled
                                ? 'border-primary bg-primary/5'
                                : 'border-zinc-200 hover:border-zinc-300'
                        }`}
                    >
                        <span className="font-medium">
                            {notificationsEnabled
                                ? 'Notificações Ativadas'
                                : 'Notificações Desativadas'}
                        </span>
                        <div
                            className={`w-6 h-6 rounded flex items-center justify-center ${
                                notificationsEnabled
                                    ? 'bg-primary text-white'
                                    : 'bg-zinc-200'
                            }`}
                        >
                            {notificationsEnabled && <Check className="h-4 w-4" />}
                        </div>
                    </motion.button>
                </div>
            </Card>
        </div>
    );
}
