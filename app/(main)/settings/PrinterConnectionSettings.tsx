'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wifi, WifiOff, Bluetooth, Trash2, Printer, Monitor, Apple, Terminal, Edit2, Check, X } from 'lucide-react';
import { PrintClientWebSocket } from '@/lib/print-client';
import { BluetoothDevice, ConnectionStatus } from '@/types/printer';
import { useTranslation } from '@/lib/i18n/useTranslation';

const STORAGE_KEY = 'printer_auto_connect';
const URL_STORAGE_KEY = 'printer_client_url';
const DEFAULT_URL = '127.0.0.1:42123';

export default function PrinterConnectionSettings() {
    const { t } = useTranslation();
    const [ws, setWs] = useState<PrintClientWebSocket | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
    const [devices, setDevices] = useState<BluetoothDevice[]>([]);
    const [connectedDevices, setConnectedDevices] = useState<BluetoothDevice[]>([]);
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [ignoreUnknown, setIgnoreUnknown] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingDeviceId, setLoadingDeviceId] = useState<string | null>(null);
    const [testingDeviceId, setTestingDeviceId] = useState<string | null>(null);
    const [printClientUrl, setPrintClientUrl] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(URL_STORAGE_KEY) || DEFAULT_URL;
        }
        return DEFAULT_URL;
    });
    const [isEditingConnection, setIsEditingConnection] = useState(false);
    const [tempUrl, setTempUrl] = useState(printClientUrl);

    const parseWebSocketUrl = (input: string): string => {
        let cleaned = input.trim();
        if (cleaned.startsWith('ws://')) {
            return cleaned;
        }
        return `ws://${cleaned}`;
    };

    const handleSaveConnection = () => {
        setPrintClientUrl(tempUrl);
        localStorage.setItem(URL_STORAGE_KEY, tempUrl);
        setIsEditingConnection(false);
    };

    const handleCancelEdit = () => {
        setTempUrl(printClientUrl);
        setIsEditingConnection(false);
    };

    const handleConnect = async () => {
        try {
            setError(null);
            const wsUrl = parseWebSocketUrl(printClientUrl);
            const client = new PrintClientWebSocket(wsUrl);

            client.onStatusChange((status) => {
                setConnectionStatus(status);
                if (status === 'disconnected' || status === 'error') {
                    setDevices([]);
                    setConnectedDevices([]);
                }
            });

            client.onDeviceDisconnect((deviceId) => {
                console.log('Device disconnected:', deviceId);
                setConnectedDevices(prev => prev.filter(d => d.id !== deviceId));
                setDevices(prev => prev.map(d =>
                    d.id === deviceId ? { ...d, connected: false } : d
                ));
                import('sonner').then(({ toast }) => {
                    toast.info(t('app.settings.printerTab.deviceDisconnected'));
                });
            });

            await client.connect();
            setWs(client);
            localStorage.setItem(STORAGE_KEY, 'true');
            localStorage.setItem(URL_STORAGE_KEY, printClientUrl);

            try {
                const response = await client.getConnectedDevices();
                if (response.success) {
                    setConnectedDevices(response.devices);
                }
            } catch (err) {
                console.error('Failed to load connected devices:', err);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            if (errorMessage.includes('failed') || errorMessage.includes('refused')) {
                setError(t('app.settings.printerTab.errorConnectRefused'));
            } else if (errorMessage.includes('timeout')) {
                setError(t('app.settings.printerTab.errorConnectTimeout'));
            } else {
                setError(t('app.settings.printerTab.errorConnect').replace('{url}', printClientUrl));
            }
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const handleTestPrint = async (deviceId: string) => {
        if (!ws) return;

        try {
            setError(null);
            setTestingDeviceId(deviceId);

            const { EscPosEncoder } = await import('@/lib/print-client/esc-pos-encoder');
            const encoder = new EscPosEncoder();

            encoder.initialize()
                .align('center')
                .bold(true).size(2, 2).text('TEST PRINT').newline().size(1, 1)
                .bold(false)
                .newline()
                .align('left')
                .text('Date: ' + new Date().toLocaleDateString()).newline()
                .text('Time: ' + new Date().toLocaleTimeString()).newline()
                .newline()
                .text('1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890').newline()
                .cut();

            const rawData = encoder.getData();
            await ws.sendData(deviceId, rawData);

            import('sonner').then(({ toast }) => {
                toast.success(t('app.settings.printerTab.testPrintSuccess'));
            });
        } catch (err) {
            console.error('Failed to test print:', err);
            import('sonner').then(({ toast }) => {
                toast.error(t('app.settings.printerTab.testPrintFailed'));
            });
        } finally {
            setTestingDeviceId(null);
        }
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
                    <CardTitle>{t('app.settings.printerTab.connection')}</CardTitle>
                    <CardDescription>{t('app.settings.printerTab.connectionDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border bg-secondary/50 p-4">
                        <div className="mb-4 space-y-1">
                            <h3 className="font-medium">{t('app.settings.printerTab.downloadClient')}</h3>
                            <p className="text-sm text-muted-foreground">
                                {t('app.settings.printerTab.downloadInstruction')}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <Button variant="outline" className="w-full" onClick={() => window.open('/downloads/Billforge-Setup-Windows.exe', '_blank')}>
                                <Monitor className="mr-2 h-4 w-4" />
                                {t('app.settings.printerTab.windows')}
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => window.open('/downloads/Billforge-Setup-Mac.dmg', '_blank')}>
                                <Apple className="mr-2 h-4 w-4" />
                                {t('app.settings.printerTab.mac')}
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => window.open('/downloads/Billforge-Setup-Linux.zip', '_blank')}>
                                <Terminal className="mr-2 h-4 w-4" />
                                {t('app.settings.printerTab.linux')}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>{t('app.settings.printerTab.connectionSettings')}</Label>
                            {!isEditingConnection && (connectionStatus === 'disconnected' || connectionStatus === 'error') && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsEditingConnection(true)}
                                >
                                    <Edit2 className="mr-2 h-4 w-4" />
                                    {t('app.settings.printerTab.edit')}
                                </Button>
                            )}
                        </div>

                        {isEditingConnection ? (
                            <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-url">{t('app.settings.printerTab.websocketUrl')}</Label>
                                    <input
                                        id="edit-url"
                                        type="text"
                                        value={tempUrl}
                                        onChange={(e) => setTempUrl(e.target.value)}
                                        placeholder="ws://127.0.0.1:42123"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {t('app.settings.printerTab.urlHelp')}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleSaveConnection}
                                        size="sm"
                                        className="flex-1"
                                    >
                                        <Check className="mr-2 h-4 w-4" />
                                        {t('app.settings.printerTab.save')}
                                    </Button>
                                    <Button
                                        onClick={handleCancelEdit}
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        {t('app.settings.printerTab.cancel')}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-lg border bg-secondary/30 p-3">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">{parseWebSocketUrl(printClientUrl)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {t('app.settings.printerTab.currentConnection')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

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
                                            className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-4"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{device.name}</p>
                                                    <Badge variant="default" className="text-xs">
                                                        {t('app.settings.printerTab.active')}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {device.address}
                                                </p>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleTestPrint(device.id)}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={testingDeviceId === device.id || loadingDeviceId === device.id}
                                                >
                                                    {testingDeviceId === device.id && (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    )}
                                                    <Printer className="mr-2 h-4 w-4" />
                                                    {t('app.settings.printerTab.testPrint')}
                                                </Button>
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
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

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
                </>
            )}
        </div>
    );
}
