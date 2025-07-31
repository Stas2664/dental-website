// Vercel API для отправки заявок в Telegram группу
export default async function handler(req, res) {
    // CORS заголовки
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Обработка preflight запроса
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Только POST запросы
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { name, age, phone: rawPhone, complaints } = req.body;
        
        // Очищаем телефон от возможных артефактов
        const phone = rawPhone.trim();

        // Проверяем обязательные поля
        if (!name || !phone || !complaints) {
            return res.status(400).json({ error: 'Отсутствуют обязательные поля' });
        }

        // Данные Telegram группы
        const BOT_TOKEN = '7535946322:AAGpiSvEsyBWama9QC-ydaRAF7Y94yutoc8';
        const CHAT_ID = '-4867519462'; // Chat ID новой группы "Заявки Стоматолог"

        // Формируем красивое сообщение для группы
        const message = `🦷 *НОВАЯ ЗАЯВКА С САЙТА СТОМАТОЛОГА*

👤 *Пациент:* ${name}
🎂 *Возраст:* ${age} лет
📞 *Телефон:* ${phone}
🩺 *Жалобы:* ${complaints}

⏰ *Дата/время:* ${new Date().toLocaleString('ru-RU', {
            timeZone: 'Europe/Moscow',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })}

📱 *Источник:* Официальный сайт
🔔 *Статус:* Требует обработки

═══════════════════════
💬 Свяжитесь с пациентом для записи на прием`;

        // Отправляем в Telegram
        const telegramResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const telegramData = await telegramResponse.json();

        if (telegramResponse.ok) {
            console.log('✅ Сообщение отправлено в Telegram:', telegramData);
            return res.status(200).json({ 
                success: true, 
                message: 'Заявка успешно отправлена!' 
            });
        } else {
            console.error('❌ Ошибка Telegram API:', telegramData);
            return res.status(500).json({ 
                error: 'Ошибка отправки в Telegram', 
                details: telegramData 
            });
        }

    } catch (error) {
        console.error('❌ Серверная ошибка:', error);
        return res.status(500).json({ 
            error: 'Внутренняя ошибка сервера', 
            details: error.message 
        });
    }
}
