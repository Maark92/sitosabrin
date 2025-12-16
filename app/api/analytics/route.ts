import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const token = process.env.VERCEL_TOKEN;
    const projectId = process.env.VERCEL_PROJECT_ID;

    if (!token || !projectId) {
        return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
    }

    try {
        // Calcola il range di date (ultimi 30 giorni)
        const to = new Date().toISOString();
        const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        // Endpoint Vercel Analytics (TimeSeries)
        // Documentazione ufficiosa/API: utilizziamo l'endpoint che alimenta la dashboard
        const endpoint = `https://vercel.com/api/v1/analytics/stats?projectId=${projectId}&from=${from}&to=${to}&environment=production`;

        // Nota: L'API "stats" di solito ritorna { data: [ { day, visitors, pageviews } ] }
        const response = await fetch(endpoint, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Vercel API Error:', errorText);
            return NextResponse.json({ error: 'Vercel API Error', details: errorText }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
