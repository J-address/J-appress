"use client"; // Marks this file as a Client Component so it can use hooks and browser APIs

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@j-address/shared";
import DecorativeBirds from "../components/decorative_birds";

const gradientStyle = {
  backgroundImage:
    "linear-gradient(180deg, #d8daddff 3%, #c0dfffff 16%, #6aa2f0ff 36%, #0155c3ff 90%)",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError("");
    setIsLoading(true);

    try {
      // Get API URL from environment variable
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      // Make POST request to the login endpoint
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "ログインに失敗しました");
      }

      const data = await response.json();

      // Store the token
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);

        // Redirect based on user role
        if (data.user?.role === Role.ADMIN) {
          router.replace("/admin");
        } else {
          router.replace("/inbox");
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "予期しないエラーが発生しました"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-start justify-center overflow-hidden px-4 pt-28 sm:pt-56"
      style={gradientStyle}
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
      <div className="relative z-10 w-full max-w-md space-y-8 rounded-3xl border border-white/25 bg-white/10 p-8 text-white shadow-2xl backdrop-blur">
        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            J-addressにログイン
          </h2>
          <p className="mt-2 text-center text-sm text-white/80">
            日本の郵便物転送サービス
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-500/20 p-4">
              <p className="text-sm text-red-100">{error}</p>
            </div>
          )}

          {/* Input fields */}
          <div className="space-y-4">
            {/* Email input */}
            <div>
              <label htmlFor="email" className="sr-only">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full rounded-lg border border-white/40 bg-white/10 px-3 py-2 text-white placeholder-white/60 focus:z-10 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/70 sm:text-sm"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password input */}
            <div>
              <label htmlFor="password" className="sr-only">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full rounded-lg border border-white/40 bg-white/10 px-3 py-2 text-white placeholder-white/60 focus:z-10 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/70 sm:text-sm"
                placeholder="パスワード(8文字以上)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-white/90 px-4 py-2 text-sm font-medium text-[#0C1B3D] shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "ログイン中..." : "ログイン"}
            </button>
          </div>

          {/* Sign up link */}
          <div className="text-sm text-center">
            <a
              href="/signup"
              className="font-medium text-white underline-offset-4 hover:underline"
            >
              アカウントをお持ちでない方は新規登録
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
