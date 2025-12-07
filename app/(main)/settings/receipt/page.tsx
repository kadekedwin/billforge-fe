'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useReceiptTemplatePreference, ReceiptData } from '@/lib/receipt';
import { generateReceiptHTML } from '@/lib/receipt/templates';
import { Check, ChevronLeft } from 'lucide-react';

const receiptTemplates = [
    { name: 'Classic', type: 'classic' as const, description: 'Traditional monospace receipt with dashed lines' },
    { name: 'Sans Serif', type: 'sans-serif' as const, description: 'Clean sans-serif receipt with dashed lines' }
];

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
    paymentMethod: 'Credit Card',
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
                        <div className="flex gap-6 min-w-min">
                            {receiptTemplates.map((template) => {
                                const templateHTML = generateReceiptHTML(sampleReceipt, template.type);

                                return (
                                    <button
                                        key={template.type}
                                        onClick={() => updateTemplate(template.type)}
                                        className={`relative flex-shrink-0 p-4 border-2 rounded-lg transition-all text-left ${
                                            selectedTemplate === template.type
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        style={{ width: '320px' }}
                                    >
                                        {selectedTemplate === template.type && (
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
                                                srcDoc={templateHTML}
                                                className="w-full border-0 pointer-events-none"
                                                style={{
                                                    width: '302mm',
                                                    height: '580px',
                                                    transform: 'scale(0.94)',
                                                    transformOrigin: 'top left'
                                                }}
                                                title={`${template.name} preview`}
                                                sandbox="allow-same-origin"
                                            />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

