'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { confirmAccountDeletion } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/errors';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

function ConfirmAccountDeletionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { removeAuth } = useAuth();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmationText, setConfirmationText] = useState("");

    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const expires = searchParams.get("expires");
    const signature = searchParams.get("signature");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (confirmationText !== "CONFIRM") {
            setError(t("auth.confirmDeletion.errorMatch"));
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if (!token || !email || !expires || !signature) {
                throw new Error(t("auth.confirmDeletion.errorMissingToken"));
            }
            await confirmAccountDeletion({
                token,
                email,
                confirmation: confirmationText,
                expires,
                signature
            });
            removeAuth();
            router.push("/login?deleted=true");
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError(t("auth.confirmDeletion.errorGeneric"));
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!token || !email || !expires || !signature) {
        return (
            <Card className="w-full max-w-md border-destructive">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <AlertTriangle className="h-16 w-16 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-destructive">{t("auth.confirmDeletion.invalidLinkTitle")}</CardTitle>
                    <CardDescription>
                        {t("auth.confirmDeletion.invalidLinkDescription")}
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button
                        onClick={() => router.push("/settings")}
                        variant="outline"
                        className="w-full"
                    >
                        {t("auth.confirmDeletion.returnToSettings")}
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md border-destructive">
            <CardHeader className="space-y-1">
                <div className="flex justify-center mb-4">
                    <AlertTriangle className="h-16 w-16 text-destructive" />
                </div>
                <CardTitle className="text-2xl font-bold text-center text-destructive">
                    {t("auth.confirmDeletion.title")}
                </CardTitle>
                <CardDescription className="text-center">
                    {t("auth.confirmDeletion.description")}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{t("auth.confirmDeletion.warningTitle")}</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>{t("auth.confirmDeletion.warningItem1")}</li>
                                <li>{t("auth.confirmDeletion.warningItem2")}</li>
                                <li>{t("auth.confirmDeletion.warningItem3")}</li>
                                <li>{t("auth.confirmDeletion.warningItem4")}</li>
                            </ul>
                            <p className="mt-2 font-semibold">{t("auth.confirmDeletion.warningReversal")}</p>
                        </AlertDescription>
                    </Alert>

                    {error && (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="confirmation" className="inline">
                            <span>
                                {t("auth.confirmDeletion.inputLabel")}{" "}
                                <strong>{t("auth.confirmDeletion.confirmWord")}</strong>{" "}
                                {t("auth.confirmDeletion.inputLabelSuffix")}
                            </span>
                        </Label>
                        <Input
                            id="confirmation"
                            type="text"
                            placeholder={t("auth.confirmDeletion.inputPlaceholder")}
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            disabled={isLoading}
                            required
                            className="border-destructive focus-visible:ring-destructive"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 mt-4">
                    <Button
                        type="submit"
                        variant="destructive"
                        className="w-full"
                        disabled={isLoading || confirmationText !== "CONFIRM"}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("auth.confirmDeletion.deleting")}
                            </>
                        ) : (
                            t("auth.confirmDeletion.delete")
                        )}
                    </Button>
                    <Button
                        type="button"
                        onClick={() => router.push("/settings")}
                        variant="ghost"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {t("auth.confirmDeletion.cancel")}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}

export default function ConfirmAccountDeletionPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        }>
            <ConfirmAccountDeletionContent />
        </Suspense>
    );
}
