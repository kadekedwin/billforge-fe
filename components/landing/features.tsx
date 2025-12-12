"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Receipt,
    ShoppingCart,
    Users,
    Tags,
    BarChart3,
    Smartphone,
} from "lucide-react";
import { useTheme } from "next-themes";
import { AnalyticIcon, CloudIcon, ReceiptIcon, SaleIcon, CustomerIcon, CheckoutIcon } from "@/components/icons/features";
import { useTranslation } from "@/lib/i18n/useTranslation";

const features = [
    {
        icon: Receipt,
        title: "landing.features.receipt.title",
        description: "landing.features.receipt.description",
        illustration: ReceiptIcon,
    },
    {
        icon: ShoppingCart,
        title: "landing.features.checkout.title",
        description: "landing.features.checkout.description",
        illustration: CheckoutIcon,
    },
    {
        icon: Users,
        title: "landing.features.customer.title",
        description: "landing.features.customer.description",
        illustration: CustomerIcon,
    },
    {
        icon: Tags,
        title: "landing.features.discount.title",
        description: "landing.features.discount.description",
        illustration: SaleIcon,
    },
    {
        icon: BarChart3,
        title: "landing.features.analytics.title",
        description: "landing.features.analytics.description",
        illustration: AnalyticIcon,
    },
    {
        icon: Smartphone,
        title: "landing.features.cloud.title",
        description: "landing.features.cloud.description",
        illustration: CloudIcon,
    },
];

const Features = () => {
    const { resolvedTheme } = useTheme();
    const { t } = useTranslation();

    return (
        <div
            id="features"
            className="max-w-(--breakpoint-xl) mx-auto w-full py-12 xs:py-20 px-6"
        >
            <h2 className="text-3xl xs:text-4xl md:text-5xl md:leading-[3.5rem] font-bold tracking-tight sm:max-w-xl sm:text-center sm:mx-auto">
                {t('landing.features.title')}
            </h2>
            <p className="mt-4 text-center text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('landing.features.description')}
            </p>
            <div className="mt-8 xs:mt-14 w-full mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
                {features.map((feature) => (
                    <Card
                        key={feature.title}
                        className="flex flex-col border rounded-xl overflow-hidden shadow-none pb-0"
                    >
                        <CardHeader>
                            <feature.icon />
                            <h4 className="mt-3! text-xl font-bold tracking-tight">
                                {t(feature.title)}
                            </h4>
                            <p className="mt-1 text-muted-foreground text-sm xs:text-[17px]">
                                {t(feature.description)}
                            </p>
                        </CardHeader>
                        <CardContent className="flex justify-end items-end mt-auto mx-10 mb-10 relative">
                            <feature.illustration className="size-30" fill={resolvedTheme === "dark" ? "white" : "black"} />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Features;
