'use client';

import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ChevronRight } from 'lucide-react';

const settingsCategories = [
    {
        title: 'Receipt Settings',
        description: 'Configure receipt templates and appearance',
        icon: FileText,
        href: '/settings/receipt'
    }
];

export default function SettingsPage() {
    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
            </div>

            <div className="grid gap-4">
                {settingsCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                        <Link key={category.href} href={category.href}>
                            <Card className="hover:border-blue-500 transition-all cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Icon className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <CardTitle>{category.title}</CardTitle>
                                                <CardDescription>{category.description}</CardDescription>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-gray-400" />
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

