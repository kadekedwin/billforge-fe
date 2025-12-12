'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Printer, CheckCircle2, AlertCircle, HelpCircle, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useBusiness } from '@/contexts/business-context';
import { getCurrencySymbol } from '@/lib/utils/currency';

interface PrinterConfig {
    printerType: string;
    printerPath: string;
    characterSet: string;
    removeSpecialCharacters: boolean;
    lineCharacter: string;
    timeout: number;
}

const DEFAULT_CONFIG: PrinterConfig = {
    printerType: 'EPSON',
    printerPath: '/dev/usb/lp0',
    characterSet: 'PC437_USA',
    removeSpecialCharacters: false,
    lineCharacter: '-',
    timeout: 5000,
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
    const { selectedBusiness } = useBusiness();
    const [config, setConfig] = useState<PrinterConfig>(DEFAULT_CONFIG);
    const [isTesting, setIsTesting] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [printerStatus, setPrinterStatus] = useState<'connected' | 'disconnected' | 'unknown'>('unknown');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const savedConfig = localStorage.getItem('printerConfig');
        if (savedConfig) {
            try {
                setConfig(JSON.parse(savedConfig));
            } catch (error) {
                console.error('Failed to load printer config:', error);
            }
        }
    }, []);

    const handleSaveConfig = () => {
        setIsSaving(true);
        try {
            localStorage.setItem('printerConfig', JSON.stringify(config));
            toast.success('Printer configuration saved');
        } catch {
            toast.error('Failed to save configuration');
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestPrint = async () => {
        if (!selectedBusiness) {
            toast.error('Please select a business first');
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
                    printerConfig: config
                }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Test print successful!');
                setPrinterStatus('connected');
            } else {
                toast.error(data.message || 'Test print failed');
                setPrinterStatus('disconnected');
            }
        } catch {
            toast.error('Failed to send test print');
            setPrinterStatus('disconnected');
        } finally {
            setIsTesting(false);
        }
    };

    const handleCheckStatus = async () => {
        setIsCheckingStatus(true);
        try {
            const response = await fetch('/api/printer-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ printerConfig: config }),
            });

            const data = await response.json();
            if (data.connected) {
                setPrinterStatus('connected');
                toast.success('Printer is connected');
            } else {
                setPrinterStatus('disconnected');
                toast.error('Printer is not connected');
            }
        } catch {
            setPrinterStatus('unknown');
            toast.error('Failed to check printer status');
        } finally {
            setIsCheckingStatus(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Printer Configuration</CardTitle>
                    <CardDescription>
                        Configure your thermal printer connection and settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="printer-type">Printer Type</Label>
                            <Select
                                value={config.printerType}
                                onValueChange={(value) => setConfig({ ...config, printerType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select printer type" />
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
                            <Label htmlFor="printer-path">Printer Path</Label>
                            <Input
                                id="printer-path"
                                value={config.printerPath}
                                onChange={(e) => setConfig({ ...config, printerPath: e.target.value })}
                                placeholder="/dev/usb/lp0"
                            />
                            <p className="text-xs text-muted-foreground">
                                Common: /dev/usb/lp0, COM1, tcp://192.168.1.100:9100
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="character-set">Character Set</Label>
                            <Select
                                value={config.characterSet}
                                onValueChange={(value) => setConfig({ ...config, characterSet: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select character set" />
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
                            <Label htmlFor="line-character">Line Character</Label>
                            <Input
                                id="line-character"
                                value={config.lineCharacter}
                                onChange={(e) => setConfig({ ...config, lineCharacter: e.target.value })}
                                placeholder="-"
                                maxLength={1}
                            />
                            <p className="text-xs text-muted-foreground">
                                Character used for drawing lines
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="timeout">Timeout (ms)</Label>
                            <Input
                                id="timeout"
                                type="number"
                                value={config.timeout}
                                onChange={(e) => setConfig({ ...config, timeout: parseInt(e.target.value) || 5000 })}
                                placeholder="5000"
                                min="1000"
                                max="30000"
                            />
                            <p className="text-xs text-muted-foreground">
                                Connection timeout in milliseconds
                            </p>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="remove-special"
                                checked={config.removeSpecialCharacters}
                                onCheckedChange={(checked) => setConfig({ ...config, removeSpecialCharacters: checked })}
                            />
                            <Label htmlFor="remove-special" className="cursor-pointer">
                                Remove Special Characters
                            </Label>
                        </div>
                    </div>

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
                            Save Configuration
                        </Button>
                    </div>

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
                            Check Status
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
                            Test Print
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
                                        {printerStatus === 'connected' ? 'Printer Connected' : 'Printer Disconnected'}
                                    </h4>
                                    <p className={`text-sm ${printerStatus === 'connected' ? 'text-green-700' : 'text-red-700'}`}>
                                        {printerStatus === 'connected'
                                            ? 'Your thermal printer is connected and ready to print.'
                                            : 'Unable to connect to the thermal printer. Check troubleshooting guide below.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5" />
                        Troubleshooting Guide
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold mb-2">Printer Not Detected</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            <li>Ensure the printer is powered on and connected via USB</li>
                            <li>Check that the USB cable is properly connected</li>
                            <li>Verify the printer path matches your system configuration</li>
                            <li>On Linux: Check permissions with <code className="bg-muted px-1 rounded">ls -l /dev/usb/lp*</code></li>
                            <li>On Windows: Use Device Manager to find the COM port</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Common Printer Paths</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            <li><strong>Linux:</strong> /dev/usb/lp0, /dev/usb/lp1</li>
                            <li><strong>Windows:</strong> COM1, COM2, COM3</li>
                            <li><strong>Network:</strong> tcp://192.168.1.100:9100</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Permission Issues (Linux)</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                            If you get permission denied errors, add your user to the lp group:
                        </p>
                        <code className="block bg-muted p-2 rounded text-sm">
                            sudo usermod -a -G lp $USER
                        </code>
                        <p className="text-xs text-muted-foreground mt-1">
                            Log out and log back in for changes to take effect
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Character Set Issues</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            <li>Use PC437_USA for standard English characters</li>
                            <li>Use PC850_MULTILINGUAL for European languages</li>
                            <li>Use WPC1252 for Western European characters</li>
                            <li>Enable &quot;Remove Special Characters&quot; if seeing garbled text</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
