"use server";

interface BookingData {
    customer_name: string;
    date: string;
    start_time: string;
    service_name?: string;
}

export async function sendAdminNotification(data: BookingData) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.warn("Telegram credentials not found in env vars");
        return;
    }

    const message = `💅 *Nuova Prenotazione!*
  
👤 *Cliente:* ${data.customer_name}
📅 *Data:* ${data.date}
⏰ *Ora:* ${data.start_time}
💅 *Servizio:* ${data.service_name || "Non specificato"}`;

    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: "Markdown",
            }),
        });

        if (!response.ok) {
            console.error("Failed to send Telegram notification:", await response.text());
        }
    } catch (error) {
        console.error("Error sending Telegram notification:", error);
    }
}
