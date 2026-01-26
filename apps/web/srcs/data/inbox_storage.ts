import type { GalleryPhoto } from '@/srcs/components/inbox_page_components';
import { defaultLettersGallery, defaultPackagesGallery } from '@/srcs/data/inbox_photos';

type CustomerInbox = {
  packages: GalleryPhoto[];
  letters: GalleryPhoto[];
  deadline: string;
};

type InboxStorage = Record<string, CustomerInbox>;

const STORAGE_KEY = 'jaddress-inbox-photos-v1';

const clonePhotos = (photos: GalleryPhoto[]) => photos.map((photo) => ({ ...photo }));

const getDefaultInbox = (): CustomerInbox => ({
  packages: clonePhotos(defaultPackagesGallery),
  letters: clonePhotos(defaultLettersGallery),
  deadline: '26.04.09',
});

const loadInboxStorage = (): InboxStorage => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as InboxStorage;
    return parsed ?? {};
  } catch {
    return {};
  }
};

const saveInboxStorage = (data: InboxStorage) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getCustomerInbox = (customerId: string): CustomerInbox => {
  const storage = loadInboxStorage();
  const fallback = getDefaultInbox();
  const existing = storage[customerId];
  if (!existing) return fallback;
  return {
    packages: existing.packages ?? fallback.packages,
    letters: existing.letters ?? fallback.letters,
    deadline: existing.deadline ?? fallback.deadline,
  };
};

export const saveCustomerInbox = (customerId: string, inbox: CustomerInbox) => {
  const storage = loadInboxStorage();
  storage[customerId] = inbox;
  saveInboxStorage(storage);
};

export const appendCustomerPhotos = (
  customerId: string,
  type: keyof CustomerInbox,
  photos: GalleryPhoto[],
) => {
  const current = getCustomerInbox(customerId);
  const next = {
    ...current,
    [type]: [...current[type], ...photos],
  };
  saveCustomerInbox(customerId, next);
  return next;
};

export const updateCustomerDeadline = (customerId: string, deadline: string) => {
  const current = getCustomerInbox(customerId);
  const next = {
    ...current,
    deadline,
  };
  saveCustomerInbox(customerId, next);
  return next;
};

export const removeCustomerPhoto = (
  customerId: string,
  type: keyof CustomerInbox,
  photoId: string,
) => {
  const current = getCustomerInbox(customerId);
  const next = {
    ...current,
    [type]: current[type].filter((photo) => photo.id !== photoId),
  };
  saveCustomerInbox(customerId, next);
  return next;
};
