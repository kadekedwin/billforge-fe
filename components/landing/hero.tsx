"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";

const Hero = () => {
    const { t } = useTranslation();

    return (
        <div
            className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center overflow-hidden border-b border-accent">
            <div
                className="max-w-(--breakpoint-xl) w-full flex flex-col lg:flex-row mx-auto items-center justify-between gap-y-14 gap-x-10 px-6 py-12 lg:py-0">
                <div className="max-w-xl">
                    <h1 className="mt-6 max-w-[20ch] text-3xl xs:text-4xl sm:text-5xl lg:text-[2.75rem] xl:text-5xl font-bold leading-[1.2]! tracking-tight">
                        {t('landing.hero.title')}
                    </h1>
                    <p className="mt-6 max-w-[60ch] xs:text-lg text-muted-foreground">
                        {t('landing.hero.description')}
                    </p>
                    <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
                        <Button
                            size="lg"
                            className="w-full sm:w-auto rounded-full text-base"
                        >
                            <Link href={"/login"} className="flex items-center space-x-3">{t('landing.hero.cta')} <ArrowUpRight
                                className="h-5! w-5!" /></Link>
                        </Button>
                    </div>
                </div>
                <div className="relative lg:max-w-lg xl:max-w-xl w-full rounded-xl aspect-square">
                    <Image
                        src="/hero-image.png"
                        fill
                        alt={t('landing.hero.title')}
                        className="object-contain rounded-xl"
                    />
                </div>

            </div>
        </div>
    );
};

export default Hero;
