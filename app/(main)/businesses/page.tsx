"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Loader2, Pencil, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getBusinesses, createBusiness, updateBusiness, deleteBusiness } from "@/lib/api/businesses";
import { useBusiness } from "@/contexts/business-context";
import { uploadImage, deleteImage, getImageUrl } from "@/lib/images/operations";
import { getFileSizeBytes } from "@/lib/images/utils";
import type { Business, CreateBusinessRequest, UpdateBusinessRequest } from "@/lib/api";

export default function BusinessesPage() {
    const { refreshBusinesses } = useBusiness();
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateBusinessRequest>({
        name: "",
        address: null,
        phone: null,
        image_size_bytes: null,
        currency: null,
        language: null,
        region: null,
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imageDeleted, setImageDeleted] = useState(false);

    useEffect(() => {
        loadBusinesses();
    }, []);

    const loadBusinesses = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await getBusinesses();
            if (response.success) {
                setBusinesses(response.data);
            } else {
                const errorData = response as unknown as {
                    success: false;
                    message: string;
                };
                setError(errorData.message || "Failed to load businesses");
            }
        } catch (err) {
            setError("An error occurred while loading businesses");
            console.error("Error loading businesses:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const processedValue = (name === "address" || name === "phone" || name === "currency" || name === "language" || name === "region") && value === "" ? null : value;
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
            // Check file size (1MB = 1048576 bytes)
            if (file.size > 1048576) {
                setError('Image size must be less than 1MB');
                e.target.value = ''; // Clear the input
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
        const fileInput = document.getElementById('logo') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormErrors({});
        setError(null);

        try {
            if (editingBusiness) {
                // Handle image upload/delete for editing
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
                    setBusinesses((prev) =>
                        prev.map((business) =>
                            business.uuid === editingBusiness.uuid ? response.data : business
                        )
                    );
                    setIsDialogOpen(false);
                    setFormData({ name: "", address: null, phone: null, image_size_bytes: null, currency: null, language: null, region: null });
                    setEditingBusiness(null);
                    setSelectedImage(null);
                    setImagePreview(null);
                    setExistingImageUrl(null);
                    setImageDeleted(false);
                    // Refresh business context to update sidebar
                    await refreshBusinesses();
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
                // Create new business
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
                        const updateResponse = await updateBusiness(createdBusinessUuid, {
                            image_size_bytes: imageSizeBytes,
                        });
                        if (updateResponse.success) {
                            setBusinesses((prev) => [...prev.filter(b => b.uuid !== createdBusinessUuid), updateResponse.data]);
                        }
                    } else {
                        setBusinesses((prev) => [...prev, response.data]);
                    }

                    setIsDialogOpen(false);
                    setFormData({ name: "", address: null, phone: null, image_size_bytes: null, currency: null, language: null, region: null });
                    setSelectedImage(null);
                    setImagePreview(null);
                    setExistingImageUrl(null);
                    setImageDeleted(false);
                    // Refresh business context to update sidebar
                    await refreshBusinesses();
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

    const handleDeleteClick = (business: Business) => {
        setBusinessToDelete(business);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!businessToDelete) return;

        try {
            setDeletingId(businessToDelete.id);
            setError(null);

            // Delete logo if exists
            if (businessToDelete.image_size_bytes) {
                await deleteImage({
                    folder: 'businesses',
                    uuid: businessToDelete.uuid,
                });
            }

            const response = await deleteBusiness(businessToDelete.uuid);
            if (response.success) {
                setBusinesses((prev) => prev.filter((business) => business.uuid !== businessToDelete.uuid));
                setIsDeleteDialogOpen(false);
                setBusinessToDelete(null);
                // Refresh business context to update selected business
                await refreshBusinesses();
            } else {
                const errorData = response as unknown as {
                    success: false;
                    message: string;
                };
                setError(errorData.message || "Failed to delete business");
            }
        } catch (err) {
            setError("An error occurred while deleting business");
            console.error("Error deleting business:", err);
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = async (business: Business) => {
        setEditingBusiness(business);
        setFormData({
            name: business.name,
            address: business.address,
            phone: business.phone,
            image_size_bytes: business.image_size_bytes,
            currency: business.currency,
            language: business.language,
            region: business.region,
        });
        setSelectedImage(null);
        setImagePreview(null);
        setImageDeleted(false);

        if (business.image_size_bytes) {
            const imageResult = await getImageUrl({
                folder: 'businesses',
                uuid: business.uuid,
            });
            if (imageResult.success && imageResult.url) {
                setExistingImageUrl(imageResult.url);
                setImagePreview(imageResult.url);
            } else {
                setExistingImageUrl(null);
            }
        } else {
            setExistingImageUrl(null);
        }

        setIsDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingBusiness(null);
            setFormData({ name: "", address: null, phone: null, image_size_bytes: null, currency: null, language: null, region: null });
            setFormErrors({});
            setError(null);
            setSelectedImage(null);
            setImagePreview(null);
            setExistingImageUrl(null);
            setImageDeleted(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Businesses</h1>
                    <p className="text-muted-foreground">
                        Manage your business locations and information
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Business
                        </Button>
                    </DialogTrigger>
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
                                    <Label htmlFor="currency">Currency (Optional)</Label>
                                    <Input
                                        id="currency"
                                        name="currency"
                                        placeholder="USD"
                                        value={formData.currency || ""}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        maxLength={3}
                                        className={formErrors.currency ? "border-destructive" : ""}
                                    />
                                    {formErrors.currency && (
                                        <p className="text-sm text-destructive">{formErrors.currency}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">ISO currency code (e.g., USD, EUR, GBP)</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="language">Language (Optional)</Label>
                                    <Input
                                        id="language"
                                        name="language"
                                        placeholder="en-US"
                                        value={formData.language || ""}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        maxLength={5}
                                        className={formErrors.language ? "border-destructive" : ""}
                                    />
                                    {formErrors.language && (
                                        <p className="text-sm text-destructive">{formErrors.language}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">Language code (e.g., en-US, fr-FR)</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="region">Region (Optional)</Label>
                                    <Input
                                        id="region"
                                        name="region"
                                        placeholder="US"
                                        value={formData.region || ""}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        maxLength={5}
                                        className={formErrors.region ? "border-destructive" : ""}
                                    />
                                    {formErrors.region && (
                                        <p className="text-sm text-destructive">{formErrors.region}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">Region/country code (e.g., US, FR, GB)</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="logo">Business Logo (Optional)</Label>
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
                                                id="logo"
                                                name="logo"
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
                                    onClick={() => handleDialogClose(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingBusiness ? "Update Business" : "Create Business"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {error && !isDialogOpen && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="rounded-lg border bg-card">
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : businesses.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center space-y-4">
                        <p className="text-lg text-muted-foreground">No businesses found</p>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Your First Business
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {businesses.map((business) => (
                                <TableRow key={business.id}>
                                    <TableCell className="font-medium">{business.name}</TableCell>
                                    <TableCell>{business.address}</TableCell>
                                    <TableCell>{business.phone}</TableCell>
                                    <TableCell>
                                        {new Date(business.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(business)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(business)}
                                                disabled={deletingId === business.id}
                                            >
                                                {deletingId === business.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                )}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <span className="font-semibold">{businessToDelete?.name}</span>.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={!!deletingId}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={!!deletingId}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deletingId ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

