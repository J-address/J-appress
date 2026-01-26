'use client';

import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';

import type { GalleryPhoto } from '@/srcs/components/inbox_page_components';
import { customers } from '@/srcs/data/inbox_customers';
import {
  appendCustomerPhotos,
  getCustomerInbox,
  removeCustomerPhoto,
  updateCustomerDeadline,
} from '@/srcs/data/inbox_storage';

const gradientStyle = {
  backgroundImage:
    'linear-gradient(180deg, #d8daddff 3%, #c0dfffff 16%, #6aa2f0ff 36%, #0155c3ff 90%)',
};

type SidebarButtonProps = {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
};

function SidebarButton({ label, isActive, onClick }: SidebarButtonProps) {
  const baseClasses =
    'flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition';
  const activeClasses =
    'border-white/30 bg-white/20 font-semibold text-black shadow hover:bg-white/30';
  const inactiveClasses =
    'border-white/20 bg-white/5 font-medium text-black hover:bg-white/15';

  return (
    <button
      type='button'
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

type UploadKind = 'packages' | 'letters';

const createId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const filesToPhotos = async (files: File[], prefix: string) => {
  const uploads = files.map(
    (file) =>
      new Promise<GalleryPhoto>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            id: createId(prefix),
            src: typeof reader.result === 'string' ? reader.result : '',
            alt: file.name || 'Uploaded photo',
          });
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      }),
  );

  return Promise.all(uploads);
};

function ThumbnailGrid({
  photos,
  onRemove,
}: {
  photos: GalleryPhoto[];
  onRemove?: (photoId: string) => void;
}) {
  if (photos.length === 0) {
    return (
      <div className='rounded-2xl border border-dashed border-white/40 bg-white/10 px-4 py-6 text-sm text-black/70'>
        まだ写真がありません。
      </div>
    );
  }

  return (
    <div className='grid gap-3 sm:grid-cols-4 lg:grid-cols-6'>
      {photos.map((photo) => (
        <div
          key={photo.id}
          className='relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow'
        >
          <img src={photo.src} alt={photo.alt} className='h-full w-full object-cover' />
          {onRemove && (
            <button
              type='button'
              onClick={() => onRemove(photo.id)}
              className='absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-white transition hover:bg-black'
            >
              削除
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

type CustomerButtonProps = {
  customerId: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
};

function CustomerButton({ customerId, label, isActive, onClick }: CustomerButtonProps) {
  return (
    <button
      key={customerId}
      type='button'
      onClick={onClick}
      className={`min-h-12 rounded-xl border px-4 py-3 text-center text-sm font-semibold transition ${
        isActive
          ? 'border-white/40 bg-white/80 text-black shadow'
          : 'border-white/20 bg-white/30 text-black/80 hover:bg-white/50'
      }`}
    >
      {label}
    </button>
  );
}

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<'home' | 'customers' | 'inbox' | 'settings'>(
    'customers',
  );
  const [customerView, setCustomerView] = useState<'list' | 'detail'>('list');
  const [activeCustomerId, setActiveCustomerId] = useState(customers[0]?.id ?? '');
  const activeCustomer = useMemo(
    () => customers.find((customer) => customer.id === activeCustomerId),
    [activeCustomerId],
  );
  const sortedCustomers = useMemo(() => {
    const priorityId = 'otani-yukou';
    const sorted = [...customers].sort((a, b) => a.kana.localeCompare(b.kana, 'ja'));
    const priorityIndex = sorted.findIndex((customer) => customer.id === priorityId);
    if (priorityIndex <= 0) return sorted;
    const [priority] = sorted.splice(priorityIndex, 1);
    return [priority, ...sorted];
  }, []);
  const [packagesGallery, setPackagesGallery] = useState<GalleryPhoto[]>([]);
  const [lettersGallery, setLettersGallery] = useState<GalleryPhoto[]>([]);
  const [deadline, setDeadline] = useState('26.04.09');
  const [uploadState, setUploadState] = useState({ kind: null as UploadKind | null, error: '' });

  useEffect(() => {
    if (!activeCustomer) return;
    const inbox = getCustomerInbox(activeCustomer.id);
    setPackagesGallery(inbox.packages);
    setLettersGallery(inbox.letters);
    setDeadline(inbox.deadline);
  }, [activeCustomer]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>, kind: UploadKind) => {
    if (!activeCustomer) return;
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setUploadState({ kind, error: '' });
    try {
      const prefix = kind === 'packages' ? 'pkg' : 'let';
      const photos = await filesToPhotos(files, prefix);
      const nextInbox = appendCustomerPhotos(activeCustomer.id, kind, photos);
      setPackagesGallery(nextInbox.packages);
      setLettersGallery(nextInbox.letters);
    } catch (error) {
      setUploadState({
        kind: null,
        error: error instanceof Error ? error.message : 'アップロードに失敗しました。',
      });
    } finally {
      setUploadState((prev) => ({ ...prev, kind: null }));
      event.target.value = '';
    }
  };

  const handleDeadlineChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!activeCustomer) return;
    const nextValue = event.target.value;
    setDeadline(nextValue);
    updateCustomerDeadline(activeCustomer.id, nextValue);
  };

  return (
    <div className='min-h-screen text-white' style={gradientStyle}>
      <div className='flex min-h-screen flex-col lg:flex-row'>
        <aside className='w-full border-b border-white/20 bg-white/10 px-6 py-6 text-black shadow-2xl backdrop-blur lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r'>
          <div className='flex items-center justify-between lg:block'>
            <div>
              <p className='text-xs uppercase tracking-[0.3em] text-black/70'>
                管理
              </p>
            </div>
          </div>
          <nav className='mt-6 space-y-2'>
            <SidebarButton
              label='ホーム'
              isActive={activeSection === 'home'}
              onClick={() => setActiveSection('home')}
            />
            <SidebarButton
              label='お客様'
              isActive={activeSection === 'customers'}
              onClick={() => {
                setActiveSection('customers');
                setCustomerView('list');
              }}
            />
            <SidebarButton
              label='受信箱'
              isActive={activeSection === 'inbox'}
              onClick={() => setActiveSection('inbox')}
            />
            <SidebarButton
              label='設定'
              isActive={activeSection === 'settings'}
              onClick={() => setActiveSection('settings')}
            />
          </nav>
        </aside>
        <main className='flex-1 px-6 pb-12 pt-8 text-black lg:ml-72 lg:px-12 lg:pt-12'>
          <div className='mx-auto flex w-full max-w-5xl flex-col gap-8'>
            {customerView === 'detail' && activeCustomer && (
              <div className='flex w-full items-center justify-between'>
                <button
                  type='button'
                  className='flex items-center gap-2 rounded-full border border-white/30 bg-white/60 px-4 py-2 text-xs font-semibold text-black transition hover:bg-white'
                  onClick={() => setCustomerView('list')}
                  aria-label='一覧に戻る'
                >
                  <span aria-hidden='true'>←</span>
                  <span>戻る</span>
                </button>
                <a
                  className='rounded-full border border-white/40 bg-white/70 px-4 py-2 text-xs font-semibold text-black transition hover:bg-white'
                  href={`/inbox?customer=${activeCustomer.id}`}
                >
                  受信箱を確認
                </a>
              </div>
            )}

            {customerView === 'list' && (
              <div className='grid gap-3 sm:grid-cols-4'>
                {sortedCustomers.map((customer) => (
                  <CustomerButton
                    key={customer.id}
                    customerId={customer.id}
                    label={customer.displayName}
                    isActive={customer.id === activeCustomerId}
                    onClick={() => {
                      setActiveCustomerId(customer.id);
                      setCustomerView('detail');
                    }}
                  />
                ))}
              </div>
            )}

            {activeCustomer && customerView === 'detail' && (
              <>
                <div className='flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-black shadow'>
                  <div className='flex items-center gap-4'>
                    <h2 className='text-xl font-semibold text-black'>
                      {activeCustomer.displayName}
                    </h2>
                  </div>
                  <div className='flex flex-wrap items-center gap-3'>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs font-semibold text-black/70'>e転居期限</span>
                      <input
                        type='text'
                        value={deadline}
                        onChange={handleDeadlineChange}
                        className='w-36 rounded-xl border border-white/30 bg-white/80 px-3 py-2 text-sm font-semibold text-black shadow-inner focus:border-black/40 focus:outline-none'
                        placeholder='26.04.09'
                      />
                    </div>
                  </div>
                </div>

                
                  <div className='mt-2 flex flex-col gap-6'>
                    <div className='mx-auto w-full max-w-3xl space-y-3 rounded-2xl border border-white/20 bg-white/10 p-4'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-baseline gap-3'>
                          <h3 className='text-lg font-semibold text-black'>お荷物</h3>
                          <span className='text-xs font-semibold text-black/60'>
                            {packagesGallery.length}件
                          </span>
                        </div>
                        <label className='cursor-pointer rounded-full bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-black/90'>
                          写真を追加
                          <input
                            type='file'
                            accept='image/*'
                            multiple
                            className='hidden'
                            onChange={(event) => handleUpload(event, 'packages')}
                          />
                        </label>
                      </div>
                      <ThumbnailGrid
                        photos={packagesGallery}
                        onRemove={(photoId) => {
                          if (!activeCustomer) return;
                          const nextInbox = removeCustomerPhoto(
                            activeCustomer.id,
                            'packages',
                            photoId,
                          );
                          setPackagesGallery(nextInbox.packages);
                          setLettersGallery(nextInbox.letters);
                        }}
                      />
                    </div>

                    <div className='mx-auto w-full max-w-3xl space-y-3 rounded-2xl border border-white/20 bg-white/10 p-4'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-baseline gap-3'>
                          <h3 className='text-lg font-semibold text-black'>お手紙</h3>
                          <span className='text-xs font-semibold text-black/60'>
                            {lettersGallery.length}件
                          </span>
                        </div>
                        <label className='cursor-pointer rounded-full bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-black/90'>
                          写真を追加
                          <input
                            type='file'
                            accept='image/*'
                            multiple
                            className='hidden'
                            onChange={(event) => handleUpload(event, 'letters')}
                          />
                        </label>
                      </div>
                      <ThumbnailGrid
                        photos={lettersGallery}
                        onRemove={(photoId) => {
                          if (!activeCustomer) return;
                          const nextInbox = removeCustomerPhoto(
                            activeCustomer.id,
                            'letters',
                            photoId,
                          );
                          setPackagesGallery(nextInbox.packages);
                          setLettersGallery(nextInbox.letters);
                        }}
                      />
                    </div>
                  </div>

                  {uploadState.error && (
                    <p className='mt-4 rounded-2xl border border-red-300 bg-red-100 px-4 py-2 text-sm text-red-700'>
                      {uploadState.error}
                    </p>
                  )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
