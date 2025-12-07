import puppeteer, { PDFOptions } from 'puppeteer';
import { ReceiptData } from './types';
import { generateReceiptHTML } from './receiptHtml';

export interface PDFGeneratorOptions {
    width?: string;
    height?: string;
    printBackground?: boolean;
    margin?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
    };
}

export const generateReceiptPDF = async (
    data: ReceiptData,
    outputPath: string,
    options: PDFGeneratorOptions = {}
): Promise<void> => {
    const html = generateReceiptHTML(data);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.setContent(html, {
        waitUntil: 'networkidle0'
    });

    const pdfOptions: PDFOptions = {
        path: outputPath,
        width: options.width || '80mm',
        printBackground: options.printBackground !== false,
        margin: options.margin || {
            top: '0mm',
            right: '0mm',
            bottom: '0mm',
            left: '0mm'
        }
    };

    if (options.height && options.height !== 'auto') {
        pdfOptions.height = options.height;
    } else {
        const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
        pdfOptions.height = `${bodyHeight}px`;
    }

    await page.pdf(pdfOptions);

    await browser.close();
};

export const generateReceiptPDFBuffer = async (
    data: ReceiptData,
    options: PDFGeneratorOptions = {}
): Promise<Uint8Array> => {
    const html = generateReceiptHTML(data);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.setContent(html, {
        waitUntil: 'networkidle0'
    });

    const pdfOptions: PDFOptions = {
        width: options.width || '80mm',
        printBackground: options.printBackground !== false,
        margin: options.margin || {
            top: '0mm',
            right: '0mm',
            bottom: '0mm',
            left: '0mm'
        }
    };

    if (options.height && options.height !== 'auto') {
        pdfOptions.height = options.height;
    } else {
        const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
        pdfOptions.height = `${bodyHeight}px`;
    }

    const buffer = await page.pdf(pdfOptions);

    await browser.close();

    return buffer;
};