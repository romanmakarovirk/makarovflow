# Настройка платежей в MakarovFlow

Этот документ описывает, как настроить платежи для Premium подписки.

## 🌟 Telegram Stars (Рекомендуется)

**Telegram Stars** - официальная платёжная система Telegram. Самый простой способ принимать платежи в Mini Apps.

### Преимущества:
- ✅ Нет необходимости в payment provider
- ✅ Моментальная активация
- ✅ Встроенная система Telegram
- ✅ Поддержка подписок
- ✅ Низкая комиссия (30%)

### Настройка:

1. **Включить платежи в боте:**
   - Открыть @BotFather
   - Отправить `/mybots`
   - Выбрать бота @makarovflow_bot
   - Нажать "Bot Settings" → "Payments"
   - Выбрать "Telegram Stars"

2. **Создать invoice в боте:**

   В `bot-server/index.js` добавить обработчик:

   ```javascript
   // Обработчик создания invoice
   bot.on('pre_checkout_query', async (ctx) => {
     await ctx.answerPreCheckoutQuery(true);
   });

   // Обработчик успешного платежа
   bot.on('message:successful_payment', async (ctx) => {
     const userId = ctx.from.id;
     const payload = ctx.message.successful_payment.telegram_payment_charge_id;

     console.log(`✅ Платёж получен от пользователя ${userId}`);
     console.log(`Payload: ${payload}`);

     // Здесь нужно сохранить в базу данных, что пользователь оплатил Premium
     await ctx.reply('🎉 Premium активирован! Спасибо за поддержку!');
   });
   ```

3. **Создать продукт Premium:**

   Добавить в `PremiumModal.jsx`:

   ```javascript
   const handlePaymentStars = async () => {
     const invoice = {
       title: 'MakarovFlow Premium',
       description: 'Месячная подписка на все Premium функции',
       payload: JSON.stringify({
         type: 'premium_monthly',
         userId: webApp.initDataUnsafe.user.id
       }),
       provider_token: '', // Пусто для Stars
       currency: 'XTR',
       prices: [{
         label: 'Premium подписка',
         amount: 99 // 99 Stars
       }]
     };

     // Отправить invoice через бота
     webApp.openInvoice(invoice.url);
   };
   ```

### Цены Telegram Stars:

| Stars | Цена (примерно) |
|-------|-----------------|
| 50    | ~$0.99         |
| 99    | ~$1.99         |
| 150   | ~$2.99         |
| 500   | ~$9.99         |

## 💳 Банковские карты (YooKassa)

**YooKassa** (Юкасса) - популярный payment provider в России.

### Настройка:

1. **Создать аккаунт на YooKassa:**
   - Зайти на https://yookassa.ru
   - Зарегистрироваться как самозанятый/ИП
   - Получить Shop ID и Secret Key

2. **Установить пакет:**
   ```bash
   npm install @a2seven/yoo-checkout
   ```

3. **Добавить в backend:**
   ```javascript
   import YooKassa from '@a2seven/yoo-checkout';

   const checkout = new YooKassa({
     shopId: process.env.YOOKASSA_SHOP_ID,
     secretKey: process.env.YOOKASSA_SECRET_KEY
   });

   // Создать платёж
   const payment = await checkout.createPayment({
     amount: {
       value: '199.00',
       currency: 'RUB'
     },
     payment_method_data: {
       type: 'bank_card'
     },
     confirmation: {
       type: 'redirect',
       return_url: 'https://your-app-url.com/success'
     },
     description: 'MakarovFlow Premium'
   });
   ```

### Комиссия:
- ~3% за банковские карты

## 🏦 СБП (Система Быстрых Платежей)

**СБП** - межбанковская система мгновенных платежей в России.

### Настройка через YooKassa:

```javascript
const payment = await checkout.createPayment({
  amount: {
    value: '199.00',
    currency: 'RUB'
  },
  payment_method_data: {
    type: 'sbp' // Указать СБП
  },
  confirmation: {
    type: 'redirect',
    return_url: 'https://your-app-url.com/success'
  },
  description: 'MakarovFlow Premium'
});
```

### Комиссия:
- ~0.5% (самая низкая)

## 📊 Рекомендуемая последовательность внедрения:

1. **Первый этап:** Telegram Stars
   - Простая настройка
   - Работает сразу
   - Подходит для начала

2. **Второй этап:** Добавить YooKassa
   - Добавить карты и СБП
   - Расширить аудиторию
   - Увеличить конверсию

## 🔐 Безопасность:

- ❌ Никогда не храните токены в коде
- ✅ Используйте переменные окружения
- ✅ Проверяйте подписи Telegram
- ✅ Логируйте все транзакции
- ✅ Используйте webhook для уведомлений

## 📝 TODO для полной настройки:

- [ ] Настроить Telegram Stars в @BotFather
- [ ] Добавить обработчики платежей в бот
- [ ] Создать базу данных для хранения Premium статусов
- [ ] Настроить YooKassa для карт и СБП
- [ ] Добавить webhook для уведомлений о платежах
- [ ] Реализовать автоматическое продление подписки
- [ ] Добавить логирование транзакций

## 🆘 Поддержка:

- Telegram Stars: https://core.telegram.org/bots/payments
- YooKassa API: https://yookassa.ru/developers
- Grammy Payments: https://grammy.dev/plugins/payments.html
