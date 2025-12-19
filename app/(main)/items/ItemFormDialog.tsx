"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, X } from "lucide-react";
import type { Item, CreateItemRequest, ItemTax, ItemDiscount, Category } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface ItemFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingItem: Item | null;
    formData: Omit<CreateItemRequest, 'business_uuid'>;
    formErrors: Record<string, string>;
    error: string | null;
    taxes: ItemTax[];
    discounts: ItemDiscount[];
    categories: Category[];
    selectedCategoryUuids: string[];
    imagePreview: string | null;
    isSubmitting: boolean;
    isUploadingImage: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onSwitchChange: (checked: boolean) => void;
    onCategoryChange: (categoryUuid: string) => void;
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

export function ItemFormDialog({
    open,
    onOpenChange,
    editingItem,
    formData,
    formErrors,
    error,
    taxes,
    discounts,
    categories,
    selectedCategoryUuids,
    imagePreview,
    isSubmitting,
    isUploadingImage,
    onInputChange,
    onSwitchChange,
    onCategoryChange,
    onImageChange,
    onRemoveImage,
    onSubmit,
}: ItemFormDialogProps) {
    const { t } = useTranslation();
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? t('app.items.editTitle') : t('app.items.createTitle')}</DialogTitle>
                        <DialogDescription>
                            {editingItem ? t('app.items.editDescription') : t('app.items.createDescription')}
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
                                <Label htmlFor="tax_uuid">{t('app.items.taxOptional')}</Label>
                                <select
                                    id="tax_uuid"
                                    name="tax_uuid"
                                    value={formData.tax_uuid || ""}
                                    onChange={onInputChange}
                                    disabled={isSubmitting}
                                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${formErrors.tax_uuid ? "border-destructive" : ""}`}
                                >
                                    <option value="">{t('app.items.noTax')}</option>
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
                                <Label htmlFor="discount_uuid">{t('app.items.discountOptional')}</Label>
                                <select
                                    id="discount_uuid"
                                    name="discount_uuid"
                                    value={formData.discount_uuid || ""}
                                    onChange={onInputChange}
                                    disabled={isSubmitting}
                                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${formErrors.discount_uuid ? "border-destructive" : ""}`}
                                >
                                    <option value="">{t('app.items.noDiscount')}</option>
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
                            <div className="space-y-2 col-span-2">
                                <Label>{t('app.items.categoriesOptional')}</Label>
                                <div className="max-h-[200px] overflow-y-auto border rounded-md p-3">
                                    {categories.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">{t('app.items.noCategoriesAvailable')}</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {categories.map((category) => (
                                                <div key={category.uuid} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`category-${category.uuid}`}
                                                        checked={selectedCategoryUuids.includes(category.uuid)}
                                                        onCheckedChange={() => onCategoryChange(category.uuid)}
                                                        disabled={isSubmitting}
                                                    />
                                                    <Label
                                                        htmlFor={`category-${category.uuid}`}
                                                        className="text-sm font-normal cursor-pointer truncate"
                                                        title={category.name}
                                                    >
                                                        {category.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {formErrors.category_uuids && (
                                    <p className="text-sm text-destructive">{formErrors.category_uuids}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('app.items.name')}</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder={t('app.items.placeholders.productName')}
                                    value={formData.name}
                                    onChange={onInputChange}
                                    disabled={isSubmitting}
                                    required
                                    className={formErrors.name ? "border-destructive" : ""}
                                />
                                {formErrors.name && (
                                    <p className="text-sm text-destructive">{formErrors.name}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sku">{t('app.items.skuOptional')}</Label>
                                <Input
                                    id="sku"
                                    name="sku"
                                    placeholder={t('app.items.placeholders.sku')}
                                    value={formData.sku || ""}
                                    onChange={onInputChange}
                                    disabled={isSubmitting}
                                    className={formErrors.sku ? "border-destructive" : ""}
                                />
                                {formErrors.sku && (
                                    <p className="text-sm text-destructive">{formErrors.sku}</p>
                                )}
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="description">{t('app.items.descriptionOptional')}</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder={t('app.items.placeholders.description')}
                                    value={formData.description || ""}
                                    onChange={onInputChange}
                                    disabled={isSubmitting}
                                    className={formErrors.description ? "border-destructive" : ""}
                                    rows={3}
                                />
                                {formErrors.description && (
                                    <p className="text-sm text-destructive">{formErrors.description}</p>
                                )}
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="image">{t('app.items.itemImageOptional')}</Label>
                                <div className="flex items-center gap-4">
                                    {imagePreview && (
                                        <div className="relative">
                                            <Avatar className="h-20 w-20">
                                                <AvatarImage src={imagePreview} alt={t('app.items.previewAlt')} />
                                                <AvatarFallback>{t('app.items.imageFallback')}</AvatarFallback>
                                            </Avatar>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                                onClick={onRemoveImage}
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
                                            accept="image/jpeg,image/png"
                                            onChange={onImageChange}
                                            disabled={isSubmitting || isUploadingImage}
                                            className="cursor-pointer"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {t('app.items.supportedFormats')}
                                        </p>
                                    </div>
                                </div>
                                {isUploadingImage && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {t('app.items.uploading')}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="base_price">{t('app.items.basePrice') || 'Base Price'}</Label>
                                <Input
                                    id="base_price"
                                    name="base_price"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    placeholder="0.00"
                                    value={formData.base_price === 0 ? "" : formData.base_price}
                                    onChange={onInputChange}
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
                                        onCheckedChange={onSwitchChange}
                                        disabled={isSubmitting}
                                    />
                                    <Label htmlFor="is_active">{t('app.items.active')}</Label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingItem ? t('app.items.update') : t('app.items.create')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}