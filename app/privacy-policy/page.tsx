export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl text-stone-800">
            <h1 className="text-3xl font-serif font-bold text-rose-950 mb-8">Privacy Policy</h1>

            <div className="prose prose-stone max-w-none">
                <p className="mb-4"><strong>Ultimo aggiornamento: 16 Dicembre 2025</strong></p>

                <p>Benvenuto su Con Strass o Senza. La tua privacy è molto importante per noi.</p>

                <h2 className="text-xl font-bold mt-6 mb-3">1. Titolare del Trattamento</h2>
                <p>
                    Il titolare del trattamento dei dati è Sabrina Palermo.<br />
                    Sede: Valguarnera Caropepe (EN), 94019.<br />
                    Email: sabrypalermo00@gmail.com
                </p>

                <h2 className="text-xl font-bold mt-6 mb-3">2. Quali dati raccogliamo</h2>
                <p>Quando prenoti un appuntamento o ci contatti, potremmo raccogliere i seguenti dati:</p>
                <ul className="list-disc pl-5 mb-4">
                    <li>Nome e Cognome</li>
                    <li>Numero di telefono (per conferme appuntamenti WhatsApp)</li>
                    <li>Email (opzionale)</li>
                    <li>Preferenze sui servizi richiesti</li>
                </ul>

                <h2 className="text-xl font-bold mt-6 mb-3">3. Finalità del Trattamento</h2>
                <p>Utilizziamo i tuoi dati esclusivamente per:</p>
                <ul className="list-disc pl-5 mb-4">
                    <li>Gestire le prenotazioni degli appuntamenti.</li>
                    <li>Inviare promemoria o comunicazioni relative al servizio (es. tramite WhatsApp).</li>
                    <li>Rispondere alle tue richieste di informazioni.</li>
                    <li>Adempiere agli obblighi di legge (es. fatturazione).</li>
                </ul>

                <h2 className="text-xl font-bold mt-6 mb-3">4. Condivisione dei Dati</h2>
                <p>
                    I tuoi dati non vengono venduti a terzi. Potrebbero essere trattati da fornitori di servizi tecnici (es. hosting Vercel, database Supabase) che agiscono come responsabili del trattamento e garantiscono standard di sicurezza adeguati.
                </p>

                <h2 className="text-xl font-bold mt-6 mb-3">5. I tuoi diritti</h2>
                <p>
                    In conformità con il GDPR, hai il diritto di chiedere l'accesso, la rettifica, la cancellazione dei tuoi dati o di opporti al loro trattamento. Per esercitare questi diritti, contattaci a <a href="mailto:sabrypalermo00@gmail.com" className="text-rose-600 hover:underline">sabrypalermo00@gmail.com</a>.
                </p>
            </div>
        </div>
    );
}
