'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import DecorativeBirds from '@/srcs/components/decorative_birds';
import { getSelectedItemCount, lettersGallery, packagesGallery } from '@/srcs/data/inbox_photos';

const gradientStyle = {
  backgroundImage:
    'linear-gradient(180deg, #d8daddff 3%, #c0dfffff 16%, #6aa2f0ff 36%, #0155c3ff 90%)',
};

export default function DiscardPage() {
  const searchParams = useSearchParams();
  const rawIds = searchParams.get('ids') ?? '';
  const selectedIds = rawIds
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  const displayCount = getSelectedItemCount(selectedIds);
  const selectedIdSet = new Set(selectedIds);
  const selectedLetters = lettersGallery.filter((photo) => selectedIdSet.has(photo.id));
  const packagePairs = packagesGallery.reduce(
    (acc, photo, index) => {
      const pairIndex = Math.floor(index / 2);
      if (!acc[pairIndex]) acc[pairIndex] = [];
      if (selectedIdSet.has(photo.id)) acc[pairIndex].push(photo);
      return acc;
    },
    {} as Record<number, typeof packagesGallery>,
  );
  const selectedPackagePairs = Object.values(packagePairs).filter((pair) => pair.length > 0);
  const hasSelectedPhotos = selectedPackagePairs.length > 0 || selectedLetters.length > 0;

  return (
    <div className='relative min-h-screen overflow-hidden px-6 pt-52 pb-12 text-white' style={gradientStyle}>
      <div className='pointer-events-none absolute inset-x-0 top-0'>
        <svg
          className='h-60 w-full opacity-100'
          viewBox='0 0 1440 290'
          preserveAspectRatio='none'
          aria-hidden='true'
        >
          <path
            d='M0,200 C180,150 360,130 540,150 C720,180 900,230 1080,210 C1260,190 1350,150 1440,120 L1440,0 L0,0 Z'
            fill='#e6eaef'
          />
        </svg>
      </div>
      <DecorativeBirds />
      <div className='relative mx-auto flex w-full max-w-3xl flex-col gap-8 rounded-3xl border border-white/15 bg-white/10 p-10 shadow-2xl backdrop-blur'>
        <div className='space-y-3'>
          <h1 className='text-3xl font-semibold'>破棄の確認</h1>
          <p className='text-sm text-white/80'>選択した写真の破棄を進めます。</p>
        </div>
        <div className='rounded-2xl border border-white/10 bg-white/10 p-6 text-center'>
          <div className='text-sm text-white/70'>選択中</div>
          <div className='mt-2 text-4xl font-semibold'>{displayCount}件</div>
        </div>
        <div className='rounded-2xl border border-white/10 bg-white/10 p-5'>
          <div className='text-sm font-semibold text-white/80'>選択した写真</div>
          {hasSelectedPhotos ? (
            <div className='mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4'>
              {selectedPackagePairs.map((pair, index) => (
                <div
                  key={`pair-${index}`}
                  className='relative aspect-[4/3] overflow-visible rounded-lg'
                >
                  {pair.length > 1 && (
                    <div
                      className='absolute rounded-lg border border-white/10 bg-white/5 shadow'
                      style={{
                        right: 0,
                        bottom: 0,
                        width: 'calc(100% - 12px)',
                        height: 'calc(100% - 12px)',
                      }}
                    >
                      <img
                        src={pair[1].src}
                        alt={pair[1].alt}
                        className='h-full w-full rounded-lg object-cover opacity-90'
                      />
                    </div>
                  )}
                  <div
                    className='absolute left-0 top-0 z-10 overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow'
                    style={{ width: 'calc(100% - 12px)', height: 'calc(100% - 12px)' }}
                  >
                    <img
                      src={pair[0].src}
                      alt={pair[0].alt}
                      className='h-full w-full object-cover'
                    />
                  </div>
                  <div className='absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent' />
                </div>
              ))}
              {selectedLetters.map((photo) => (
                <div
                  key={photo.id}
                  className='relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow'
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className='h-full w-full object-cover'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent' />
                </div>
              ))}
            </div>
          ) : (
            <div className='mt-3 text-xs text-white/60'>選択された写真がありません。</div>
          )}
        </div>
        <div className='flex flex-wrap gap-4'>
          <Link
            href='/inbox'
            className='rounded-full bg-white/15 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/25'
          >
            戻る
          </Link>
          <button
            type='button'
            className='rounded-full bg-black px-8 py-3 text-sm font-semibold text-white transition hover:bg-black/85'
          >
            破棄を確定
          </button>
        </div>
      </div>
    </div>
  );
}
