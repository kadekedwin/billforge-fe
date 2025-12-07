"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    Package,
    LogOut,
    Menu,
    Percent,
    Tag,
    CreditCard,
    UserCircle,
} from "lucide-react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet";
import {useAuth} from "@/lib/auth-context";
import {useBusiness} from "@/lib/business-context";
import {useState, useEffect, memo} from "react";
import {Building2, ChevronDown, Loader2, Plus, Pencil, X, Trash2} from "lucide-react";
import Image from "next/image";
import { getImageUrl, uploadImage, deleteImage, getFileSizeBytes } from "@/lib/images";
import { createBusiness, updateBusiness, deleteBusiness } from "@/lib/api/businesses";
import type { Business, CreateBusinessRequest, UpdateBusinessRequest } from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BusinessLogo = memo(({ business, size = "sm" }: { business: Business; size?: "sm" | "lg" }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadImage = async () => {
            if (business.image_size_bytes) {
                setLoading(true);
                const result = await getImageUrl({
                    folder: 'businesses',
                    uuid: business.uuid,
                });
                if (result.success && result.url) {
                    setImageUrl(result.url);
                }
                setLoading(false);
            }
        };
        loadImage();
    }, [business.uuid, business.image_size_bytes]);

    const sizeClasses = size === "lg" ? "h-8 w-8" : "h-4 w-4";

    if (loading) {
        return <Loader2 className={cn(sizeClasses, "animate-spin")} />;
    }

    if (imageUrl) {
        return (
            <Avatar className={sizeClasses}>
                <AvatarImage src={imageUrl} alt={business.name} />
                <AvatarFallback>{business.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
        );
    }

    return <Building2 className={sizeClasses} />;
});

BusinessLogo.displayName = 'BusinessLogo';

const navItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Transactions",
        href: "/transactions",
        icon: FileText,
    },
    {
        title: "Items",
        href: "/items",
        icon: Package,
    },
    {
        title: "Customers",
        href: "/customers",
        icon: UserCircle,
    },
    {
        title: "Payment Methods",
        href: "/payment-methods",
        icon: CreditCard,
    },
    {
        title: "Item Taxes",
        href: "/item-taxes",
        icon: Percent,
    },
    {
        title: "Item Discounts",
        href: "/item-discounts",
        icon: Tag,
    },
];

function SidebarContent({onNavigate}: { onNavigate?: () => void }) {
    const pathname = usePathname();
    const {user, logout} = useAuth();
    const {selectedBusiness, businesses, setSelectedBusiness, refreshBusinesses} = useBusiness();

    const [isBusinessDialogOpen, setIsBusinessDialogOpen] = useState(false);
    const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateBusinessRequest>({
        name: "",
        address: null,
        phone: null,
        image_size_bytes: null,
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imageDeleted, setImageDeleted] = useState(false);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleLogout = () => {
        logout();
        onNavigate?.();
    };

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

    const handleAddBusiness = () => {
        setEditingBusiness(null);
        setFormData({ name: "", address: null, phone: null, image_size_bytes: null });
        setFormErrors({});
        setError(null);
        setSelectedImage(null);
        setImagePreview(null);
        setExistingImageUrl(null);
        setImageDeleted(false);
        setIsBusinessDialogOpen(true);
    };

    const handleEditBusiness = async (business: Business) => {
        setEditingBusiness(business);
        setFormData({
            name: business.name,
            address: business.address,
            phone: business.phone,
            image_size_bytes: business.image_size_bytes,
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

        setIsBusinessDialogOpen(true);
    };

    const handleBusinessDialogClose = (open: boolean) => {
        setIsBusinessDialogOpen(open);
        if (!open) {
            setEditingBusiness(null);
            setFormData({ name: "", address: null, phone: null, image_size_bytes: null });
            setFormErrors({});
            setError(null);
            setSelectedImage(null);
            setImagePreview(null);
            setExistingImageUrl(null);
            setImageDeleted(false);
        }
    };

    const handleDeleteBusiness = (business: Business) => {
        setBusinessToDelete(business);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!businessToDelete) return;

        try {
            setIsDeleting(true);

            // Delete logo if exists
            if (businessToDelete.image_size_bytes) {
                await deleteImage({
                    folder: 'businesses',
                    uuid: businessToDelete.uuid,
                });
            }

            const response = await deleteBusiness(businessToDelete.uuid);
            if (response.success) {
                setIsDeleteDialogOpen(false);
                setBusinessToDelete(null);
                await refreshBusinesses();
            }
        } catch (err) {
            console.error("Error deleting business:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSubmitBusiness = async (e: React.FormEvent) => {
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
                    setIsBusinessDialogOpen(false);
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
                        await updateBusiness(createdBusinessUuid, {
                            image_size_bytes: imageSizeBytes,
                        });
                    }

                    setIsBusinessDialogOpen(false);
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

    return (
        <div className="flex h-full flex-col">
            {/* Logo/Brand */}
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center space-x-2" onClick={onNavigate}>
                    <Image src={"/logovector.png"} alt={"logo"} width={32} height={32}/>
                    <span className="text-xl font-bold">BillForge</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={cn(
                                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <Icon className="h-5 w-5"/>
                            <span>{item.title}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Business Selector */}
            {selectedBusiness && businesses.length > 0 && (
                <div className="border-t p-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-between"
                            >
                                <div className="flex items-center space-x-2">
                                    <BusinessLogo business={selectedBusiness} size="sm" />
                                    <span className="truncate text-sm">{selectedBusiness.name}</span>
                                </div>
                                <ChevronDown className="h-4 w-4 opacity-50"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuLabel>Switch Business</DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            {businesses.map((business) => (
                                <DropdownMenuItem
                                    key={business.uuid}
                                    className={cn(
                                        "flex items-center justify-between group",
                                        selectedBusiness.uuid === business.uuid && "bg-accent"
                                    )}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    <div
                                        className="flex items-center flex-1 cursor-pointer"
                                        onClick={() => {
                                            setSelectedBusiness(business);
                                            onNavigate?.();
                                        }}
                                    >
                                        <div className="mr-2">
                                            <BusinessLogo business={business} size="sm" />
                                        </div>
                                        <span className="flex-1">{business.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditBusiness(business);
                                            }}
                                        >
                                            <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-destructive hover:text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteBusiness(business);
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem
                                onClick={handleAddBusiness}
                                className="cursor-pointer"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                <span>Add Business</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            {/* User Profile */}
            <div className="border-t p-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="w-full justify-start space-x-3 px-2"
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarImage src=""/>
                                <AvatarFallback>
                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-1 flex-col items-start text-sm">
                                <span className="font-medium">{user?.name || "User"}</span>
                                <span className="text-xs text-muted-foreground">
                  {user?.email || ""}
                </span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem asChild>
                            <Link href="/profile">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings">Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                            <LogOut className="mr-2 h-4 w-4"/>
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Business Create/Edit Dialog */}
            <Dialog open={isBusinessDialogOpen} onOpenChange={handleBusinessDialogClose}>
                <DialogContent>
                    <form onSubmit={handleSubmitBusiness}>
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
                                            Supported formats: JPG, JPEG, PNG, GIF, WEBP
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
                                onClick={() => handleBusinessDialogClose(false)}
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

            {/* Delete Business Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Business</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &#34;{businessToDelete?.name}&#34;? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export function Sidebar() {
    return (
        <aside className="hidden h-screen w-64 border-r bg-background lg:block">
            <SidebarContent/>
        </aside>
    );
}

export function MobileSidebar() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Toggle menu"
                >
                    {open ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <SidebarContent onNavigate={() => setOpen(false)}/>
            </SheetContent>
        </Sheet>
    );
}

