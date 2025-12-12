"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";

const plans = [
  {
    key: "free",
    price: 0,
    href: "/login",
  },
  {
    key: "pro",
    price: 29,
    isRecommended: true,
    isPopular: true,
    href: "/login"
  },
  {
    key: "enterprise",
    price: 99,
    href: "#footer"
  },
];

const Pricing = () => {
  const { t } = useTranslation();

  const getFeatures = (planKey: string) => {
    if (planKey === 'free') {
      return [
        t('landing.pricing.plans.free.features.business'),
        t('landing.pricing.plans.free.features.items'),
        t('landing.pricing.plans.free.features.customers'),
        t('landing.pricing.plans.free.features.transactions'),
        t('landing.pricing.plans.free.features.paymentMethods'),
        t('landing.pricing.plans.free.features.discountsTaxes'),
        t('landing.pricing.plans.free.features.templates'),
        t('landing.pricing.plans.free.features.storage'),
      ];
    } else if (planKey === 'pro') {
      return [
        t('landing.pricing.plans.pro.features.business'),
        t('landing.pricing.plans.pro.features.items'),
        t('landing.pricing.plans.pro.features.customers'),
        t('landing.pricing.plans.pro.features.transactions'),
        t('landing.pricing.plans.pro.features.paymentMethods'),
        t('landing.pricing.plans.pro.features.discountsTaxes'),
        t('landing.pricing.plans.pro.features.templates'),
        t('landing.pricing.plans.pro.features.support'),
        t('landing.pricing.plans.pro.features.analytics'),
        t('landing.pricing.plans.pro.features.branding'),
      ];
    } else {
      return [
        t('landing.pricing.plans.enterprise.features.business'),
        t('landing.pricing.plans.enterprise.features.items'),
        t('landing.pricing.plans.enterprise.features.customers'),
        t('landing.pricing.plans.enterprise.features.transactions'),
        t('landing.pricing.plans.enterprise.features.paymentMethods'),
        t('landing.pricing.plans.enterprise.features.discountsTaxes'),
        t('landing.pricing.plans.enterprise.features.api'),
        t('landing.pricing.plans.enterprise.features.support'),
      ];
    }
  };

  return (
    <div id="pricing" className="max-w-(--breakpoint-lg) mx-auto py-12 xs:py-20 px-6">
      <div className="text-center mb-8 xs:mb-14">
        <h1 className="text-4xl xs:text-5xl font-bold tracking-tight">
          {t('landing.pricing.title')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('landing.pricing.description')}
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-8 lg:gap-0">
        {plans.map((plan) => (
          <div
            key={plan.key}
            className={cn(
              "relative bg-accent/50 border p-7 rounded-xl lg:rounded-none lg:first:rounded-l-xl lg:last:rounded-r-xl",
              {
                "bg-background border-[2px] border-primary py-12 rounded-xl!":
                  plan.isPopular,
              }
            )}
          >
            {plan.isPopular && (
              <Badge className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2">
                {t('landing.pricing.mostPopular')}
              </Badge>
            )}
            <h3 className="text-lg font-medium">{t(`landing.pricing.plans.${plan.key}.name`)}</h3>
            <div className="mt-2">
              <span className="text-4xl font-bold">${plan.price}</span>
              {plan.price > 0 && (
                <span className="text-muted-foreground ml-1">{t('landing.pricing.monthly')}</span>
              )}
            </div>
            <p className="mt-4 font-medium text-muted-foreground">
              {t(`landing.pricing.plans.${plan.key}.description`)}
            </p>
            <Separator className="my-6" />
            <ul className="space-y-2">
              {getFeatures(plan.key).map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <CircleCheck className="h-4 w-4 mt-1 text-green-600" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              variant={plan.isPopular ? "default" : "outline"}
              size="lg"
              className="w-full mt-6 rounded-full"
            >
              <Link href={plan.href}>{t(`landing.pricing.plans.${plan.key}.button`)}</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
