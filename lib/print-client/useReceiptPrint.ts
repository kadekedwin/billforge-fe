import { useCallback } from 'react';
import { PrintClientWebSocket } from './websocket-print';
import { ReceiptData } from '@/lib/receipt-generator';
import { EscPosEncoder } from './esc-pos-encoder';
import {
    generateThermalClassicCommands,
    generateThermalCompactCommands,
    generateThermalDetailedCommands
} from './command-generators';

interface UseReceiptPrintProps {
    printClient: PrintClientWebSocket | null;
}

interface PrintOptions {
    printerId: string;
    templateId: number; // print_template_id
    settings?: any; // Future printer specific settings
}

export function useReceiptPrint({ printClient }: UseReceiptPrintProps) {
    const printReceipt = useCallback(async (data: ReceiptData, options: PrintOptions) => {
        if (!printClient || !printClient.isConnected()) {
            throw new Error('Print client not connected');
        }

        const encoder = new EscPosEncoder();

        // Select generator based on template ID
        switch (options.templateId) {
            case 1: // Thermal Compact
                await generateThermalCompactCommands(data, encoder);
                break;
            case 2: // Thermal Detailed
                await generateThermalDetailedCommands(data, encoder);
                break;
            case 0: // Thermal Classic (default)
            default:
                await generateThermalClassicCommands(data, encoder);
                break;
        }

        const rawData = encoder.getData();

        try {
            await printClient.sendData(options.printerId, rawData);
            return { success: true };
        } catch (error) {
            console.error('Failed to print receipt:', error);
            throw error;
        }
    }, [printClient]);

    return {
        printReceipt
    };
}
