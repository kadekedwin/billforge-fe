import puppeteer, { ScreenshotOptions } from 'puppeteer';
import { ReceiptData } from './types';
import { ReceiptSettings } from '@/lib/api/receipt-settings/types';
import { generateDynamicReceiptHTML } from './dynamic-preview';

export interface ImageGeneratorOptions {
    type?: 'png' | 'jpeg' | 'webp';
    quality?: number;
    fullPage?: boolean;
    omitBackground?: boolean;
    width?: number;
    height?: number;
    settings?: ReceiptSettings;
}

export const generateReceiptImage = async (
    data: ReceiptData,
    outputPath: string,
    options: ImageGeneratorOptions = {}
): Promise<void> => {
    if (!options.settings) {
        throw new Error('Receipt settings are required for image generation');
    }
    const html = generateDynamicReceiptHTML(data, options.settings);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.setContent(html, {
        waitUntil: 'networkidle0'
    });

    const receiptElement = await page.$('.receipt');

    if (!receiptElement) {
        await browser.close();
        throw new Error('Receipt element not found');
    }

    const screenshotOptions: ScreenshotOptions = {
        path: outputPath,
        type: options.type || 'png',
        omitBackground: options.omitBackground || false
    };

    if ((options.type === 'jpeg' || options.type === 'webp') && options.quality) {
        screenshotOptions.quality = options.quality;
    }

    await receiptElement.screenshot(screenshotOptions);

    await browser.close();
};

export const generateReceiptImageBuffer = async (
    data: ReceiptData,
    options: ImageGeneratorOptions = {}
): Promise<Buffer> => {
    if (!options.settings) {
        throw new Error('Receipt settings are required for image generation');
    }
    const html = generateDynamicReceiptHTML(data, options.settings);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.setContent(html, {
        waitUntil: 'networkidle0'
    });

    const receiptElement = await page.$('.receipt');

    if (!receiptElement) {
        await browser.close();
        throw new Error('Receipt element not found');
    }

    const screenshotOptions: ScreenshotOptions = {
        type: options.type || 'png',
        omitBackground: options.omitBackground || false
    };

    if ((options.type === 'jpeg' || options.type === 'webp') && options.quality) {
        screenshotOptions.quality = options.quality;
    }

    const buffer = await receiptElement.screenshot(screenshotOptions);

    await browser.close();

    return Buffer.from(buffer);
};