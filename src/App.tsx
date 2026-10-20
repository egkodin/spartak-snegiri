import { useEffect, useRef, useState } from 'react';
import { ArtemCoach, Collapse, CuratorCoach, Schedule, VenueGallery } from './components';
import { assetPath } from './assetPath';
import Icon from './icons';
import { spartak, spartakFaqs, spartakGroups, spartakPlans, spartakVenues } from './content';

const navigation = [
  { label: 'О клубе', href: '#about' },
  { label: 'Тренеры', href: '#coaches' },
  { label: 'Зал', href: '#venues' },
  { label: 'Расписание', href: '#schedule' },
  { label: 'Стоимость', href: '#pricing' },
  { label: 'Контакты', href: '#contacts' },
];
const price = (value: number) => new Intl.NumberFormat('ru-RU').format(value);
const enrollmentLink = (plan = '') => `${spartak.telegram}?text=${encodeURIComponent(`Здравствуйте! Хочу записать ребёнка на бесплатную пробную тренировку в ДФК «Спартак» в Снегирях.${plan ? ` Интересует: ${plan}.` : ''} Подскажите подходящую группу и время.`)}`;

function Brand({ light = false }: { light?: boolean }) {
  return <a className={`brand ${light ? 'brand-light' : ''}`} href="#home" aria-label="ДФК Спартак Снегири: на главную">
    <img className="brand-crest" src={assetPath('images/spartak-logo.webp')} width="60" height="60" alt=""/>
    <span className="brand-wordmark">СПАРТАК<span className="brand-second">СНЕГИРИ</span><span className="brand-caption">ДЕТСКИЙ ФУТБОЛЬНЫЙ КЛУБ</span></span>
  </a>;
}

export default function SpartakApp() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function close(event: KeyboardEvent) {
      if (event.key === 'Escape') { setMenuOpen(false); menuButtonRef.current?.focus(); }
    }
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [menuOpen]);

  return <>
    <a className="skip-link" href="#main-content">Перейти к содержимому</a><div id="home"/>
    <header className="header"><div className="header-inner container">
      <Brand/><nav className="desktop-nav" aria-label="Основная навигация">{navigation.map(item => <a key={item.href} href={item.href}>{item.label}</a>)}</nav>
      <a className="button button-dark header-cta" href={enrollmentLink()} target="_blank" rel="noopener noreferrer">На пробную</a>
      <button className="menu-button icon-button" ref={menuButtonRef} onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={menuOpen} aria-controls="mobile-nav">{menuOpen ? <Icon name="close"/> : <Icon name="menu"/>}</button>
    </div><Collapse open={menuOpen} className="menu-collapse"><nav id="mobile-nav" className="mobile-nav" aria-label="Мобильная навигация">{navigation.map(item => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}</nav></Collapse></header>

    <main id="main-content">
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero-copy"><span className="eyebrow">ДФК «Спартак» · Снегири</span>
          <h1 id="hero-title"><span className="hero-title-line">Футбол.</span><span className="hero-title-line">Команда.</span><span className="hero-title-line">Спартак.</span></h1>
          <p className="hero-description">Футбол для детей в Снегирях.<br/>От первого паса до игры за свою команду.</p>
          <div className="hero-actions"><a className="button button-primary" href={enrollmentLink()} target="_blank" rel="noopener noreferrer">На бесплатную тренировку</a></div>
          <div className="hero-bottom"><Icon name="location" size={20}/><span>Снегири, ул. Стадионная, 3<br/><strong>Вторник и четверг · с 18:00</strong></span></div>
        </div>
        <div className="hero-visual"><picture><source type="image/webp" srcSet={`${assetPath('images/spartak/hall-2-768.webp')} 768w, ${assetPath('images/spartak/hall-2-1600.webp')} 1600w`} sizes="(max-width: 900px) 100vw, 55vw"/><img className="hero-photo" src={assetPath('images/spartak/hall-2-upscaled.jpg')} alt="Дети играют в футбол с тренером в спортивном зале в Снегирях" width="2560" height="1920" fetchPriority="high"/></picture><div className="hero-photo-shade"/><div className="visual-bottomline"><span>СВОЯ КОМАНДА.</span></div></div>
      </section>

      <section className="about section container" id="about" aria-labelledby="about-title"><div className="section-label">О клубе</div>
        <div className="about-content"><h2 id="about-title">Растём в игре.<br/><span className="outlined-word">Играем за своих.</span></h2><div className="about-text"><p>ДФК «Спартак» в Снегирях: учимся владеть мячом, понимать партнёров и действовать в команде.</p><p className="muted">Две группы по возрасту. Тренировки в зале зимой и на поле с искусственным газоном летом. Игровая практика и участие в турнирах.</p></div></div>
        <div className="values"><article><span className="value-icon"><Icon name="football" size={32}/></span><h3>Начать с удовольствием</h3><p>Базовые навыки и игровые упражнения. Можно прийти без опыта.</p></article><article><span className="value-icon"><Icon name="team" size={32}/></span><h3>Стать частью команды</h3><p>Турниры и возможность приглашения в сборную филиалов ДФК «Спартак».</p></article><article><span className="value-icon"><Icon name="building" size={32}/></span><h3>Тренироваться круглый год</h3><p>Зал, летнее поле, раздевалки и бесплатная парковка.</p></article></div>
      </section>

      <section className="coach-section section" id="coaches" aria-labelledby="coaches-title"><div className="container"><h2 className="section-label coaches-title" id="coaches-title">Тренеры</h2><ArtemCoach onEnroll={() => { window.open(enrollmentLink(), '_blank', 'noopener,noreferrer'); }} clubName="ДФК Спартак"/><CuratorCoach/></div></section>

      <section className="venues-section section container" id="venues" aria-labelledby="venues-title"><div className="section-label">Наш зал</div><div className="section-heading"><h2 id="venues-title">Место, где<br/>начинается игра.</h2><p className="muted">Настоящие фотографии нашего зала.<br/>Снегири, ул. Стадионная, 3.</p></div><VenueGallery photos={spartakVenues} clubName="ДФК Спартак"/></section>

      <section className="schedule-section section" id="schedule" aria-labelledby="schedule-title"><div className="container"><div className="section-label">Расписание</div><div className="section-heading"><h2 id="schedule-title">Два вечера в неделю.<br/>Одна любимая игра.</h2><p className="muted">Вторник и четверг.<br/>Выберите год рождения ребёнка.</p></div><Schedule scheduleGroups={spartakGroups} days={['Вторник', 'Четверг']}/><p className="schedule-note">Перед первым посещением согласуйте группу и время с менеджером.</p></div></section>

      <section className="pricing-section section container" id="pricing" aria-labelledby="pricing-title"><div className="section-label">Стоимость</div><div className="section-heading"><h2 id="pricing-title">Больше игры.<br/>Понятные условия.</h2><p className="muted">8 тренировок в календарный месяц.<br/>Пробная тренировка бесплатно.</p></div><div className="pricing-grid">{spartakPlans.map(plan => <article className="price-card" key={plan.group}><span className="eyebrow">{plan.years}</span><h3>{plan.group}</h3><div className="price-current">{price(plan.price)} <span>₽ / мес.</span></div><ul><li><Icon name="check" size={16}/>8 тренировок по {plan.duration} минут</li><li><Icon name="check" size={16}/>2 занятия в неделю</li><li><Icon name="check" size={16}/>Участие в турнирах</li></ul><a className="button button-dark" href={enrollmentLink(`${plan.group}, 8 тренировок: ${plan.price} ₽`)} target="_blank" rel="noopener noreferrer">Выбрать группу</a></article>)}</div><div className="single-session"><div><span>Без абонемента</span><h3>Разовая тренировка</h3></div><div><strong>950 ₽ <span>/ занятие</span></strong></div><a className="text-link" href={enrollmentLink('Разовая тренировка: 950 ₽')} target="_blank" rel="noopener noreferrer">Записаться</a></div><p className="pricing-note">Количество мест ограничено. Посещение разового занятия согласуйте заранее.</p></section>

      <section className="join-section container" aria-labelledby="join-title"><div className="join-copy"><span className="eyebrow">Первая тренировка бесплатно</span><h2 id="join-title">Красно-белые.<br/><span>С самого детства.</span></h2><p>Приходите познакомиться с тренером и командой.</p><a className="button button-primary" href={enrollmentLink()} target="_blank" rel="noopener noreferrer">Записаться на тренировку</a></div><img className="join-crest" src={assetPath('images/spartak-logo.webp')} width="1254" height="1254" alt="" loading="lazy"/></section>

      <section className="faq section container" aria-labelledby="faq-title"><div><div className="section-label">Перед тренировкой</div><h2 id="faq-title">Что нужно знать<br/>родителям.</h2></div><div className="faq-list">{spartakFaqs.map((item, i) => <article className={`faq-item ${activeFaq === i ? 'is-open' : ''}`} key={item.question}><h3><button id={`faq-question-${i}`} onClick={() => setActiveFaq(activeFaq === i ? null : i)} aria-expanded={activeFaq === i} aria-controls={`faq-answer-${i}`}>{item.question}<Icon name="plus" size={20}/></button></h3><Collapse open={activeFaq === i} id={`faq-answer-${i}`} role="region" aria-labelledby={`faq-question-${i}`}><p>{item.answer}</p></Collapse></article>)}</div></section>

      <section className="contacts-section section" id="contacts" aria-labelledby="contacts-title"><div className="container"><div className="section-label">Контакты</div><div className="contacts-layout"><div><h2 id="contacts-title">Встретимся<br/><span>на тренировке.</span></h2><a className="contact-phone" href={spartak.phoneHref}>{spartak.phone}</a><div className="contact-socials"><a className="button button-dark" href={spartak.telegram} target="_blank" rel="noopener noreferrer">Telegram</a><a className="button button-outline" href={spartak.max} target="_blank" rel="noopener noreferrer">Max</a></div><a className="text-link" href={`mailto:${spartak.email}`}>{spartak.email}</a></div><div className="address-card spartak-address"><img src={assetPath('images/spartak/hall-1-768.webp')} alt="Спортивный зал ДФК Спартак в Снегирях" width="768" height="1024" loading="lazy"/><div className="address-info"><span className="eyebrow">Московская область · Снегири</span><h3>ул. Стадионная, 3</h3><p>Зал зимой · поле летом</p><a className="text-link" href={spartak.map} target="_blank" rel="noopener noreferrer">Открыть в Яндекс Картах <Icon name="up-right" size={16}/></a></div></div></div></div></section>
    </main>

    <footer className="footer"><div className="container"><div className="footer-top"><Brand light/><div className="footer-invitation">Своих <span>поддерживаем.</span></div></div><div className="footer-middle"><p>Детский футбольный клуб<br/>«Спартак» · Снегири</p><nav aria-label="Навигация в подвале">{navigation.map(item => <a key={item.href} href={item.href}>{item.label}</a>)}</nav><div className="footer-contacts"><a href={spartak.phoneHref}>{spartak.phone}</a><span>{spartak.address}</span><a href={spartak.vk} target="_blank" rel="noopener noreferrer">ВКонтакте</a></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} ДФК «Спартак» · Снегири</span><a href="https://icons8.com" target="_blank" rel="noopener noreferrer">Иконки Icons8</a></div></div></footer>
  </>;
}
