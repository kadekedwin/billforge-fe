import { NextRequest, NextResponse } from 'next/server';
import { generateReceiptPDFBuffer, PDFGeneratorOptions } from '@/lib/receipt/pdfGenerator';
import { ReceiptData } from '@/lib/receipt/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const receiptData: ReceiptData = body.receiptData;
        const options: PDFGeneratorOptions = body.options || {};

        const pdfBuffer = await generateReceiptPDFBuffer(receiptData, options);

        return new NextResponse(Buffer.from(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="receipt-${receiptData.receiptNumber}.pdf"`,
            },
        });
    } catch (error) {
        console.error('PDF generation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to generate PDF', details: errorMessage },
            { status: 500 }
        );
    }
}