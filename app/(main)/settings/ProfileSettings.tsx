'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { uploadImage, getImageUrl, deleteImage } from '@/lib/images/operations';
import { getFileSizeBytes } from '@/lib/images/utils';
import { Upload, User as UserIcon, Mail, Save, Loader2, Trash2, CheckCircle2, Lock } from 'lucide-react';
import { getUser, updateUser, User } from '@/lib/api/user';
import { changePassword, requestAccountDeletion } from '@/lib/api/auth';
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/api/errors";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function ProfileSettings() {
    const router = useRouter();
    const { t } = useTranslation();
    const { setAuth, token } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageDeleted, setImageDeleted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [deletionError, setDeletionError] = useState<string | null>(null);

    const loadUser = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await getUser();
            setUser(response.data);
            setFormData({
                name: response.data.name,
                email: response.data.email,
            });

            if (response.data.image_size_bytes) {
                const imageResult = await getImageUrl({
                    folder: 'users',
                    uuid: response.data.uuid,
                });
                if (imageResult.success && imageResult.url) {
                    setAvatarUrl(imageResult.url);
                }
            }
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError(t('app.settings.profileTab.errorLoad'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const sizeInBytes = getFileSizeBytes(file);
        if (sizeInBytes > 1024 * 1024) {
            setError(t('app.settings.profileTab.imageSizeError'));
            return;
        }

        setSelectedImage(file);
        setImageDeleted(false);
        setError(null);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteAvatar = () => {
        setImageDeleted(true);
        setSelectedImage(null);
        setImagePreview(null);
    };

    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            let imageSizeBytes = user.image_size_bytes;

            if (imageDeleted && user.image_size_bytes) {
                await deleteImage({
                    folder: 'users',
                    uuid: user.uuid,
                });
                imageSizeBytes = null;
            }

            if (selectedImage) {
                const uploadResult = await uploadImage({
                    file: selectedImage,
                    folder: 'users',
                    uuid: user.uuid,
                });

                if (uploadResult.success) {
                    imageSizeBytes = getFileSizeBytes(selectedImage);
                } else {
                    setError(uploadResult.error || 'Failed to upload image');
                    setIsSaving(false);
                    return;
                }
            }

            const response = await updateUser({
                image_size_bytes: imageSizeBytes,
            });

            setSuccess(t('app.settings.profileTab.successUpdate'));
            setUser(response.data);
            setSelectedImage(null);
            setImagePreview(null);
            setImageDeleted(false);

            if (token) {
                setAuth(response.data, token);
            }

            await loadUser();
            router.refresh();
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError(t('app.settings.profileTab.errorUpdate'));
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordData.current_password || !passwordData.new_password || !passwordData.new_password_confirmation) {
            setPasswordError(t('app.settings.profileTab.errorFields'));
            return;
        }

        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            setPasswordError(t('app.settings.profileTab.errorMatch'));
            return;
        }

        if (passwordData.new_password.length < 8) {
            setPasswordError(t('app.settings.profileTab.errorLength'));
            return;
        }

        setIsChangingPassword(true);
        setPasswordError(null);
        setPasswordSuccess(null);

        try {
            await changePassword(passwordData);

            setPasswordSuccess(t('app.settings.profileTab.successPassword'));
            setPasswordData({
                current_password: '',
                new_password: '',
                new_password_confirmation: '',
            });
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.errors) {
                    const errorMessages = Object.values(err.errors).flat();
                    setPasswordError(errorMessages.join(', '));
                } else {
                    setPasswordError(err.message);
                }
            } else {
                setPasswordError(t('app.settings.profileTab.errorPassword'));
            }
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleAccountDeletion = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!confirm(t('app.settings.profileTab.confirmDelete'))) {
            return;
        }

        setIsDeletingAccount(true);
        setDeletionError(null);

        try {
            const response = await requestAccountDeletion({});

            if (response.success) {
                alert(t('app.settings.profileTab.sentDelete'));
                router.push('/settings');
            } else {
                setDeletionError(response.message || 'Failed to request account deletion');
            }
        } catch (err) {
            if (err instanceof ApiError) {
                setDeletionError(err.message);
            } else {
                setDeletionError(t('app.settings.profileTab.errorDelete'));
            }
        } finally {
            setIsDeletingAccount(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-4 text-sm text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Failed to load user data</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {success}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>{t('app.settings.profileTab.profilePicture')}</CardTitle>
                    <CardDescription>{t('app.settings.profileTab.profilePictureDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                        {imagePreview ? (
                            <AvatarImage src={imagePreview} alt={user.name} />
                        ) : !imageDeleted && avatarUrl ? (
                            <AvatarImage src={avatarUrl} alt={user.name} />
                        ) : null}
                        <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex gap-2">
                            <Label htmlFor="avatar-upload" className="cursor-pointer">
                                <div
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                                    <Upload className="h-4 w-4" />
                                    {t('app.settings.profileTab.uploadPhoto')}
                                </div>
                            </Label>
                            <Input
                                id="avatar-upload"
                                type="file"
                                accept="image/jpeg,image/png"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                            {(avatarUrl || imagePreview) && !imageDeleted && (
                                <Button
                                    variant="outline"
                                    onClick={handleDeleteAvatar}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {t('app.settings.profileTab.delete')}
                                </Button>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            {t('app.settings.profileTab.imageRequirements')}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('app.settings.profileTab.personalInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            {t('app.settings.profileTab.fullName')}
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder={t('app.settings.profileTab.enterFullName')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {t('app.settings.profileTab.email')}
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            placeholder={t('app.settings.profileTab.enterEmail')}
                            disabled
                            className="bg-muted cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground">{t('app.settings.profileTab.emailNote')}</p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    {isSaving ? t('app.settings.profileTab.saving') : t('app.settings.profileTab.saveChanges')}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('app.settings.profileTab.changePassword')}</CardTitle>
                    <CardDescription>{t('app.settings.profileTab.changePasswordDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {passwordError && (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-4">
                            {passwordError}
                        </div>
                    )}

                    {passwordSuccess && (
                        <div className="rounded-md bg-green-50 p-3 text-sm text-green-600 flex items-center gap-2 mb-4">
                            <CheckCircle2 className="h-4 w-4" />
                            {passwordSuccess}
                        </div>
                    )}

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current_password" className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                {t('app.settings.profileTab.currentPassword')}
                            </Label>
                            <Input
                                id="current_password"
                                type="password"
                                value={passwordData.current_password}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                                placeholder={t('app.settings.profileTab.enterCurrentPassword')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="new_password" className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                {t('app.settings.profileTab.newPassword')}
                            </Label>
                            <Input
                                id="new_password"
                                type="password"
                                value={passwordData.new_password}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                                placeholder={t('app.settings.profileTab.enterNewPassword')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="new_password_confirmation" className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                {t('app.settings.profileTab.confirmNewPassword')}
                            </Label>
                            <Input
                                id="new_password_confirmation"
                                type="password"
                                value={passwordData.new_password_confirmation}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, new_password_confirmation: e.target.value }))}
                                placeholder={t('app.settings.profileTab.enterConfirmNewPassword')}
                            />
                        </div>

                        <Button type="submit" disabled={isChangingPassword}>
                            {isChangingPassword ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Lock className="h-4 w-4 mr-2" />
                            )}
                            {isChangingPassword ? t('app.settings.profileTab.changingPassword') : t('app.settings.profileTab.changePassword')}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">{t('app.settings.profileTab.deleteAccount')}</CardTitle>
                    <CardDescription>
                        {t('app.settings.profileTab.deleteAccountDescription')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {deletionError && (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-4">
                            {deletionError}
                        </div>
                    )}

                    <form onSubmit={handleAccountDeletion} className="space-y-4">
                        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                            <p className="font-semibold mb-2">{t('app.settings.profileTab.deleteWarning')}</p>
                            <p>{t('app.settings.profileTab.deleteConsequences')}</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>{t('app.settings.profileTab.deleteItem1')}</li>
                                <li>{t('app.settings.profileTab.deleteItem2')}</li>
                                <li>{t('app.settings.profileTab.deleteItem3')}</li>
                            </ul>
                            <p className="mt-3">{t('app.settings.profileTab.deleteConfirmation')}</p>
                        </div>

                        <Button type="submit" variant="destructive" disabled={isDeletingAccount} className="w-full">
                            {isDeletingAccount ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            {isDeletingAccount ? t('app.settings.profileTab.sendingEmail') : t('app.settings.profileTab.requestDeletion')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
