'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useReceiptTemplatePreference, ReceiptData, ReceiptTemplateType } from '@/lib/receipt';
import { generateReceiptHTML } from '@/lib/receipt/templates';
import { Check, ChevronLeft } from 'lucide-react';
import { receiptTemplates } from '@/lib/receipt/templates';

interface ReceiptTemplateCardProps {
    template: {
        name: string;
        type: ReceiptTemplateType;
        description: string;
    };
    sampleReceipt: ReceiptData;
    isSelected: boolean;
    onSelect: () => void;
}

function ReceiptTemplateCard({ template, sampleReceipt, isSelected, onSelect }: ReceiptTemplateCardProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const adjustHeight = () => {
            try {
                const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDocument) {
                    const height = iframeDocument.documentElement.scrollHeight;
                    iframe.style.height = `${height}px`;
                }
            } catch (error) {
                console.error('Error adjusting iframe height:', error);
            }
        };

        iframe.addEventListener('load', adjustHeight);

        const timer = setTimeout(adjustHeight, 100);

        return () => {
            iframe.removeEventListener('load', adjustHeight);
            clearTimeout(timer);
        };
    }, []);

    const templateHTML = generateReceiptHTML(sampleReceipt, template.type);

    return (
        <button
            onClick={onSelect}
            className={`relative flex-shrink-0 p-4 border-2 rounded-lg transition-all text-left ${
                isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
            }`}
            style={{ width: '320px' }}
        >
            {isSelected && (
                <div className="absolute top-3 right-3 bg-blue-500 rounded-full p-1.5 z-10">
                    <Check className="h-4 w-4 text-white" />
                </div>
            )}

            <div className="mb-3">
                <div className="font-semibold text-lg">{template.name}</div>
                <div className="text-sm text-gray-600 mt-1">{template.description}</div>
            </div>

            <div className="relative bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                <iframe
                    ref={iframeRef}
                    srcDoc={templateHTML}
                    className="w-full border-0 pointer-events-none"
                    style={{
                        width: '302px',
                        minHeight: '400px',
                        transform: 'scale(0.94)',
                        transformOrigin: 'top left'
                    }}
                    title={`${template.name} preview`}
                    sandbox="allow-same-origin"
                />
            </div>
        </button>
    );
}

const sampleReceipt: ReceiptData = {
    receiptNumber: 'RCP-001',
    date: '2025-12-07',
    time: '14:30:00',
    storeName: 'BillForge Store',
    storeAddress: '123 Main Street, City, State 12345',
    storePhone: '(555) 123-4567',
    cashierName: 'John Doe',
    customerName: 'Jane Smith',
    items: [
        {
            id: '1',
            name: 'Premium Coffee',
            quantity: 2,
            price: 4.99,
            total: 9.98
        },
        {
            id: '2',
            name: 'Chocolate Croissant',
            quantity: 1,
            price: 3.50,
            total: 3.50
        },
        {
            id: '3',
            name: 'Orange Juice',
            quantity: 1,
            price: 2.99,
            total: 2.99
        }
    ],
    subtotal: 16.47,
    tax: 1.32,
    discount: 1.50,
    total: 16.29,
    paymentMethod: 'Cash',
    paymentAmount: 20.00,
    changeAmount: 3.71,
    footer: 'Thank you for your purchase!',
    notes: 'Please visit us again soon'
};

export default function ReceiptSettingsPage() {
    const { template: selectedTemplate, updateTemplate } = useReceiptTemplatePreference();

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/settings">
                    <Button variant="outline" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Receipt Settings</h1>
                    <p className="text-gray-600 mt-2">Configure receipt templates and preview your receipts</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Receipt Template</CardTitle>
                    <CardDescription>Choose a template for your receipts</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto pb-4">
                        <div className="flex items-start gap-6 min-w-min">
                            {receiptTemplates.map((template) => (
                                <ReceiptTemplateCard
                                    key={template.type}
                                    template={template}
                                    sampleReceipt={sampleReceipt}
                                    isSelected={selectedTemplate === template.type}
                                    onSelect={() => updateTemplate(template.type)}
                                />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

