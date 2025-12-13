import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/(auth)/'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
