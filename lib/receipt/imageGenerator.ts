import puppeteer from 'puppeteer';
import { ReceiptData, ReceiptTemplateType } from './types';
import { generateReceiptHTML } from './templates';

export interface ImageGeneratorOptions {
    type?: 'png' | 'jpeg' | 'webp';
    quality?: number;
    fullPage?: boolean;
    omitBackground?: boolean;
    width?: number;
    height?: number;
    template?: ReceiptTemplateType;
}

export const generateReceiptImage = async (
    data: ReceiptData,
    outputPath: string,
    options: ImageGeneratorOptions = {}
): Promise<void> => {
    const html = generateReceiptHTML(data, options.template || 'classic');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    if (options.width || options.height) {
        await page.setViewport({
            width: options.width || 800,
            height: options.height || 1200,
            deviceScaleFactor: 2
        });
    }

    await page.setContent(html, {
        waitUntil: 'networkidle0'
    });

    await page.screenshot({
        path: outputPath,
        type: options.type || 'png',
        quality: options.quality || 90,
        fullPage: options.fullPage !== false,
        omitBackground: options.omitBackground || false
    });

    await browser.close();
};

export const generateReceiptImageBuffer = async (
    data: ReceiptData,
    options: ImageGeneratorOptions = {}
): Promise<Buffer> => {
    const html = generateReceiptHTML(data, options.template || 'classic');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    if (options.width || options.height) {
        await page.setViewport({
            width: options.width || 800,
            height: options.height || 1200,
            deviceScaleFactor: 2
        });
    }

    await page.setContent(html, {
        waitUntil: 'networkidle0'
    });

    const buffer = await page.screenshot({
        type: options.type || 'png',
        quality: options.quality || 90,
        fullPage: options.fullPage !== false,
        omitBackground: options.omitBackground || false
    });

    await browser.close();

    return buffer as Buffer;
};