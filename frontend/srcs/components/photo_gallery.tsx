'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Photo = { id: string; src: string; alt: string };

type Props = {
  title: string;
  subtitle?: string;
  photos: Photo[];
  gridClassName?: string;
  pairWithNextOnSelect?: boolean;
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
  photos,
  gridClassName,
  pairWithNextOnSelect,
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
      return (idx - 1 + photos.length) % photos.length;
    });
  };

  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewIndex((idx) => {
      if (idx === null || photos.length === 0) return idx;
      return (idx + 1) % photos.length;
    });
  };

  const closePreview = () => setPreviewIndex(null);

  return (
    <div
      className='space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur'
      onClick={handleBackgroundClick}
    >
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-semibold text-white'>{title}</h1>
          {subtitle && <p className='text-sm text-white/70'>{subtitle}</p>}
        </div>
        <div className='flex items-center gap-2'>
          {selectionModeValue && showSelectedBadge && (
            <span className='rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/85'>
              Selected: {selectedCount}
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
              Select all
            </button>
          )}
        </div>
      </div>

      <div className={gridClassName ?? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'}>
        {photos.map((photo, index) => {
          const isSelected = selectedValue.has(photo.id);
          return (
            <div
              key={photo.id}
              className={`group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg transition hover:-translate-y-[2px] hover:border-white/30 ${
                isSelected ? highlightClass : ''
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
              <img
                src={photo.src}
                alt={photo.alt}
                className='h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20' />
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
                  <button
                    type='button'
                    className='absolute right-3 top-3 z-10 rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700'
                    onClick={closePreview}
                  >
                    Close
                  </button>
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
