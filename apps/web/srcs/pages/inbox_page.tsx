'use client';

import { useState } from 'react';

import { ActionButton, GallerySection } from '@/srcs/components/inbox_page_components';
import type { ActionKey, GalleryPhoto } from '@/srcs/components/inbox_page_components';

const gradientStyle = {
  backgroundImage:
    'linear-gradient(180deg, #d8daddff 3%, #c0dfffff 16%, #6aa2f0ff 36%, #0155c3ff 90%)',
};

export default function InboxPage() {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const defaultHighlight = 'ring-4 ring-white drop-shadow-[0_0_20px_rgba(255,255,255,0.35)]';
  const [highlightClass, setHighlightClass] = useState(defaultHighlight);
  const [activeAction, setActiveAction] = useState<ActionKey | null>(null);

  const packagesGallery: GalleryPhoto[] = [
    { id: 'pkg-1', src: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', alt: 'Parcel at warehouse' },
    { id: 'pkg-2', src: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80', alt: 'Boxes on trolley' },
    { id: 'pkg-3', src: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80', alt: 'Packages stacked' },
    { id: 'pkg-4', src: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=1200&q=80', alt: 'Courier handling box' },
    { id: 'pkg-5', src: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80', alt: 'Delivery truck' },
    { id: 'pkg-6', src: 'https://images.unsplash.com/photo-1544986581-efac024faf62?auto=format&fit=crop&w=1200&q=80', alt: 'Stacked parcels' },
  ];

  const lettersGallery: GalleryPhoto[] = [
    { id: 'let-1', src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80', alt: 'Envelopes pile' },
    { id: 'let-2', src: 'https://images.unsplash.com/photo-1448932252197-d19750584e56?auto=format&fit=crop&w=1200&q=80', alt: 'Mailbox with letters' },
    { id: 'let-3', src: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80', alt: 'Stamped letters' },
    { id: 'let-4', src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80', alt: 'Letter on table' },
    { id: 'let-5', src: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80', alt: 'Mail on desk' },
    { id: 'let-6', src: 'https://images.unsplash.com/photo-1473181488821-2d23949a045a?auto=format&fit=crop&w=1200&q=80', alt: 'Handwritten letter' },
    { id: 'let-7', src: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=1200&q=80', alt: 'Letter bundle' },
  ];

  const actionStyles = {
    forward: 'ring-4 ring-sky-500 drop-shadow-[0_0_18px_rgba(56,189,248,0.35)]',
    scan: 'ring-4 ring-[#F78D00] drop-shadow-[0_0_18px_rgba(247,141,0,0.35)]',
    discard: 'ring-4 ring-red-500 drop-shadow-[0_0_18px_rgba(239,68,68,0.35)]',
  };

  const activateSelection = (actionKey: ActionKey, style: string) => {
    if (activeAction === actionKey) {
      setSelectionMode(false);
      setSelectedIds(new Set());
      setHighlightClass(defaultHighlight);
      setActiveAction(null);
      return;
    }
    setSelectionMode(true);
    setHighlightClass(style);
    setActiveAction(actionKey);
  };

  const actionButtons = [
    {
      actionKey: 'forward',
      label: '転送',
      ariaLabel: '転送を選択',
      svgClassName: 'h-20 w-14',
      labelSizeClassName: 'text-xs',
    },
    {
      actionKey: 'scan',
      label: 'スキャン',
      ariaLabel: 'スキャンを選択',
      svgClassName: 'h-10 w-14',
      labelSizeClassName: 'text-[11px]',
    },
    {
      actionKey: 'discard',
      label: '破棄',
      ariaLabel: '破棄を選択',
      svgClassName: 'h-10 w-14',
      labelSizeClassName: 'text-xs',
    },
  ] as const;

  return (
    <div className='relative min-h-screen overflow-hidden text-white' style={gradientStyle}>
      <div className='fixed inset-x-0 top-0 z-30'>
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
        <header className='relative left-1/2 right-1/2 w-screen -translate-x-1/2 rounded-none bg-transparent px-6 py-8'>
          <div className='-mt-2 flex flex-wrap items-center justify-between gap-3'>
            <div className='flex items-center gap-6 sm:gap-10 lg:gap-20'>
              {actionButtons.map((action) => (
                <ActionButton
                  key={action.actionKey}
                  actionKey={action.actionKey}
                  label={action.label}
                  ariaLabel={action.ariaLabel}
                  svgClassName={action.svgClassName}
                  labelSizeClassName={action.labelSizeClassName}
                  isActive={activeAction === action.actionKey}
                  onClick={() => activateSelection(action.actionKey, actionStyles[action.actionKey])}
                />
              ))}
            </div>
            <div className='flex items-baseline gap-6 sm:gap-10 lg:gap-20'>
              <span className='text-xs font-yomogi text-black sm:text-xl'>e転居期限: 26.04.09</span>
              <span className='cursor-pointer text-xl font-yomogi text-black transition hover:underline hover:decoration-black hover:decoration-2 hover:underline-offset-4 hover:drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)] sm:text-2xl'>
                大谷 優光
              </span>
            </div>
          </div>
        </header>
      </div>
      <div className='relative mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 pb-12 pt-52'>

        <GallerySection
          title='お荷物'
          photos={packagesGallery}
          gridClassName='grid gap-4 sm:grid-cols-3 lg:grid-cols-4'
          pairWithNextOnSelect
          stackPairs
          selectionMode={selectionMode}
          onSelectionModeChange={setSelectionMode}
          selected={selectedIds}
          onSelectedChange={setSelectedIds}
          selectedHighlightClass={highlightClass}
        />

        <GallerySection
          title='お手紙'
          photos={lettersGallery}
          gridClassName='grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
          selectionMode={selectionMode}
          onSelectionModeChange={setSelectionMode}
          selected={selectedIds}
          onSelectedChange={setSelectedIds}
          selectedHighlightClass={highlightClass}
        />
      </div>
      {selectedIds.size > 0 && (
        <div className='fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-white/10 backdrop-blur py-3 px-4'>
          <div className='mx-auto flex w-full max-w-6xl items-center justify-center gap-6 text-white'>
            <span className='text-sm text-white/85'>
              {selectedIds.size}件選択中
            </span>
            <button
              type='button'
              disabled
              className='rounded-full bg-white px-8 py-2 text-sm font-semibold text-[#0C1B3D] opacity-80 cursor-not-allowed shadow'
            >
              次へ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
