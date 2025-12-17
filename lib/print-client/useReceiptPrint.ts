import { useCallback } from 'react';
import { PrintClientWebSocket } from './websocket-print';
import { ReceiptData } from '@/lib/receipt-generator';
import { EscPosEncoder } from './esc-pos-encoder';
import {
    generatePrintTemplate0,
    generatePrintTemplate1,
    generatePrintTemplate2,
    PrinterSettings
} from './printTemplates';

interface UseReceiptPrintProps {
    printClient: PrintClientWebSocket | null;
}

interface PrintOptions {
    printerId: string;
    templateId: number;
    settings?: PrinterSettings;
}

export function useReceiptPrint({ printClient }: UseReceiptPrintProps) {
    const printReceipt = useCallback(async (data: ReceiptData, options: PrintOptions) => {
        if (!printClient || !printClient.isConnected()) {
            throw new Error('Print client not connected');
        }

        const encoder = new EscPosEncoder();

        switch (options.templateId) {
            case 1:
                await generatePrintTemplate1(data, encoder, options.settings);
                break;
            case 2:
                await generatePrintTemplate2(data, encoder, options.settings);
                break;
            case 0:
            default:
                await generatePrintTemplate0(data, encoder, options.settings);
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
