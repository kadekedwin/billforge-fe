'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { confirmAccountDeletion } from '@/lib/api/auth';
import { toast } from 'sonner';

function ConfirmAccountDeletionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';
    const expires = searchParams.get('expires') || '';
    const signature = searchParams.get('signature') || '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (confirmText !== 'CONFIRM') {
            toast.error('Please type CONFIRM to proceed');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await confirmAccountDeletion({
                token,
                email,
                confirmation: confirmText,
                expires,
                signature,
            });

            if (response.success) {
                toast.success('Account deleted successfully');
                router.push('/login');
            } else {
                toast.error(response.message || 'Failed to delete account');
            }
        } catch {
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Confirm Account Deletion
                    </CardTitle>
                    <CardDescription>
                        This action is permanent and cannot be undone
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive space-y-3">
                            <p className="font-semibold">Warning: This will permanently delete:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>All your businesses and their data</li>
                                <li>All transactions and sales records</li>
                                <li>All items and inventory</li>
                                <li>Your profile and account information</li>
                            </ul>
                            <p className="font-semibold mt-3">This action cannot be reversed.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-text">
                                Type <span className="font-mono font-bold">CONFIRM</span> to delete your account
                            </Label>
                            <Input
                                id="confirm-text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="Type CONFIRM here"
                                className="font-mono"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                onClick={() => router.push('/settings')}
                                variant="outline"
                                className="flex-1"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || confirmText !== 'CONFIRM'}
                                className="flex-1"
                                variant="destructive"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Account'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ConfirmAccountDeletionPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        }>
            <ConfirmAccountDeletionContent />
        </Suspense>
    );
}
