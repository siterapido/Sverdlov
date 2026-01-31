'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileTab } from './ProfileTab';
import { PreferencesTab } from './PreferencesTab';
import { User, Bell } from 'lucide-react';

interface UserSettings {
    id: string;
    fullName: string;
    email: string;
    profilePhoto: string | null;
    theme: 'light' | 'dark' | 'system';
    language: 'pt' | 'es' | 'en';
    notificationsEnabled: boolean;
}

interface SettingsClientProps {
    initialSettings: UserSettings;
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
    const [settings, setSettings] = useState<UserSettings>(initialSettings);

    const handleSettingsUpdate = (updatedSettings: Partial<UserSettings>) => {
        setSettings((prev) => ({ ...prev, ...updatedSettings }));
    };

    return (
        <div className="max-w-3xl">
            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Perfil</span>
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span className="hidden sm:inline">Preferências</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <ProfileTab
                        settings={settings}
                        onSettingsUpdate={handleSettingsUpdate}
                    />
                </TabsContent>

                <TabsContent value="preferences">
                    <PreferencesTab
                        settings={settings}
                        onSettingsUpdate={handleSettingsUpdate}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
