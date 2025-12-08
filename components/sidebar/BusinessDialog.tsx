"use client";

import { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Business, CreateBusinessRequest, UpdateBusinessRequest } from "@/lib/api";
import { createBusiness, updateBusiness } from "@/lib/api/businesses";
import { uploadImage, deleteImage, getImageUrl } from "@/lib/images/operations";
import { getFileSizeBytes } from "@/lib/images/utils";

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateBusinessRequest>({
        name: editingBusiness?.name || "",
        address: editingBusiness?.address || null,
        phone: editingBusiness?.phone || null,
        image_size_bytes: editingBusiness?.image_size_bytes || null,
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imageDeleted, setImageDeleted] = useState(false);

    // Load existing image when editing
    useState(() => {
        const loadExistingImage = async () => {
            if (editingBusiness && editingBusiness.image_size_bytes) {
                const imageResult = await getImageUrl({
                    folder: 'businesses',
                    uuid: editingBusiness.uuid,
                });
                if (imageResult.success && imageResult.url) {
                    setExistingImageUrl(imageResult.url);
                    setImagePreview(imageResult.url);
                }
            }
        };
        if (open && editingBusiness) {
            loadExistingImage();
            setFormData({
                name: editingBusiness.name,
                address: editingBusiness.address,
                phone: editingBusiness.phone,
                image_size_bytes: editingBusiness.image_size_bytes,
            });
        }
    });

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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1048576) {
                setError('Image size must be less than 1MB');
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
        setExistingImageUrl(null);
        const fileInput = document.getElementById('business-logo') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setFormData({ name: "", address: null, phone: null, image_size_bytes: null });
        setFormErrors({});
        setError(null);
        setSelectedImage(null);
        setImagePreview(null);
        setExistingImageUrl(null);
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
                        setError("Failed to update business");
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
                        setError("Failed to create business");
                    }
                }
            }
        } catch (err) {
            setError(editingBusiness ? "An error occurred while updating business" : "An error occurred while creating business");
            console.error("Error saving business:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{editingBusiness ? "Edit Business" : "Create New Business"}</DialogTitle>
                        <DialogDescription>
                            {editingBusiness ? "Update business information" : "Add a new business location to your account"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {error && (
                            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="name">Business Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Business name"
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
                            <Label htmlFor="address">Address (Optional)</Label>
                            <Input
                                id="address"
                                name="address"
                                placeholder="123 Main St, City, Country"
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
                            <Label htmlFor="phone">Phone Number (Optional)</Label>
                            <Input
                                id="phone"
                                name="phone"
                                placeholder="+1234567890"
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
                            <Label htmlFor="business-logo">Business Logo (Optional)</Label>
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
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        disabled={isSubmitting || isUploadingImage}
                                        className="cursor-pointer"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Supported formats: JPG, JPEG, PNG, GIF, WEBP. Max size: 1MB
                                    </p>
                                </div>
                            </div>
                            {isUploadingImage && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Uploading logo...
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
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || isUploadingImage}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingBusiness ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}