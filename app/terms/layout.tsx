import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "BillForge Terms of Service - Read our terms and conditions for using our billing and invoice management platform.",
    openGraph: {
        title: "Terms of Service | BillForge",
        description: "Read the terms and conditions for using BillForge billing and invoice management platform.",
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "Terms of Service | BillForge",
        description: "Read the terms and conditions for using BillForge billing and invoice management platform.",
    },
    alternates: {
        canonical: "/terms",
    },
};

export default function TermsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
