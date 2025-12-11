'use client';

import { UserCircle, FileText, Settings } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Dynamically import the settings components
const ProfileSettings = dynamic(() => import('./ProfileSettings'), { ssr: false });
const ReceiptSettings = dynamic(() => import('./ReceiptSettings'), { ssr: false });
const PreferencesSettings = dynamic(() => import('./PreferencesSettings'), { ssr: false });

const tabs = [
    {
        id: 'profile' as const,
        label: 'Profile',
        icon: UserCircle,
    },
    {
        id: 'receipt' as const,
        label: 'Receipt Settings',
        icon: FileText,
    },
    {
        id: 'preferences' as const,
        label: 'Preferences',
        icon: Settings,
    },
];

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
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
                <TabsContent value="preferences">
                    <PreferencesSettings />
                </TabsContent>
            </Tabs>
        </div>
    );
}
