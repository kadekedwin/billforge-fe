"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {Sidebar, MobileSidebar} from "@/components/sidebar/Sidebar";
import {useAuth} from "@/contexts/auth-context";
import {useBusiness} from "@/contexts/business-context";
import {BusinessOnboarding} from "@/components/business-onboarding";
import ThemeToggle from "@/components/landing/theme-toggle";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const {isAuthenticated, isLoading: isAuthLoading, user} = useAuth();
    const {businesses, isLoading: isBusinessLoading} = useBusiness();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            router.push("/login");
        } else if (!isAuthLoading && isAuthenticated && user && !user.email_verified_at) {
            router.push("/verify-email");
        }
    }, [isAuthenticated, isAuthLoading, user, router]);

    if (isAuthLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    if (isBusinessLoading && businesses.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="mt-4 text-sm text-muted-foreground">Loading businesses...</p>
                </div>
            </div>
        );
    }

    if (businesses.length === 0) {
        return <BusinessOnboarding/>;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Desktop Sidebar */}
            <Sidebar/>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="flex h-14 items-center justify-between border-b px-3 lg:hidden">
                    <div className="flex items-center space-x-2">
                        <MobileSidebar/>
                        <span className="text-lg font-bold">BillForge</span>
                    </div>
                    <ThemeToggle />
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-background p-3 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

