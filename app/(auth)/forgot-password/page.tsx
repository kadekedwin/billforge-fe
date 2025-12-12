"use client";

import { useState } from "react";
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
import { forgotPassword } from "@/lib/api/auth";
import type { ForgotPasswordRequest } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState<ForgotPasswordRequest>({
        email: "",
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setFieldErrors({});

        try {
            await forgotPassword(formData);
            setSuccess(true);
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
                setError(t("auth.forgotPassword.errorGeneric"));
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
                        {t("auth.forgotPassword.checkEmailTitle")}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {t("auth.forgotPassword.checkEmailDescription")} <strong>{formData.email}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                        {t("auth.forgotPassword.checkEmailNote1")}
                    </p>
                    <p className="text-sm text-muted-foreground text-center">
                        {t("auth.forgotPassword.checkEmailNote2")}
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button
                        onClick={() => setSuccess(false)}
                        variant="outline"
                        className="w-full"
                    >
                        {t("auth.forgotPassword.tryAnotherEmail")}
                    </Button>
                    <Link href="/login" className="w-full">
                        <Button variant="ghost" className="w-full">
                            {t("auth.forgotPassword.backToLogin")}
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">
                    {t("auth.forgotPassword.title")}
                </CardTitle>
                <CardDescription>
                    {t("auth.forgotPassword.description")}
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
                        <Label htmlFor="email">{t("auth.forgotPassword.emailLabel")}</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder={t("auth.forgotPassword.emailPlaceholder")}
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
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 mt-4">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? t("auth.forgotPassword.submitting") : t("auth.forgotPassword.submit")}
                    </Button>
                    <Link href="/login" className="w-full">
                        <Button variant="ghost" className="w-full">
                            {t("auth.forgotPassword.backToLogin")}
                        </Button>
                    </Link>
                </CardFooter>
            </form>
        </Card>
    );
}
