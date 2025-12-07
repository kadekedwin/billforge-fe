"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, MobileSidebar } from "@/components/sidebar";
import { useAuth } from "@/lib/auth-context";
import { useBusiness } from "@/lib/business-context";
import { BusinessOnboarding } from "@/components/business-onboarding";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const { selectedBusiness, businesses, isLoading: isBusinessLoading } = useBusiness();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isBusinessLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Show onboarding if there are no businesses
  if (businesses.length === 0) {
    return <BusinessOnboarding />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center border-b px-4 lg:hidden">
          <MobileSidebar />
          <div className="ml-4 flex items-center space-x-2">
            <span className="text-xl font-bold">BillForge</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

