import {Separator} from "@/components/ui/separator";
import {
    DribbbleIcon,
    GithubIcon,
    TwitchIcon,
    TwitterIcon,
} from "lucide-react";
import Link from "next/link";
import {Logo} from "@/components/landing/logo";

const footerSections = [
    {
        title: "Contact",
        links: [
            {
                title: "billforgeapp@gmail.com",
                href: "mailto:billforgeapp@gmail.com",
            },
            {
                title: "Whatsapp",
                href: "#",
            },
            {
                title: "Telegram",
                href: "#",
            },
        ],
    },
    {
        title: "Legal",
        links: [
            {
                title: "Terms",
                href: "#",
            },
            {
                title: "Privacy",
                href: "#",
            },
        ],
    },
];

const Footer = () => {
    return (
        <footer className="mt-12 xs:mt-20 dark bg-background border-t">
            <div className="max-w-(--breakpoint-xl) mx-auto py-12 grid grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-10 px-6">
                <div className="col-span-full xl:col-span-2">
                    <Logo color={"white"}/>

                    <p className="mt-4 text-muted-foreground">
                        Streamline your billing process with intelligent invoice management
                    </p>
                </div>

                {footerSections.map(({title, links}) => (
                    <div key={title} className="xl:justify-self-end">
                        <h6 className="font-semibold text-foreground">{title}</h6>
                        <ul className="mt-6 space-y-4">
                            {links.map(({title, href}) => (
                                <li key={title}>
                                    <Link
                                        href={href}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        {title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <Separator/>
            <div className="max-w-(--breakpoint-xl) mx-auto py-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-x-2 gap-y-5 px-6">
                {/* Copyright */}
                <span className="text-muted-foreground text-center xs:text-start">
                    &copy; {new Date().getFullYear()}{" "} <Link href="https://shadcnui-blocks.com" target="_blank"> Billforge</Link>. All rights reserved.
                </span>
                {/*  */}
                <span className="text-muted-foreground text-center xs:text-start">
                    Made with ❤️ in Bali
                </span>
            </div>
        </footer>
    );
};

export default Footer;
