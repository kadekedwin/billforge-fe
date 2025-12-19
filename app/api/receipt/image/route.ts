import { NextRequest, NextResponse } from 'next/server';
import { generateReceiptImageBuffer } from '@/lib/receipt-generator/imageGenerator';
import type { ImageGeneratorOptions } from '@/lib/receipt-generator/imageGenerator';
import type { ReceiptData } from '@/lib/receipt-generator';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const receiptData: ReceiptData = body.receiptData;
        const receiptSettings = body.receiptSettings;
        const options: ImageGeneratorOptions = { ...body.options, settings: receiptSettings };

        const imageBuffer = await generateReceiptImageBuffer(receiptData, options);

        const contentType = options.type === 'jpeg' ? 'image/jpeg' :
            options.type === 'webp' ? 'image/webp' :
                'image/png';

        const extension = options.type || 'png';

        return new NextResponse(Buffer.from(imageBuffer), {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="receipt-${receiptData.receiptNumber}.${extension}"`,
            },
        });
    } catch (error) {
        console.error('Image generation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to generate image', details: errorMessage },
            { status: 500 }
        );
    }
}

