import { printThermalReceipt, type PrinterConfig } from '@/lib/thermal-printer';
import type { ReceiptData } from './types';

export interface PrintOptions {
    method: 'thermal' | 'network' | 'bluetooth';
    config?: PrinterConfig;
}

export async function print(data: ReceiptData, options: PrintOptions = { method: 'thermal' }): Promise<void> {
    switch (options.method) {
        case 'thermal':
            await printThermalReceipt(data, options.config);
            break;

        case 'network':
            throw new Error('Network printing not yet implemented');

        case 'bluetooth':
            throw new Error('Bluetooth printing not yet implemented');

        default:
            throw new Error(`Unknown print method: ${options.method}`);
    }
}

export async function printThermal(data: ReceiptData, config?: PrinterConfig): Promise<void> {
    return printThermalReceipt(data, config);
}

export type { PrinterConfig } from '@/lib/thermal-printer';
