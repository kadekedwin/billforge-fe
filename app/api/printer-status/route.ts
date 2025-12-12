import { NextRequest, NextResponse } from 'next/server';
import { ThermalPrinter, PrinterTypes } from 'node-thermal-printer';

interface PrinterConfig {
    printerType: string;
    printerPath: string;
    characterSet: string;
    removeSpecialCharacters: boolean;
    lineCharacter: string;
    timeout: number;
}

const getPrinterType = (type: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const types: Record<string, any> = {
        'EPSON': PrinterTypes.EPSON,
        'STAR': PrinterTypes.STAR,
        'TANCA': PrinterTypes.TANCA,
        'DARUMA': PrinterTypes.DARUMA,
    };
    return types[type] || PrinterTypes.EPSON;
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { printerConfig } = body as { printerConfig?: PrinterConfig };

        const config = printerConfig || {
            printerType: 'EPSON',
            printerPath: '/dev/usb/lp0',
            characterSet: 'PC437_USA',
            removeSpecialCharacters: false,
            lineCharacter: '-',
            timeout: 3000,
        };

        const printer = new ThermalPrinter({
            type: getPrinterType(config.printerType),
            interface: config.printerPath,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            characterSet: config.characterSet as any,
            removeSpecialCharacters: config.removeSpecialCharacters,
            options: {
                timeout: config.timeout,
            },
        });

        const isConnected = await printer.isPrinterConnected();

        return NextResponse.json({
            connected: isConnected,
            printerPath: config.printerPath,
        });
    } catch (error) {
        console.error('Printer status check error:', error);
        return NextResponse.json(
            {
                connected: false,
                error: error instanceof Error ? error.message : 'Failed to check printer status',
            },
            { status: 200 }
        );
    }
}
