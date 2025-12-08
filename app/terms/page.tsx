"use client";

import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: December 8, 2025</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              By accessing and using BillForge, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>2. Use License</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Permission is granted to temporarily access and use BillForge for personal and commercial purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose without proper subscription</li>
              <li>Attempt to decompile or reverse engineer any software contained on BillForge</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or mirror the materials on any other server</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>3. User Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              To use certain features of BillForge, you must register for an account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain the security of your password and account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>4. Subscription and Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              BillForge offers various subscription plans. By subscribing, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Pay all fees associated with your chosen subscription plan</li>
              <li>Automatic renewal of your subscription unless cancelled</li>
              <li>Possible changes in pricing with 30 days advance notice</li>
              <li>No refunds for partial months or unused services</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>5. Data and Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your use of BillForge is also governed by our Privacy Policy. Please review our{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              {" "}to understand our practices.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>6. Prohibited Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You may not use BillForge to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Violate any laws or regulations</li>
              <li>Infringe upon intellectual property rights</li>
              <li>Transmit viruses, malware, or other malicious code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Use the service for fraudulent purposes</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>7. Service Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We strive to maintain high availability of BillForge, but we do not guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue any part of the service with or without notice. We are not liable for any modification, suspension, or discontinuance of the service.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>8. Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              All content included on BillForge, such as text, graphics, logos, images, and software, is the property of BillForge or its content suppliers and is protected by international copyright laws. The compilation of all content on this site is the exclusive property of BillForge.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>9. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              In no event shall BillForge or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use BillForge, even if BillForge or a BillForge authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>10. Termination</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may terminate or suspend your account and access to BillForge immediately, without prior notice or liability, for any reason, including if you breach these Terms of Service. Upon termination, your right to use the service will immediately cease.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>11. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms of Service on this page and updating the &quot;Last updated&quot; date. Your continued use of BillForge after such modifications constitutes your acknowledgment and acceptance of the modified terms.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>12. Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              These terms shall be governed and construed in accordance with applicable laws, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these terms will not be considered a waiver of those rights.
            </p>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>
              If you have any questions about these Terms of Service, please contact us.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      <Footer />
    </>
  );
}

