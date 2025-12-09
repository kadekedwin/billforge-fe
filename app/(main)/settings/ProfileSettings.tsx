'use client';

import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {uploadImage, getImageUrl, deleteImage} from '@/lib/images/operations';
import {getFileSizeBytes} from '@/lib/images/utils';
import {Upload, User as UserIcon, Mail, Save, Loader2, Trash2, CheckCircle2, Lock} from 'lucide-react';
import {getUser, updateUser, User} from '@/lib/api/user';
import {resetPassword} from "@/lib/api/auth";
import {useAuth} from "@/contexts/auth-context";

export default function ProfileSettings() {
    const router = useRouter();
    const {setAuth, token} = useAuth();
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
        password: '',
        password_confirmation: '',
    });

    const loadUser = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await getUser();
            if (response.success) {
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
            } else {
                setError(response.message || 'Failed to load user data');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while loading user data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const sizeInBytes = getFileSizeBytes(file);
        if (sizeInBytes > 1024 * 1024) {
            setError('Image size must be less than 1MB');
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
                name: formData.name,
                image_size_bytes: imageSizeBytes,
            });

            if (response.success) {
                setSuccess('Profile updated successfully!');
                setUser(response.data);
                setSelectedImage(null);
                setImagePreview(null);
                setImageDeleted(false);

                if (token) {
                    setAuth(response.data, token);
                }

                await loadUser();
                router.refresh();
            } else {
                setError(response.message || 'Failed to update profile');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while updating profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordData.current_password || !passwordData.password || !passwordData.password_confirmation) {
            setPasswordError('All fields are required');
            return;
        }

        if (passwordData.password !== passwordData.password_confirmation) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (passwordData.password.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            return;
        }

        setIsChangingPassword(true);
        setPasswordError(null);
        setPasswordSuccess(null);

        try {
            const response = await resetPassword({
                current_password: passwordData.current_password,
                password: passwordData.password,
                password_confirmation: passwordData.password_confirmation,
            });

            if (response.success) {
                setPasswordSuccess('Password updated successfully!');
                setPasswordData({
                    current_password: '',
                    password: '',
                    password_confirmation: '',
                });
            } else {
                setPasswordError(response.message || 'Failed to update password');
            }
        } catch (err) {
            setPasswordError(err instanceof Error ? err.message : 'An error occurred while updating password');
        } finally {
            setIsChangingPassword(false);
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
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
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
                    <CheckCircle2 className="h-4 w-4"/>
                    {success}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>Upload a profile picture to personalize your account</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                        {imagePreview ? (
                            <AvatarImage src={imagePreview} alt={user.name}/>
                        ) : !imageDeleted && avatarUrl ? (
                            <AvatarImage src={avatarUrl} alt={user.name}/>
                        ) : null}
                        <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex gap-2">
                            <Label htmlFor="avatar-upload" className="cursor-pointer">
                                <div
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                                    <Upload className="h-4 w-4"/>
                                    Upload Photo
                                </div>
                            </Label>
                            <Input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                            {(avatarUrl || imagePreview) && !imageDeleted && (
                                <Button
                                    variant="outline"
                                    onClick={handleDeleteAvatar}
                                >
                                    <Trash2 className="h-4 w-4 mr-2"/>
                                    Delete
                                </Button>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            JPG, PNG or GIF. Max size 1MB.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4"/>
                            Full Name
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4"/>
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            placeholder="Enter your email"
                            disabled
                            className="bg-muted cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                    ) : (
                        <Save className="h-4 w-4 mr-2"/>
                    )}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                    {passwordError && (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-4">
                            {passwordError}
                        </div>
                    )}

                    {passwordSuccess && (
                        <div className="rounded-md bg-green-50 p-3 text-sm text-green-600 flex items-center gap-2 mb-4">
                            <CheckCircle2 className="h-4 w-4"/>
                            {passwordSuccess}
                        </div>
                    )}

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current_password" className="flex items-center gap-2">
                                <Lock className="h-4 w-4"/>
                                Current Password
                            </Label>
                            <Input
                                id="current_password"
                                type="password"
                                value={passwordData.current_password}
                                onChange={(e) => setPasswordData(prev => ({...prev, current_password: e.target.value}))}
                                placeholder="Enter current password"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="flex items-center gap-2">
                                <Lock className="h-4 w-4"/>
                                New Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={passwordData.password}
                                onChange={(e) => setPasswordData(prev => ({...prev, password: e.target.value}))}
                                placeholder="Enter new password (min 8 characters)"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation" className="flex items-center gap-2">
                                <Lock className="h-4 w-4"/>
                                Confirm New Password
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={passwordData.password_confirmation}
                                onChange={(e) => setPasswordData(prev => ({...prev, password_confirmation: e.target.value}))}
                                placeholder="Confirm new password"
                            />
                        </div>

                        <Button type="submit" disabled={isChangingPassword}>
                            {isChangingPassword ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                            ) : (
                                <Lock className="h-4 w-4 mr-2"/>
                            )}
                            {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

