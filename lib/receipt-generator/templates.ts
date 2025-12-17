import { ReceiptData, ReceiptTemplate, ImageTemplateType, PrintTemplateType, ReceiptTemplateType } from './types';
import { generateClassicTemplate } from './templates/classic';
import { generateSansSerifTemplate } from './templates/sans-serif';
import { generateModernBoldTemplate } from './templates/modern-bold';
import { generatePreviewTemplate0, generatePreviewTemplate1, generatePreviewTemplate2 } from '@/lib/print-client/previewTemplates';

export const imageTemplates: ReceiptTemplate[] = [
    {
        name: 'Classic',
        type: 'classic',
        description: 'Traditional monospace receipt with dashed lines',
        generateHTML: generateClassicTemplate
    },
    {
        name: 'Sans Serif',
        type: 'sans-serif',
        description: 'Clean sans-serif receipt with dashed lines',
        generateHTML: generateSansSerifTemplate
    },
    {
        name: 'Modern Bold',
        type: 'modern-bold',
        description: 'Modern bold receipt with dashed lines',
        generateHTML: generateModernBoldTemplate
    }
];

export const printTemplates: ReceiptTemplate[] = [
    {
        name: 'Simple',
        type: 'thermal-classic',
        description: 'Simple classic thermal receipt',
        generateHTML: generatePreviewTemplate0
    },
    {
        name: 'Compact',
        type: 'thermal-compact',
        description: 'Compact space-efficient thermal receipt',
        generateHTML: generatePreviewTemplate1
    },
    {
        name: 'Detailed',
        type: 'thermal-detailed',
        description: 'Detailed thermal receipt with full information',
        generateHTML: generatePreviewTemplate2
    }
];

export const receiptTemplates: ReceiptTemplate[] = [...imageTemplates, ...printTemplates];

export const getTemplateByType = (type: string): ReceiptTemplate => {
    const template = receiptTemplates.find(t => t.type === type);
    return template || receiptTemplates[0];
};

export const generateReceiptHTML = (data: ReceiptData, templateType: ReceiptTemplateType = 'classic'): string => {
    const template = getTemplateByType(templateType);
    return template.generateHTML(data);
};
