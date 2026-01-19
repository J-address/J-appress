import type { GalleryPhoto } from '@/srcs/components/inbox_page_components';

export const packagesGallery: GalleryPhoto[] = [
  {
    id: 'pkg-1',
    src: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    alt: 'Parcel at warehouse',
  },
  {
    id: 'pkg-2',
    src: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    alt: 'Boxes on trolley',
  },
  {
    id: 'pkg-3',
    src: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80',
    alt: 'Packages stacked',
  },
  {
    id: 'pkg-4',
    src: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=1200&q=80',
    alt: 'Courier handling box',
  },
  {
    id: 'pkg-5',
    src: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80',
    alt: 'Delivery truck',
  },
  {
    id: 'pkg-6',
    src: 'https://images.unsplash.com/photo-1544986581-efac024faf62?auto=format&fit=crop&w=1200&q=80',
    alt: 'Stacked parcels',
  },
];

export const lettersGallery: GalleryPhoto[] = [
  {
    id: 'let-1',
    src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    alt: 'Envelopes pile',
  },
  {
    id: 'let-2',
    src: 'https://images.unsplash.com/photo-1448932252197-d19750584e56?auto=format&fit=crop&w=1200&q=80',
    alt: 'Mailbox with letters',
  },
  {
    id: 'let-3',
    src: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80',
    alt: 'Stamped letters',
  },
  {
    id: 'let-4',
    src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
    alt: 'Letter on table',
  },
  {
    id: 'let-5',
    src: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80',
    alt: 'Mail on desk',
  },
  {
    id: 'let-6',
    src: 'https://images.unsplash.com/photo-1473181488821-2d23949a045a?auto=format&fit=crop&w=1200&q=80',
    alt: 'Handwritten letter',
  },
  {
    id: 'let-7',
    src: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=1200&q=80',
    alt: 'Letter bundle',
  },
];

export function getSelectedItemCount(selectedIds: string[]) {
  const packageIndexById = new Map(
    packagesGallery.map((photo, index) => [photo.id, index]),
  );
  const packagePairs = new Set<number>();
  let letterCount = 0;

  selectedIds.forEach((id) => {
    const pkgIndex = packageIndexById.get(id);
    if (pkgIndex !== undefined) {
      packagePairs.add(Math.floor(pkgIndex / 2));
      return;
    }
    if (lettersGallery.some((photo) => photo.id === id)) {
      letterCount += 1;
    }
  });

  return packagePairs.size + letterCount;
}
