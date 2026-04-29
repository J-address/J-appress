import type { Metadata } from 'next';
import { Geist, Geist_Mono, Yomogi } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const yomogi = Yomogi({
  variable: '--font-yomogi-base',
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'J-address - 日本の郵便物転送サービス',
  description: '日本の住所で郵便物を受け取り、オンラインで管理できる郵便物転送サービス',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${yomogi.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
