import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            // Aggiungo '/dashboard/' per sicurezza, così copriamo tutte le possibilità
            disallow: ['/admin/', '/private/', '/dashboard/'],
        },
        sitemap: 'https://constrassosenzaa.vercel.app/sitemap.xml',
    };
}