"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, MobileSidebar } from "@/components/sidebar/Sidebar";
import { useAuth } from "@/contexts/auth-context";
import { useBusiness } from "@/contexts/business-context";
import { BusinessOnboarding } from "@/components/business-onboarding";
import ThemeToggle from "@/components/landing/theme-toggle";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading: isAuthLoading, user, refreshUser } = useAuth();
    const { businesses, isLoading: isBusinessLoading, selectedBusiness, setSelectedBusiness } = useBusiness();
    const router = useRouter();
    const { t } = useTranslation();
    const [hasRefreshedUser, setHasRefreshedUser] = useState(false);

    useEffect(() => {
        const refreshUserData = async () => {
            if (isAuthenticated && !isAuthLoading && !hasRefreshedUser) {
                await refreshUser();
                setHasRefreshedUser(true);
            }
        };
        refreshUserData();
    }, [isAuthenticated, isAuthLoading, hasRefreshedUser, refreshUser]);

    useEffect(() => {
        if (!hasRefreshedUser) return;

        if (!isAuthLoading && !isAuthenticated) {
            router.push("/login");
        } else if (!isAuthLoading && isAuthenticated && user && !user.email_verified_at) {
            router.push("/verify-email");
        }
    }, [isAuthenticated, isAuthLoading, user, router, hasRefreshedUser]);

    useEffect(() => {
        if (!isBusinessLoading && businesses.length > 0 && !selectedBusiness) {
            setSelectedBusiness(businesses[0]);
        }
    }, [isBusinessLoading, businesses, selectedBusiness, setSelectedBusiness]);

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

    if (isBusinessLoading && selectedBusiness === null) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="mt-4 text-sm text-muted-foreground">{t('common.loadingBusinesses')}</p>
                </div>
            </div>
        );
    }

    if (businesses.length === 0) {
        return <BusinessOnboarding />;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-14 items-center justify-between border-b px-3 lg:hidden">
                    <div className="flex items-center space-x-2">
                        <MobileSidebar />
                        <span className="text-lg font-bold">{t('common.appName')}</span>
                    </div>
                    <ThemeToggle />
                </header>

                <main className="flex-1 overflow-y-auto bg-background p-3 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

