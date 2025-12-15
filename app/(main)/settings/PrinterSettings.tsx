'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Printer, CheckCircle2, AlertCircle, HelpCircle, Save, Wifi, Bluetooth, Cable, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useBusiness } from '@/contexts/business-context';
import { getCurrencySymbol } from '@/lib/utils/currency';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type {
    PrinterSettings,
    ThermalSettings,
    NetworkSettings,
    BluetoothSettings,
    ConnectionType
} from '@/lib/thermal-printer/types';

const DEFAULT_THERMAL_CONFIG: ThermalSettings = {
    connectionType: 'thermal',
    config: {
        printerType: 'EPSON',
        printerPath: '/dev/usb/lp0',
        characterSet: 'PC437_USA',
        removeSpecialCharacters: false,
        lineCharacter: '-',
        timeout: 5000,
    }
};

const DEFAULT_NETWORK_CONFIG: NetworkSettings = {
    connectionType: 'network',
    config: {
        ipAddress: '192.168.1.100',
        port: 9100,
        protocol: 'raw',
    }
};

const DEFAULT_BLUETOOTH_CONFIG: BluetoothSettings = {
    connectionType: 'bluetooth',
    config: {
        deviceName: '',
        macAddress: '',
        paired: false,
    }
};

const PRINTER_TYPES = ['EPSON', 'STAR', 'TANCA', 'DARUMA'];

const CHARACTER_SETS = [
    'PC437_USA',
    'PC850_MULTILINGUAL',
    'PC860_PORTUGUESE',
    'PC863_CANADIAN_FRENCH',
    'PC865_NORDIC',
    'PC851_GREEK',
    'PC857_TURKISH',
    'PC737_GREEK',
    'ISO8859_7_GREEK',
    'WPC1252',
    'PC866_CYRILLIC2',
    'PC852_LATIN2',
    'SLOVENIA',
    'PC858_EURO',
    'WPC775_BALTIC_RIM',
    'PC855_CYRILLIC',
    'PC861_ICELANDIC',
    'PC862_HEBREW',
    'PC864_ARABIC',
    'PC869_GREEK',
    'ISO8859_2_LATIN2',
    'ISO8859_15_LATIN9',
    'PC1125_UKRANIAN',
    'WPC1250_LATIN2',
    'WPC1251_CYRILLIC',
    'WPC1253_GREEK',
    'WPC1254_TURKISH',
    'WPC1255_HEBREW',
    'WPC1256_ARABIC',
    'WPC1257_BALTIC_RIM',
    'WPC1258_VIETNAMESE',
    'KZ1048_KAZAKHSTAN',
];


export default function PrinterSettings() {
    const { t } = useTranslation();
    const { selectedBusiness } = useBusiness();
    const [settings, setSettings] = useState<PrinterSettings>(DEFAULT_THERMAL_CONFIG);
    const [isTesting, setIsTesting] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [printerStatus, setPrinterStatus] = useState<'connected' | 'disconnected' | 'unknown'>('unknown');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const savedSettings = localStorage.getItem('printerSettings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                if (parsed.connectionType) {
                    setSettings(parsed);
                } else {
                    const migrated: ThermalSettings = {
                        connectionType: 'thermal',
                        config: parsed
                    };
                    setSettings(migrated);
                }
            } catch (error) {
                console.error('Failed to load printer settings:', error);
            }
        }
    }, []);

    const handleConnectionTypeChange = (type: ConnectionType) => {
        switch (type) {
            case 'thermal':
                setSettings(DEFAULT_THERMAL_CONFIG);
                break;
            case 'network':
                setSettings(DEFAULT_NETWORK_CONFIG);
                break;
            case 'bluetooth':
                setSettings(DEFAULT_BLUETOOTH_CONFIG);
                break;
        }
    };

    const handleSaveConfig = () => {
        setIsSaving(true);
        try {
            localStorage.setItem('printerSettings', JSON.stringify(settings));
            toast.success(t('app.settings.printerTab.toastSaved'));
        } catch {
            toast.error(t('app.settings.printerTab.toastSaveFailed'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestPrint = async () => {
        if (!selectedBusiness) {
            toast.error(t('app.settings.printerTab.toastSelectBusiness'));
            return;
        }

        if (settings.connectionType !== 'thermal') {
            toast.error('Only thermal printing is currently supported');
            return;
        }

        setIsTesting(true);
        try {
            const currencySymbol = getCurrencySymbol(selectedBusiness.currency);
            const testReceipt = {
                receiptNumber: 'TEST-001',
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
                storeName: selectedBusiness.name,
                storeAddress: selectedBusiness.address || undefined,
                storePhone: selectedBusiness.phone || undefined,
                items: [
                    {
                        id: '1',
                        name: 'Test Item',
                        quantity: 1,
                        price: 10.00,
                        total: 10.00,
                    },
                ],
                subtotal: 10.00,
                tax: 1.00,
                discount: 0,
                total: 11.00,
                paymentMethod: 'Cash',
                currencySymbol: currencySymbol,
            };

            const response = await fetch('/api/print-thermal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiptData: testReceipt,
                    printerConfig: settings.config
                }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success(t('app.settings.printerTab.toastTestSuccess'));
                setPrinterStatus('connected');
            } else {
                toast.error(data.message || t('app.settings.printerTab.toastTestFailed'));
                setPrinterStatus('disconnected');
            }
        } catch {
            toast.error(t('app.settings.printerTab.toastTestError'));
            setPrinterStatus('disconnected');
        } finally {
            setIsTesting(false);
        }
    };

    const handleCheckStatus = async () => {
        if (settings.connectionType !== 'thermal') {
            toast.error('Only thermal printing is currently supported');
            return;
        }

        setIsCheckingStatus(true);
        try {
            const response = await fetch('/api/printer-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ printerConfig: settings.config }),
            });

            const data = await response.json();
            if (data.connected) {
                setPrinterStatus('connected');
                toast.success(t('app.settings.printerTab.toastConnected'));
            } else {
                setPrinterStatus('disconnected');
                toast.error(t('app.settings.printerTab.toastNotConnected'));
            }
        } catch {
            setPrinterStatus('unknown');
            toast.error(t('app.settings.printerTab.toastCheckError'));
        } finally {
            setIsCheckingStatus(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('app.settings.printerTab.title')}</CardTitle>
                    <CardDescription>
                        {t('app.settings.printerTab.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <Label>{t('app.settings.printerTab.connectionType')}</Label>
                        <RadioGroup
                            value={settings.connectionType}
                            onValueChange={(value) => handleConnectionTypeChange(value as ConnectionType)}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                            <div>
                                <RadioGroupItem value="thermal" id="thermal" className="peer sr-only" />
                                <Label
                                    htmlFor="thermal"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <Cable className="mb-3 h-6 w-6" />
                                    <div className="text-center">
                                        <div className="font-semibold">{t('app.settings.printerTab.thermalUSB')}</div>
                                        <div className="text-xs text-muted-foreground mt-1">{t('app.settings.printerTab.thermalUSBDesc')}</div>
                                    </div>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="network" id="network" className="peer sr-only" />
                                <Label
                                    htmlFor="network"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <Wifi className="mb-3 h-6 w-6" />
                                    <div className="text-center">
                                        <div className="font-semibold">{t('app.settings.printerTab.network')}</div>
                                        <div className="text-xs text-muted-foreground mt-1">{t('app.settings.printerTab.networkDesc')}</div>
                                    </div>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="bluetooth" id="bluetooth" className="peer sr-only" />
                                <Label
                                    htmlFor="bluetooth"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <Bluetooth className="mb-3 h-6 w-6" />
                                    <div className="text-center">
                                        <div className="font-semibold">{t('app.settings.printerTab.bluetooth')}</div>
                                        <div className="text-xs text-muted-foreground mt-1">{t('app.settings.printerTab.bluetoothDesc')}</div>
                                    </div>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {settings.connectionType !== 'thermal' && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <div className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-blue-900">{t('app.settings.printerTab.comingSoon')}</h4>
                                    <p className="text-sm text-blue-700">
                                        {settings.connectionType === 'network'
                                            ? t('app.settings.printerTab.networkComingSoon')
                                            : t('app.settings.printerTab.bluetoothComingSoon')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {settings.connectionType === 'thermal' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="printer-type">{t('app.settings.printerTab.printerType')}</Label>
                                <Select
                                    value={settings.config.printerType}
                                    onValueChange={(value) => setSettings({ ...settings, config: { ...settings.config, printerType: value } })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('app.settings.printerTab.selectType')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRINTER_TYPES.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="printer-path">{t('app.settings.printerTab.printerPath')}</Label>
                                <Input
                                    id="printer-path"
                                    value={settings.config.printerPath}
                                    onChange={(e) => setSettings({ ...settings, config: { ...settings.config, printerPath: e.target.value } })}
                                    placeholder="/dev/usb/lp0"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t('app.settings.printerTab.pathHelp')}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="character-set">{t('app.settings.printerTab.characterSet')}</Label>
                                <Select
                                    value={settings.config.characterSet}
                                    onValueChange={(value) => setSettings({ ...settings, config: { ...settings.config, characterSet: value } })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('app.settings.printerTab.selectCharset')} />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                        {CHARACTER_SETS.map((charset) => (
                                            <SelectItem key={charset} value={charset}>
                                                {charset}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="line-character">{t('app.settings.printerTab.lineCharacter')}</Label>
                                <Input
                                    id="line-character"
                                    value={settings.config.lineCharacter}
                                    onChange={(e) => setSettings({ ...settings, config: { ...settings.config, lineCharacter: e.target.value } })}
                                    placeholder="-"
                                    maxLength={1}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t('app.settings.printerTab.lineCharacterHelp')}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timeout">{t('app.settings.printerTab.timeout')}</Label>
                                <Input
                                    id="timeout"
                                    type="number"
                                    value={settings.config.timeout}
                                    onChange={(e) => setSettings({ ...settings, config: { ...settings.config, timeout: parseInt(e.target.value) || 5000 } })}
                                    placeholder="5000"
                                    min="1000"
                                    max="30000"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t('app.settings.printerTab.timeoutHelp')}
                                </p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="remove-special"
                                    checked={settings.config.removeSpecialCharacters}
                                    onCheckedChange={(checked) => setSettings({ ...settings, config: { ...settings.config, removeSpecialCharacters: checked } })}
                                />
                                <Label htmlFor="remove-special" className="cursor-pointer">
                                    {t('app.settings.printerTab.removeSpecial')}
                                </Label>
                            </div>
                        </div>
                    )}

                    {settings.connectionType === 'network' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ip-address">{t('app.settings.printerTab.ipAddress')}</Label>
                                <Input
                                    id="ip-address"
                                    value={settings.config.ipAddress}
                                    onChange={(e) => setSettings({ ...settings, config: { ...settings.config, ipAddress: e.target.value } })}
                                    placeholder="192.168.1.100"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="port">{t('app.settings.printerTab.port')}</Label>
                                <Input
                                    id="port"
                                    type="number"
                                    value={settings.config.port}
                                    onChange={(e) => setSettings({ ...settings, config: { ...settings.config, port: parseInt(e.target.value) || 9100 } })}
                                    placeholder="9100"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="protocol">{t('app.settings.printerTab.protocol')}</Label>
                                <Select
                                    value={settings.config.protocol}
                                    onValueChange={(value: 'raw' | 'ipp') => setSettings({ ...settings, config: { ...settings.config, protocol: value } })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="raw">{t('app.settings.printerTab.rawProtocol')}</SelectItem>
                                        <SelectItem value="ipp">{t('app.settings.printerTab.ippProtocol')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {settings.connectionType === 'bluetooth' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="device-name">{t('app.settings.printerTab.deviceName')}</Label>
                                <Input
                                    id="device-name"
                                    value={settings.config.deviceName}
                                    onChange={(e) => setSettings({ ...settings, config: { ...settings.config, deviceName: e.target.value } })}
                                    placeholder="Bluetooth Printer"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="mac-address">{t('app.settings.printerTab.macAddress')}</Label>
                                <Input
                                    id="mac-address"
                                    value={settings.config.macAddress}
                                    onChange={(e) => setSettings({ ...settings, config: { ...settings.config, macAddress: e.target.value } })}
                                    placeholder="00:11:22:33:44:55"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="paired"
                                    checked={settings.config.paired}
                                    onCheckedChange={(checked) => setSettings({ ...settings, config: { ...settings.config, paired: checked } })}
                                />
                                <Label htmlFor="paired" className="cursor-pointer">
                                    {t('app.settings.printerTab.devicePaired')}
                                </Label>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 pt-4">
                        <Button
                            onClick={handleSaveConfig}
                            disabled={isSaving}
                            variant="default"
                            className="flex-1"
                        >
                            {isSaving ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            {t('app.settings.printerTab.saveConfig')}
                        </Button>
                    </div>

                    {settings.connectionType === 'thermal' && (
                        <>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleCheckStatus}
                                    disabled={isCheckingStatus}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    {isCheckingStatus ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Printer className="mr-2 h-4 w-4" />
                                    )}
                                    {t('app.settings.printerTab.checkStatus')}
                                </Button>
                                <Button
                                    onClick={handleTestPrint}
                                    disabled={isTesting}
                                    className="flex-1"
                                >
                                    {isTesting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Printer className="mr-2 h-4 w-4" />
                                    )}
                                    {t('app.settings.printerTab.testPrint')}
                                </Button>
                            </div>

                            {printerStatus !== 'unknown' && (
                                <div className={`rounded-lg border p-4 ${printerStatus === 'connected' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                    <div className="flex items-start gap-3">
                                        {printerStatus === 'connected' ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                        )}
                                        <div>
                                            <h4 className={`font-semibold ${printerStatus === 'connected' ? 'text-green-900' : 'text-red-900'}`}>
                                                {printerStatus === 'connected' ? t('app.settings.printerTab.connected') : t('app.settings.printerTab.disconnected')}
                                            </h4>
                                            <p className={`text-sm ${printerStatus === 'connected' ? 'text-green-700' : 'text-red-700'}`}>
                                                {printerStatus === 'connected'
                                                    ? t('app.settings.printerTab.connectedMessage')
                                                    : t('app.settings.printerTab.disconnectedMessage')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5" />
                        {t('app.settings.printerTab.troubleshooting')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold mb-2">{t('app.settings.printerTab.printerNotDetected')}</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            <li>{t('app.settings.printerTab.ensurePowered')}</li>
                            <li>{t('app.settings.printerTab.checkUSB')}</li>
                            <li>{t('app.settings.printerTab.verifyPath')}</li>
                            <li>{t('app.settings.printerTab.linuxPermissions')} <code className="bg-muted px-1 rounded">ls -l /dev/usb/lp*</code></li>
                            <li>{t('app.settings.printerTab.windowsDevice')}</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">{t('app.settings.printerTab.commonPaths')}</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            <li><strong>{t('app.settings.printerTab.linux')}:</strong> /dev/usb/lp0, /dev/usb/lp1</li>
                            <li><strong>{t('app.settings.printerTab.windows')}:</strong> COM1, COM2, COM3</li>
                            <li><strong>{t('app.settings.printerTab.network')}:</strong> tcp://192.168.1.100:9100</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">{t('app.settings.printerTab.permissionIssues')}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                            {t('app.settings.printerTab.permissionDesc')}
                        </p>
                        <code className="block bg-muted p-2 rounded text-sm">
                            sudo usermod -a -G lp $USER
                        </code>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t('app.settings.printerTab.logoutNote')}
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">{t('app.settings.printerTab.charsetIssues')}</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            <li>{t('app.settings.printerTab.usePC437')}</li>
                            <li>{t('app.settings.printerTab.usePC850')}</li>
                            <li>{t('app.settings.printerTab.useWPC1252')}</li>
                            <li>{t('app.settings.printerTab.enableRemove')}</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
