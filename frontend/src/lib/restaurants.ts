import type { Lang } from './i18n';

export interface Restaurant {
  name: string;
  kind: Record<Lang, string>;
  desc: Record<Lang, string>;
  where: string;
  source: string;
  url: string;
}

export const restaurants: Restaurant[] = [
  {
    name: 'City 21',
    kind: { uz: 'Panoramali', ru: 'Панорамный' },
    desc: { uz: 'Hilton mehmonxonasidagi kafe-bar, deyarli 80 yillik tarixga ega.', ru: 'Кафе-бар в отеле Hilton, почти 80 лет истории.' },
    where: 'Hilton, Toshkent',
    source: 'Weproject',
    url: 'https://www.weproject.media/en/articles/detail/10-restaurants-in-tashkent-that-locals-actually-choose/?amp=y',
  },
  {
    name: 'Koinot',
    kind: { uz: 'Panoramali', ru: 'Панорамный' },
    desc: { uz: "Toshkent teleminorasidagi restoran, shaharni yuqoridan ko'rsatadi.", ru: 'Ресторан на Ташкентской телебашне с видом на город сверху.' },
    where: 'Toshkent teleminorasi',
    source: 'Afisha.uz',
    url: 'https://www.afisha.uz/uz/restaurants/2025/04/23/restaurants',
  },
  {
    name: 'Khiva Restaurant',
    kind: { uz: "O'zbek", ru: 'Узбекская' },
    desc: { uz: "Hyatt Regency ichidagi o'zbek oshxonasi.", ru: 'Узбекская кухня внутри Hyatt Regency.' },
    where: 'Hyatt Regency',
    source: 'Spotted by Locals',
    url: 'https://www.spottedbylocals.com/tashkent/category/restaurants',
  },
  {
    name: 'Gruzinskiy dvorik',
    kind: { uz: 'Gruzin', ru: 'Грузинская' },
    desc: { uz: 'Toshkentdagi eng eski gruzin restoranlaridan biri.', ru: 'Один из старейших грузинских ресторанов Ташкента.' },
    where: 'Toshkent',
    source: 'Weproject',
    url: 'https://www.weproject.media/en/articles/detail/10-restaurants-in-tashkent-that-locals-actually-choose/?amp=y',
  },
  {
    name: 'KeyTown',
    kind: { uz: 'Koreys', ru: 'Корейская' },
    desc: { uz: 'Mahalliy aholi tavsiya qiladigan koreys oshxonasi.', ru: 'Корейская кухня, которую советуют местные жители.' },
    where: 'Toshkent',
    source: 'Spotted by Locals',
    url: 'https://www.spottedbylocals.com/tashkent/category/restaurants',
  },
  {
    name: 'Forn Lebnen',
    kind: { uz: 'Sharqona', ru: 'Ближневосточная' },
    desc: { uz: 'Livan va Yaqin Sharq taomlari.', ru: 'Ливанская и ближневосточная кухня.' },
    where: 'Toshkent',
    source: 'Spotted by Locals',
    url: 'https://www.spottedbylocals.com/tashkent/category/restaurants',
  },
  {
    name: 'Ovqat Bozori',
    kind: { uz: "O'zbek", ru: 'Узбекская' },
    desc: { uz: "Chorsu bozoridagi arzon o'zbek taomlari.", ru: 'Недорогая узбекская кухня на базаре Чорсу.' },
    where: 'Chorsu bozori',
    source: 'Spotted by Locals',
    url: 'https://www.spottedbylocals.com/tashkent/category/restaurants',
  },
  {
    name: 'City Grill',
    kind: { uz: 'Steyk', ru: 'Стейки' },
    desc: { uz: 'Steyk uchun tavsiya etilgan joy. Manba 2017-yildan, avval tekshirib oling.', ru: 'Рекомендуют для стейков. Источник 2017 года, сначала проверьте.' },
    where: 'Toshkent',
    source: 'Culture Trip',
    url: 'https://theculturetrip.com/asia/uzbekistan/articles/tashkent-s-10-best-restaurants-for-cultural-dining',
  },
];

export const restaurantSites: { name: string; url: string; note: Record<Lang, string> }[] = [
  { name: 'Afisha.uz', url: 'https://www.afisha.uz/uz/restaurants/2026/03/28/milliy', note: { uz: "Milliy va panoramali restoranlar, ish vaqti, telefon", ru: 'Национальные и панорамные рестораны, часы работы, телефон' } },
  { name: 'Yandex Go', url: 'https://openkitchen.eda.yandex/article/places/guides/tashkents-top-20-restaurants-yandex-uzbekistan-launches-the-ultima-guide', note: { uz: 'Toshkentning top-20 restorani, 2026-yil may', ru: 'Топ-20 ресторанов Ташкента, май 2026' } },
  { name: 'Spotted by Locals', url: 'https://www.spottedbylocals.com/tashkent/category/restaurants', note: { uz: 'Mahalliy aholi tavsiyalari', ru: 'Рекомендации местных жителей' } },
  { name: 'Trip.com', url: 'https://www.trip.com/restaurant/tashkent-24680/', note: { uz: 'Sharhlar; reytinglar sahifalar o‘rtasida farq qiladi', ru: 'Отзывы; рейтинги отличаются между страницами' } },
  { name: 'Goldenpages.uz', url: 'https://www.goldenpages.uz/uz/rubrics/?Id=3473', note: { uz: "Manzil va telefon bo'yicha ma'lumotnoma", ru: 'Справочник с адресами и телефонами' } },
  { name: 'top.uz', url: 'https://top.uz/uz/section/restorany?PAGEN_1=55', note: { uz: 'Restoranlar katalogi', ru: 'Каталог ресторанов' } },
];
