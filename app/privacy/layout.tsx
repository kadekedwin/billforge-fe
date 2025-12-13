import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "BillForge Privacy Policy - Learn how we collect, use, and protect your personal information and business data. GDPR and CCPA compliant.",
    openGraph: {
        title: "Privacy Policy | BillForge",
        description: "Learn how BillForge protects your privacy and handles your data securely.",
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "Privacy Policy | BillForge",
        description: "Learn how BillForge protects your privacy and handles your data securely.",
    },
    alternates: {
        canonical: "/privacy",
    },
};

export default function PrivacyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
