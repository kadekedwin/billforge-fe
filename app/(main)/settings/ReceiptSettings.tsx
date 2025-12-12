'use client';

import { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useReceiptTemplatePreference, ReceiptData, ReceiptTemplateType } from '@/lib/receipt';
import { generateReceiptHTML } from '@/lib/receipt/templates';
import { Check, Loader2 } from 'lucide-react';
import { receiptTemplates } from '@/lib/receipt/templates';
import { useBusiness } from '@/contexts/business-context';
import { getCurrencySymbol } from '@/lib/utils/currency';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface ReceiptTemplateCardProps {
    template: {
        name: string;
        type: ReceiptTemplateType;
        description: string;
    };
    sampleReceipt: ReceiptData;
    includeLogo: boolean;
    footerMessage: string;
    qrcodeValue: string;
    isSelected: boolean;
    onSelect: () => void;
}

function ReceiptTemplateCard({ template, sampleReceipt, includeLogo, footerMessage, qrcodeValue, isSelected, onSelect }: ReceiptTemplateCardProps) {
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

        const timer = setTimeout(adjustHeight, 500);

        return () => {
            iframe.removeEventListener('load', adjustHeight);
            clearTimeout(timer);
        };
    }, [qrcodeValue, footerMessage, includeLogo]);

    const templateHTML = generateReceiptHTML({
        ...sampleReceipt,
        storeLogo: includeLogo ? sampleReceipt.storeLogo : undefined,
        footer: footerMessage,
        qrcode: qrcodeValue,
        currencySymbol: sampleReceipt.currencySymbol
    }, template.type);

    return (
        <button
            onClick={onSelect}
            className={`relative flex-shrink-0 p-4 border-2 rounded-lg transition-all text-left ${isSelected
                ? 'border-blue-500 '
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
                    key={`${includeLogo}-${footerMessage}-${qrcodeValue}`}
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
                    sandbox="allow-same-origin allow-scripts"
                />
            </div>
        </button>
    );
}

const sampleReceipt: ReceiptData = {
    receiptNumber: 'RCP-001',
    transactionId: 'INV1001',
    date: '2025-12-07',
    time: '14:30:00',
    storeName: 'BillForge Store',
    storeAddress: '123 Main Street, City, State 12345',
    storePhone: '(555) 123-4567',
    storeLogo: '/logoblack.png',
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
    footer: '',
    notes: 'Please visit us again soon'
};

export default function ReceiptSettings() {
    const { t } = useTranslation();
    const { selectedBusiness } = useBusiness();
    const {
        isLoading,
        error,
        template: selectedTemplate,
        updateTemplate,
        includeLogo,
        updateIncludeLogo,
        footerMessage,
        updateFooterMessage,
        qrcodeValue,
        updateQrcodeValue,
        transactionPrefix,
        updateTransactionPrefix,
        transactionNextNumber,
        updateTransactionNextNumber,
    } = useReceiptTemplatePreference({ businessUuid: selectedBusiness?.uuid || null });

    const sampleReceipt: ReceiptData = {
        receiptNumber: 'RCP-001',
        transactionId: 'INV1001',
        date: '2025-12-07',
        time: '14:30:00',
        storeName: 'BillForge Store',
        storeAddress: '123 Main Street, City, State 12345',
        storePhone: '(555) 123-4567',
        storeLogo: '/logoblack.png',
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
        footer: '',
        notes: 'Please visit us again soon',
        currencySymbol: getCurrencySymbol(selectedBusiness?.currency)
    };

    if (!selectedBusiness) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-muted-foreground">{t('app.settings.receiptTab.selectBusiness')}</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Receipt Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="include-logo"
                            checked={includeLogo}
                            onCheckedChange={updateIncludeLogo}
                        />
                        <div className="space-y-0.5">
                            <Label htmlFor="include-logo" className="text-base">
                                {t('app.settings.receiptTab.includeLogo')}
                            </Label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="footer-message" className="text-base">
                            {t('app.settings.receiptTab.footerMessage')}
                        </Label>
                        <Input
                            id="footer-message"
                            placeholder={t('app.settings.receiptTab.footerPlaceholder')}
                            value={footerMessage}
                            onChange={(e) => updateFooterMessage(e.target.value)}
                            className="max-w-md"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="qrcode-value" className="text-base">
                            {t('app.settings.receiptTab.qrCode')}
                        </Label>
                        <Input
                            id="qrcode-value"
                            placeholder={t('app.settings.receiptTab.qrPlaceholder')}
                            value={qrcodeValue}
                            onChange={(e) => updateQrcodeValue(e.target.value)}
                            className="max-w-md"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="transaction-prefix" className="text-base">
                            {t('app.settings.receiptTab.prefix')}
                        </Label>
                        <Input
                            id="transaction-prefix"
                            placeholder="INV"
                            value={transactionPrefix}
                            onChange={(e) => updateTransactionPrefix(e.target.value)}
                            maxLength={10}
                            className="max-w-md"
                        />
                        <p className="text-xs text-muted-foreground">{t('app.settings.receiptTab.prefixHelp')}</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="transaction-number" className="text-base">
                            {t('app.settings.receiptTab.nextNumber')}
                        </Label>
                        <Input
                            id="transaction-number"
                            type="number"
                            min="1"
                            placeholder="1"
                            value={transactionNextNumber}
                            onChange={(e) => updateTransactionNextNumber(parseInt(e.target.value) || 1)}
                            className="max-w-md"
                        />
                        <p className="text-xs text-muted-foreground">{t('app.settings.receiptTab.nextNumberHelp')}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('app.settings.receiptTab.template')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto pb-4">
                        <div className="flex items-start gap-6 min-w-min" key={`${includeLogo}-${footerMessage}-${qrcodeValue}`}>
                            {receiptTemplates.map((template) => (
                                <ReceiptTemplateCard
                                    key={template.type}
                                    template={template}
                                    sampleReceipt={sampleReceipt}
                                    includeLogo={includeLogo}
                                    footerMessage={footerMessage}
                                    qrcodeValue={qrcodeValue}
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
