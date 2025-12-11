"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { useBusiness } from "@/contexts/business-context";
import { useReceiptTemplatePreference } from "@/lib/receipt";
import { getImageUrl } from "@/lib/images/operations";
import { getItemCategories } from "@/lib/api/item-categories";
import { LIMITS, getLimitMessage } from "@/lib/config/limits";
import { ReceiptPopup } from "@/components/receipt-popup";
import { convertTransactionToReceiptData } from "@/lib/receipt/utils";
import { toast } from "sonner";
import type { Transaction, TransactionItem } from "@/lib/api";
import { ItemsGrid } from "./ItemsGrid";
import { CartSummary } from "./CartSummary";
import { CheckoutView } from "./CheckoutView";
import { useDashboardData } from "./useDashboardData";
import { useCart } from "./useCart";
import { completeTransaction } from "./transactionHandler";
import { getMonthlyTransactionCount, getTotalCartItems, getTotalCartAmount } from "./cartUtils";

export default function DashboardPage() {
    const { selectedBusiness } = useBusiness();
    const { includeLogo, footerMessage, qrcodeValue } = useReceiptTemplatePreference();
    const {
        items,
        customers,
        paymentMethods,
        taxes,
        discounts,
        transactions,
        categories,
        isLoading,
        error,
        loadData,
    } = useDashboardData();
    const { cart, addToCart, removeFromCart, clearCart } = useCart();

    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [itemCategoryMap, setItemCategoryMap] = useState<Map<string, string[]>>(new Map());
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [isCheckout, setIsCheckout] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<string>("");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [isReceiptPopupOpen, setIsReceiptPopupOpen] = useState(false);
    const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
    const [completedTransactionItems, setCompletedTransactionItems] = useState<TransactionItem[]>([]);
    const [completedCustomerName, setCompletedCustomerName] = useState<string | undefined>(undefined);
    const [completedPaymentMethodName, setCompletedPaymentMethodName] = useState<string>("Cash");
    const [completedCustomerEmail, setCompletedCustomerEmail] = useState<string | null>(null);
    const [completedCustomerPhone, setCompletedCustomerPhone] = useState<string | null>(null);
    const [businessLogoUrl, setBusinessLogoUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchItemCategories = async () => {
            if (!selectedBusiness || items.length === 0) {
                setItemCategoryMap(new Map());
                return;
            }

            setIsLoadingCategories(true);
            const businessItems = items.filter(item => item.business_uuid === selectedBusiness.uuid);
            const categoryMap = new Map<string, string[]>();

            await Promise.all(
                businessItems.map(async (item) => {
                    try {
                        const response = await getItemCategories(item.uuid);
                        if (response.success && response.data) {
                            categoryMap.set(item.uuid, response.data.map(cat => cat.uuid));
                        } else {
                            categoryMap.set(item.uuid, []);
                        }
                    } catch (error) {
                        categoryMap.set(item.uuid, []);
                    }
                })
            );

            setItemCategoryMap(categoryMap);
            setIsLoadingCategories(false);
        };

        fetchItemCategories();
    }, [items, selectedBusiness]);

    useEffect(() => {
        const fetchBusinessLogo = async () => {
            if (selectedBusiness && includeLogo && selectedBusiness.image_size_bytes) {
                const result = await getImageUrl({
                    folder: 'businesses',
                    uuid: selectedBusiness.uuid,
                });
                if (result.success && result.url) {
                    setBusinessLogoUrl(result.url);
                } else {
                    setBusinessLogoUrl(undefined);
                }
            } else {
                setBusinessLogoUrl(undefined);
            }
        };

        fetchBusinessLogo();
    }, [selectedBusiness, includeLogo]);

    const handleCheckout = () => {
        if (!selectedBusiness) {
            setCheckoutError("Please select a business from the sidebar");
            return;
        }

        const monthlyCount = getMonthlyTransactionCount(transactions, selectedBusiness.uuid);
        if (monthlyCount >= LIMITS.MAX_TRANSACTIONS_MONTHLY) {
            toast.error(getLimitMessage('MAX_TRANSACTIONS_MONTHLY'));
            return;
        }

        setIsCheckout(true);
    };

    const handleCompleteTransaction = async () => {
        if (!selectedBusiness) {
            setCheckoutError("Please select a business from the sidebar");
            return;
        }

        setIsSubmitting(true);
        setCheckoutError(null);

        const result = await completeTransaction({
            cart,
            items,
            taxes,
            discounts,
            businessUuid: selectedBusiness.uuid,
            selectedCustomer,
            selectedPaymentMethod,
            notes,
            customers,
            paymentMethods,
        });

        if (result.success && result.transaction && result.transactionItems) {
            setCompletedTransaction(result.transaction);
            setCompletedTransactionItems(result.transactionItems);
            setCompletedCustomerName(result.customerName);
            setCompletedPaymentMethodName(result.paymentMethodName || "Cash");
            setCompletedCustomerEmail(result.customerEmail || null);
            setCompletedCustomerPhone(result.customerPhone || null);
            setIsReceiptPopupOpen(true);

            clearCart();
            setIsCheckout(false);
            setSelectedCustomer("");
            setSelectedPaymentMethod("");
            setNotes("");
        } else {
            setCheckoutError(result.error || "Failed to complete transaction");
        }

        setIsSubmitting(false);
    };

    const filteredItems = selectedBusiness
        ? items.filter((item) => {
            if (item.business_uuid !== selectedBusiness.uuid) return false;

            if (searchQuery) {
                const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
                if (!matchesSearch) return false;
            }

            if (selectedCategory) {
                const itemCategories = itemCategoryMap.get(item.uuid) || [];
                if (!itemCategories.includes(selectedCategory)) return false;
            }

            return true;
        })
        : [];

    const businessCustomers = selectedBusiness
        ? customers.filter((c) => c.business_uuid === selectedBusiness.uuid)
        : [];

    const businessPaymentMethods = selectedBusiness
        ? paymentMethods.filter((pm) => pm.business_uuid === selectedBusiness.uuid)
        : [];

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-semibold text-destructive">Error</p>
                    <p className="text-muted-foreground">{error}</p>
                    <Button onClick={loadData} className="mt-4">
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    if (isCheckout) {
        return (
            <CheckoutView
                cart={cart}
                items={items}
                customers={businessCustomers}
                paymentMethods={businessPaymentMethods}
                taxes={taxes}
                discounts={discounts}
                selectedCustomer={selectedCustomer}
                selectedPaymentMethod={selectedPaymentMethod}
                notes={notes}
                isSubmitting={isSubmitting}
                error={checkoutError}
                onBack={() => setIsCheckout(false)}
                onCustomerChange={setSelectedCustomer}
                onPaymentMethodChange={setSelectedPaymentMethod}
                onNotesChange={setNotes}
                onComplete={handleCompleteTransaction}
            />
        );
    }

    const businessCategories = selectedBusiness
        ? categories.filter((cat) => cat.business_uuid === selectedBusiness.uuid)
        : [];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">New Transaction</h1>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {businessCategories.length > 0 && (
                    <div className="flex items-center gap-2">
                        <select
                            id="category-filter"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            disabled={isLoadingCategories}
                            className="flex h-10 w-full sm:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">All Categories</option>
                            {businessCategories.map((category) => (
                                <option key={category.uuid} value={category.uuid}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {isLoadingCategories && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                    </div>
                )}
            </div>

            <ItemsGrid
                items={filteredItems}
                cart={cart}
                onAddToCart={addToCart}
                onRemoveFromCart={removeFromCart}
            />

            <CartSummary
                totalItems={getTotalCartItems(cart)}
                totalAmount={getTotalCartAmount(cart, items)}
                onCheckout={handleCheckout}
            />

            {completedTransaction && selectedBusiness && (
                <ReceiptPopup
                    open={isReceiptPopupOpen}
                    onOpenChange={(open) => {
                        setIsReceiptPopupOpen(open);
                        if (!open) {
                            setCompletedTransaction(null);
                            setCompletedTransactionItems([]);
                            setCompletedCustomerName(undefined);
                            setCompletedPaymentMethodName("Cash");
                            setCompletedCustomerEmail(null);
                            setCompletedCustomerPhone(null);
                        }
                    }}
                    receiptData={convertTransactionToReceiptData(
                        completedTransaction,
                        completedTransactionItems,
                        selectedBusiness,
                        completedCustomerName,
                        completedPaymentMethodName,
                        footerMessage || undefined,
                        businessLogoUrl,
                        qrcodeValue || undefined
                    )}
                    customerEmail={completedCustomerEmail}
                    customerPhone={completedCustomerPhone}
                />
            )}
        </div>
    );
}