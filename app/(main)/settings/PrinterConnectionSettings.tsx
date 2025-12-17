'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wifi, WifiOff, Bluetooth, Trash2 } from 'lucide-react';
import { PrintClientWebSocket } from '@/lib/print-client';
import { BluetoothDevice, ConnectionStatus } from '@/types/printer';
import { useTranslation } from '@/lib/i18n/useTranslation';

const STORAGE_KEY = 'printer_auto_connect';

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
