"use client";

import { Button } from "@/components/ui/button";
import { LogoText } from "../../icons/logoText";
import { NavMenu } from "./nav-menu";
import { NavigationSheet } from "./navigation-sheet";
import ThemeToggle from "../theme-toggle";
import { LanguageSelector } from "@/components/language-selector";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";

const Navbar = () => {
    const { t } = useTranslation();
    return (
        <nav className="h-16 bg-background border-b border-accent">
            <div className="h-full flex items-center justify-between max-w-(--breakpoint-xl) mx-auto px-4 sm:px-6">
                <Link href={"/"}>
                    <LogoText />
                </Link>
                ``
                {/* Desktop Menu */}
                <NavMenu className="hidden md:block" />

                <div className="flex items-center gap-3">
                    <LanguageSelector />
                    <ThemeToggle />
                    <Button variant="outline" className="hidden sm:inline-flex">
                        <Link href={"/login"}>{t('landing.nav.signIn')}</Link>
                    </Button>
                    <Button className="hidden xs:inline-flex">{t('landing.nav.getStarted')}</Button>

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <NavigationSheet />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
