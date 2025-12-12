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
import { register } from "@/lib/api/auth";
import type { RegisterRequest } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";

export default function RegisterPage() {
    const router = useRouter();
    const { setAuth } = useAuth();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<RegisterRequest>({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setFieldErrors({});

        // Client-side validation
        if (formData.password !== formData.password_confirmation) {
            setFieldErrors({ password_confirmation: t("auth.register.errorMatch") });
            setIsLoading(false);
            return;
        }

        try {
            const response = await register(formData);
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
                setError(t("auth.register.errorGeneric"));
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
                    {t("auth.register.title")}
                </CardTitle>
                <CardDescription>
                    {t("auth.register.description")}
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
                        <Label htmlFor="name">{t("auth.register.nameLabel")}</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder={t("auth.register.namePlaceholder")}
                            value={formData.name}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                            className={fieldErrors.name ? "border-destructive" : ""}
                        />
                        {fieldErrors.name && (
                            <p className="text-sm text-destructive">{fieldErrors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">{t("auth.register.emailLabel")}</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder={t("auth.register.emailPlaceholder")}
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
                        <Label htmlFor="password">{t("auth.register.passwordLabel")}</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder={t("auth.register.passwordPlaceholder")}
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                            minLength={8}
                            className={fieldErrors.password ? "border-destructive" : ""}
                        />
                        {fieldErrors.password && (
                            <p className="text-sm text-destructive">
                                {fieldErrors.password}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">{t("auth.register.confirmPasswordLabel")}</Label>
                        <Input
                            id="password_confirmation"
                            name="password_confirmation"
                            type="password"
                            placeholder={t("auth.register.confirmPasswordPlaceholder")}
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                            minLength={8}
                            className={
                                fieldErrors.password_confirmation ? "border-destructive" : ""
                            }
                        />
                        {fieldErrors.password_confirmation && (
                            <p className="text-sm text-destructive">
                                {fieldErrors.password_confirmation}
                            </p>
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                        {t("auth.register.termsAgreement")}{" "}
                        <Link href="/terms" className="underline hover:text-primary">
                            {t("auth.register.terms")}
                        </Link>{" "}
                        {t("auth.register.and")}{" "}
                        <Link href="/privacy" className="underline hover:text-primary">
                            {t("auth.register.privacy")}
                        </Link>
                        .
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 mt-4">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? t("auth.register.submitting") : t("auth.register.submit")}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        {t("auth.register.hasAccount")}{" "}
                        <Link
                            href="/login"
                            className="font-medium text-primary hover:underline"
                        >
                            {t("auth.register.signIn")}
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}

