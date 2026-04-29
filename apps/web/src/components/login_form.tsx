'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useId, useState } from 'react';
import type { Theme } from '@/src/themes';

type Props = {
  theme: Theme;
  variant: 'user' | 'admin';
};

export default function LoginForm({ theme, variant }: Props) {
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, loginType: variant }),
      });

      const data = (await res.json()) as { message?: string };

      if (!res.ok) {
        throw new Error(data.message ?? 'ログインに失敗しました');
      }

      if (variant === 'user') {
        router.replace('/inbox');
      } else {
        router.replace('/admin');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className={`rounded-md p-4 ${theme.error}`}>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor={emailId} className="sr-only">
            メールアドレス
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`appearance-none relative block w-full rounded-lg border px-3 py-2 focus:z-10 focus:outline-none focus:ring-2 sm:text-sm ${theme.input}`}
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor={passwordId} className="sr-only">
            パスワード
          </label>
          <input
            id={passwordId}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={`appearance-none relative block w-full rounded-lg border px-3 py-2 focus:z-10 focus:outline-none focus:ring-2 sm:text-sm ${theme.input}`}
            placeholder="パスワード(8文字以上)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`group relative flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${theme.button}`}
        >
          {isLoading ? 'ログイン中...' : 'ログイン'}
        </button>
      </div>
    </form>
  );
}
