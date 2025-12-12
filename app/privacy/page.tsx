"use client";

import { Navbar } from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LogoText } from "@/components/icons/logoText";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: December 8, 2025</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Introduction</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              At BillForge, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our billing and invoice management service. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Personal Information</h3>
                <p className="text-muted-foreground mb-2">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Business information (company name, address, tax ID)</li>
                  <li>Payment information (processed securely through third-party payment processors)</li>
                  <li>Account credentials (username, password)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Business Data</h3>
                <p className="text-muted-foreground mb-2">
                  When you use BillForge, we collect and store:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Customer information you enter</li>
                  <li>Invoice and transaction data</li>
                  <li>Item catalogs and pricing information</li>
                  <li>Tax and discount configurations</li>
                  <li>Business settings and preferences</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Automatically Collected Information</h3>
                <p className="text-muted-foreground mb-2">
                  When you access BillForge, we automatically collect:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Log data (IP address, browser type, operating system)</li>
                  <li>Device information</li>
                  <li>Usage data (pages visited, features used, time spent)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>2. How We Use Your Information</CardTitle>
          </CardHeader><LogoText />
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions and manage your account</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, prevent, and address technical issues and fraudulent activity</li>
              <li>Personalize and improve your experience</li>
              <li>Send you marketing communications (with your consent)</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>3. Information Sharing and Disclosure</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>With service providers who perform services on our behalf</li>
              <li>To comply with legal obligations or respond to legal requests</li>
              <li>To protect the rights, property, and safety of BillForge, our users, or others</li>
              <li>In connection with a merger, sale, or acquisition of all or part of our company</li>
              <li>With your consent or at your direction</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>4. Data Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We implement appropriate technical and organizational measures to protect your information, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Secure data centers with physical security measures</li>
              <li>Regular backups and disaster recovery procedures</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>5. Data Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We retain your information for as long as your account is active or as needed to provide you services. We will retain and use your information as necessary to comply with legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your data by contacting us, subject to certain legal retention requirements.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>6. Your Rights and Choices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You have certain rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Access and receive a copy of your personal information</li>
              <li>Correct or update inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Object to or restrict certain processing of your information</li>
              <li>Export your data in a portable format</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent where we rely on consent to process your information</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              To exercise these rights, please contact us using the information provided at the end of this policy.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>7. Cookies and Tracking Technologies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We use cookies and similar tracking technologies to collect and track information about your use of BillForge. Types of cookies we use include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Essential cookies: Required for the operation of our service</li>
              <li>Preference cookies: Remember your settings and preferences</li>
              <li>Analytics cookies: Help us understand how you use our service</li>
              <li>Marketing cookies: Track your activity to deliver relevant advertisements</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              You can control cookies through your browser settings and other tools. However, disabling certain cookies may limit your ability to use some features of BillForge.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>8. Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              BillForge may contain links to third-party websites and integrates with third-party services. We are not responsible for the privacy practices of these third parties. We encourage you to read the privacy policies of any third-party services you interact with.
            </p>
            <p className="text-muted-foreground">
              Third-party services we may use include payment processors, analytics providers, and cloud infrastructure providers. These services have their own privacy policies governing their use of your information.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>9. Children&apos;s Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              BillForge is not intended for use by children under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18, we will take steps to delete that information.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>10. International Data Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your information may be transferred to and maintained on servers located outside of your country or jurisdiction. By using BillForge, you consent to the transfer of your information to countries that may have different data protection laws than your country of residence.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>11. Changes to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. You are advised to review this Privacy Policy periodically for any changes. Your continued use of BillForge after any modifications indicates your acceptance of the updated Privacy Policy.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>12. California Privacy Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Right to know what personal information is collected, used, shared, or sold</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of the sale of personal information (we do not sell personal information)</li>
              <li>Right to non-discrimination for exercising your privacy rights</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>13. GDPR Rights (European Users)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR):
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Right to access your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure (right to be forgotten)</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Right to lodge a complaint with a supervisory authority</li>
            </ul>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>
              If you have any questions about this Privacy Policy or our data practices, please contact us. We are committed to working with you to obtain a fair resolution of any privacy concerns.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      <Footer />
    </>
  );
}

