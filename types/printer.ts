export interface WebSocketMessage<T = any> {
    type: string;
    payload?: T;
    data?: T;
}

export interface BluetoothDevice {
    id: string;
    name: string;
    address: string;
    type?: 'classic' | 'ble';
    paired?: boolean;
    connected?: boolean;
}

export interface DiscoverPayload {
    ignoreUnknown?: boolean;
}

export interface ConnectPayload {
    deviceId: string;
}

export interface DisconnectPayload {
    deviceId: string;
}

export interface SendDataPayload {
    deviceId: string;
    data: string | number[];
}

export interface DiscoverResponse {
    success: boolean;
    devices: BluetoothDevice[];
}

export interface ConnectResponse {
    success: boolean;
    deviceId: string;
    name: string;
}

export interface DisconnectResponse {
    success: boolean;
    deviceId: string;
}

export interface ConnectedDevicesResponse {
    success: boolean;
    devices: BluetoothDevice[];
}

export interface SendDataResponse {
    success: boolean;
    deviceId: string;
    bytesSent: number;
}

export interface ClearDevicesResponse {
    success: boolean;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
