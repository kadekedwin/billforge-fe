import { NextRequest, NextResponse } from 'next/server';
import { printThermalReceipt } from '@/lib/receipt/thermalPrinter';
import { ReceiptData } from '@/lib/receipt/types';

interface PrinterConfig {
    printerType: string;
    printerPath: string;
    characterSet: string;
    removeSpecialCharacters: boolean;
    lineCharacter: string;
    timeout: number;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { receiptData, printerConfig } = body as {
            receiptData: ReceiptData;
            printerConfig?: PrinterConfig;
        };

        if (!receiptData) {
            return NextResponse.json(
                { success: false, message: 'Receipt data is required' },
                { status: 400 }
            );
        }

        await printThermalReceipt(receiptData, printerConfig);

        return NextResponse.json({
            success: true,
            message: 'Receipt printed successfully',
        });
    } catch (error) {
        console.error('Thermal print error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to print receipt',
            },
            { status: 500 }
        );
    }
}
