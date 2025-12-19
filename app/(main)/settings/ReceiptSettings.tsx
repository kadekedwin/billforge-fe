'use client';

import { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReceiptData } from '@/lib/receipt-generator/types';
import { generateDynamicReceiptHTML } from '@/lib/receipt-generator/dynamic-preview';
import { useReceiptTemplatePreference } from '@/lib/receipt-settings';
import { Check, Loader2 } from 'lucide-react';
import { useBusiness } from '@/contexts/business-context';
import { getCurrencySymbol } from '@/lib/utils/currency';
import { useTranslation } from '@/lib/i18n/useTranslation';




export default function ReceiptSettings() {
    const { t } = useTranslation();
    const { selectedBusiness } = useBusiness();
    const {
        isLoading,
        error,
        receiptStyle,
        updateReceiptStyle,

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

        printerFont,
        updatePrinterFont,
        lineCharacter,
        updateLineCharacter,
        itemLayout,
        updateItemLayout,

        labelReceiptId,
        updateLabelReceiptId,
        labelReceiptIdEnabled,
        updateLabelReceiptIdEnabled,

        labelTransactionId,
        updateLabelTransactionId,
        labelTransactionIdEnabled,
        updateLabelTransactionIdEnabled,

        labelDate,
        updateLabelDate,
        labelDateEnabled,
        updateLabelDateEnabled,

        labelTime,
        updateLabelTime,
        labelTimeEnabled,
        updateLabelTimeEnabled,

        labelCashier,
        updateLabelCashier,
        labelCashierEnabled,
        updateLabelCashierEnabled,

        labelCustomer,
        updateLabelCustomer,
        labelCustomerEnabled,
        updateLabelCustomerEnabled,

        labelItems,
        updateLabelItems,
        labelItemsEnabled,
        updateLabelItemsEnabled,

        labelSubtotal,
        updateLabelSubtotal,
        labelSubtotalEnabled,
        updateLabelSubtotalEnabled,

        labelDiscount,
        updateLabelDiscount,
        labelDiscountEnabled,
        updateLabelDiscountEnabled,

        labelTax,
        updateLabelTax,
        labelTaxEnabled,
        updateLabelTaxEnabled,

        labelTotal,
        updateLabelTotal,
        labelTotalEnabled,
        updateLabelTotalEnabled,

        labelPaymentMethod,
        updateLabelPaymentMethod,
        labelPaymentMethodEnabled,
        updateLabelPaymentMethodEnabled,

        labelAmountPaid,
        updateLabelAmountPaid,
        labelAmountPaidEnabled,
        updateLabelAmountPaidEnabled,

        labelChange,
        updateLabelChange,
        labelChangeEnabled,
        updateLabelChangeEnabled,
    } = useReceiptTemplatePreference({ businessUuid: selectedBusiness?.uuid || null });

    const sampleReceipt: ReceiptData = {
        receiptNumber: 'RCP-001',
        transactionId: 'INV1001',
        date: '2025-12-07',
        time: '14:30:00',
        storeName: 'BillForge Store',
        storeAddress: '123 Main Street, City, State 12345',
        storePhone: '(555) 123-4567',
        storeLogo: '/logotext.png',
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

    const renderLabelInput = (
        id: string,
        label: string,
        value: string,
        onChange: (v: string) => void,
        enabled: boolean,
        onEnabledChange: (v: boolean) => void
    ) => (
        <div className="space-y-2">
            <Label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {label}
            </Label>
            <div className="flex items-center gap-2">
                <Input
                    id={id}
                    placeholder={label}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    maxLength={100}
                    disabled={!enabled}
                    className={`flex-1 ${!enabled ? 'opacity-50' : ''}`}
                />
                <Switch
                    checked={enabled}
                    onCheckedChange={onEnabledChange}
                />
            </div>
        </div>
    );

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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div className="space-y-2">
                            <Label htmlFor="receipt-style-select">Receipt Style (Image/PDF)</Label>
                            <Select
                                value={receiptStyle}
                                onValueChange={(value) => updateReceiptStyle(value as any)}
                            >
                                <SelectTrigger id="receipt-style-select">
                                    <SelectValue placeholder="Select a style" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="classic">Classic Monospace</SelectItem>
                                    <SelectItem value="sans-serif">Modern Sans Serif</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="font-select">Font (Printer)</Label>
                            <Select value={printerFont || 'A'} onValueChange={updatePrinterFont}>
                                <SelectTrigger id="font-select">
                                    <SelectValue placeholder="Select font" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="A">Font A (12x24)</SelectItem>
                                    <SelectItem value="B">Font B (9x17)</SelectItem>
                                    <SelectItem value="C">Font C (9x24)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="line-character-select">Line Character</Label>
                            <Select value={lineCharacter || '-'} onValueChange={updateLineCharacter}>
                                <SelectTrigger id="line-character-select">
                                    <SelectValue placeholder="Select line style" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="-">Dashed (-)</SelectItem>
                                    <SelectItem value=".">Dotted (.)</SelectItem>
                                    <SelectItem value="_">Underscore (_)</SelectItem>
                                    <SelectItem value="=">Double (=)</SelectItem>
                                    <SelectItem value="*">Asterisk (*)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="item-layout-select">Item Layout</Label>
                            <Select value={itemLayout?.toString() || '0'} onValueChange={(val) => updateItemLayout(parseInt(val))}>
                                <SelectTrigger id="item-layout-select">
                                    <SelectValue placeholder="Select layout" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Horizontal (Name & Price same line)</SelectItem>
                                    <SelectItem value="1">Vertical (Name top, Price bottom)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Custom Labels</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Customize and toggle visibility of receipt labels
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderLabelInput('label-receipt-id', 'Receipt ID Label', labelReceiptId, updateLabelReceiptId, labelReceiptIdEnabled, updateLabelReceiptIdEnabled)}
                        {renderLabelInput('label-transaction-id', 'Transaction ID Label', labelTransactionId, updateLabelTransactionId, labelTransactionIdEnabled, updateLabelTransactionIdEnabled)}
                        {renderLabelInput('label-date', 'Date Label', labelDate, updateLabelDate, labelDateEnabled, updateLabelDateEnabled)}
                        {renderLabelInput('label-time', 'Time Label', labelTime, updateLabelTime, labelTimeEnabled, updateLabelTimeEnabled)}
                        {renderLabelInput('label-cashier', 'Cashier Label', labelCashier, updateLabelCashier, labelCashierEnabled, updateLabelCashierEnabled)}
                        {renderLabelInput('label-customer', 'Customer Label', labelCustomer, updateLabelCustomer, labelCustomerEnabled, updateLabelCustomerEnabled)}
                        {renderLabelInput('label-items', 'Items Label', labelItems, updateLabelItems, labelItemsEnabled, updateLabelItemsEnabled)}
                        {renderLabelInput('label-subtotal', 'Subtotal Label', labelSubtotal, updateLabelSubtotal, labelSubtotalEnabled, updateLabelSubtotalEnabled)}
                        {renderLabelInput('label-discount', 'Discount Label', labelDiscount, updateLabelDiscount, labelDiscountEnabled, updateLabelDiscountEnabled)}
                        {renderLabelInput('label-tax', 'Tax Label', labelTax, updateLabelTax, labelTaxEnabled, updateLabelTaxEnabled)}
                        {renderLabelInput('label-total', 'Total Label', labelTotal, updateLabelTotal, labelTotalEnabled, updateLabelTotalEnabled)}
                        {renderLabelInput('label-payment-method', 'Payment Method Label', labelPaymentMethod, updateLabelPaymentMethod, labelPaymentMethodEnabled, updateLabelPaymentMethodEnabled)}
                        {renderLabelInput('label-amount-paid', 'Amount Paid Label', labelAmountPaid, updateLabelAmountPaid, labelAmountPaidEnabled, updateLabelAmountPaidEnabled)}
                        {renderLabelInput('label-change', 'Change Label', labelChange, updateLabelChange, labelChangeEnabled, updateLabelChangeEnabled)}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Thermal Preview</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Preview of how the receipt will look on a thermal printer
                    </p>
                </CardHeader>
                <CardContent className="flex justify-center bg-gray-100/50 p-6">
                    <div className="bg-white p-4 shadow-sm border border-gray-200">
                        <iframe
                            key={`${printerFont}-${lineCharacter}-${itemLayout}-${receiptStyle}-${includeLogo}-${footerMessage}-${qrcodeValue}`}
                            srcDoc={generateDynamicReceiptHTML({
                                ...sampleReceipt,
                                storeLogo: includeLogo ? sampleReceipt.storeLogo : undefined,
                                footer: footerMessage,
                                qrcode: qrcodeValue,
                                currencySymbol: sampleReceipt.currencySymbol
                            }, {
                                id: 0,
                                uuid: '',
                                business_uuid: '',
                                receipt_style_id: Number(receiptStyle === 'classic' ? 0 : 1),
                                qrcode_data: qrcodeValue || null,
                                footer_message: footerMessage || null,
                                include_image: includeLogo,
                                transaction_prefix: transactionPrefix || null,
                                transaction_next_number: transactionNextNumber,

                                line_character: lineCharacter || null,
                                item_layout: itemLayout,

                                label_receipt_id: labelReceiptId || null,
                                label_receipt_id_enabled: labelReceiptIdEnabled,
                                label_transaction_id: labelTransactionId || null,
                                label_transaction_id_enabled: labelTransactionIdEnabled,
                                label_date: labelDate || null,
                                label_date_enabled: labelDateEnabled,
                                label_time: labelTime || null,
                                label_time_enabled: labelTimeEnabled,
                                label_cashier: labelCashier || null,
                                label_cashier_enabled: labelCashierEnabled,
                                label_customer: labelCustomer || null,
                                label_customer_enabled: labelCustomerEnabled,
                                label_items: labelItems || null,
                                label_items_enabled: labelItemsEnabled,
                                label_subtotal: labelSubtotal || null,
                                label_subtotal_enabled: labelSubtotalEnabled,
                                label_discount: labelDiscount || null,
                                label_discount_enabled: labelDiscountEnabled,
                                label_tax: labelTax || null,
                                label_tax_enabled: labelTaxEnabled,
                                label_total: labelTotal || null,
                                label_total_enabled: labelTotalEnabled,
                                label_payment_method: labelPaymentMethod || null,
                                label_payment_method_enabled: labelPaymentMethodEnabled,
                                label_amount_paid: labelAmountPaid || null,
                                label_amount_paid_enabled: labelAmountPaidEnabled,
                                label_change: labelChange || null,
                                label_change_enabled: labelChangeEnabled,
                                created_at: '',
                                updated_at: ''
                            })}
                            className="w-[300px] h-[500px] border-0 bg-white"
                            title="Thermal Preview"
                        />
                    </div>
                </CardContent>
            </Card>




        </div>
    );
}
