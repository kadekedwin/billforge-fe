import {
    ShoppingCart,
    Receipt,
    Package,
    Users,
    CreditCard,
    Percent,
    Tag,
    Settings,
    FolderOpen,
} from "lucide-react";

export const navItems = [
    {
        title: "Sale",
        href: "/sale",
        icon: ShoppingCart,
        translationKey: "app.sidebar.sale" as const,
    },
    {
        title: "Transactions",
        href: "/transactions",
        icon: Receipt,
        translationKey: "app.sidebar.transactions" as const,
    },
    {
        title: "Items",
        href: "/items",
        icon: Package,
        translationKey: "app.sidebar.items" as const,
    },
    {
        title: "Categories",
        href: "/categories",
        icon: FolderOpen,
        translationKey: "app.sidebar.categories" as const,
    },
    {
        title: "Customers",
        href: "/customers",
        icon: Users,
        translationKey: "app.sidebar.customers" as const,
    },
    {
        title: "Payment Methods",
        href: "/payment-methods",
        icon: CreditCard,
        translationKey: "app.sidebar.paymentMethods" as const,
    },
    {
        title: "Item Taxes",
        href: "/item-taxes",
        icon: Percent,
        translationKey: "app.sidebar.itemTaxes" as const,
    },
    {
        title: "Item Discounts",
        href: "/item-discounts",
        icon: Tag,
        translationKey: "app.sidebar.itemDiscounts" as const,
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        translationKey: "app.sidebar.settings" as const,
    },
];