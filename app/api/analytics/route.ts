import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const token = process.env.VERCEL_TOKEN;
    const projectId = process.env.VERCEL_PROJECT_ID;
    const teamId = process.env.VERCEL_TEAM_ID;

    if (!token || !projectId) {
        return NextResponse.json({ data: [], error: 'Missing configuration' }, { status: 200 });
    }

    try {
        // Ultimi 30 giorni
        const to = new Date().toISOString();
        const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        // Endpoint ufficiale Web Analytics di Vercel (timeseries)
        const params = new URLSearchParams({
            from,
            to,
            unit: 'day',
            environment: 'production',
        });
        if (teamId) params.set('teamId', teamId);

        const endpoint = `https://vercel.com/api/web/analytics/projects/${projectId}/timeseries?${params.toString()}`;

        const response = await fetch(endpoint, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Vercel API Error:', errorText);
            return NextResponse.json({ data: [], error: 'Vercel API Error', details: errorText }, { status: 200 });
        }

        const json = await response.json();
        // Normalizziamo i dati al formato atteso dal client: day, visitors, pageviews
        const normalized = (json?.data ?? []).map((item: any) => ({
            day: item?.date ?? item?.day,
            visitors: item?.visitors ?? item?.uniques ?? 0,
            pageviews: item?.pageviews ?? item?.views ?? 0,
        }));

        return NextResponse.json({ data: normalized });
    } catch (error) {
        console.error('Server Error:', error);
        return NextResponse.json({ data: [], error: 'Internal Server Error' }, { status: 200 });
    }
}
