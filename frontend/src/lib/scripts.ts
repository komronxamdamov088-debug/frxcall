import type { Lang } from './i18n';

export interface Script {
  title: string;
  body: string;
  danger?: boolean;
}

const uz: Script[] = [
  { title: 'Salomlashish', body: 'Assalomu alaykum, FRONTIX, operator {ism}. Sizga qanday yordam bera olaman?' },
  {
    title: 'Aniqlashtiruvchi savollar (bittadan so‘rang)',
    body: "1) Ismingiz nima?\n2) Qanday biznesingiz bor (restoran, klinika, o'quv markaz, do'kon, salon)?\n3) Sizga nima kerak (sayt, Telegram bot, CRM, QR-menyu)?\n4) Qachon kerak va qaysi usulda bog'lanish qulay: telefon yoki Telegram?",
  },
  {
    title: 'Qanday xizmatlar bor?',
    body: "Sayt, Telegram bot, QR-menyu, onlayn buyurtma tizimi, CRM va biznes avtomatlashtirish, Click/Payme integratsiya, 1C/CRM bilan API integratsiya, uz/ru/en ko'p tillilik, admin panel.",
  },
  { title: 'Muddat qancha?', body: "Odatda 1–6 hafta, QR-menyu 1–2 hafta. Aniq muddatni menejerimiz loyihani ko'rib aytadi." },
  {
    title: 'Narxi qancha?',
    body: "Standart narxnoma yo'q, narx loyihaga qarab individual baholanadi. Birinchi konsultatsiya bepul. Aniq narxni menejerimiz aytadi.",
  },
  { title: "To'lov qanday?", body: "To'lov bosqichma-bosqich. Foiz nisbatini menejer siz bilan kelishadi." },
  { title: 'Loyihadan keyin yordam bormi?', body: "Ha, texnik qo'llab-quvvatlash bor. Shartlarini menejerimiz tushuntiradi." },
  {
    title: 'FRX mahsulotlari',
    body: "FRX CRM: do'kon va mehmonxona uchun CRM (FRX Do'kon, FRX Hotel). FRX Business / Hotel / MED: tayyorligi va demo menejer orqali. QarzDaftar: qarz daftari ilovasi.",
  },
  { title: 'Bilmagan savol', body: "Aniq javob uchun menejerimiz sizga bog'lanadi. Telefon yoki Telegram raqamingizni tasdiqlab olaman." },
  {
    title: 'Shikoyat',
    body: "Noqulaylik uchun uzr so'raymiz. Ismingiz, telefoningiz, qaysi loyiha yoki mahsulot, nima va qachon bo'lganini ayting; skrinshot yoki havola bo'lsa yuboring. Menejerimiz sizga bog'lanadi. Hech narsa va'da qilmang, darhol menejerga uzating.",
  },
  { title: 'Yakunlash', body: 'Murojaatingiz uchun rahmat. Xayrli kun!' },
  {
    title: "Aloqa ma'lumotlari",
    body: 'Tel: +998 90 816 98 33\nTelegram: @frontix_official\nInstagram: @frontix_uz\nEmail: frontix_uz@gmail.com\nSayt: frontix.uz\nPortal va to‘lov boti: @FRXID_bot\nMurojaatlar boti: @frontix_userMessage_bot',
  },
  {
    title: 'Hech qachon',
    danger: true,
    body: "Narx, chegirma, qaytarish, kafolat muddati yoki deadline aytmang. Natija va'da qilmang, mijozlar misollarini keltirmang. Parol, SMS-kod, karta raqami/CVV so'ramang. Shartnoma, domen va kod egaligi masalasini menejerga uzating.",
  },
];

const ru: Script[] = [
  { title: 'Приветствие', body: 'Ассалому алейкум, FRONTIX, оператор {имя}. Чем могу помочь?' },
  {
    title: 'Уточняющие вопросы (по одному)',
    body: '1) Как вас зовут?\n2) Какой у вас бизнес (ресторан, клиника, учебный центр, магазин, салон)?\n3) Что вам нужно (сайт, Telegram-бот, CRM, QR-меню)?\n4) Когда нужно и как удобнее связаться: телефон или Telegram?',
  },
  {
    title: 'Какие есть услуги?',
    body: 'Сайт, Telegram-бот, QR-меню, система онлайн-заказов, CRM и автоматизация бизнеса, интеграция Click/Payme, API-интеграция с 1C/CRM, многоязычность uz/ru/en, админ-панель.',
  },
  { title: 'Какие сроки?', body: 'Обычно 1–6 недель, QR-меню 1–2 недели. Точный срок назовёт менеджер после знакомства с проектом.' },
  {
    title: 'Сколько стоит?',
    body: 'Стандартного прайса нет, цена оценивается индивидуально по проекту. Первая консультация бесплатна. Точную цену назовёт менеджер.',
  },
  { title: 'Как оплата?', body: 'Оплата поэтапная. Процентное соотношение согласует менеджер.' },
  { title: 'Есть ли поддержка после проекта?', body: 'Да, есть техническая поддержка. Условия объяснит менеджер.' },
  {
    title: 'Продукты FRX',
    body: 'FRX CRM: CRM для магазинов и гостиниц (FRX Do‘kon, FRX Hotel). FRX Business / Hotel / MED: готовность и демо через менеджера. QarzDaftar: приложение долговой книги.',
  },
  { title: 'Вопрос без ответа', body: 'Для точного ответа с вами свяжется наш менеджер. Подтвержу ваш телефон или Telegram.' },
  {
    title: 'Жалоба',
    body: 'Приносим извинения за неудобства. Назовите имя, телефон, проект или продукт, что произошло и когда; пришлите скриншот или ссылку. С вами свяжется менеджер. Ничего не обещайте, сразу передайте менеджеру.',
  },
  { title: 'Завершение', body: 'Спасибо за обращение. Хорошего дня!' },
  {
    title: 'Контакты',
    body: 'Тел: +998 90 816 98 33\nTelegram: @frontix_official\nInstagram: @frontix_uz\nEmail: frontix_uz@gmail.com\nСайт: frontix.uz\nПортал и бот оплаты: @FRXID_bot\nБот обращений: @frontix_userMessage_bot',
  },
  {
    title: 'Никогда',
    danger: true,
    body: 'Не называйте цену, скидку, возврат, гарантийный срок или дедлайн. Не обещайте результат и не приводите примеры клиентов. Не просите пароль, SMS-код, номер карты/CVV. Вопросы договора, домена и владения кодом передавайте менеджеру.',
  },
];

export const scripts: Record<Lang, Script[]> = { uz, ru };
