import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import Icon from './icons';
import { assetPath } from './assetPath';
import { spartakGroups, spartakVenues } from './content';

export function Collapse({ open, children, className = '', ...props }: HTMLAttributes<HTMLDivElement> & { open: boolean; children: ReactNode }) {
  const [interactive, setInteractive] = useState(false);
  useEffect(() => { setInteractive(true); }, []);
  return <div {...props} className={`collapse ${className}`} data-open={open} aria-hidden={interactive ? !open : undefined} inert={interactive && !open}>
    <div className="collapse-inner">{children}</div>
  </div>;
}

function CoachDetails({ id, children, label = 'Карьера и тренерский опыт' }: { id: string; children: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  return <div className="coach-details" data-open={open}>
    <button type="button" className="coach-details-toggle" id={`${id}-toggle`} aria-expanded={open} aria-controls={id} onClick={() => setOpen(previous => !previous)}>
      {label} <Icon name="plus" size={16}/>
    </button>
    <Collapse open={open} id={id} role="region" aria-labelledby={`${id}-toggle`}><div className="coach-details-content">{children}</div></Collapse>
  </div>;
}


function VenuePhoto({ venue, index, requested, active, base, onReady, onSettled, clubName }: { clubName: string; venue: typeof spartakVenues[number]; index: number; requested: boolean; active: boolean; base: boolean; onReady: (index: number) => void; onSettled: () => void }) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [state, setState] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const [visited, setVisited] = useState(requested);
  useEffect(() => { if (requested) setVisited(true); }, [requested]);
  async function loaded(image: HTMLImageElement) {
    try { await image.decode(); setState('ready'); onReady(index); }
    catch { setState('error'); }
  }
  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete) {
      if (image.naturalWidth) void loaded(image);
      else setState('error');
    }
  }, [attempt, requested, visited]);
  return <>
    {(visited || requested) && <img ref={imageRef} key={attempt} src={venue.image} srcSet={venue.srcSet} sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 1050px) calc(100vw - 64px), (max-width: 1416px) calc(100vw - 96px), 1320px" alt={`${venue.title} ${clubName}, фотография ${index + 1}`} width={venue.width} height={venue.height} loading="lazy" decoding="async" data-state={state} data-active={active} data-base={base} aria-hidden={!active && !requested} onLoad={event => loaded(event.currentTarget)} onError={() => setState('error')} onTransitionEnd={event => { if (event.propertyName === 'opacity' && active) onSettled(); }}/>}
    {requested && state !== 'ready' && <div className="venue-photo-state" role="status">
      <p>{state === 'loading' ? 'Загружаем фотографию…' : 'Не удалось загрузить фотографию.'}</p>
        {state === 'error' && <button className="button button-primary" onClick={event => { event.currentTarget.closest('.venue-gallery')?.querySelector<HTMLButtonElement>('.gallery-controls button')?.focus(); setState('loading'); setAttempt(attempt + 1); }}>Повторить загрузку</button>}
    </div>}
  </>;
}

export function VenueGallery({ photos, clubName }: { photos: typeof spartakVenues; clubName: string }) {
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState<number[]>([]);
  const [shown, setShown] = useState<number | null>(null);
  const [base, setBase] = useState<number | null>(null);
  useEffect(() => {
    if (ready.includes(index) && shown !== index) { setBase(shown); setShown(index); }
  }, [index, ready, shown]);
  const current = photos[index];
  return <div className="venue-gallery">
    <div className="venue-main">{photos.map((venue, i) => <VenuePhoto key={venue.image} venue={venue} clubName={clubName} index={i} requested={index === i} active={shown === i} base={base === i} onReady={loaded => setReady(previous => previous.includes(loaded) ? previous : [...previous, loaded])} onSettled={() => setBase(null)}/>)}</div>
    <div className="venue-footer">
      <div className="venue-overlay"><h3>{current.title}</h3><span aria-live="polite" aria-atomic="true">{String(index + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span></div>
      <div className="venue-thumbnails" role="group" aria-label="Фотографии залов">{photos.map((venue, i) => <button key={venue.image} className={index === i ? 'active' : ''} onClick={() => setIndex(i)} aria-label={`Показать фото ${i + 1}: ${venue.title}`} aria-pressed={index === i}><img src={venue.thumbnail} alt="" width="320" height="213" loading="lazy" decoding="async"/></button>)}</div>
      <div className="gallery-controls"><button className="icon-button" onClick={() => setIndex(previous => (previous - 1 + photos.length) % photos.length)} aria-label="Предыдущая фотография"><Icon name="left" size={20}/></button><button className="icon-button" onClick={() => setIndex(previous => (previous + 1) % photos.length)} aria-label="Следующая фотография"><Icon name="right" size={20}/></button></div>
    </div>
  </div>;
}

export function Schedule({ scheduleGroups, days }: { scheduleGroups: typeof spartakGroups; days: string[] }) {
  const [groupIndex, setGroupIndex] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  function moveTab(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % scheduleGroups.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + scheduleGroups.length) % scheduleGroups.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = scheduleGroups.length - 1;
    else return;
    event.preventDefault(); setGroupIndex(next); refs.current[next]?.focus();
  }
  return <><div className="schedule-tabs" role="tablist" aria-label="Возрастная группа">{scheduleGroups.map((item, i) => <button key={item.id} role="tab" id={`tab-${item.id}`} ref={el => { refs.current[i] = el; }} aria-selected={groupIndex === i} aria-controls={`panel-${item.id}`} tabIndex={groupIndex === i ? 0 : -1} onClick={() => setGroupIndex(i)} onKeyDown={e => moveTab(e, i)}><strong>{item.ages}</strong><span>{item.label}</span></button>)}</div>{scheduleGroups.map((group, i) => <div key={group.id} className="schedule-panel" hidden={groupIndex !== i} id={`panel-${group.id}`} role="tabpanel" aria-labelledby={`tab-${group.id}`} tabIndex={0}><div className="schedule-description"><span className="eyebrow">{group.birthYears}</span><h3>{group.label}</h3><span>Тренировка: {group.duration} минут</span></div><div className="schedule-days">{days.map(day => <div key={day}><span className="day-label">{day}</span><strong>{group.time}</strong><span className="day-venue"><Icon name="location" size={16}/>{group.venue}</span></div>)}</div></div>)}</>;
}

export function MaximCoach({ onEnroll }: { onEnroll: () => void }) {
  return <article className="coach-layout coach-maxim" aria-labelledby="maxim-title">
    <div className="coach-photo-wrap"><img src={assetPath('images/coach-maxim.jpg')} alt="Максим Андреевич Полетаев, тренер ДФК Спартак" width="866" height="1274" loading="lazy"/><span className="coach-license">ЛИЦЕНЗИЯ C–UEFA</span></div>
    <div className="coach-copy"><span className="eyebrow">Тренер</span><h2 id="maxim-title">Максим Андреевич<br/><span>Полетаев</span></h2>
      <div className="coach-facts"><div><span>Образование</span><p>РГСУ</p></div><div><span>Достижения</span><ul className="coach-achievements">
        <li>Чемпион Москвы и МО</li>
        <li>Чемпион международных соревнований в формате 7х7</li>
        <li>Финалист всероссийского турнира Adidas</li>
        <li>Чемпион кубка лфл Москва</li>
        <li>Многократный обладатель индивидуальных наград</li>
      </ul></div></div>
      <button className="text-link" onClick={onEnroll}>Познакомиться на тренировке</button>
    </div>
  </article>;
}

export function ArtemCoach({ onEnroll, clubName }: { onEnroll: () => void; clubName: string }) {
  return <div className="coach-layout coach-artem coach-secondary"><div className="coach-photo-wrap"><img src={assetPath('images/coach-artem-upscaled.jpg')} alt={`Артем Михайлович Трофимов, старший тренер ${clubName}`} width="1046" height="1503" loading="lazy"/><span className="coach-license">ЛИЦЕНЗИЯ C–UEFA</span></div><div className="coach-copy"><span className="eyebrow">Старший тренер</span><h2 id="coach-title">Артем Михайлович<br/><span>Трофимов</span></h2><p className="coach-intro">Профессиональный футбольный опыт.<br/>Внимательный подход к юным игрокам.</p><div className="coach-facts"><div><span>Образование</span><p>Российский государственный университет физической культуры и спорта. Кафедра теории и методики футбола.</p></div><div><span>Достижения</span><p>Победитель Летнего Первенства Москвы 2025. Победитель и призёр всероссийских турниров.</p></div></div><CoachDetails id="artem-career"><h3>Игровая карьера</h3><p>Воспитанник ФК «Химки», победитель зимнего первенства Москвы.</p><ul><li>ФК «Зоркий» (Красногорск)</li><li>ФК «Знамя» (Ногинск)</li></ul><h3>Тренерский опыт</h3><ul><li>Академия FFC</li><li>2024: стажировка в Академии «Спартак» им. Фёдора Черенкова</li><li>Академия «Витязь» Москва</li><li>ДФК «СпортАкадемКлуб»</li></ul><p>Победитель и призёр турниров по 2010 и 2011 г. р. Многократный чемпион и призёр ЛБЛ, МЧЛ, Кубка Офицеров и Winnergy Cup.</p></CoachDetails><button className="text-link" onClick={onEnroll}>Познакомиться на тренировке</button></div></div>;
}

export function CuratorCoach() {
  return <article className="coach-layout coach-curator coach-secondary" aria-labelledby="curator-title">
          <div className="coach-photo-wrap coach-curator-portrait coach-square-portrait"><img src={assetPath('images/coach-curator-upscaled.webp')} alt="Валерий Валерьевич Цимбал, куратор ДФК Спартак" width="1208" height="1302" loading="lazy" decoding="async"/><span className="coach-license">ЛИЦЕНЗИЯ C–UEFA</span></div>
          <div className="coach-copy">
            <span className="eyebrow">Куратор ДФК «Спартак»</span>
            <h2 id="curator-title">Валерий Валерьевич<br/><span>Цимбал</span></h2>
            <p className="coach-intro">Контроль качества тренировочного процесса и соответствия работы стандартам клуба.</p>
            <div className="coach-facts">
              <div><span>Подготовка тренера</span><p>Центр подготовки детско-юношеских тренеров по футболу имени К. И. Бескова.</p></div>
              <div><span>Стаж работы тренером</span><p>6 лет</p></div>
            </div>
            <CoachDetails id="curator-biography" label="Образование и достижения">
              <h3>Образование</h3>
              <ul>
                <li><strong>Московский институт физической культуры и спорта</strong><br/>Факультет физической культуры, 2015–2020.</li>
                <li><strong>ГБОУ СПО Педагогический колледж № 18 «Митино»</strong><br/>Специальность: физическая культура, 2011–2015.</li>
                <li><strong>Центр подготовки детско-юношеских тренеров по футболу имени К. И. Бескова</strong><br/>Тренерская лицензия C–UEFA.</li>
              </ul>
              <h3>Личные достижения</h3>
              <ul>
                <li><strong>2002–2003:</strong> лучший игрок школы ДЮСШ «Зоркий».</li>
                <li><strong>2004, 2005, 2006:</strong> чемпион Московской области по футболу.</li>
                <li><strong>2008:</strong> чемпион Москвы по футболу.</li>
                <li><strong>2011:</strong> победитель спартакиады Московской области по футболу.</li>
                <li><strong>2013:</strong> чемпион Москвы среди ГБОУ СПО по мини-футболу.</li>
                <li><strong>2012, 2013, 2014:</strong> чемпион Кубка К. И. Бескова среди ГБОУ СПО по мини-футболу.</li>
                <li><strong>2015:</strong> серебряный призёр чемпионата России среди ГБОУ СПО по мини-футболу.</li>
                <li><strong>2011:</strong> первый взрослый разряд по футболу.</li>
              </ul>
            </CoachDetails>
          </div>
        </article>;
}
