'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useBusiness } from '@/contexts/business-context';
import { usePrinterSettings } from '@/lib/printer-settings/usePrinterSettings';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const ENCODING_OPTIONS = [
    'UTF-8',
    'GB18030',
    'Big5',
    'EUC-KR',
    'Shift_JIS',
] as const;

const PRINTER_PRESETS = {
    '58mm': { paper_width_mm: 58, chars_per_line: 32 },
    '80mm': { paper_width_mm: 80, chars_per_line: 48 },
} as const;

export default function PrinterSettings() {
    const { t } = useTranslation();
    const { selectedBusiness } = useBusiness();

    const {
        isLoading: isLoadingSettings,
        paperWidthMm,
        updatePaperWidthMm,
        charsPerLine,
        updateCharsPerLine,
        encoding,
        updateEncoding,
        feedLines,
        updateFeedLines,
        cutEnabled,
        updateCutEnabled,
        autoPrint,
        updateAutoPrint,
    } = usePrinterSettings({ businessUuid: selectedBusiness?.uuid || null });

    const handlePresetChange = (preset: '58mm' | '80mm') => {
        const presetValues = PRINTER_PRESETS[preset];
        updatePaperWidthMm(presetValues.paper_width_mm);
        updateCharsPerLine(presetValues.chars_per_line);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('app.settings.printerTab.configurations')}</CardTitle>
                    <CardDescription>{t('app.settings.printerTab.configurationsDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingSettings ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t('app.settings.printerTab.paperSize')}</Label>
                                <Select onValueChange={(value) => handlePresetChange(value as '58mm' | '80mm')}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('app.settings.printerTab.selectPaperSize')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="58mm">58mm (32 {t('app.settings.printerTab.chars')})</SelectItem>
                                        <SelectItem value="80mm">80mm (48 {t('app.settings.printerTab.chars')})</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t('app.settings.printerTab.paperWidth')}</Label>
                                    <Input
                                        type="number"
                                        value={paperWidthMm}
                                        onChange={(e) => updatePaperWidthMm(parseInt(e.target.value) || 80)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('app.settings.printerTab.charsPerLine')}</Label>
                                    <Input
                                        type="number"
                                        value={charsPerLine}
                                        onChange={(e) => updateCharsPerLine(parseInt(e.target.value) || 48)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>{t('app.settings.printerTab.encoding')}</Label>
                                <Select
                                    value={encoding}
                                    onValueChange={(value) => updateEncoding(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ENCODING_OPTIONS.map((enc) => (
                                            <SelectItem key={enc} value={enc}>
                                                {enc}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>{t('app.settings.printerTab.feedLines')}</Label>
                                <Input
                                    type="number"
                                    value={feedLines}
                                    onChange={(e) => updateFeedLines(parseInt(e.target.value) || 0)}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={cutEnabled}
                                    onCheckedChange={(checked) => updateCutEnabled(checked)}
                                />
                                <Label>{t('app.settings.printerTab.autoCut')}</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={autoPrint}
                                    onCheckedChange={(checked) => updateAutoPrint(checked)}
                                />
                                <Label>{t('app.settings.printerTab.autoPrint')}</Label>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
