"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resendVerification, verifyEmail, changeEmail } from "@/lib/api/auth";
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, refreshUser, setAuth } = useAuth();
    const [isResending, setIsResending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isChangingEmail, setIsChangingEmail] = useState(false);
    const [showChangeEmail, setShowChangeEmail] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [emailError, setEmailError] = useState<string | null>(null);
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
            const response = await verifyEmail(
                userId,
                verificationHash,
                expiresParam || undefined,
                signatureParam || undefined
            );

            if (response.success) {
                setVerificationStatus("success");
                await refreshUser();
                setTimeout(() => {
                    router.push("/dashboard");
                }, 2000);
            } else {
                setVerificationStatus("error");
                setErrorMessage(response.message || "Verification failed. The link may be invalid or expired.");
            }
        } catch (err) {
            setVerificationStatus("error");
            setErrorMessage("An unexpected error occurred. Please try again.");
            console.error("Verification error:", err);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        setResendMessage(null);

        try {
            const response = await resendVerification();

            if (response.success) {
                setResendMessage("Verification email sent! Please check your inbox.");
            } else {
                const errorData = response as unknown as {
                    success: false;
                    message: string;
                };
                setResendMessage(errorData.message || "Failed to resend verification email.");
            }
        } catch (err) {
            setResendMessage("An unexpected error occurred. Please try again.");
            console.error("Resend verification error:", err);
        } finally {
            setIsResending(false);
        }
    };

    const handleChangeEmail = async () => {
        if (!newEmail || !newEmail.includes("@")) {
            setEmailError("Please enter a valid email address");
            return;
        }

        setIsChangingEmail(true);
        setEmailError(null);

        try {
            const response = await changeEmail({ email: newEmail });

            if (response.success) {
                setAuth(response.data.user, response.data.access_token);
                await refreshUser();
                setShowChangeEmail(false);
                setNewEmail("");
                setResendMessage("Email updated successfully! A new verification email has been sent.");
            } else {
                const errorData = response as unknown as {
                    success: false;
                    message: string;
                    errors?: Record<string, string[]>;
                };
                if (errorData.errors?.email) {
                    setEmailError(errorData.errors.email[0]);
                } else {
                    setEmailError(errorData.message || "Failed to change email.");
                }
            }
        } catch (err) {
            setEmailError("An unexpected error occurred. Please try again.");
            console.error("Change email error:", err);
        } finally {
            setIsChangingEmail(false);
        }
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
                        <Button onClick={() => router.push("/dashboard")}>
                            Go to Dashboard
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
                            Your email has been successfully verified. Redirecting to dashboard...
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
                        {!showChangeEmail ? (
                            <>
                                <Button onClick={handleResend} className="w-full" disabled={isResending}>
                                    {isResending ? "Sending..." : "Resend Verification Email"}
                                </Button>
                                <Button
                                    onClick={() => setShowChangeEmail(true)}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Change Email Address
                                </Button>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="new-email-error">New Email Address</Label>
                                    <Input
                                        id="new-email-error"
                                        type="email"
                                        placeholder="newemail@example.com"
                                        value={newEmail}
                                        onChange={(e) => {
                                            setNewEmail(e.target.value);
                                            setEmailError(null);
                                        }}
                                        disabled={isChangingEmail}
                                        className={emailError ? "border-destructive" : ""}
                                    />
                                    {emailError && (
                                        <p className="text-sm text-destructive">{emailError}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleChangeEmail}
                                        className="flex-1"
                                        disabled={isChangingEmail}
                                    >
                                        {isChangingEmail ? "Updating..." : "Update Email"}
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setShowChangeEmail(false);
                                            setNewEmail("");
                                            setEmailError(null);
                                        }}
                                        variant="outline"
                                        disabled={isChangingEmail}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                        {resendMessage && (
                            <div className="rounded-md bg-muted p-3 text-sm text-center">
                                {resendMessage}
                            </div>
                        )}
                    </CardContent>
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

                    {!showChangeEmail ? (
                        <>
                            <Button onClick={handleResend} className="w-full" disabled={isResending}>
                                {isResending ? "Sending..." : "Resend Verification Email"}
                            </Button>
                            <Button
                                onClick={() => setShowChangeEmail(true)}
                                variant="outline"
                                className="w-full"
                            >
                                Change Email Address
                            </Button>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-email">New Email Address</Label>
                                <Input
                                    id="new-email"
                                    type="email"
                                    placeholder="newemail@example.com"
                                    value={newEmail}
                                    onChange={(e) => {
                                        setNewEmail(e.target.value);
                                        setEmailError(null);
                                    }}
                                    disabled={isChangingEmail}
                                    className={emailError ? "border-destructive" : ""}
                                />
                                {emailError && (
                                    <p className="text-sm text-destructive">{emailError}</p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleChangeEmail}
                                    className="flex-1"
                                    disabled={isChangingEmail}
                                >
                                    {isChangingEmail ? "Updating..." : "Update Email"}
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowChangeEmail(false);
                                        setNewEmail("");
                                        setEmailError(null);
                                    }}
                                    variant="outline"
                                    disabled={isChangingEmail}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    {resendMessage && (
                        <div className="rounded-md bg-muted p-3 text-sm text-center">
                            {resendMessage}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
