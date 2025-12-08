import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CircleCheck } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: 0,
    description:
      "Perfect for small businesses just getting started with digital billing.",
    features: [
      "1 Business",
      "50 Items",
      "50 Customers",
      "50 Transactions/month",
      "5 Payment Methods",
      "30 Discounts & Taxes",
      "Basic Receipt Templates",
      "Cloud Storage",
    ],
    buttonText: "Get Started Free",
  },
  {
    name: "Pro",
    price: 29,
    isRecommended: true,
    description:
      "Ideal for growing businesses with multiple locations and higher volume.",
    features: [
      "10 Businesses",
      "500 Items",
      "500 Customers",
      "500 Transactions/month",
      "50 Payment Methods",
      "300 Discounts & Taxes",
      "Premium Receipt Templates",
      "Priority Support",
      "Advanced Analytics",
      "Custom Branding",
    ],
    buttonText: "Start Pro Trial",
    isPopular: true,
  },
  {
    name: "Enterprise",
    price: 99,
    description:
      "For large businesses requiring advanced features and dedicated support.",
    features: [
      "10 Businesses",
      "Unlimited Items",
      "Unlimited Customers",
      "Unlimited Transactions",
      "Unlimited Payment Methods",
      "Unlimited Discounts & Taxes",
      "API Access",
      "24/7 Priority Support",
    ],
    buttonText: "Contact Sales",
  },
];

const Pricing = () => {
  return (
    <div id="pricing" className="max-w-(--breakpoint-lg) mx-auto py-12 xs:py-20 px-6">
      <div className="text-center mb-8 xs:mb-14">
        <h1 className="text-4xl xs:text-5xl font-bold tracking-tight">
          Simple, Transparent Pricing
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your business. Start free and upgrade as you grow.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-8 lg:gap-0">
        {plans.map((plan) => (
          <div
            key={plan.name}
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
                Most Popular
              </Badge>
            )}
            <h3 className="text-lg font-medium">{plan.name}</h3>
            <div className="mt-2">
              <span className="text-4xl font-bold">${plan.price}</span>
              {plan.price > 0 && (
                <span className="text-muted-foreground ml-1">/month</span>
              )}
            </div>
            <p className="mt-4 font-medium text-muted-foreground">
              {plan.description}
            </p>
            <Separator className="my-6" />
            <ul className="space-y-2">
              {plan.features.map((feature) => (
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
              {plan.buttonText}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
