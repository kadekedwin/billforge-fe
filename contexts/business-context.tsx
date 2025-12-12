"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import type { Business } from "@/lib/api/businesses/types";
import { getBusinesses } from "@/lib/api/businesses";
import { useAuth } from "@/contexts/auth-context";

interface BusinessContextType {
    selectedBusiness: Business | null;
    businesses: Business[];
    setSelectedBusiness: (business: Business | null) => void;
    refreshBusinesses: () => Promise<void>;
    isLoading: boolean;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const STORAGE_KEY = "selectedBusinessUuid";

const PUBLIC_ROUTES = [
    "/",
    "/login",
    "/register",
    "/verify-email",
    "/forgot-password",
    "/forgot-password-reset",
    "/privacy",
    "/terms",
];

export function BusinessProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [selectedBusiness, setSelectedBusinessState] = useState<Business | null>(null);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const isPublicRoute = useCallback(() => {
        return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
    }, [pathname]);

    const getSavedBusinessUuid = useCallback(() => {
        if (typeof window === "undefined") return null;

        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch {
            return null;
        }
    }, []);

    const saveBusinessUuid = useCallback((uuid: string | null) => {
        if (typeof window === "undefined") return;

        try {
            if (uuid) {
                localStorage.setItem(STORAGE_KEY, uuid);
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
        } catch (error) {
            console.error("Failed to save business UUID:", error);
        }
    }, []);

    const selectBusiness = useCallback((businessList: Business[]) => {
        if (businessList.length === 0) {
            setSelectedBusinessState(null);
            saveBusinessUuid(null);
            return;
        }

        const savedUuid = getSavedBusinessUuid();
        const savedBusiness = savedUuid
            ? businessList.find(b => b.uuid === savedUuid)
            : null;

        const businessToSelect = savedBusiness || businessList[0];
        setSelectedBusinessState(businessToSelect);
        saveBusinessUuid(businessToSelect.uuid);
    }, [getSavedBusinessUuid, saveBusinessUuid]);

    const fetchBusinesses = useCallback(async () => {
        if (typeof window === "undefined") {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const response = await getBusinesses();

            if (response.success && response.data) {
                setBusinesses(response.data);
                selectBusiness(response.data);
            } else {
                setBusinesses([]);
                setSelectedBusinessState(null);
                saveBusinessUuid(null);
            }
        } catch (error) {
            console.error("Failed to fetch businesses:", error);
            setBusinesses([]);
            setSelectedBusinessState(null);
            saveBusinessUuid(null);
        } finally {
            setIsLoading(false);
        }
    }, [selectBusiness, saveBusinessUuid]);

    useEffect(() => {
        if (isPublicRoute()) {
            setIsLoading(false);
            return;
        }

        if (authLoading) {
            return;
        }

        if (isAuthenticated) {
            fetchBusinesses();
        } else {
            setBusinesses([]);
            setSelectedBusinessState(null);
            setIsLoading(false);
        }
    }, [isAuthenticated, authLoading, isPublicRoute, fetchBusinesses]);

    const setSelectedBusiness = useCallback((business: Business | null) => {
        setSelectedBusinessState(business);
        saveBusinessUuid(business?.uuid || null);
    }, [saveBusinessUuid]);

    const refreshBusinesses = useCallback(async () => {
        await fetchBusinesses();
    }, [fetchBusinesses]);

    const value = {
        selectedBusiness,
        businesses,
        setSelectedBusiness,
        refreshBusinesses,
        isLoading,
    };

    return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusiness() {
    const context = useContext(BusinessContext);

    if (context === undefined) {
        throw new Error("useBusiness must be used within a BusinessProvider");
    }

    return context;
}
