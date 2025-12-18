import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Con Strass o Senza',
        short_name: 'Con Strass',
        description: 'Nail Art e Manicure a Valguarnera',
        start_url: '/',
        display: 'standalone',
        background_color: '#fff1f2', // rose-50
        theme_color: '#fff1f2',
        icons: [
            {
                src: '/logo.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
