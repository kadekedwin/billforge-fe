"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { login } from "@/lib/api/auth";
import type { LoginRequest } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";

export default function LoginPage() {
    const router = useRouter();
    const { setAuth } = useAuth();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<LoginRequest>({
        email: "",
        password: "",
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setFieldErrors({});

        try {
            const response = await login(formData);
            setAuth(response.data.user, response.data.access_token);
            if (!response.data.user.email_verified_at) {
                router.push("/verify-email");
            } else {
                router.push("/sale");
            }
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.errors) {
                    const errors: Record<string, string> = {};
                    Object.keys(err.errors).forEach((key) => {
                        errors[key] = err.errors![key][0];
                    });
                    setFieldErrors(errors);
                } else {
                    setError(err.message);
                }
            } else {
                setError(t("auth.login.errorGeneric"));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">
                    {t("auth.login.title")}
                </CardTitle>
                <CardDescription>
                    {t("auth.login.description")}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">{t("auth.login.emailLabel")}</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder={t("auth.login.emailPlaceholder")}
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                            className={fieldErrors.email ? "border-destructive" : ""}
                        />
                        {fieldErrors.email && (
                            <p className="text-sm text-destructive">{fieldErrors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">{t("auth.login.passwordLabel")}</Label>
                            <Link
                                href="/forgot-password"
                                className="text-sm text-muted-foreground hover:text-primary"
                            >
                                {t("auth.login.forgotPassword")}
                            </Link>
                        </div>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder={t("auth.login.passwordPlaceholder")}
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                            className={fieldErrors.password ? "border-destructive" : ""}
                        />
                        {fieldErrors.password && (
                            <p className="text-sm text-destructive">
                                {fieldErrors.password}
                            </p>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 mt-4">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? t("auth.login.submitting") : t("auth.login.submit")}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        {t("auth.login.noAccount")}{" "}
                        <Link
                            href="/register"
                            className="font-medium text-primary hover:underline"
                        >
                            {t("auth.login.signUp")}
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}

