"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    Package,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Percent,
    Tag,
    CreditCard,
    UserCircle,
} from "lucide-react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet";
import {useAuth} from "@/lib/auth-context";
import {useBusiness} from "@/lib/business-context";
import {useState, useEffect, memo} from "react";
import {Building2, ChevronDown, Loader2} from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/lib/images";
import type { Business } from "@/lib/api";

const BusinessLogo = memo(({ business, size = "sm" }: { business: Business; size?: "sm" | "lg" }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadImage = async () => {
            if (business.image_size_bytes) {
                setLoading(true);
                const result = await getImageUrl({
                    folder: 'businesses',
                    uuid: business.uuid,
                });
                if (result.success && result.url) {
                    setImageUrl(result.url);
                }
                setLoading(false);
            }
        };
        loadImage();
    }, [business.uuid, business.image_size_bytes]);

    const sizeClasses = size === "lg" ? "h-8 w-8" : "h-4 w-4";

    if (loading) {
        return <Loader2 className={cn(sizeClasses, "animate-spin")} />;
    }

    if (imageUrl) {
        return (
            <Avatar className={sizeClasses}>
                <AvatarImage src={imageUrl} alt={business.name} />
                <AvatarFallback>{business.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
        );
    }

    return <Building2 className={sizeClasses} />;
});

BusinessLogo.displayName = 'BusinessLogo';

const navItems = [
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
        title: "Businesses",
        href: "/businesses",
        icon: Users,
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
    },
];

function SidebarContent({onNavigate}: { onNavigate?: () => void }) {
    const pathname = usePathname();
    const {user, logout} = useAuth();
    const {selectedBusiness, businesses, setSelectedBusiness} = useBusiness();

    const handleLogout = () => {
        logout();
        onNavigate?.();
    };

    return (
        <div className="flex h-full flex-col">
            {/* Logo/Brand */}
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center space-x-2" onClick={onNavigate}>
                    <Image src={"/logovector.png"} alt={"logo"} width={32} height={32}/>
                    <span className="text-xl font-bold">BillForge</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={cn(
                                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <Icon className="h-5 w-5"/>
                            <span>{item.title}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Business Selector */}
            {selectedBusiness && businesses.length > 0 && (
                <div className="border-t p-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-between"
                            >
                                <div className="flex items-center space-x-2">
                                    <BusinessLogo business={selectedBusiness} size="sm" />
                                    <span className="truncate text-sm">{selectedBusiness.name}</span>
                                </div>
                                <ChevronDown className="h-4 w-4 opacity-50"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuLabel>Switch Business</DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            {businesses.map((business) => (
                                <DropdownMenuItem
                                    key={business.uuid}
                                    onClick={() => {
                                        setSelectedBusiness(business);
                                        onNavigate?.();
                                    }}
                                    className={cn(
                                        selectedBusiness.uuid === business.uuid && "bg-accent"
                                    )}
                                >
                                    <div className="mr-2">
                                        <BusinessLogo business={business} size="sm" />
                                    </div>
                                    <span>{business.name}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            {/* User Profile */}
            <div className="border-t p-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="w-full justify-start space-x-3 px-2"
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarImage src=""/>
                                <AvatarFallback>
                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-1 flex-col items-start text-sm">
                                <span className="font-medium">{user?.name || "User"}</span>
                                <span className="text-xs text-muted-foreground">
                  {user?.email || ""}
                </span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem asChild>
                            <Link href="/profile">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings">Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                            <LogOut className="mr-2 h-4 w-4"/>
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

export function Sidebar() {
    return (
        <aside className="hidden h-screen w-64 border-r bg-background lg:block">
            <SidebarContent/>
        </aside>
    );
}

export function MobileSidebar() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Toggle menu"
                >
                    {open ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <SidebarContent onNavigate={() => setOpen(false)}/>
            </SheetContent>
        </Sheet>
    );
}

