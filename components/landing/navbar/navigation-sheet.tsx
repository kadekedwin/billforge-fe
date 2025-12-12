"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { VisuallyHidden as VisuallyHiddenPrimitive } from "@radix-ui/react-visually-hidden";
import { Menu } from "lucide-react";
import { LogoText } from "../../icons/logoText";
import { NavMenu } from "./nav-menu";

import { useTranslation } from "@/lib/i18n/useTranslation";

export const NavigationSheet = () => {
  const { t } = useTranslation();
  return (
    <Sheet>
      <VisuallyHiddenPrimitive>
        <SheetTitle>{t('landing.nav.drawerTitle')}</SheetTitle>
      </VisuallyHiddenPrimitive>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <LogoText />
        <NavMenu orientation="vertical" className="mt-12" />

        <div className="mt-8 space-y-4">
          <Button variant="outline" className="w-full sm:hidden">
            {t('landing.nav.signIn')}
          </Button>
          <Button className="w-full xs:hidden">{t('landing.nav.getStarted')}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
