'use client';

import { PhotoGallery } from '@/srcs/components/photo_gallery';

export type ActionKey = 'forward' | 'scan' | 'discard';

export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
};

type ActionButtonProps = {
  actionKey: ActionKey;
  label: string;
  ariaLabel: string;
  svgClassName: string;
  labelSizeClassName: string;
  isActive: boolean;
  onClick: () => void;
};

type GallerySectionProps = {
  title: string;
  photos: GalleryPhoto[];
  gridClassName: string;
  selectionMode: boolean;
  onSelectionModeChange: (value: boolean) => void;
  selected: Set<string>;
  onSelectedChange: (value: Set<string>) => void;
  selectedHighlightClass: string;
  pairWithNextOnSelect?: boolean;
  stackPairs?: boolean;
};

const labelShadowClassName = 'drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)]';

export function GallerySection({
  title,
  photos,
  gridClassName,
  selectionMode,
  onSelectionModeChange,
  selected,
  onSelectedChange,
  selectedHighlightClass,
  pairWithNextOnSelect,
  stackPairs,
}: GallerySectionProps) {
  const photoCount = stackPairs ? Math.ceil(photos.length / 2) : photos.length;

  return (
    <div className='mx-auto w-full max-w-5xl'>
      <div className='mb-2 flex items-end justify-between gap-4'>
        <h2 className='text-2xl font-semibold text-white'>{title}</h2>
        <span className='text-sm font-semibold text-white/80'>写真数: {photoCount}</span>
      </div>
      <PhotoGallery
        title={title}
        photos={photos}
        gridClassName={gridClassName}
        pairWithNextOnSelect={pairWithNextOnSelect}
        stackPairs={stackPairs}
        selectionMode={selectionMode}
        onSelectionModeChange={onSelectionModeChange}
        selected={selected}
        onSelectedChange={onSelectedChange}
        showSelectedBadge={false}
        selectedHighlightClass={selectedHighlightClass}
        showHeader={false}
      />
    </div>
  );
}

export function ActionButton({
  actionKey,
  label,
  ariaLabel,
  svgClassName,
  labelSizeClassName,
  isActive,
  onClick,
}: ActionButtonProps) {
  return (
    <button
      type='button'
      className='group relative flex flex-col items-center text-black focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70'
      aria-label={ariaLabel}
      onClick={onClick}
      data-action={actionKey}
    >
      <span className='flex h-10 w-10 items-center justify-center rounded-full bg-white/1 transition group-hover:-translate-y-2 group-hover:bg-transparent'>
        <svg viewBox='0 0 256 128' className={svgClassName} aria-hidden='true'>
          <path
            d='M10 86 C46 22 102 14 128 56 C156 60 206 18 246 86'
            fill='none'
            stroke='currentColor'
            strokeWidth='20'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </span>
      <span
        className={`absolute left-1/2 top-full mt-2 -translate-x-1/2 font-semibold text-black transition opacity-100 group-hover:-translate-y-2 ${labelSizeClassName} ${
          isActive ? labelShadowClassName : ''
        }`}
      >
        {label}
      </span>
    </button>
  );
}
