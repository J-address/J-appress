'use client';

import { useState } from 'react';

import { PhotoGallery } from '@/srcs/components/photo_gallery';

const gradientStyle = {
  backgroundImage:
    'linear-gradient(135deg, #114CEE 0%, #0F399F 30%, #000000 55%, #F78D00 80%)',
};

export default function InboxPage() {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const defaultHighlight = 'ring-4 ring-white drop-shadow-[0_0_20px_rgba(255,255,255,0.35)]';
  const [highlightClass, setHighlightClass] = useState(defaultHighlight);
  const [activeAction, setActiveAction] = useState<'forward' | 'scan' | 'discard' | null>(null);

  const packagesGallery = [
    { id: 'pkg-1', src: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', alt: 'Parcel at warehouse' },
    { id: 'pkg-2', src: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80', alt: 'Boxes on trolley' },
    { id: 'pkg-3', src: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80', alt: 'Packages stacked' },
    { id: 'pkg-4', src: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=1200&q=80', alt: 'Courier handling box' },
    { id: 'pkg-5', src: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80', alt: 'Delivery truck' },
    { id: 'pkg-6', src: 'https://images.unsplash.com/photo-1544986581-efac024faf62?auto=format&fit=crop&w=1200&q=80', alt: 'Stacked parcels' },
  ];

  const lettersGallery = [
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

  const activateSelection = (actionKey: 'forward' | 'scan' | 'discard', style: string) => {
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

  return (
    <div className='min-h-screen text-white' style={gradientStyle}>
      <div className='mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-12'>
        <header className='rounded-3xl bg-white/10 px-6 py-8 shadow-xl backdrop-blur'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <h1 className='text-3xl font-bold sm:text-4xl'>郵便物</h1>
            <span className='text-base font-semibold text-white/80 sm:text-3xl'>e転居期限: 26.04.09</span>
          </div>
        </header>

        <div className='flex flex-col items-start gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between'>
          <div className='grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3 sm:flex-1'>
            <button
              type='button'
              className={`w-full rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeAction === 'forward'
                  ? 'border border-sky-500/70 bg-sky-600/90 text-white shadow-lg'
                  : 'border border-sky-500/30 bg-sky-500/15 text-white hover:border-sky-500/50 hover:bg-sky-500/25'
              }`}
              onClick={() => activateSelection('forward', actionStyles.forward)}
            >
              転送
            </button>
            <button
              type='button'
              className={`w-full rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeAction === 'scan'
                  ? 'border border-[#F78D00]/60 bg-[#c46c00]/70 text-white shadow-lg'
                  : 'border border-[#F78D00]/30 bg-[#F78D00]/20 text-white hover:border-[#F78D00]/50 hover:bg-[#F78D00]/30'
              }`}
              onClick={() => activateSelection('scan', actionStyles.scan)}
            >
              スキャン
            </button>
            <button
              type='button'
              className={`w-full rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeAction === 'discard'
                  ? 'border border-red-500/70 bg-red-700/70 text-white shadow-lg'
                  : 'border border-red-500/30 bg-red-500/15 text-red-50 hover:border-red-500/50 hover:bg-red-500/25'
              }`}
              onClick={() => activateSelection('discard', actionStyles.discard)}
            >
              廃棄
            </button>
          </div>
          <span className='whitespace-nowrap text-sm font-semibold text-white/85'>Selected: {selectedIds.size}</span>
        </div>

        <PhotoGallery
          title='お荷物'
          photos={packagesGallery}
          gridClassName='grid gap-4 sm:grid-cols-3 lg:grid-cols-4'
          pairWithNextOnSelect
          selectionMode={selectionMode}
          onSelectionModeChange={setSelectionMode}
          selected={selectedIds}
          onSelectedChange={setSelectedIds}
          showSelectedBadge={false}
          selectedHighlightClass={highlightClass}
        />

        <PhotoGallery
          title='お手紙'
          photos={lettersGallery}
          gridClassName='grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
          selectionMode={selectionMode}
          onSelectionModeChange={setSelectionMode}
          selected={selectedIds}
          onSelectedChange={setSelectedIds}
          showSelectedBadge={false}
          selectedHighlightClass={highlightClass}
        />
      </div>
      {selectedIds.size > 0 && (
        <div className='fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-white/10 backdrop-blur py-3 px-4'>
          <div className='mx-auto flex w-full max-w-6xl items-center justify-center gap-6 text-white'>
            <span className='text-sm text-white/85'>
              {selectedIds.size} {selectedIds.size === 1 ? 'photo selected' : 'photos selected'}
            </span>
            <button
              type='button'
              disabled
              className='rounded-full bg-white px-8 py-2 text-sm font-semibold text-[#0C1B3D] opacity-80 cursor-not-allowed shadow'
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
