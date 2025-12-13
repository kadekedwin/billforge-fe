import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { BusinessProvider } from "@/contexts/business-context";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/contexts/locale-context";
import { structuredData, organizationData } from "@/lib/structured-data";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://billforge.com'),
    title: {
        default: "BillForge - Modern Billing & Invoice Management System",
        template: "%s | BillForge"
    },
    description: "BillForge is a modern, efficient billing and invoice management system for businesses. Create, manage, and track invoices with ease. Streamline your billing process today.",
    keywords: [
        "billing software",
        "invoice management",
        "invoice generator",
        "business billing",
        "invoice tracking",
        "billing system",
        "invoice software",
        "accounting software",
        "business management",
        "invoice creator",
        "billing solution",
        "financial management"
    ],
    authors: [{ name: "BillForge Team" }],
    creator: "BillForge",
    publisher: "BillForge",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "/",
        title: "BillForge - Modern Billing & Invoice Management System",
        description: "BillForge is a modern, efficient billing and invoice management system for businesses. Create, manage, and track invoices with ease.",
        siteName: "BillForge",
        images: [
            {
                url: "/hero-image.png",
                width: 1200,
                height: 630,
                alt: "BillForge - Modern Billing & Invoice Management",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "BillForge - Modern Billing & Invoice Management System",
        description: "BillForge is a modern, efficient billing and invoice management system for businesses. Create, manage, and track invoices with ease.",
        images: ["/hero-image.png"],
        creator: "@billforge",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: "your-google-verification-code",
        yandex: "your-yandex-verification-code",
    },
    alternates: {
        canonical: "/",
    },
    category: "business",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
                <meta name="theme-color" content="#000000" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <link rel="canonical" href={process.env.NEXT_PUBLIC_BASE_URL || 'https://billforge.com'} />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AuthProvider>
                        <BusinessProvider>
                            <LocaleProvider>
                                {children}
                                <Toaster position="top-right" />
                            </LocaleProvider>
                        </BusinessProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
