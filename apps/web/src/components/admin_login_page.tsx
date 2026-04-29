'use client';

import { adminTheme } from '@/src/themes';
import LoginForm from './login_form';

export default function AdminLoginPage() {
  return (
    <div
      className="relative flex min-h-screen items-start justify-center overflow-hidden px-4 pt-28 sm:pt-56"
      style={{ background: adminTheme.background }}
    >
      <div
        className={`relative z-10 w-full max-w-md space-y-8 rounded-3xl border p-8 shadow-2xl ${adminTheme.card}`}
      >
        <div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${adminTheme.text}`}>
            管理者ログイン
          </h2>
          <p className={`mt-2 text-center text-sm ${adminTheme.subtext}`}>
            J-address 管理ポータル
          </p>
        </div>
        <LoginForm theme={adminTheme} variant="admin" />
      </div>
    </div>
  );
}
