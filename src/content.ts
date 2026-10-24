import { assetPath } from './assetPath';

export const spartak = {
  name: 'ДФК «Спартак» · Снегири',
  phone: '+7 (906) 751-42-67',
  phoneHref: 'tel:+79067514267',
  venue: 'Снегирек',
  address: 'Октябрьская ул., 41, п. г. т. Снегири',
  telegram: 'https://t.me/cfcspartak',
  max: 'https://max.ru/u/f9LHodD0cOIvygwQQB-dgxmv_h8wWH4ObiAUyDSUW6xf31qEXgRWEG5_V64',
  vk: 'https://vk.ru/cfc_spartak',
  email: 'info@cfcspartak.ru',
  map: 'https://yandex.ru/maps/org/snegirek/45210896054?si=0f63ev4bvvg42exe41krpzaru0',
};

export const spartakGroups = [
  { id: 'junior', label: 'Младшая группа', ages: '2018–2023', birthYears: '2018–2023 г. р.', time: '18:00–19:00', venue: 'Снегири', duration: 60 },
  { id: 'senior', label: 'Старшая группа', ages: '2014–2017', birthYears: '2014–2017 г. р.', time: '19:00–20:30', venue: 'Снегири', duration: 90 },
];

export const spartakPlans = [
  { group: 'Младшая группа', years: '2018–2023 г. р.', price: 5180, duration: 60 },
  { group: 'Старшая группа', years: '2014–2017 г. р.', price: 5900, duration: 90 },
];

export const spartakVenues = [1, 2, 3, 4, 5].map(id => ({
  id,
  title: id === 2 ? 'Тренировка в Снегирях' : 'Спортивный зал в Снегирях',
  label: 'Зал',
  width: id === 2 ? 2560 : 1920,
  height: id === 2 ? 1920 : 2560,
  image: assetPath(`images/spartak/hall-${id}-1600.webp`),
  srcSet: `${assetPath(`images/spartak/hall-${id}-768.webp`)} 768w, ${assetPath(`images/spartak/hall-${id}-1600.webp`)} 1600w`,
  thumbnail: assetPath(`images/spartak/hall-${id}-thumb.webp`),
}));

export const spartakFaqs = [
  { question: 'Как выбрать группу?', answer: 'Младшая группа: дети 2018–2023 года рождения. Старшая: 2014–2017 года рождения. Перед первым занятием менеджер поможет выбрать группу по возрасту и подготовке ребёнка.' },
  { question: 'Где проходят тренировки?', answer: `В «${spartak.venue}»: ${spartak.address}. Зимой занимаемся в спортивном зале, летом на поле с искусственным газоном. Есть раздевалки и бесплатная парковка.` },
  { question: 'Можно прийти без опыта?', answer: 'Да. Базовая программа подходит детям, которые знакомятся с футболом и осваивают первые навыки. На бесплатной тренировке познакомитесь с тренером и попробуете занятия.' },
  { question: 'Как записаться?', answer: 'Напишите менеджеру в Telegram или Max либо позвоните по номеру +7 (906) 751-42-67. Перед посещением нужно согласовать время: количество мест в группе ограничено.' },
];
