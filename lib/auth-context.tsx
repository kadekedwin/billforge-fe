"use client";

import {createContext, useContext, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import type {User} from "@/lib/api";

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const initializeAuthState = async () => {
        if (typeof window === "undefined") {
            setIsLoading(false)
            return
        }

        try {
            const storedToken = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

            if (storedToken && storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setToken(storedToken);
                    setUser(parsedUser);
                } catch (error) {
                    console.error("Error parsing stored user:", error);
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                }
            }
        } catch (error) {
            console.error('Failed to initialize auth:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        initializeAuthState()
    }, []);

    const setAuth = (newUser: User, newToken: string) => {
        setUser(newUser);
        setToken(newToken);
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));

        // Set cookie for middleware
        document.cookie = `token=${newToken}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Clear cookie
        document.cookie = "token=; path=/; max-age=0";

        router.push("/login");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!token && !!user,
                setAuth,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

