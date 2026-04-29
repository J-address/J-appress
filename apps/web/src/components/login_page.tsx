'use client';

import { userTheme } from '@/src/themes';
import DecorativeBirds from './decorative_birds';
import LoginForm from './login_form';

export default function LoginPage() {
  return (
    <div
      className="relative flex min-h-screen items-start justify-center overflow-hidden px-4 pt-28 sm:pt-56"
      style={{ background: userTheme.background }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0">
        <svg
          className="h-60 w-full opacity-100"
          viewBox="0 0 1440 290"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,160 C180,120 360,120 540,150 C720,180 900,230 1080,210 C1260,190 1350,150 1440,120 L1440,0 L0,0 Z"
            fill="#e6eaef"
          />
        </svg>
      </div>
      <DecorativeBirds />
      <div
        className={`relative z-10 w-full max-w-md space-y-8 rounded-3xl border p-8 shadow-2xl backdrop-blur ${userTheme.card}`}
      >
        <div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${userTheme.text}`}>
            J-addressにログイン
          </h2>
          <p className={`mt-2 text-center text-sm ${userTheme.subtext}`}>
            日本の郵便物転送サービス
          </p>
        </div>
        <LoginForm theme={userTheme} variant="user" />
        <div className="text-center text-sm">
          <a href="/signup" className={`font-medium ${userTheme.link}`}>
            アカウントをお持ちでない方は新規登録
          </a>
        </div>
      </div>
    </div>
  );
}
