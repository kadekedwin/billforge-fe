"use client";

import Link from "next/link";
import Image from "next/image";

interface SidebarHeaderProps {
    onNavigate?: () => void;
}

export function SidebarHeader({ onNavigate }: SidebarHeaderProps) {
    return (
        <div className="flex h-16 items-center border-b px-6">
            <Link href="/dashboard" className="flex items-center space-x-2" onClick={onNavigate}>
                <Image src={"/logovector.png"} alt={"logo"} width={32} height={32} />
                <span className="text-xl font-bold">BillForge</span>
            </Link>
        </div>
    );
}