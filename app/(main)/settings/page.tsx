'use client';

import { UserCircle, FileText, Settings, Printer } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ProfileSettings = dynamic(() => import('./ProfileSettings'), { ssr: false });
const ReceiptSettings = dynamic(() => import('./ReceiptSettings'), { ssr: false });
const PrinterSettings = dynamic(() => import('./PrinterSettings'), { ssr: false });
const PreferencesSettings = dynamic(() => import('./PreferencesSettings'), { ssr: false });

import { useTranslation } from '@/lib/i18n/useTranslation';

export default function SettingsPage() {
    const { t } = useTranslation();

    const tabs = [
        {
            id: 'profile' as const,
            label: t('app.settings.profile'),
            icon: UserCircle,
        },
        {
            id: 'receipt' as const,
            label: t('app.settings.receipt'),
            icon: FileText,
        },
        {
            id: 'printer' as const,
            label: t('app.settings.printer'),
            icon: Printer,
        },
        {
            id: 'preferences' as const,
            label: t('app.settings.preferences'),
            icon: Settings,
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('app.settings.title')}</h1>
            </div>

            <Tabs defaultValue="profile">
                <TabsList>
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <TabsTrigger key={tab.id} value={tab.id}>
                                <Icon className="mr-2 h-4 w-4" />
                                {tab.label}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                <TabsContent value="profile">
                    <ProfileSettings />
                </TabsContent>
                <TabsContent value="receipt">
                    <ReceiptSettings />
                </TabsContent>
                <TabsContent value="printer">
                    <PrinterSettings />
                </TabsContent>

                <TabsContent value="preferences">
                    <PreferencesSettings />
                </TabsContent>
            </Tabs>
        </div>
    );
}
