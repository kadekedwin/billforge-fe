"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
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
                setErrorMessage("An unexpected error occurred. Please try again.");
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
            setResendMessage("Verification email sent! Please check your inbox.");
        } catch (err) {
            if (err instanceof ApiError) {
                setResendMessage(err.message);
            } else {
                setResendMessage("An unexpected error occurred. Please try again.");
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
            <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Email Already Verified</CardTitle>
                        <CardDescription>
                            Your email address has already been verified.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Button onClick={() => router.push("/sale")}>
                            Go to Sale
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (verificationStatus === "success") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
                        <CardDescription>
                            Your email has been successfully verified. Redirecting to sale...
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (verificationStatus === "error") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex justify-center mb-4">
                            <XCircle className="h-16 w-16 text-destructive" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Verification Failed</CardTitle>
                        <CardDescription>
                            {errorMessage || "The verification link is invalid or has expired."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button onClick={handleResend} className="w-full" disabled={isResending}>
                            {isResending ? "Sending..." : "Resend Verification Email"}
                        </Button>
                        <Button
                            onClick={() => setShowConfirmDialog(true)}
                            variant="outline"
                            className="w-full"
                        >
                            Change Email Address
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
                                <AlertDialogTitle>Change Email Address?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You will be logged out and redirected to the registration page to register with a new email address.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleChangeEmail}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </Card>
            </div>
        );
    }

    if (isVerifying) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1 text-center">
                        <div className="flex justify-center mb-4">
                            <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Verifying Email...</CardTitle>
                        <CardDescription>
                            Please wait while we verify your email address.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <Mail className="h-16 w-16 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
                    <CardDescription>
                        We sent a verification email to <strong>{user?.email}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                        Please check your inbox and click the verification link to activate your account.
                    </p>
                    <Button onClick={handleResend} className="w-full" disabled={isResending}>
                        {isResending ? "Sending..." : "Resend Verification Email"}
                    </Button>
                    <Button
                        onClick={() => setShowConfirmDialog(true)}
                        variant="outline"
                        className="w-full"
                    >
                        Change Email Address
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
                            <AlertDialogTitle>Change Email Address?</AlertDialogTitle>
                            <AlertDialogDescription>
                                You will be logged out and redirected to the registration page to register with a new email address.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleChangeEmail}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Card>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>}>
            <VerifyEmailPageContent />
        </Suspense>
    );
}
