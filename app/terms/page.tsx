"use client";

import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{t('terms.title')}</h1>
          <p className="text-muted-foreground">{t('terms.lastUpdated')}</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('terms.acceptance.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('terms.acceptance.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('terms.license.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t('terms.license.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t('terms.license.items.modify')}</li>
              <li>{t('terms.license.items.commercial')}</li>
              <li>{t('terms.license.items.decompile')}</li>
              <li>{t('terms.license.items.remove')}</li>
              <li>{t('terms.license.items.transfer')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('terms.account.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t('terms.account.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t('terms.account.items.accurate')}</li>
              <li>{t('terms.account.items.security')}</li>
              <li>{t('terms.account.items.notify')}</li>
              <li>{t('terms.account.items.responsibility')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('terms.subscription.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t('terms.subscription.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t('terms.subscription.items.fees')}</li>
              <li>{t('terms.subscription.items.renewal')}</li>
              <li>{t('terms.subscription.items.pricing')}</li>
              <li>{t('terms.subscription.items.refunds')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('terms.dataPrivacy.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('terms.dataPrivacy.content')}{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                {t('terms.dataPrivacy.link')}
              </Link>
              {" "}{t('terms.dataPrivacy.toUnderstand')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('terms.prohibited.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t('terms.prohibited.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t('terms.prohibited.items.laws')}</li>
              <li>{t('terms.prohibited.items.infringe')}</li>
              <li>{t('terms.prohibited.items.malware')}</li>
              <li>{t('terms.prohibited.items.unauthorized')}</li>
              <li>{t('terms.prohibited.items.harass')}</li>
              <li>{t('terms.prohibited.items.fraud')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('terms.availability.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('terms.availability.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('terms.intellectual.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('terms.intellectual.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('terms.liability.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('terms.liability.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('terms.termination.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('terms.termination.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('terms.changesTerms.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('terms.changesTerms.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('terms.governing.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('terms.governing.content')}
            </p>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <Card>
          <CardHeader>
            <CardTitle>{t('terms.contact.title')}</CardTitle>
            <CardDescription>
              {t('terms.contact.description')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      <Footer />
    </>
  );
}
