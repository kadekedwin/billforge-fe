"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { resendVerification, verifyEmail } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyEmailPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, refreshUser, removeAuth } = useAuth();
    const { t } = useTranslation();
    const [isResending, setIsResending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [resendMessage, setResendMessage] = useState<string | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const id = searchParams.get("id");
    const hash = searchParams.get("hash");
    const expires = searchParams.get("expires");
    const signature = searchParams.get("signature");

    useEffect(() => {
        if (id && hash && !isVerifying && verificationStatus === "idle") {
            handleVerification(id, hash, expires, signature);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, hash, expires, signature]);

    const handleVerification = async (
        userId: string,
        verificationHash: string,
        expiresParam: string | null,
        signatureParam: string | null
    ) => {
        setIsVerifying(true);
        setErrorMessage(null);

        try {
            await verifyEmail(
                userId,
                verificationHash,
                expiresParam || undefined,
                signatureParam || undefined
            );
            setVerificationStatus("success");
            await refreshUser();
            setTimeout(() => {
                router.push("/sale");
            }, 2000);
        } catch (err) {
            setVerificationStatus("error");
            if (err instanceof ApiError) {
                setErrorMessage(err.message);
            } else {
                setErrorMessage(t("auth.verifyEmail.errorGeneric"));
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        setResendMessage(null);

        try {
            await resendVerification();
            setResendMessage(t("auth.verifyEmail.resendSuccess"));
        } catch (err) {
            if (err instanceof ApiError) {
                setResendMessage(err.message);
            } else {
                setResendMessage(t("auth.verifyEmail.errorGeneric"));
            }
        } finally {
            setIsResending(false);
        }
    };

    const handleChangeEmail = () => {
        removeAuth();
    };

    if (user?.email_verified_at) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{t("auth.verifyEmail.alreadyVerifiedTitle")}</CardTitle>
                    <CardDescription>
                        {t("auth.verifyEmail.alreadyVerifiedDescription")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Button onClick={() => router.push("/sale")}>
                        {t("auth.verifyEmail.goToSale")}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (verificationStatus === "success") {
        return (
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{t("auth.verifyEmail.successTitle")}</CardTitle>
                    <CardDescription>
                        {t("auth.verifyEmail.successDescription")}
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (verificationStatus === "error") {
        return (
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <XCircle className="h-16 w-16 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{t("auth.verifyEmail.failedTitle")}</CardTitle>
                    <CardDescription>
                        {errorMessage || t("auth.verifyEmail.failedDescription")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button onClick={handleResend} className="w-full" disabled={isResending}>
                        {isResending ? t("auth.verifyEmail.resending") : t("auth.verifyEmail.resend")}
                    </Button>
                    <Button
                        onClick={() => setShowConfirmDialog(true)}
                        variant="outline"
                        className="w-full"
                    >
                        {t("auth.verifyEmail.changeEmail")}
                    </Button>
                    {resendMessage && (
                        <div className="rounded-md bg-muted p-3 text-sm text-center">
                            {resendMessage}
                        </div>
                    )}
                </CardContent>
                <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t("auth.verifyEmail.changeEmailTitle")}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t("auth.verifyEmail.changeEmailDescription")}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t("auth.verifyEmail.cancel")}</AlertDialogCancel>
                            <AlertDialogAction onClick={handleChangeEmail}>{t("auth.verifyEmail.continue")}</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Card>
        );
    }

    if (isVerifying) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{t("auth.verifyEmail.verifyingTitle")}</CardTitle>
                    <CardDescription>
                        {t("auth.verifyEmail.verifyingDescription")}
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                    <Mail className="h-16 w-16 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">{t("auth.verifyEmail.title")}</CardTitle>
                <CardDescription>
                    {t("auth.verifyEmail.description")} <strong>{user?.email}</strong>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                    {t("auth.verifyEmail.instruction")}
                </p>
                <Button onClick={handleResend} className="w-full" disabled={isResending}>
                    {isResending ? t("auth.verifyEmail.resending") : t("auth.verifyEmail.resend")}
                </Button>
                <Button
                    onClick={() => setShowConfirmDialog(true)}
                    variant="outline"
                    className="w-full"
                >
                    {t("auth.verifyEmail.changeEmail")}
                </Button>
                {resendMessage && (
                    <div className="rounded-md bg-muted p-3 text-sm text-center">
                        {resendMessage}
                    </div>
                )}
            </CardContent>
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("auth.verifyEmail.changeEmailTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("auth.verifyEmail.changeEmailDescription")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("auth.verifyEmail.cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleChangeEmail}>{t("auth.verifyEmail.continue")}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>}>
            <VerifyEmailPageContent />
        </Suspense>
    );
}
