"use client";

import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { LogoText } from "@/components/icons/logoText";

const footerSections = [
    {
        key: 'contact',
        links: [
            {
                key: 'email',
                href: "mailto:billforgeapp@gmail.com",
            },
            {
                key: 'whatsapp',
                href: "#",
            },
            {
                key: 'telegram',
                href: "#",
            },
        ],
    },
    {
        key: 'legal',
        links: [
            {
                key: 'terms',
                href: "/terms",
            },
            {
                key: 'privacy',
                href: "/privacy",
            },
        ],
    },
];

import { useTranslation } from "@/lib/i18n/useTranslation";

const Footer = () => {
    const { t } = useTranslation();

    const getLinkTitle = (key: string) => {
        switch (key) {
            case 'email': return "billforgeapp@gmail.com";
            case 'whatsapp': return "Whatsapp";
            case 'telegram': return "Telegram";
            case 'terms': return t('landing.footer.links.terms');
            case 'privacy': return t('landing.footer.links.privacy');
            default: return key;
        }
    };

    return (
        <footer id="footer" className="mt-12 xs:mt-20 dark bg-background border-t">
            <div className="max-w-(--breakpoint-xl) mx-auto py-12 grid grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-10 px-6">
                <div className="col-span-full xl:col-span-2">
                    <LogoText color={"white"} />

                    <p className="mt-4 text-muted-foreground">
                        {t('landing.footer.description')}
                    </p>
                </div>

                {footerSections.map(({ key, links }) => (
                    <div key={key} className="xl:justify-self-end">
                        <h6 className="font-semibold text-foreground">{t(`landing.footer.${key}`)}</h6>
                        <ul className="mt-6 space-y-4">
                            {links.map(({ key: linkKey, href }) => (
                                <li key={linkKey}>
                                    <Link
                                        href={href}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        {key === 'contact' ? (
                                            linkKey === 'email' ? 'billforgeapp@gmail.com' :
                                                linkKey === 'whatsapp' ? 'Whatsapp' : 'Telegram'
                                        ) : (
                                            linkKey === 'terms' ? t('landing.footer.legalLinks.terms') : t('landing.footer.legalLinks.privacy')
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <Separator />
            <div className="max-w-(--breakpoint-xl) mx-auto py-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-x-2 gap-y-5 px-6">
                {/* Copyright */}
                <span className="text-muted-foreground text-center xs:text-start">
                    {t('landing.footer.copyright')}
                </span>
                {/*  */}
                <span className="text-muted-foreground text-center xs:text-start">
                    {t('landing.footer.madeWith')}
                </span>
            </div>
        </footer>
    );
};

export default Footer;
