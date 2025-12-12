"use client";

import { ChevronDown, Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBusiness } from "@/contexts/business-context";
import { cn } from "@/lib/utils";
import { Business } from "@/lib/api";
import { BusinessLogo } from "./BusinessLogo";
import { toast } from "sonner";
import { LIMITS, getLimitMessage } from "@/lib/config/limits";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface BusinessSelectorProps {
    onNavigate?: () => void;
    onAddBusiness: () => void;
    onEditBusiness: (business: Business) => void;
    onDeleteBusiness: (business: Business) => void;
}

export function BusinessSelector({
    onNavigate,
    onAddBusiness,
    onEditBusiness,
    onDeleteBusiness,
}: BusinessSelectorProps) {
    const { t } = useTranslation();
    const { selectedBusiness, businesses, setSelectedBusiness } = useBusiness();

    const handleAddBusiness = () => {
        if (businesses.length >= LIMITS.MAX_BUSINESSES) {
            toast.error(getLimitMessage('MAX_BUSINESSES'));
            return;
        }
        onAddBusiness();
    };

    if (!selectedBusiness) {
        return null;
    }

    return (
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
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>{t('sidebar.businessSelector.switchBusiness')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
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
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" side="right">
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditBusiness(business);
                                            }}
                                        >
                                            <Pencil className="mr-2 h-4 w-4" />
                                            <span>{t('sidebar.businessSelector.edit')}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteBusiness(business);
                                            }}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>{t('sidebar.businessSelector.delete')}</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={handleAddBusiness}
                        className="cursor-pointer"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        <span>{t('sidebar.businessSelector.addBusiness')}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}