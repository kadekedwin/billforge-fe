"use client";

import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Business, CreateBusinessRequest, UpdateBusinessRequest } from "@/lib/api";
import { CURRENCIES, LANGUAGES, REGIONS } from "@/lib/data/locale-data";
import { createBusiness, updateBusiness } from "@/lib/api/businesses";
import { uploadImage, deleteImage, getImageUrl } from "@/lib/images/operations";
import { getFileSizeBytes } from "@/lib/images/utils";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface BusinessDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingBusiness: Business | null;
    onSuccess: () => void;
}

export function BusinessDialog({
    open,
    onOpenChange,
    editingBusiness,
    onSuccess,
}: BusinessDialogProps) {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateBusinessRequest>({
        name: editingBusiness?.name || "",
        address: editingBusiness?.address || null,
        phone: editingBusiness?.phone || null,
        image_size_bytes: editingBusiness?.image_size_bytes || null,
        currency: editingBusiness?.currency || null,
        language: editingBusiness?.language || null,
        region: editingBusiness?.region || null,
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imageDeleted, setImageDeleted] = useState(false);

    // Load existing business data and image when editing
    useEffect(() => {
        const loadExistingData = async () => {
            if (open && editingBusiness) {
                // Set form data
                setFormData({
                    name: editingBusiness.name,
                    address: editingBusiness.address,
                    phone: editingBusiness.phone,
                    image_size_bytes: editingBusiness.image_size_bytes,
                    currency: editingBusiness.currency,
                    language: editingBusiness.language,
                    region: editingBusiness.region,
                });

                // Load existing image
                if (editingBusiness.image_size_bytes) {
                    const imageResult = await getImageUrl({
                        folder: 'businesses',
                        uuid: editingBusiness.uuid,
                    });
                    if (imageResult.success && imageResult.url) {
                        setImagePreview(imageResult.url);
                    }
                }
            } else if (open && !editingBusiness) {
                // Reset form for new business
                setFormData({ name: "", address: null, phone: null, image_size_bytes: null, currency: null, language: null, region: null });
                setImagePreview(null);
                setSelectedImage(null);
                setImageDeleted(false);
            }
        };

        loadExistingData();
    }, [open, editingBusiness]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const processedValue = (name === "address" || name === "phone") && value === "" ? null : value;
        setFormData((prev) => ({ ...prev, [name]: processedValue }));
        if (formErrors[name]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value || null,
        }));

        if (formErrors[name]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1048576) {
                setError(t('sidebar.businessDialog.errors.imageSize'));
                e.target.value = '';
                return;
            }
            setSelectedImage(file);
            setImageDeleted(false);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setImageDeleted(true);
        const fileInput = document.getElementById('business-logo') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setFormData({ name: "", address: null, phone: null, image_size_bytes: null, currency: null, language: null, region: null });
        setFormErrors({});
        setError(null);
        setSelectedImage(null);
        setImagePreview(null);
        setImageDeleted(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormErrors({});
        setError(null);

        try {
            if (editingBusiness) {
                let imageSizeBytes = formData.image_size_bytes;

                if (imageDeleted && editingBusiness.image_size_bytes) {
                    setIsUploadingImage(true);
                    await deleteImage({
                        folder: 'businesses',
                        uuid: editingBusiness.uuid,
                    });
                    imageSizeBytes = null;
                    setIsUploadingImage(false);
                }

                if (selectedImage) {
                    setIsUploadingImage(true);
                    const uploadResult = await uploadImage({
                        file: selectedImage,
                        folder: 'businesses',
                        uuid: editingBusiness.uuid,
                    });

                    if (uploadResult.success) {
                        imageSizeBytes = getFileSizeBytes(selectedImage);
                    }
                    setIsUploadingImage(false);
                }

                const response = await updateBusiness(editingBusiness.uuid, {
                    ...formData,
                    image_size_bytes: imageSizeBytes,
                } as UpdateBusinessRequest);

                if (response.success) {
                    handleClose();
                    onSuccess();
                } else {
                    const errorData = response as unknown as {
                        success: false;
                        message: string;
                        errors?: Record<string, string[]>;
                    };
                    if (errorData.errors) {
                        const errors: Record<string, string> = {};
                        Object.keys(errorData.errors).forEach((key) => {
                            if (errorData.errors) {
                                errors[key] = errorData.errors[key][0];
                            }
                        });
                        setFormErrors(errors);
                    } else if (errorData.message) {
                        setError(errorData.message);
                    } else {
                        setError(t('sidebar.businessDialog.errors.updateFailed'));
                    }
                }
            } else {
                const response = await createBusiness(formData);
                if (response.success) {
                    const createdBusinessUuid = response.data.uuid;
                    let imageSizeBytes: number | null = null;

                    if (selectedImage && createdBusinessUuid) {
                        setIsUploadingImage(true);
                        const uploadResult = await uploadImage({
                            file: selectedImage,
                            folder: 'businesses',
                            uuid: createdBusinessUuid,
                        });

                        if (uploadResult.success) {
                            imageSizeBytes = getFileSizeBytes(selectedImage);
                        }
                        setIsUploadingImage(false);
                    }

                    if (imageSizeBytes !== null) {
                        await updateBusiness(createdBusinessUuid, {
                            image_size_bytes: imageSizeBytes,
                        });
                    }

                    handleClose();
                    onSuccess();
                } else {
                    const errorData = response as unknown as {
                        success: false;
                        message: string;
                        errors?: Record<string, string[]>;
                    };
                    if (errorData.errors) {
                        const errors: Record<string, string> = {};
                        Object.keys(errorData.errors).forEach((key) => {
                            if (errorData.errors) {
                                errors[key] = errorData.errors[key][0];
                            }
                        });
                        setFormErrors(errors);
                    } else if (errorData.message) {
                        setError(errorData.message);
                    } else {
                        setError(t('sidebar.businessDialog.errors.createFailed'));
                    }
                }
            }
        } catch (err) {
            setError(editingBusiness ? t('sidebar.businessDialog.errors.updateError') : t('sidebar.businessDialog.errors.createError'));
            console.error("Error saving business:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{editingBusiness ? t('sidebar.businessDialog.edit') : t('sidebar.businessDialog.create')}</DialogTitle>
                        <DialogDescription>
                            {editingBusiness ? t('sidebar.businessDialog.description.edit') : t('sidebar.businessDialog.description.create')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {error && (
                            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('sidebar.businessDialog.form.name.label')}</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder={t('sidebar.businessDialog.form.name.placeholder')}
                                value={formData.name}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                required
                                className={formErrors.name ? "border-destructive" : ""}
                            />
                            {formErrors.name && (
                                <p className="text-sm text-destructive">{formErrors.name}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">{t('sidebar.businessDialog.form.address.label')}</Label>
                            <Input
                                id="address"
                                name="address"
                                placeholder={t('sidebar.businessDialog.form.address.placeholder')}
                                value={formData.address || ""}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                className={formErrors.address ? "border-destructive" : ""}
                            />
                            {formErrors.address && (
                                <p className="text-sm text-destructive">{formErrors.address}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">{t('sidebar.businessDialog.form.phone.label')}</Label>
                            <Input
                                id="phone"
                                name="phone"
                                placeholder={t('sidebar.businessDialog.form.phone.placeholder')}
                                value={formData.phone || ""}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                className={formErrors.phone ? "border-destructive" : ""}
                            />
                            {formErrors.phone && (
                                <p className="text-sm text-destructive">{formErrors.phone}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currency">{t('sidebar.businessDialog.form.currency.label')}</Label>
                            <Select
                                value={formData.currency || ''}
                                onValueChange={(value) => handleSelectChange('currency', value)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger className={formErrors.currency ? 'border-destructive' : ''}>
                                    <SelectValue placeholder={t('sidebar.businessDialog.form.currency.placeholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {CURRENCIES.map((currency) => (
                                        <SelectItem key={currency.value} value={currency.value}>
                                            {currency.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {formErrors.currency && (
                                <p className="text-sm text-destructive">{formErrors.currency}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="language">{t('sidebar.businessDialog.form.language.label')}</Label>
                            <Select
                                value={formData.language || ''}
                                onValueChange={(value) => handleSelectChange('language', value)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger className={formErrors.language ? 'border-destructive' : ''}>
                                    <SelectValue placeholder={t('sidebar.businessDialog.form.language.placeholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {LANGUAGES.map((language) => (
                                        <SelectItem key={language.value} value={language.value}>
                                            {language.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {formErrors.language && (
                                <p className="text-sm text-destructive">{formErrors.language}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="region">{t('sidebar.businessDialog.form.region.label')}</Label>
                            <Select
                                value={formData.region || ''}
                                onValueChange={(value) => handleSelectChange('region', value)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger className={formErrors.region ? 'border-destructive' : ''}>
                                    <SelectValue placeholder={t('sidebar.businessDialog.form.region.placeholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {REGIONS.map((region) => (
                                        <SelectItem key={region.value} value={region.value}>
                                            {region.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {formErrors.region && (
                                <p className="text-sm text-destructive">{formErrors.region}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="business-logo">{t('sidebar.businessDialog.form.logo.label')}</Label>
                            <div className="flex items-start gap-4">
                                {imagePreview && (
                                    <div className="relative">
                                        <Avatar className="h-20 w-20">
                                            <AvatarImage src={imagePreview} alt="Business logo preview" />
                                            <AvatarFallback>Logo</AvatarFallback>
                                        </Avatar>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                            onClick={handleRemoveImage}
                                            disabled={isSubmitting || isUploadingImage}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input
                                        id="business-logo"
                                        name="business-logo"
                                        type="file"
                                        accept="image/jpeg,image/png"
                                        onChange={handleImageChange}
                                        disabled={isSubmitting || isUploadingImage}
                                        className="cursor-pointer"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {t('sidebar.businessDialog.form.logo.helper')}
                                    </p>
                                </div>
                            </div>
                            {isUploadingImage && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {t('sidebar.businessDialog.form.logo.uploading')}
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            {t('sidebar.businessDialog.buttons.cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting || isUploadingImage}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingBusiness ? t('sidebar.businessDialog.buttons.update') : t('sidebar.businessDialog.buttons.create')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}