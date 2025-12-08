"use client";

import { useState } from "react";
import { Business } from "@/lib/api";
import { useBusiness } from "@/contexts/business-context";
import { SidebarHeader } from "./SidebarHeader";
import { Navigation } from "./Navigation";
import { BusinessSelector } from "./BusinessSelector";
import { UserProfile } from "./UserProfile";
import { BusinessDialog } from "./BusinessDialog";
import { DeleteBusinessDialog } from "./DeleteBusinessDialog";

interface SidebarContentProps {
    onNavigate?: () => void;
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
    const { refreshBusinesses } = useBusiness();

    const [isBusinessDialogOpen, setIsBusinessDialogOpen] = useState(false);
    const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);

    const handleAddBusiness = () => {
        setEditingBusiness(null);
        setIsBusinessDialogOpen(true);
    };

    const handleEditBusiness = (business: Business) => {
        setEditingBusiness(business);
        setIsBusinessDialogOpen(true);
    };

    const handleDeleteBusiness = (business: Business) => {
        setBusinessToDelete(business);
        setIsDeleteDialogOpen(true);
    };

    const handleBusinessSuccess = async () => {
        await refreshBusinesses();
    };

    const handleDeleteSuccess = async () => {
        setBusinessToDelete(null);
        await refreshBusinesses();
    };

    return (
        <div className="flex h-full flex-col">
            <SidebarHeader onNavigate={onNavigate} />

            <Navigation onNavigate={onNavigate} />

            <BusinessSelector
                onNavigate={onNavigate}
                onAddBusiness={handleAddBusiness}
                onEditBusiness={handleEditBusiness}
                onDeleteBusiness={handleDeleteBusiness}
            />

            <UserProfile onNavigate={onNavigate} />

            <BusinessDialog
                open={isBusinessDialogOpen}
                onOpenChange={setIsBusinessDialogOpen}
                editingBusiness={editingBusiness}
                onSuccess={handleBusinessSuccess}
            />

            <DeleteBusinessDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                business={businessToDelete}
                onSuccess={handleDeleteSuccess}
            />
        </div>
    );
}