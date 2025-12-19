import { ReceiptData, ReceiptTemplate, ImageTemplateType, ReceiptTemplateType } from './types';
import { generateClassicTemplate } from './templates/classic';
import { generateSansSerifTemplate } from './templates/sans-serif';
import { generateModernBoldTemplate } from './templates/modern-bold';

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

export const receiptTemplates: ReceiptTemplate[] = [...imageTemplates];

export const getTemplateByType = (type: string): ReceiptTemplate => {
    const template = receiptTemplates.find(t => t.type === type);
    return template || receiptTemplates[0];
};

export const generateReceiptHTML = (data: ReceiptData, templateType: ReceiptTemplateType = 'classic'): string => {
    const template = getTemplateByType(templateType);
    return template.generateHTML(data);
};
