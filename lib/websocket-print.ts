import {
    WebSocketMessage,
    DiscoverPayload,
    ConnectPayload,
    DisconnectPayload,
    SendDataPayload,
    DiscoverResponse,
    ConnectResponse,
    DisconnectResponse,
    ConnectedDevicesResponse,
    SendDataResponse,
    ClearDevicesResponse,
    ConnectionStatus,
} from '@/types/printer';

type MessageHandler = (data: any) => void;

export class PrintClientWebSocket {
    private ws: WebSocket | null = null;
    private url: string;
    private messageHandlers: Map<string, MessageHandler[]> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 2000;
    private statusCallback?: (status: ConnectionStatus) => void;

    constructor(url: string = 'ws://localhost:42123') {
        this.url = url;
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.updateStatus('connecting');
                this.ws = new WebSocket(this.url);

                this.ws.onopen = () => {
                    console.log('WebSocket connected to print client');
                    this.reconnectAttempts = 0;
                    this.updateStatus('connected');
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message: WebSocketMessage = JSON.parse(event.data);
                        this.handleMessage(message);
                    } catch (error) {
                        console.error('Failed to parse WebSocket message:', error);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this.updateStatus('error');
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    this.updateStatus('disconnected');
                    this.attemptReconnect();
                };
            } catch (error) {
                this.updateStatus('error');
                reject(error);
            }
        });
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.updateStatus('disconnected');
    }

    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    onStatusChange(callback: (status: ConnectionStatus) => void) {
        this.statusCallback = callback;
    }

    private updateStatus(status: ConnectionStatus) {
        if (this.statusCallback) {
            this.statusCallback(status);
        }
    }

    private attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => {
                this.connect().catch((error) => {
                    console.error('Reconnection failed:', error);
                });
            }, this.reconnectDelay);
        }
    }

    private sendMessage(message: WebSocketMessage) {
        if (!this.isConnected()) {
            throw new Error('WebSocket is not connected');
        }
        this.ws!.send(JSON.stringify(message));
    }

    private handleMessage(message: WebSocketMessage) {
        const handlers = this.messageHandlers.get(message.type);
        if (handlers) {
            handlers.forEach((handler) => handler(message.data));
        }
    }

    on(messageType: string, handler: MessageHandler) {
        if (!this.messageHandlers.has(messageType)) {
            this.messageHandlers.set(messageType, []);
        }
        this.messageHandlers.get(messageType)!.push(handler);
    }

    off(messageType: string, handler: MessageHandler) {
        const handlers = this.messageHandlers.get(messageType);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    // API Methods

    async discover(ignoreUnknown: boolean = false): Promise<DiscoverResponse> {
        return new Promise((resolve, reject) => {
            const handler = (data: DiscoverResponse) => {
                this.off('discover_response', handler);
                resolve(data);
            };

            this.on('discover_response', handler);

            try {
                this.sendMessage({
                    type: 'discover',
                    payload: { ignoreUnknown },
                });

                // Timeout after 30 seconds
                setTimeout(() => {
                    this.off('discover_response', handler);
                    reject(new Error('Discover request timed out'));
                }, 30000);
            } catch (error) {
                this.off('discover_response', handler);
                reject(error);
            }
        });
    }

    async connectDevice(deviceId: string): Promise<ConnectResponse> {
        return new Promise((resolve, reject) => {
            const handler = (data: ConnectResponse) => {
                this.off('connect_response', handler);
                resolve(data);
            };

            this.on('connect_response', handler);

            try {
                this.sendMessage({
                    type: 'connect',
                    payload: { deviceId },
                });

                // Timeout after 15 seconds
                setTimeout(() => {
                    this.off('connect_response', handler);
                    reject(new Error('Connect request timed out'));
                }, 15000);
            } catch (error) {
                this.off('connect_response', handler);
                reject(error);
            }
        });
    }

    async disconnectDevice(deviceId: string): Promise<DisconnectResponse> {
        return new Promise((resolve, reject) => {
            const handler = (data: DisconnectResponse) => {
                this.off('disconnect_response', handler);
                resolve(data);
            };

            this.on('disconnect_response', handler);

            try {
                this.sendMessage({
                    type: 'disconnect',
                    payload: { deviceId },
                });

                // Timeout after 10 seconds
                setTimeout(() => {
                    this.off('disconnect_response', handler);
                    reject(new Error('Disconnect request timed out'));
                }, 10000);
            } catch (error) {
                this.off('disconnect_response', handler);
                reject(error);
            }
        });
    }

    async getConnectedDevices(): Promise<ConnectedDevicesResponse> {
        return new Promise((resolve, reject) => {
            const handler = (data: ConnectedDevicesResponse) => {
                this.off('connected_devices_response', handler);
                resolve(data);
            };

            this.on('connected_devices_response', handler);

            try {
                this.sendMessage({
                    type: 'get_connected',
                    payload: {},
                });

                // Timeout after 10 seconds
                setTimeout(() => {
                    this.off('connected_devices_response', handler);
                    reject(new Error('Get connected devices request timed out'));
                }, 10000);
            } catch (error) {
                this.off('connected_devices_response', handler);
                reject(error);
            }
        });
    }

    async sendData(deviceId: string, data: string): Promise<SendDataResponse> {
        return new Promise((resolve, reject) => {
            const handler = (responseData: SendDataResponse) => {
                this.off('send_data_response', handler);
                resolve(responseData);
            };

            this.on('send_data_response', handler);

            try {
                this.sendMessage({
                    type: 'send_data',
                    payload: { deviceId, data },
                });

                // Timeout after 10 seconds
                setTimeout(() => {
                    this.off('send_data_response', handler);
                    reject(new Error('Send data request timed out'));
                }, 10000);
            } catch (error) {
                this.off('send_data_response', handler);
                reject(error);
            }
        });
    }

    async clearDevices(): Promise<ClearDevicesResponse> {
        return new Promise((resolve, reject) => {
            const handler = (data: ClearDevicesResponse) => {
                this.off('devices_cleared', handler);
                resolve(data);
            };

            this.on('devices_cleared', handler);

            try {
                this.sendMessage({
                    type: 'clear_devices',
                    payload: {},
                });

                // Timeout after 10 seconds
                setTimeout(() => {
                    this.off('devices_cleared', handler);
                    reject(new Error('Clear devices request timed out'));
                }, 10000);
            } catch (error) {
                this.off('devices_cleared', handler);
                reject(error);
            }
        });
    }
}
