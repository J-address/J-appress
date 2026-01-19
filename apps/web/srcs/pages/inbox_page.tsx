'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { ActionButton, GallerySection } from '@/srcs/components/inbox_page_components';
import type { ActionKey } from '@/srcs/components/inbox_page_components';
import {
  getSelectedItemCount,
  lettersGallery as lettersGalleryData,
  packagesGallery as packagesGalleryData,
} from '@/srcs/data/inbox_photos';

const gradientStyle = {
  backgroundImage:
    'linear-gradient(180deg, #d8daddff 3%, #c0dfffff 16%, #6aa2f0ff 36%, #0155c3ff 90%)',
};

export default function InboxPage() {
  const router = useRouter();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const defaultHighlight = 'ring-4 ring-white drop-shadow-[0_0_20px_rgba(255,255,255,0.35)]';
  const [highlightClass, setHighlightClass] = useState(defaultHighlight);
  const [activeAction, setActiveAction] = useState<ActionKey | null>(null);

  const packagesGallery = packagesGalleryData;
  const lettersGallery = lettersGalleryData;

  const actionStyles = {
    forward: 'ring-4 ring-sky-500 drop-shadow-[0_0_18px_rgba(56,189,248,0.35)]',
    scan: 'ring-4 ring-[#F78D00] drop-shadow-[0_0_18px_rgba(247,141,0,0.35)]',
    discard: 'ring-4 ring-[#000000] drop-shadow-[0_0_18px_rgba(0,0,0,0.35)]',
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

  const selectedIdList = Array.from(selectedIds);
  const selectedItemCount = getSelectedItemCount(selectedIdList);

  const handleNextClick = () => {
    if (activeAction !== 'discard' || selectedIds.size === 0) return;
    const params = new URLSearchParams({
      count: String(selectedItemCount),
      ids: selectedIdList.join(','),
    });
    router.push(`/inbox/discard?${params.toString()}`);
  };

  const actionButtons = [
    {
      actionKey: 'forward',
      label: '転送',
      ariaLabel: '転送を選択',
      labelSizeClassName: 'text-sm',
    },
    {
      actionKey: 'scan',
      label: 'スキャン',
      ariaLabel: 'スキャンを選択',
      labelSizeClassName: 'text-xs',
    },
    {
      actionKey: 'discard',
      label: '破棄',
      ariaLabel: '破棄を選択',
      labelSizeClassName: 'text-sm',
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
            <div className='flex items-center gap-3 sm:gap-5 lg:gap-8'>
              {actionButtons.map((action) => (
                <ActionButton
                  key={action.actionKey}
                  actionKey={action.actionKey}
                  label={action.label}
                  ariaLabel={action.ariaLabel}
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
              {selectedItemCount}件選択中
            </span>
            <button
              type='button'
              disabled={activeAction !== 'discard'}
              onClick={handleNextClick}
              className={`rounded-full px-8 py-2 text-sm font-semibold shadow transition ${
                activeAction === 'discard'
                  ? 'bg-white text-[#0C1B3D] hover:brightness-95'
                  : 'cursor-not-allowed bg-white/70 text-[#0C1B3D]/70 opacity-80'
              }`}
            >
              次へ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
