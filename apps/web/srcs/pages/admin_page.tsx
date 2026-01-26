'use client';

const gradientStyle = {
  backgroundImage:
    'linear-gradient(180deg, #d8daddff 3%, #c0dfffff 16%, #6aa2f0ff 36%, #0155c3ff 90%)',
};

type SidebarButtonProps = {
  label: string;
  isActive?: boolean;
};

function SidebarButton({label, isActive }: SidebarButtonProps) {
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
    >
      {label}
    </button>
  );
}

export default function AdminPage() {
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
            <SidebarButton  label='ホーム' isActive />
            <SidebarButton  label='お客様' />
            <SidebarButton  label='受信箱' />
            <SidebarButton  label='設定' />
          </nav>
        </aside>
      </div>
    </div>
  );
}
