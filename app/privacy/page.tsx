"use client";

import { Navbar } from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{t('privacy.title')}</h1>
          <p className="text-muted-foreground">{t('privacy.lastUpdated')}</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('privacy.intro.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('privacy.intro.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('privacy.infoCollect.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{t('privacy.infoCollect.personal.title')}</h3>
                <p className="text-muted-foreground mb-2">
                  {t('privacy.infoCollect.personal.intro')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>{t('privacy.infoCollect.personal.items.contact')}</li>
                  <li>{t('privacy.infoCollect.personal.items.business')}</li>
                  <li>{t('privacy.infoCollect.personal.items.payment')}</li>
                  <li>{t('privacy.infoCollect.personal.items.credentials')}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('privacy.infoCollect.businessData.title')}</h3>
                <p className="text-muted-foreground mb-2">
                  {t('privacy.infoCollect.businessData.intro')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>{t('privacy.infoCollect.businessData.items.customers')}</li>
                  <li>{t('privacy.infoCollect.businessData.items.invoices')}</li>
                  <li>{t('privacy.infoCollect.businessData.items.items')}</li>
                  <li>{t('privacy.infoCollect.businessData.items.tax')}</li>
                  <li>{t('privacy.infoCollect.businessData.items.settings')}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('privacy.infoCollect.auto.title')}</h3>
                <p className="text-muted-foreground mb-2">
                  {t('privacy.infoCollect.auto.intro')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>{t('privacy.infoCollect.auto.items.log')}</li>
                  <li>{t('privacy.infoCollect.auto.items.device')}</li>
                  <li>{t('privacy.infoCollect.auto.items.usage')}</li>
                  <li>{t('privacy.infoCollect.auto.items.cookies')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('privacy.howWeUse.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t('privacy.howWeUse.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t('privacy.howWeUse.items.provide')}</li>
              <li>{t('privacy.howWeUse.items.process')}</li>
              <li>{t('privacy.howWeUse.items.send')}</li>
              <li>{t('privacy.howWeUse.items.respond')}</li>
              <li>{t('privacy.howWeUse.items.monitor')}</li>
              <li>{t('privacy.howWeUse.items.detect')}</li>
              <li>{t('privacy.howWeUse.items.personalize')}</li>
              <li>{t('privacy.howWeUse.items.marketing')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('privacy.sharing.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t('privacy.sharing.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t('privacy.sharing.items.providers')}</li>
              <li>{t('privacy.sharing.items.legal')}</li>
              <li>{t('privacy.sharing.items.protect')}</li>
              <li>{t('privacy.sharing.items.merger')}</li>
              <li>{t('privacy.sharing.items.consent')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('privacy.security.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t('privacy.security.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t('privacy.security.items.encryption')}</li>
              <li>{t('privacy.security.items.assessments')}</li>
              <li>{t('privacy.security.items.access')}</li>
              <li>{t('privacy.security.items.datacenters')}</li>
              <li>{t('privacy.security.items.backups')}</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              {t('privacy.security.disclaimer')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('privacy.retention.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('privacy.retention.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('privacy.rights.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t('privacy.rights.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t('privacy.rights.items.access')}</li>
              <li>{t('privacy.rights.items.correct')}</li>
              <li>{t('privacy.rights.items.delete')}</li>
              <li>{t('privacy.rights.items.object')}</li>
              <li>{t('privacy.rights.items.export')}</li>
              <li>{t('privacy.rights.items.optout')}</li>
              <li>{t('privacy.rights.items.withdraw')}</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              {t('privacy.rights.exercise')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('privacy.cookies.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t('privacy.cookies.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t('privacy.cookies.items.essential')}</li>
              <li>{t('privacy.cookies.items.preference')}</li>
              <li>{t('privacy.cookies.items.analytics')}</li>
              <li>{t('privacy.cookies.items.marketing')}</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              {t('privacy.cookies.control')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('privacy.thirdParty.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t('privacy.thirdParty.intro')}
            </p>
            <p className="text-muted-foreground">
              {t('privacy.thirdParty.services')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('privacy.children.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('privacy.children.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('privacy.international.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('privacy.international.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('privacy.changes.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('privacy.changes.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('privacy.california.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t('privacy.california.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t('privacy.california.items.know')}</li>
              <li>{t('privacy.california.items.delete')}</li>
              <li>{t('privacy.california.items.optout')}</li>
              <li>{t('privacy.california.items.nondiscrimination')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('privacy.gdpr.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t('privacy.gdpr.intro')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t('privacy.gdpr.items.access')}</li>
              <li>{t('privacy.gdpr.items.rectification')}</li>
              <li>{t('privacy.gdpr.items.erasure')}</li>
              <li>{t('privacy.gdpr.items.restrict')}</li>
              <li>{t('privacy.gdpr.items.portability')}</li>
              <li>{t('privacy.gdpr.items.object')}</li>
              <li>{t('privacy.gdpr.items.complaint')}</li>
            </ul>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <Card>
          <CardHeader>
            <CardTitle>{t('privacy.contact.title')}</CardTitle>
            <CardDescription>
              {t('privacy.contact.description')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      <Footer />
    </>
  );
}
