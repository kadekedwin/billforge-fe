'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Wifi, WifiOff, Bluetooth, Trash2 } from 'lucide-react';
import { PrintClientWebSocket } from '@/lib/print-client';
import { BluetoothDevice, ConnectionStatus } from '@/types/printer';
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

const STORAGE_KEY = 'printer_auto_connect';

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
    const [ws, setWs] = useState<PrintClientWebSocket | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
    const [devices, setDevices] = useState<BluetoothDevice[]>([]);
    const [connectedDevices, setConnectedDevices] = useState<BluetoothDevice[]>([]);
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [ignoreUnknown, setIgnoreUnknown] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingDeviceId, setLoadingDeviceId] = useState<string | null>(null);

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
    } = usePrinterSettings({ businessUuid: selectedBusiness?.uuid || null });

    const handleConnect = async () => {
        try {
            setError(null);
            const client = new PrintClientWebSocket();

            client.onStatusChange((status) => {
                setConnectionStatus(status);
                if (status === 'disconnected' || status === 'error') {
                    setDevices([]);
                    setConnectedDevices([]);
                }
            });

            await client.connect();
            setWs(client);
            localStorage.setItem(STORAGE_KEY, 'true');

            try {
                const response = await client.getConnectedDevices();
                if (response.success) {
                    setConnectedDevices(response.devices);
                }
            } catch (err) {
                console.error('Failed to load connected devices:', err);
            }
        } catch (err) {
            setError(t('app.settings.printerTab.errorConnect'));
            console.error('Failed to connect to print client:', err);
        }
    };

    useEffect(() => {
        const shouldAutoConnect = localStorage.getItem(STORAGE_KEY) === 'true';
        if (shouldAutoConnect) {
            handleConnect();
        }

        return () => {
            if (ws) {
                ws.disconnect();
            }
        };
    }, []);

    const handleDisconnect = () => {
        if (ws) {
            ws.disconnect();
            setWs(null);
        }
        localStorage.removeItem(STORAGE_KEY);
        setDevices([]);
        setConnectedDevices([]);
    };

    const handleDiscover = async () => {
        if (!ws) return;

        try {
            setError(null);
            setIsDiscovering(true);
            const response = await ws.discover(ignoreUnknown);

            if (response.success) {
                setDevices(response.devices);
            } else {
                setError(t('app.settings.printerTab.errorDiscover'));
            }
        } catch (err) {
            setError(t('app.settings.printerTab.errorDiscover'));
            console.error('Failed to discover devices:', err);
        } finally {
            setIsDiscovering(false);
        }
    };

    const handleConnectDevice = async (deviceId: string) => {
        if (!ws) return;

        try {
            setError(null);
            setLoadingDeviceId(deviceId);
            const response = await ws.connectDevice(deviceId);

            if (response.success) {
                const connectedResponse = await ws.getConnectedDevices();
                if (connectedResponse.success) {
                    setConnectedDevices(connectedResponse.devices);
                }

                setDevices(prevDevices =>
                    prevDevices.map(d =>
                        d.id === deviceId ? { ...d, connected: true } : d
                    )
                );
            } else {
                setError(t('app.settings.printerTab.errorConnectDevice'));
            }
        } catch (err) {
            setError(t('app.settings.printerTab.errorConnectDevice'));
            console.error('Failed to connect device:', err);
        } finally {
            setLoadingDeviceId(null);
        }
    };

    const handleDisconnectDevice = async (deviceId: string) => {
        if (!ws) return;

        try {
            setError(null);
            setLoadingDeviceId(deviceId);
            const response = await ws.disconnectDevice(deviceId);

            if (response.success) {
                const connectedResponse = await ws.getConnectedDevices();
                if (connectedResponse.success) {
                    setConnectedDevices(connectedResponse.devices);
                }

                setDevices(prevDevices =>
                    prevDevices.map(d =>
                        d.id === deviceId ? { ...d, connected: false } : d
                    )
                );
            } else {
                setError(t('app.settings.printerTab.errorDisconnectDevice'));
            }
        } catch (err) {
            setError(t('app.settings.printerTab.errorDisconnectDevice'));
            console.error('Failed to disconnect device:', err);
        } finally {
            setLoadingDeviceId(null);
        }
    };

    const handleClearDevices = async () => {
        if (!ws) return;

        try {
            setError(null);
            const response = await ws.clearDevices();

            if (response.success) {
                setDevices([]);
            } else {
                setError(t('app.settings.printerTab.errorClear'));
            }
        } catch (err) {
            setError(t('app.settings.printerTab.errorClear'));
            console.error('Failed to clear devices:', err);
        }
    };

    const handlePresetChange = (preset: '58mm' | '80mm') => {
        const presetValues = PRINTER_PRESETS[preset];
        updatePaperWidthMm(presetValues.paper_width_mm);
        updateCharsPerLine(presetValues.chars_per_line);
    };

    const getStatusBadge = () => {
        switch (connectionStatus) {
            case 'connected':
                return (
                    <Badge variant="default" className="bg-green-500">
                        <Wifi className="mr-1 h-3 w-3" />
                        {t('app.settings.printerTab.connected')}
                    </Badge>
                );
            case 'connecting':
                return (
                    <Badge variant="secondary">
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        {t('app.settings.printerTab.connecting')}
                    </Badge>
                );
            case 'error':
                return (
                    <Badge variant="destructive">
                        <WifiOff className="mr-1 h-3 w-3" />
                        {t('app.settings.printerTab.error')}
                    </Badge>
                );
            default:
                return (
                    <Badge variant="secondary">
                        <WifiOff className="mr-1 h-3 w-3" />
                        {t('app.settings.printerTab.disconnected')}
                    </Badge>
                );
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

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
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('app.settings.printerTab.connection')}</CardTitle>
                    <CardDescription>{t('app.settings.printerTab.connectionDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label>{t('app.settings.printerTab.status')}</Label>
                            <div>{getStatusBadge()}</div>
                        </div>
                        {connectionStatus === 'connected' ? (
                            <Button onClick={handleDisconnect} variant="outline">
                                {t('app.settings.printerTab.disconnect')}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleConnect}
                                disabled={connectionStatus === 'connecting'}
                            >
                                {connectionStatus === 'connecting' && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {t('app.settings.printerTab.connect')}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {connectionStatus === 'connected' && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('app.settings.printerTab.discovery')}</CardTitle>
                            <CardDescription>{t('app.settings.printerTab.discoveryDescription')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="ignore-unknown"
                                    checked={ignoreUnknown}
                                    onCheckedChange={setIgnoreUnknown}
                                />
                                <Label htmlFor="ignore-unknown">
                                    {t('app.settings.printerTab.ignoreUnknown')}
                                </Label>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleDiscover}
                                    disabled={isDiscovering}
                                    className="flex-1"
                                >
                                    {isDiscovering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Bluetooth className="mr-2 h-4 w-4" />
                                    {t('app.settings.printerTab.discoverDevices')}
                                </Button>

                                {devices.length > 0 && (
                                    <Button
                                        onClick={handleClearDevices}
                                        variant="outline"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        {t('app.settings.printerTab.clearDevices')}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {devices.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('app.settings.printerTab.discoveredDevices')}</CardTitle>
                                <CardDescription>
                                    {t('app.settings.printerTab.discoveredDevicesDescription')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {devices.map((device) => (
                                        <div
                                            key={device.id}
                                            className="flex items-center justify-between rounded-lg border p-4"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{device.name}</p>
                                                    {device.paired && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {t('app.settings.printerTab.paired')}
                                                        </Badge>
                                                    )}
                                                    {device.connected && (
                                                        <Badge variant="default" className="text-xs bg-green-500">
                                                            {t('app.settings.printerTab.deviceConnected')}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {device.address}
                                                </p>
                                                {device.type && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {t('app.settings.printerTab.type')}: {device.type}
                                                    </p>
                                                )}
                                            </div>

                                            {device.connected ? (
                                                <Button
                                                    onClick={() => handleDisconnectDevice(device.id)}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={loadingDeviceId === device.id}
                                                >
                                                    {loadingDeviceId === device.id && (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    )}
                                                    {t('app.settings.printerTab.disconnectDevice')}
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => handleConnectDevice(device.id)}
                                                    size="sm"
                                                    disabled={loadingDeviceId === device.id}
                                                >
                                                    {loadingDeviceId === device.id && (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    )}
                                                    {t('app.settings.printerTab.connectDevice')}
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {connectedDevices.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('app.settings.printerTab.connectedDevices')}</CardTitle>
                                <CardDescription>
                                    {t('app.settings.printerTab.connectedDevicesDescription')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {connectedDevices.map((device) => (
                                        <div
                                            key={device.id}
                                            className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{device.name}</p>
                                                    <Badge variant="default" className="text-xs bg-green-500">
                                                        {t('app.settings.printerTab.active')}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {device.address}
                                                </p>
                                            </div>

                                            <Button
                                                onClick={() => handleDisconnectDevice(device.id)}
                                                variant="outline"
                                                size="sm"
                                                disabled={loadingDeviceId === device.id}
                                            >
                                                {loadingDeviceId === device.id && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                {t('app.settings.printerTab.disconnectDevice')}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
