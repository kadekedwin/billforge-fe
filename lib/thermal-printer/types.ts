export interface PrinterConfig {
    printerType: string;
    printerPath: string;
    characterSet: string;
    removeSpecialCharacters: boolean;
    lineCharacter: string;
    timeout: number;
}

export interface NetworkPrinterConfig {
    ipAddress: string;
    port: number;
    protocol: 'raw' | 'ipp';
}

export interface BluetoothPrinterConfig {
    deviceName: string;
    macAddress: string;
    paired: boolean;
}

export type ConnectionType = 'thermal' | 'network' | 'bluetooth';

export interface BasePrinterSettings {
    connectionType: ConnectionType;
}

export interface ThermalSettings extends BasePrinterSettings {
    connectionType: 'thermal';
    config: PrinterConfig;
}

export interface NetworkSettings extends BasePrinterSettings {
    connectionType: 'network';
    config: NetworkPrinterConfig;
}

export interface BluetoothSettings extends BasePrinterSettings {
    connectionType: 'bluetooth';
    config: BluetoothPrinterConfig;
}

export type PrinterSettings = ThermalSettings | NetworkSettings | BluetoothSettings;
