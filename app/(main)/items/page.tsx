"use client";

import { useState, useEffect, memo, useCallback } from "react";
import { useBusiness } from "@/contexts/business-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Trash2, Loader2, Pencil, X } from "lucide-react";
import { getItems, createItem, updateItem, deleteItem } from "@/lib/api/items";
import { getItemTaxes } from "@/lib/api/item-taxes";
import { getItemDiscounts } from "@/lib/api/item-discounts";
import { uploadImage, deleteImage, getImageUrl } from "@/lib/images/operations";
import { getFileSizeBytes } from "@/lib/images/utils";
import type { Item, CreateItemRequest, UpdateItemRequest, ItemTax, ItemDiscount } from "@/lib/api";

const ItemImage = memo(({ item }: { item: Item }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadImage = async () => {
            if (item.image_size_bytes) {
                setLoading(true);
                const result = await getImageUrl({
                    folder: 'items',
                    uuid: item.uuid,
                });
                if (result.success && result.url) {
                    setImageUrl(result.url);
                }
                setLoading(false);
            }
        };
        loadImage();
    }, [item.uuid, item.image_size_bytes]);

    if (loading) {
        return (
            <Avatar className="h-10 w-10">
                <AvatarFallback>
                    <Loader2 className="h-4 w-4 animate-spin" />
                </AvatarFallback>
            </Avatar>
        );
    }

    return (
        <Avatar className="h-10 w-10">
            {imageUrl ? (
                <AvatarImage src={imageUrl} alt={item.name} />
            ) : (
                <AvatarFallback>{item.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            )}
        </Avatar>
    );
});

ItemImage.displayName = 'ItemImage';

export default function ItemsPage() {
    const { selectedBusiness, businesses } = useBusiness();
    const [items, setItems] = useState<Item[]>([]);
    const [taxes, setTaxes] = useState<ItemTax[]>([]);
    const [discounts, setDiscounts] = useState<ItemDiscount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imageDeleted, setImageDeleted] = useState(false);
    const [formData, setFormData] = useState<Omit<CreateItemRequest, 'business_uuid'>>({
        discount_uuid: null,
        tax_uuid: null,
        name: "",
        sku: null,
        description: null,
        base_price: 0,
        is_active: true,
        image_size_bytes: null,
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const loadData = useCallback(async () => {
        if (!selectedBusiness) return;

        try {
            setIsLoading(true);
            setError(null);
            const [itemsResponse, taxesResponse, discountsResponse] = await Promise.all([
                getItems(),
                getItemTaxes(),
                getItemDiscounts(),
            ]);

            if (itemsResponse.success) {
                const filteredItems = itemsResponse.data.filter(
                    (item: Item) => item.business_uuid === selectedBusiness.uuid
                );
                setItems(filteredItems);
            } else {
                const errorData = itemsResponse as unknown as {
                    success: false;
                    message: string;
                };
                setError(errorData.message || "Failed to load items");
            }

            if (taxesResponse.success) {
                const filteredTaxes = taxesResponse.data.filter(
                    (tax: ItemTax) => tax.business_uuid === selectedBusiness.uuid
                );
                setTaxes(filteredTaxes);
            }

            if (discountsResponse.success) {
                const filteredDiscounts = discountsResponse.data.filter(
                    (discount: ItemDiscount) => discount.business_uuid === selectedBusiness.uuid
                );
                setDiscounts(filteredDiscounts);
            }
        } catch (err) {
            setError("An error occurred while loading data");
            console.error("Error loading data:", err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedBusiness]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const getBusinessName = (business_uuid: string) => {
        const business = businesses.find(b => b.uuid === business_uuid);
        return business?.name || "Unknown Business";
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let processedValue: string | number | undefined | null = value;

        if (name === "base_price") {
            processedValue = parseFloat(value) || 0;
        } else if ((name === "tax_uuid" || name === "discount_uuid") && value === "") {
            processedValue = null;
        } else if ((name === "sku" || name === "description") && value === "") {
            processedValue = null;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: processedValue
        }));
        if (formErrors[name]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, is_active: checked }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
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
        const fileInput = document.getElementById('image') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBusiness) return;

        setIsSubmitting(true);
        setFormErrors({});
        setError(null);

        try {
            let imageSizeBytes: number | null = null;

            if (editingItem) {
                if (selectedImage) {
                    setIsUploadingImage(true);
                    const uploadResult = await uploadImage({
                        file: selectedImage,
                        folder: 'items',
                        uuid: editingItem.uuid,
                    });
                    setIsUploadingImage(false);

                    if (!uploadResult.success) {
                        setError(uploadResult.error || 'Failed to upload image');
                        setIsSubmitting(false);
                        return;
                    }
                    imageSizeBytes = getFileSizeBytes(selectedImage);
                } else if (imageDeleted) {
                    await deleteImage({
                        folder: 'items',
                        uuid: editingItem.uuid,
                    });
                    imageSizeBytes = null;
                } else if (existingImageUrl) {
                    imageSizeBytes = editingItem.image_size_bytes;
                }

                const updateData: UpdateItemRequest = {
                    business_uuid: selectedBusiness.uuid,
                    discount_uuid: formData.discount_uuid,
                    tax_uuid: formData.tax_uuid,
                    name: formData.name,
                    sku: formData.sku,
                    description: formData.description,
                    base_price: formData.base_price,
                    is_active: formData.is_active,
                    image_size_bytes: imageSizeBytes,
                };
                const response = await updateItem(editingItem.uuid, updateData);
                if (response.success) {
                    setItems((prev) =>
                        prev.map((item) =>
                            item.uuid === editingItem.uuid ? response.data : item
                        )
                    );
                    setIsDialogOpen(false);
                    setFormData({
                        discount_uuid: null,
                        tax_uuid: null,
                        name: "",
                        sku: null,
                        description: null,
                        base_price: 0,
                        is_active: true,
                        image_size_bytes: null,
                    });
                    setEditingItem(null);
                    setSelectedImage(null);
                    setImagePreview(null);
                    setExistingImageUrl(null);
                    setImageDeleted(false);
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
                        setError("Failed to update item");
                    }
                }
            } else {
                let imageSizeBytes: number | null = null;
                let createdItemUuid: string | null = null;

                const createData: CreateItemRequest = {
                    ...formData,
                    business_uuid: selectedBusiness.uuid,
                    image_size_bytes: null,
                };

                const response = await createItem(createData);
                if (response.success) {
                    createdItemUuid = response.data.uuid;

                    if (selectedImage && createdItemUuid) {
                        setIsUploadingImage(true);
                        const uploadResult = await uploadImage({
                            file: selectedImage,
                            folder: 'items',
                            uuid: createdItemUuid,
                        });
                        setIsUploadingImage(false);

                        if (uploadResult.success) {
                            imageSizeBytes = getFileSizeBytes(selectedImage);
                            await updateItem(response.data.uuid, { image_size_bytes: imageSizeBytes });
                            response.data.image_size_bytes = imageSizeBytes;
                        }
                    }

                    setItems((prev) => [...prev, response.data]);
                    setIsDialogOpen(false);
                    setFormData({
                        discount_uuid: null,
                        tax_uuid: null,
                        name: "",
                        sku: null,
                        description: null,
                        base_price: 0,
                        is_active: true,
                        image_size_bytes: null,
                    });
                    setSelectedImage(null);
                    setImagePreview(null);
                    setExistingImageUrl(null);
                    setImageDeleted(false);
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
                        setError("Failed to create item");
                    }
                }
            }
        } catch (err) {
            setError(editingItem ? "An error occurred while updating item" : "An error occurred while creating item");
            console.error("Error saving item:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (item: Item) => {
        setItemToDelete(item);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;

        try {
            setDeletingId(itemToDelete.id);
            setError(null);

            if (itemToDelete.image_size_bytes) {
                await deleteImage({
                    folder: 'items',
                    uuid: itemToDelete.uuid,
                });
            }

            const response = await deleteItem(itemToDelete.uuid);
            if (response.success) {
                setItems((prev) => prev.filter((item) => item.uuid !== itemToDelete.uuid));
                setIsDeleteDialogOpen(false);
                setItemToDelete(null);
            } else {
                const errorData = response as unknown as {
                    success: false;
                    message: string;
                };
                setError(errorData.message || "Failed to delete item");
            }
        } catch (err) {
            setError("An error occurred while deleting item");
            console.error("Error deleting item:", err);
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = async (item: Item) => {
        setEditingItem(item);
        setFormData({
            discount_uuid: item.discount_uuid,
            tax_uuid: item.tax_uuid,
            name: item.name,
            sku: item.sku,
            description: item.description,
            base_price: parseFloat(item.base_price),
            is_active: item.is_active,
            image_size_bytes: item.image_size_bytes,
        });
        setSelectedImage(null);
        setImagePreview(null);
        setImageDeleted(false);

        if (item.image_size_bytes) {
            const imageResult = await getImageUrl({
                folder: 'items',
                uuid: item.uuid,
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
            setEditingItem(null);
            setFormData({
                discount_uuid: null,
                tax_uuid: null,
                name: "",
                sku: null,
                description: null,
                base_price: 0,
                is_active: true,
                image_size_bytes: null,
            });
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
                    <h1 className="text-3xl font-bold tracking-tight">Items</h1>
                    <p className="text-muted-foreground">
                        Manage your products and services
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{editingItem ? "Edit Item" : "Create New Item"}</DialogTitle>
                                <DialogDescription>
                                    {editingItem ? "Update item information" : "Add a new product or service to your inventory"}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                {error && (
                                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                        {error}
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="tax_uuid">Tax (Optional)</Label>
                                        <select
                                            id="tax_uuid"
                                            name="tax_uuid"
                                            value={formData.tax_uuid || ""}
                                            onChange={handleInputChange}
                                            disabled={isSubmitting}
                                            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${formErrors.tax_uuid ? "border-destructive" : ""}`}
                                        >
                                            <option value="">No tax</option>
                                            {taxes.map((tax) => (
                                                <option key={tax.uuid} value={tax.uuid}>
                                                    {tax.name} ({tax.type === 'percentage' ? `${tax.value}%` : `$${tax.value}`})
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.tax_uuid && (
                                            <p className="text-sm text-destructive">{formErrors.tax_uuid}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="discount_uuid">Discount (Optional)</Label>
                                        <select
                                            id="discount_uuid"
                                            name="discount_uuid"
                                            value={formData.discount_uuid || ""}
                                            onChange={handleInputChange}
                                            disabled={isSubmitting}
                                            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${formErrors.discount_uuid ? "border-destructive" : ""}`}
                                        >
                                            <option value="">No discount</option>
                                            {discounts.map((discount) => (
                                                <option key={discount.uuid} value={discount.uuid}>
                                                    {discount.name} ({discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`})
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.discount_uuid && (
                                            <p className="text-sm text-destructive">{formErrors.discount_uuid}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Item Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="Product Name"
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
                                        <Label htmlFor="sku">SKU (Optional)</Label>
                                        <Input
                                            id="sku"
                                            name="sku"
                                            placeholder="PROD-001"
                                            value={formData.sku || ""}
                                            onChange={handleInputChange}
                                            disabled={isSubmitting}
                                            className={formErrors.sku ? "border-destructive" : ""}
                                        />
                                        {formErrors.sku && (
                                            <p className="text-sm text-destructive">{formErrors.sku}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="description">Description (Optional)</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            placeholder="Product description..."
                                            value={formData.description || ""}
                                            onChange={handleInputChange}
                                            disabled={isSubmitting}
                                            className={formErrors.description ? "border-destructive" : ""}
                                            rows={3}
                                        />
                                        {formErrors.description && (
                                            <p className="text-sm text-destructive">{formErrors.description}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="image">Item Image (Optional)</Label>
                                        <div className="flex items-center gap-4">
                                            {imagePreview && (
                                                <div className="relative">
                                                    <Avatar className="h-20 w-20">
                                                        <AvatarImage src={imagePreview} alt="Item preview" />
                                                        <AvatarFallback>IMG</AvatarFallback>
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
                                                    id="image"
                                                    name="image"
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
                                                Uploading image...
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="base_price">Base Price</Label>
                                        <Input
                                            id="base_price"
                                            name="base_price"
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            placeholder="0.00"
                                            value={formData.base_price === 0 ? "" : formData.base_price}
                                            onChange={handleInputChange}
                                            disabled={isSubmitting}
                                            required
                                            className={formErrors.base_price ? "border-destructive" : ""}
                                        />
                                        {formErrors.base_price && (
                                            <p className="text-sm text-destructive">{formErrors.base_price}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2 flex flex-col justify-end">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="is_active"
                                                checked={formData.is_active}
                                                onCheckedChange={handleSwitchChange}
                                                disabled={isSubmitting}
                                            />
                                            <Label htmlFor="is_active">Active</Label>
                                        </div>
                                    </div>
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
                                    {editingItem ? "Update Item" : "Create Item"}
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
                ) : items.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center space-y-4">
                        <p className="text-lg text-muted-foreground">No items found</p>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Your First Item
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Business</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <ItemImage item={item} />
                                    </TableCell>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                                    <TableCell>{getBusinessName(item.business_uuid)}</TableCell>
                                    <TableCell>${parseFloat(item.base_price).toFixed(2)}</TableCell>
                                    <TableCell>
                                        {item.is_active ? (
                                            <Badge variant="default" className="bg-green-500">Active</Badge>
                                        ) : (
                                            <Badge variant="secondary">Inactive</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(item)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(item)}
                                                disabled={deletingId === item.id}
                                            >
                                                {deletingId === item.id ? (
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
                            This will permanently delete <span className="font-semibold">{itemToDelete?.name}</span> (SKU: {itemToDelete?.sku}).
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

