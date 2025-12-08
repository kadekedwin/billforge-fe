import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Receipt,
  ShoppingCart,
  Users,
  Tags,
  BarChart3,
  Smartphone,
} from "lucide-react";

const features = [
  {
    icon: Receipt,
    title: "Professional Receipts",
    description:
      "Create beautiful, customizable receipts with your logo, QR codes, and custom messages. Choose from multiple templates that look professional and boost your brand image.",
  },
  {
    icon: ShoppingCart,
    title: "Fast Checkout Process",
    description:
      "Speed up your transactions with an intuitive POS interface. Process sales quickly, accept multiple payment methods, and get your customers on their way faster.",
  },
  {
    icon: Users,
    title: "Customer Management",
    description:
      "Build lasting relationships with customer profiles and purchase history. Track preferences, spending patterns, and provide personalized service to your regulars.",
  },
  {
    icon: Tags,
    title: "Smart Discounts & Taxes",
    description:
      "Easily manage percentage or fixed discounts and multiple tax rates. Apply promotions to specific items or entire transactions with just a few clicks.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Get instant insights into your sales performance. Track daily revenue, best-selling items, and transaction trends to make data-driven business decisions.",
  },
  {
    icon: Smartphone,
    title: "Access Anywhere",
    description:
      "Cloud-based system works on any device - desktop, tablet, or smartphone. Manage your business from anywhere with secure, real-time data synchronization.",
  },
];

const Features = () => {
  return (
    <div
      id="features"
      className="max-w-(--breakpoint-xl) mx-auto w-full py-12 xs:py-20 px-6"
    >
      <h2 className="text-3xl xs:text-4xl md:text-5xl md:leading-[3.5rem] font-bold tracking-tight sm:max-w-xl sm:text-center sm:mx-auto">
        Everything You Need to Run Your Business
      </h2>
      <p className="mt-4 text-center text-lg text-muted-foreground max-w-2xl mx-auto">
        Powerful features designed to streamline your sales, manage customers, and grow your business efficiently.
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
                {feature.title}
              </h4>
              <p className="mt-1 text-muted-foreground text-sm xs:text-[17px]">
                {feature.description}
              </p>
            </CardHeader>
            <CardContent className="mt-auto px-0 pb-0">
              <div className="bg-muted h-52 ml-6 rounded-tl-xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Features;
