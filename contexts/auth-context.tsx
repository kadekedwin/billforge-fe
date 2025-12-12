"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/api";
import { getUser } from "@/lib/api/user";

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    removeAuth: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
    TOKEN: "token",
    USER: "user",
} as const;

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const clearStorage = useCallback(() => {
        if (typeof window === "undefined") return;

        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        document.cookie = `${STORAGE_KEYS.TOKEN}=; path=/; max-age=0`;
    }, []);

    const saveToStorage = useCallback((newUser: User, newToken: string) => {
        if (typeof window === "undefined") return;

        try {
            localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
            document.cookie = `${STORAGE_KEYS.TOKEN}=${newToken}; path=/; max-age=${COOKIE_MAX_AGE}`;
        } catch (error) {
            console.error("Failed to save auth data:", error);
        }
    }, []);

    const loadFromStorage = useCallback(() => {
        if (typeof window === "undefined") return null;

        try {
            const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
            const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

            if (!storedToken || !storedUser) return null;

            const parsedUser = JSON.parse(storedUser);
            return { user: parsedUser, token: storedToken };
        } catch (error) {
            console.error("Failed to load auth data:", error);
            clearStorage();
            return null;
        }
    }, [clearStorage]);

    const initializeAuth = useCallback(async () => {
        const authData = loadFromStorage();

        if (authData) {
            setUser(authData.user);
            setToken(authData.token);
        }

        setIsLoading(false);
    }, [loadFromStorage]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        initializeAuth();
    }, [initializeAuth]);

    const setAuth = useCallback((newUser: User, newToken: string) => {
        setUser(newUser);
        setToken(newToken);
        saveToStorage(newUser, newToken);
    }, [saveToStorage]);

    const removeAuth = useCallback(() => {
        setUser(null);
        setToken(null);
        clearStorage();
        router.push("/login");
    }, [clearStorage, router]);

    const refreshUser = useCallback(async () => {
        if (!token) return;

        try {
            const response = await getUser();

            if (response.success && response.data) {
                setUser(response.data);
                if (typeof window !== "undefined") {
                    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
                }
            }
        } catch (error) {
            if (error instanceof Error && 'statusCode' in error) {
                const apiError = error as { statusCode: number };
                if (apiError.statusCode === 401) {
                    removeAuth();
                    return;
                }
            }
            console.error("Failed to refresh user:", error);
        }
    }, [token, removeAuth]);

    const value = {
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        setAuth,
        removeAuth,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}
