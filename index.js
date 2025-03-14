require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// Get environment variables
const TOKEN = process.env.BOT_TOKEN;
const YOUR_ADMIN_ID = process.env.YOUR_ADMIN_ID;
const GROUP_ID = process.env.GROUP_ID;

const WELCOME_MESSAGE_TEXT = `
 **Welcome to our channel!** To join the channel, please answer a few questions.
Click the button below to get started ✅

----------------------------

✨ **مرحباً بك في قناتنا!** ✨

للانضمام إلى القناة، يرجى الإجابة على بعض الأسئلة.
اضغط على الزر أدناه للبدء...
`;

const bot = new TelegramBot(TOKEN, { polling: true });
const userData = {};
const mutedUsers = new Set();

// إنشاء خادم HTTP
const app = express();
app.get('/', (req, res) => {
    res.send('Bot is running!');
});

app.get('/status', (req, res) => {
    res.json({ status: 'active', timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// التعامل مع أعضاء جدد
bot.on('new_chat_members', (msg) => {
    const chatId = msg.chat.id;

    if (chatId.toString() === GROUP_ID) {
        msg.new_chat_members.forEach((user) => {
            const welcomeMessage = ` **مرحباً بك، ${user.first_name}!** \n\nيسعدنا انضمامك إلى مجموعتنا. نأمل أن تستفيد من محتوى المجموعة وتشاركنا بأفكارك!`;

            bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' })
                .catch((e) => {
                    console.error(`خطأ في إرسال رسالة الترحيب: ${e}`);
                });
        });
    }
});

// أوامر المنح والكتم
// ... (بقية الأوامر كما هي)

// بدء الاستبيان
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    userData[chatId] = { q1: null, q2: null, q3: null, q4: null, q5: null, q6: null };

    const keyboard = { inline_keyboard: [[{ text: 'start', callback_data: 'start_questions' }]] };
    bot.sendMessage(chatId, WELCOME_MESSAGE_TEXT, { reply_markup: JSON.stringify(keyboard), parse_mode: 'Markdown' });
});

// معالج الأزرار
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    bot.answerCallbackQuery(query.id);

    if (data === 'start_questions') {
        const keyboard = { inline_keyboard: [[{ text: 'yes', callback_data: 'yes' }, { text: 'no', callback_data: 'no' }]] };
        bot.editMessageText('✅ **هل أنت على استعداد للالتزام بقواعد القناة؟** ✅\n\nAre you prepared to follow the channel guidelines?', { chat_id: chatId, message_id: query.message.message_id, reply_markup: JSON.stringify(keyboard), parse_mode: 'Markdown' });
    } else if (data === 'yes') {
        userData[chatId].q1 = true;
        const keyboard = { inline_keyboard: [[{ text: 'yes', callback_data: 'yes2' }, { text: 'no', callback_data: 'no2' }]] };
        bot.editMessageText('Are you available to actively participate in the channel?\n\n**هل أنت متفرغ للمشاركة الفعالة في القناة؟**', { chat_id: chatId, message_id: query.message.message_id, reply_markup: JSON.stringify(keyboard), parse_mode: 'Markdown' });
    } else if (data === 'no' || data === 'no2') {
        bot.editMessageText('❌ **شكراً لاهتمامك.**', { chat_id: chatId, message_id: query.message.message_id, parse_mode: 'Markdown' });
    } else if (data === 'yes2') {
        userData[chatId].q2 = true;
        bot.editMessageText('**ما هو هدفك من الانضمام إلى هذه القناة؟** (يرجى الرد برسالة نصية)\n\nWhat is your goal for joining this channel? (Please reply with a text message)', { chat_id: chatId, message_id: query.message.message_id, parse_mode: 'Markdown' });
    }
});

// التعامل مع الرسائل النصية
bot.on('message', (msg) => {
    // ... (بقية معالجة الرسائل كما هي)
});

if (!TOKEN) {
    console.error('Error: BOT_TOKEN environment variable is not set.');
} else {
    console.log('Bot is starting...');
}
