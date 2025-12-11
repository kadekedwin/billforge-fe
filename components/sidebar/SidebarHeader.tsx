"use client";

import Link from "next/link";
import { LogoText } from "@/components/icons/logoText";

interface SidebarHeaderProps {
    onNavigate?: () => void;
}

export function SidebarHeader({ onNavigate }: SidebarHeaderProps) {
    return (
        <div className="flex h-16 items-center border-b px-6">
            <Link href="/sale" className="flex items-center space-x-2" onClick={onNavigate}>
                <LogoText />
            </Link>
        </div>
    );
}