'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserCircle, FileText } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the settings components
const ProfileSettings = dynamic(() => import('./ProfileSettings'), { ssr: false });
const ReceiptSettings = dynamic(() => import('./ReceiptSettings'), { ssr: false });

type SettingsTab = 'profile' | 'receipt';

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
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            </div>

            {/* Tab Selector */}
            <div className="border-b">
                <div className="flex space-x-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <Button
                                key={tab.id}
                                variant="ghost"
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative rounded-none border-b-2 px-4 py-2 ${
                                    isActive
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                {tab.label}
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="py-4">
                {activeTab === 'profile' && <ProfileSettings />}
                {activeTab === 'receipt' && <ReceiptSettings />}
            </div>
        </div>
    );
}

