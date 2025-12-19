import { useCallback } from 'react';
import { PrintClientWebSocket } from './websocket-print';
import { ReceiptData } from '@/lib/receipt-generator';
import { EscPosEncoder } from './esc-pos-encoder';
import { generateDynamicPrintCommand, PrinterSettings } from './dynamic-generator';
import { ReceiptSettings } from '@/lib/api/receipt-settings/types';

interface UseReceiptPrintProps {
    printClient: PrintClientWebSocket | null;
}

interface PrintOptions {
    printerId: string;
    receiptSettings: ReceiptSettings;
    printerSettings?: PrinterSettings;
}

export function useReceiptPrint({ printClient }: UseReceiptPrintProps) {
    const printReceipt = useCallback(async (data: ReceiptData, options: PrintOptions) => {
        if (!printClient || !printClient.isConnected()) {
            throw new Error('Print client not connected');
        }

        const encoder = new EscPosEncoder();

        await generateDynamicPrintCommand(
            data,
            options.receiptSettings,
            encoder,
            options.printerSettings
        );

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
