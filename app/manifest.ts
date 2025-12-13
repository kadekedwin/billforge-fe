import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'BillForge - Modern Billing & Invoice Management',
        short_name: 'BillForge',
        description: 'Modern billing and invoice management system for businesses. Create, manage, and track invoices efficiently.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    }
}
