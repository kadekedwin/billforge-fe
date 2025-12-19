"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useBusiness } from "@/contexts/business-context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
    getSalesSummary,
    getSalesByDate,
    getSalesByItem,
    getSalesByCategory,
    getSalesByPaymentMethod,
    type SalesSummary,
    type SalesByDate,
    type SalesByItem,
    type SalesByCategory,
    type SalesByPaymentMethod
} from "@/lib/api/reports";
import { Loader2, TrendingUp, ShoppingCart, DollarSign, Package, CreditCard, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
    const { selectedBusiness } = useBusiness();
    const { t } = useTranslation();

    // Set default dates: 1 month ago to today
    const getDefaultDates = () => {
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        return {
            start: oneMonthAgo,
            end: today
        };
    };

    const defaultDates = getDefaultDates();
    const [startDate, setStartDate] = useState<Date | undefined>(defaultDates.start);
    const [endDate, setEndDate] = useState<Date | undefined>(defaultDates.end);
    const [isLoading, setIsLoading] = useState(false);

    const [summary, setSummary] = useState<SalesSummary | null>(null);
    const [byDate, setByDate] = useState<SalesByDate[]>([]);
    const [byItem, setByItem] = useState<SalesByItem[]>([]);
    const [byCategory, setByCategory] = useState<SalesByCategory[]>([]);
    const [byPaymentMethod, setByPaymentMethod] = useState<SalesByPaymentMethod[]>([]);

    const fetchReports = async () => {
        if (!selectedBusiness) return;

        setIsLoading(true);
        const filters = {
            business_uuid: selectedBusiness.uuid,
            start_date: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
            end_date: endDate ? format(endDate, 'yyyy-MM-dd') : undefined
        };

        try {
            const [summaryRes, dateRes, itemRes, categoryRes, paymentRes] = await Promise.all([
                getSalesSummary(filters),
                getSalesByDate(filters),
                getSalesByItem(filters),
                getSalesByCategory(filters),
                getSalesByPaymentMethod(filters)
            ]);

            if (summaryRes.success) setSummary(summaryRes.data);
            if (dateRes.success) setByDate(dateRes.data);
            if (itemRes.success) setByItem(itemRes.data);
            if (categoryRes.success) setByCategory(categoryRes.data);
            if (paymentRes.success) setByPaymentMethod(paymentRes.data);
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [selectedBusiness]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: selectedBusiness?.currency || 'USD'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t("app.reports.title")}</h1>
                <p className="text-muted-foreground">
                    {t("app.reports.subtitle")}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t("app.reports.dateRange.title")}</CardTitle>
                    <CardDescription>{t("app.reports.dateRange.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Label>{t("app.reports.dateRange.startDate")}</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal mt-2",
                                            !startDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, "PPP") : <span>{t('common.pickDate')}</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={setStartDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex-1">
                            <Label>{t("app.reports.dateRange.endDate")}</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal mt-2",
                                            !endDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate ? format(endDate, "PPP") : <span>{t('common.pickDate')}</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={setEndDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex items-end">
                            <Button onClick={fetchReports} disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t("app.reports.dateRange.applyFilter")}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {summary && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t("app.reports.summary.totalSales")}</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.total_sales)}</div>
                            <p className="text-xs text-muted-foreground">
                                {summary.total_transactions} {t("app.reports.summary.transactions")}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t("app.reports.summary.averageTransaction")}</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.average_transaction_value)}</div>
                            <p className="text-xs text-muted-foreground">
                                {t("app.reports.summary.perTransaction")}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t("app.reports.summary.itemsSold")}</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_items_sold}</div>
                            <p className="text-xs text-muted-foreground">
                                {t("app.reports.summary.totalUnits")}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t("app.reports.summary.totalTax")}</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.total_tax)}</div>
                            <p className="text-xs text-muted-foreground">
                                {t("app.reports.summary.taxCollected")}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t("app.reports.summary.totalDiscounts")}</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.total_discounts)}</div>
                            <p className="text-xs text-muted-foreground">
                                {t("app.reports.summary.discountsGiven")}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs defaultValue="date" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="date">{t("app.reports.tabs.byDate")}</TabsTrigger>
                    <TabsTrigger value="item">{t("app.reports.tabs.byItem")}</TabsTrigger>
                    <TabsTrigger value="category">{t("app.reports.tabs.byCategory")}</TabsTrigger>
                    <TabsTrigger value="payment">{t("app.reports.tabs.byPaymentMethod")}</TabsTrigger>
                </TabsList>

                <TabsContent value="date" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("app.reports.byDate.title")}</CardTitle>
                            <CardDescription>{t("app.reports.byDate.description")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : byDate.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">{t("app.reports.noData")}</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t("app.reports.byDate.date")}</TableHead>
                                            <TableHead className="text-right">{t("app.reports.byDate.transactions")}</TableHead>
                                            <TableHead className="text-right">{t("app.reports.byDate.totalAmount")}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {byDate.map((row) => (
                                            <TableRow key={row.date}>
                                                <TableCell>{formatDate(row.date)}</TableCell>
                                                <TableCell className="text-right">{row.transaction_count}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(row.total_amount)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="item" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("app.reports.byItem.title")}</CardTitle>
                            <CardDescription>{t("app.reports.byItem.description")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : byItem.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">{t("app.reports.noData")}</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t("app.reports.byItem.itemName")}</TableHead>
                                            <TableHead>{t("app.reports.byItem.sku")}</TableHead>
                                            <TableHead className="text-right">{t("app.reports.byItem.quantitySold")}</TableHead>
                                            <TableHead className="text-right">{t("app.reports.byItem.totalRevenue")}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {byItem.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{row.name}</TableCell>
                                                <TableCell className="text-muted-foreground">{row.sku}</TableCell>
                                                <TableCell className="text-right">{row.quantity_sold}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(row.total_revenue)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="category" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("app.reports.byCategory.title")}</CardTitle>
                            <CardDescription>{t("app.reports.byCategory.description")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : byCategory.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">{t("app.reports.noData")}</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t("app.reports.byCategory.category")}</TableHead>
                                            <TableHead className="text-right">{t("app.reports.byCategory.quantitySold")}</TableHead>
                                            <TableHead className="text-right">{t("app.reports.byCategory.totalRevenue")}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {byCategory.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{row.category_name}</TableCell>
                                                <TableCell className="text-right">{row.quantity_sold}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(row.total_revenue)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payment" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("app.reports.byPaymentMethod.title")}</CardTitle>
                            <CardDescription>{t("app.reports.byPaymentMethod.description")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : byPaymentMethod.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">{t("app.reports.noData")}</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t("app.reports.byPaymentMethod.paymentMethod")}</TableHead>
                                            <TableHead className="text-right">{t("app.reports.byPaymentMethod.transactions")}</TableHead>
                                            <TableHead className="text-right">{t("app.reports.byPaymentMethod.totalAmount")}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {byPaymentMethod.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{row.payment_method_name}</TableCell>
                                                <TableCell className="text-right">{row.transaction_count}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(row.total_amount)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
