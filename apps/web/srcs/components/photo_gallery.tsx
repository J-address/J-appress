'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Photo = { id: string; src: string; alt: string };

type PhotoIndexBadgeProps = {
  value: number;
  className?: string;
};

function PhotoIndexBadge({ value, className }: PhotoIndexBadgeProps) {
  return (
    <span
      className={`absolute z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#6aa2f0]/45 text-xs font-semibold text-black shadow ${
        className ?? 'left-1 top-1'
      }`}
    >
      {value}
    </span>
  );
}

type Props = {
  title: string;
  subtitle?: string;
  showHeader?: boolean;
  photos: Photo[];
  gridClassName?: string;
  pairWithNextOnSelect?: boolean;
  stackPairs?: boolean;
  selectionMode?: boolean;
  onSelectionModeChange?: (val: boolean) => void;
  selected?: Set<string>;
  onSelectedChange?: (next: Set<string>) => void;
  showSelectedBadge?: boolean;
  selectedHighlightClass?: string;
};

export function PhotoGallery({
  title,
  subtitle,
  showHeader = true,
  photos,
  gridClassName,
  pairWithNextOnSelect,
  stackPairs,
  selectionMode,
  onSelectionModeChange,
  selected,
  onSelectedChange,
  showSelectedBadge = true,
  selectedHighlightClass,
}: Props) {
  const [internalSelectionMode, setInternalSelectionMode] = useState(false);
  const [internalSelected, setInternalSelected] = useState<Set<string>>(new Set());
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const selectionModeValue = selectionMode ?? internalSelectionMode;
  const setSelectionModeValue = onSelectionModeChange ?? setInternalSelectionMode;

  const selectedValue = selected ?? internalSelected;
  const setSelectedValue = (updater: (prev: Set<string>) => Set<string>) => {
    if (onSelectedChange) {
      const prev = selected ?? new Set<string>();
      const next = updater(prev);
      onSelectedChange(next);
    } else {
      setInternalSelected((prev) => updater(prev));
    }
  };

  const highlightClass =
    selectedHighlightClass ??
    'ring-4 ring-white drop-shadow-[0_0_20px_rgba(255,255,255,0.35)]';

  useEffect(
    () => () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    },
    [],
  );

  const toggleSelect = (id: string) => {
    setSelectedValue((prev) => {
      const next = new Set(prev);
      const index = photos.findIndex((p) => p.id === id);
      if (pairWithNextOnSelect && index >= 0) {
        // Skip toggling directly on even-numbered items (human-counted)
        if (index % 2 === 1) return next;
      }

      const pairId =
        pairWithNextOnSelect && index >= 0 && index % 2 === 0 ? photos[index + 1]?.id : undefined;

      const willSelect = !next.has(id);
      if (willSelect) {
        next.add(id);
        if (pairId) next.add(pairId);
      } else {
        next.delete(id);
        if (pairId) next.delete(pairId);
      }
      return next;
    });
  };

  const startLongPress = (photo: Photo) => {
    longPressTriggered.current = false;
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      setSelectionModeValue(true);
      toggleSelect(photo.id);
      longPressTriggered.current = true;
      longPressTimer.current = null;
    }, 500);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTileClick = (photo: Photo, index: number) => {
    if (selectionModeValue) {
      toggleSelect(photo.id);
    } else {
      setPreviewIndex(index);
    }
  };

  const clearSelection = () => {
    setSelectionModeValue(false);
    setSelectedValue(() => new Set());
  };

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (selectionModeValue && !target.closest('[data-photo-tile=\"true\"]')) {
      clearSelection();
    }
  };

  const selectedCount = selectedValue.size;
  const currentPhoto = previewIndex !== null ? photos[previewIndex] : null;
  const currentDisplayNumber =
    previewIndex !== null
      ? stackPairs
        ? Math.floor(previewIndex / 2) + 1
        : previewIndex + 1
      : null;
  const hasPair =
    stackPairs && previewIndex !== null
      ? previewIndex % 2 === 0
        ? Boolean(photos[previewIndex + 1])
        : Boolean(photos[previewIndex - 1])
      : false;

  const selectAll = () => {
    setSelectedValue((prev) => {
      const next = new Set(prev);
      const allSelected = photos.every((p) => next.has(p.id));
      if (allSelected) {
        photos.forEach((p) => next.delete(p.id));
      } else {
        photos.forEach((p) => next.add(p.id));
      }
      return next;
    });
  };

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewIndex((idx) => {
      if (idx === null || photos.length === 0) return idx;
      if (!stackPairs) return (idx - 1 + photos.length) % photos.length;
      const parity = idx % 2;
      let next = idx - 2;
      if (next < 0) {
        const lastIndex = photos.length - 1;
        next = lastIndex % 2 === parity ? lastIndex : lastIndex - 1;
      }
      return next;
    });
  };

  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewIndex((idx) => {
      if (idx === null || photos.length === 0) return idx;
      if (!stackPairs) return (idx + 1) % photos.length;
      const parity = idx % 2;
      let next = idx + 2;
      if (next >= photos.length) {
        next = parity;
      }
      return next;
    });
  };

  const togglePair = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewIndex((idx) => {
      if (idx === null) return idx;
      if (!stackPairs) return idx;
      const pairIndex = idx % 2 === 0 ? idx + 1 : idx - 1;
      return photos[pairIndex] ? pairIndex : idx;
    });
  };

  const closePreview = () => setPreviewIndex(null);

  return (
    <div
      className='space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur'
      onClick={handleBackgroundClick}
    >
      {showHeader && (
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h1 className='text-2xl font-semibold text-white'>{title}</h1>
            {subtitle && <p className='text-sm text-white/70'>{subtitle}</p>}
          </div>
          <div className='flex items-center gap-2'>
            {selectionModeValue && showSelectedBadge && (
              <span className='rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/85'>
                選択済み: {selectedCount}
              </span>
            )}
            {selectionModeValue && (
              <button
                type='button'
                className='rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:border-white/60 hover:bg-white/20'
                onClick={(e) => {
                  e.stopPropagation();
                  selectAll();
                }}
              >
                全て選択
              </button>
            )}
          </div>
        </div>
      )}

      <div className={gridClassName ?? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'}>
        {photos.map((photo, index) => {
          if (stackPairs && index % 2 === 1) return null;

          const pairedPhoto = stackPairs ? photos[index + 1] : null;
          const displayNumber = stackPairs ? Math.floor(index / 2) + 1 : index + 1;
          const isSelected = selectedValue.has(photo.id);
          return (
            <div
              key={photo.id}
              className={`group relative aspect-[4/3] ${
                stackPairs ? 'overflow-visible' : 'overflow-visible rounded-2xl'
              }`}
              onPointerDown={() => startLongPress(photo)}
              onPointerUp={() => {
                if (longPressTimer.current) cancelLongPress();
                if (longPressTriggered.current) {
                  longPressTriggered.current = false;
                  return;
                }
                handleTileClick(photo, index);
              }}
              onPointerLeave={cancelLongPress}
              onPointerCancel={cancelLongPress}
              role='button'
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTileClick(photo, index);
                }
              }}
              data-photo-tile='true'
            >
              {stackPairs && pairedPhoto && (
                <div className='pointer-events-none absolute inset-0 translate-x-3 translate-y-3 rounded-2xl border border-white/10 bg-white/5 shadow-lg'>
                  <img
                    src={pairedPhoto.src}
                    alt={pairedPhoto.alt}
                    className='h-full w-full object-cover opacity-90'
                  />
                  <div className='absolute inset-0 rounded-2xl bg-gradient-to-t from-black/40 via-transparent to-black/20' />
                </div>
              )}
              <div
                className={`relative z-10 h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg transition hover:-translate-y-[2px] hover:border-white/30 ${
                  isSelected ? highlightClass : ''
                }`}
              >
                <PhotoIndexBadge value={displayNumber} />
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className='h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20' />
              </div>
            </div>
          );
        })}
      </div>

      {currentPhoto &&
        (typeof document !== 'undefined'
          ? createPortal(
              <div
                className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-4'
                onClick={closePreview}
                role='presentation'
              >
                <div
                  className='relative max-w-[90vw] rounded-3xl border border-white/20 bg-black/70 p-4 shadow-2xl'
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={currentPhoto.src}
                    alt={currentPhoto.alt}
                    className='h-auto max-h-[85vh] w-auto max-w-full object-contain'
                  />
                  {currentDisplayNumber !== null && (
                    <PhotoIndexBadge
                      value={currentDisplayNumber}
                      className='left-4 top-4'
                    />
                  )}
                  <button
                    type='button'
                    className='absolute right-3 top-3 z-10 rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700'
                    onClick={closePreview}
                  >
                    X
                  </button>
                  {stackPairs && (
                    <button
                      type='button'
                      className='absolute right-24 top-3 z-10 rounded-full bg-white/20 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50'
                      onClick={togglePair}
                      disabled={!hasPair}
                    >
                      ペア切替
                    </button>
                  )}
                  <button
                    type='button'
                    className='absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/70 px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/85'
                    onClick={showPrev}
                  >
                    ←
                  </button>
                  <button
                    type='button'
                    className='absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/70 px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/85'
                    onClick={showNext}
                  >
                    →
                  </button>
                  <div className='flex items-center justify-between px-4 py-3 text-sm text-white/80'>
                    <span>{currentPhoto.alt}</span>
                  </div>
                </div>
              </div>,
              document.body,
            )
          : null)}
    </div>
  );
}
