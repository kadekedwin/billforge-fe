'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PreferencesSettings() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                        Customize how BillForge looks on your device
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <Label className="text-base">Theme</Label>
                        <p className="text-sm text-muted-foreground">
                            Select your preferred theme or use system setting
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                            <Button
                                variant={theme === 'light' ? 'default' : 'outline'}
                                onClick={() => setTheme('light')}
                                className="flex flex-col items-center gap-2 h-auto py-4"
                            >
                                <Sun className="h-5 w-5" />
                                <span>Light</span>
                            </Button>
                            <Button
                                variant={theme === 'dark' ? 'default' : 'outline'}
                                onClick={() => setTheme('dark')}
                                className="flex flex-col items-center gap-2 h-auto py-4"
                            >
                                <Moon className="h-5 w-5" />
                                <span>Dark</span>
                            </Button>
                            <Button
                                variant={theme === 'system' ? 'default' : 'outline'}
                                onClick={() => setTheme('system')}
                                className="flex flex-col items-center gap-2 h-auto py-4"
                            >
                                <Monitor className="h-5 w-5" />
                                <span>System</span>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Language & Region</CardTitle>
                    <CardDescription>
                        Set your language and regional preferences
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-base">Language</Label>
                        <p className="text-sm text-muted-foreground">
                            English (US) - Coming soon: More languages
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-base">Currency</Label>
                        <p className="text-sm text-muted-foreground">
                            USD ($) - Coming soon: Multi-currency support
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

