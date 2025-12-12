'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function PreferencesSettings() {
    const { theme, setTheme } = useTheme();
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('app.settings.preferencesTab.title')}</CardTitle>
                    <CardDescription>
                        {t('app.settings.preferencesTab.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <Label className="text-base">{t('app.settings.preferencesTab.theme')}</Label>
                        <p className="text-sm text-muted-foreground">
                            {t('app.settings.preferencesTab.themeDescription')}
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                            <Button
                                variant={theme === 'light' ? 'default' : 'outline'}
                                onClick={() => setTheme('light')}
                                className="flex flex-col items-center gap-2 h-auto py-4"
                            >
                                <Sun className="h-5 w-5" />
                                <span>{t('app.settings.preferencesTab.light')}</span>
                            </Button>
                            <Button
                                variant={theme === 'dark' ? 'default' : 'outline'}
                                onClick={() => setTheme('dark')}
                                className="flex flex-col items-center gap-2 h-auto py-4"
                            >
                                <Moon className="h-5 w-5" />
                                <span>{t('app.settings.preferencesTab.dark')}</span>
                            </Button>
                            <Button
                                variant={theme === 'system' ? 'default' : 'outline'}
                                onClick={() => setTheme('system')}
                                className="flex flex-col items-center gap-2 h-auto py-4"
                            >
                                <Monitor className="h-5 w-5" />
                                <span>{t('app.settings.preferencesTab.system')}</span>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

