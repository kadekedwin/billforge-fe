import {
    LayoutDashboard,
    FileText,
    Package,
    UserCircle,
    CreditCard,
    Percent,
    Tag,
    Settings,
    FolderOpen,
} from "lucide-react";

export const navItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Transactions",
        href: "/transactions",
        icon: FileText,
    },
    {
        title: "Items",
        href: "/items",
        icon: Package,
    },
    {
        title: "Categories",
        href: "/categories",
        icon: FolderOpen,
    },
    {
        title: "Customers",
        href: "/customers",
        icon: UserCircle,
    },
    {
        title: "Payment Methods",
        href: "/payment-methods",
        icon: CreditCard,
    },
    {
        title: "Item Taxes",
        href: "/item-taxes",
        icon: Percent,
    },
    {
        title: "Item Discounts",
        href: "/item-discounts",
        icon: Tag,
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
    },
];