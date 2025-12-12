"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { forgotPasswordReset } from "@/lib/api/auth";
import type { ForgotPasswordResetRequest } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<ForgotPasswordResetRequest>({
        token: "",
        email: "",
        password: "",
        password_confirmation: "",
        expires: undefined,
        signature: undefined,
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const token = searchParams.get("token");
        const email = searchParams.get("email");
        const expires = searchParams.get("expires");
        const signature = searchParams.get("signature");

        if (token) {
            setFormData((prev) => ({ ...prev, token }));
        }
        if (email) {
            setFormData((prev) => ({ ...prev, email }));
        }
        if (expires) {
            setFormData((prev) => ({ ...prev, expires }));
        }
        if (signature) {
            setFormData((prev) => ({ ...prev, signature }));
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setFieldErrors({});

        if (formData.password !== formData.password_confirmation) {
            setFieldErrors({ password_confirmation: t("auth.resetPassword.errorMatch") });
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setFieldErrors({ password: t("auth.resetPassword.errorLength") });
            setIsLoading(false);
            return;
        }

        try {
            await forgotPasswordReset(formData);
            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 2000);
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
                setError(t("auth.resetPassword.errorGeneric"));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    if (success) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-center">
                        {t("auth.resetPassword.successTitle")}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {t("auth.resetPassword.successDescription")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                        {t("auth.resetPassword.redirecting")}
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/login">
                        <Button>{t("auth.resetPassword.goToLogin")}</Button>
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">
                    {t("auth.resetPassword.title")}
                </CardTitle>
                <CardDescription>
                    {t("auth.resetPassword.description")}
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
                        <Label htmlFor="email">{t("auth.resetPassword.emailLabel")}</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder={t("auth.resetPassword.emailPlaceholder")}
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
                        <Label htmlFor="password">{t("auth.resetPassword.newPasswordLabel")}</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder={t("auth.resetPassword.newPasswordPlaceholder")}
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                            minLength={8}
                            className={fieldErrors.password ? "border-destructive" : ""}
                        />
                        {fieldErrors.password && (
                            <p className="text-sm text-destructive">{fieldErrors.password}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            {t("auth.resetPassword.passwordHint")}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">{t("auth.resetPassword.confirmPasswordLabel")}</Label>
                        <Input
                            id="password_confirmation"
                            name="password_confirmation"
                            type="password"
                            placeholder={t("auth.resetPassword.confirmPasswordPlaceholder")}
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                            className={fieldErrors.password_confirmation ? "border-destructive" : ""}
                        />
                        {fieldErrors.password_confirmation && (
                            <p className="text-sm text-destructive">
                                {fieldErrors.password_confirmation}
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
                        {isLoading ? t("auth.resetPassword.submitting") : t("auth.resetPassword.submit")}
                    </Button>
                    <Link href="/login" className="w-full">
                        <Button variant="ghost" className="w-full">
                            {t("auth.resetPassword.backToLogin")}
                        </Button>
                    </Link>
                </CardFooter>
            </form>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="text-muted-foreground">Loading...</div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
