'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Card = { title: string; href?: string };

const gradientStyle = {
  backgroundImage:
    'linear-gradient(135deg, #114CEE 0%, #0F399F 30%, #000000 55%, #F78D00 80%)',
};

const cards: Card[] = [
  { title: 'Profile' },
  { title: '郵便物', href: '/inbox' },
  { title: 'Shipment request' },
  { title: 'Settings' },
  { title: 'Price list' },
  { title: 'FAQ' },
  { title: 'Contact us', href: '/contact' },
];

export default function MainPage() {
  const actionCardClass =
    'rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:-translate-y-[2px] hover:bg-white/10';
  const [jstTime, setJstTime] = useState('');
  const router = useRouter();
  const handleCardClick = (href?: string) => {
    if (href) router.push(href);
  };

  const calendar = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weeks: Array<Array<number | null>> = [];
    let currentDay = 1 - firstDay;
    while (currentDay <= daysInMonth) {
      const week: Array<number | null> = [];
      for (let i = 0; i < 7; i += 1) {
        week.push(currentDay > 0 && currentDay <= daysInMonth ? currentDay : null);
        currentDay += 1;
      }
      weeks.push(week);
    }
    const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return { weeks, monthLabel, today: now.getDate() };
  }, []);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Tokyo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const update = () => setJstTime(formatter.format(new Date()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className='min-h-screen' style={gradientStyle}>
      <div className='mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10 text-white'>
        <header className='flex flex-col gap-4 rounded-3xl bg-white/10 p-8 shadow-xl backdrop-blur'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div>
              <p className='text-sm uppercase tracking-[0.2em] text-white/70'>Welcome back</p>
              <h1 className='text-3xl font-bold sm:text-4xl'>Kiki</h1>
              <p className='mt-2 max-w-2xl text-base text-white/80'>
              </p>
            </div>
          </div>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {cards.map((card) => (
              <button
                key={card.title}
                type='button'
                className={actionCardClass}
                onClick={() => handleCardClick(card.href)}
              >
                <p className='text-xs uppercase tracking-widest text-white/60'>{card.title}</p>
              </button>
            ))}
          </div>
        </header>

        <section className='grid gap-6 lg:grid-cols-3'>
          <div className='rounded-3xl bg-white p-6 text-[#0C1B3D] shadow-2xl lg:col-span-2'>
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <div>
                <h2 className='text-2xl font-bold text-[#0C1B3D]'>News</h2>
              </div>
            </div>
            <div className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            </div>
          </div>
            <div className='rounded-2xl border border-white/15 bg-white/5 p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-lg font-semibold'>{calendar.monthLabel}</p>
                </div>
              </div>
              <div className='mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-white/80'>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className='mt-2 grid grid-cols-7 gap-1 text-center text-sm font-medium'>
                {calendar.weeks.map((week, wIdx) =>
                  week.map((day, dIdx) => {
                    const isToday = day === calendar.today;
                    return (
                      <div
                        key={`${wIdx}-${dIdx}`}
                        className={`flex h-9 items-center justify-center rounded-md ${
                          day
                            ? isToday
                              ? 'bg-white text-[#0C1B3D] font-bold'
                              : 'bg-white/10 text-white'
                            : ''
                        }`}
                      >
                        {day ?? ''}
                      </div>
                    );
                  }),
                )}
              </div>
              <div className='mt-8 space-y-2'>
                <p className='text-sm text-white/80'>Current time in Japan</p>
                <p className='text-2xl font-semibold text-white/80'>{jstTime || '—'}</p>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
}
