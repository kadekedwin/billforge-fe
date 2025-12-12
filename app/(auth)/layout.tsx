import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - BillForge",
  description: "Sign in or create an account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}

