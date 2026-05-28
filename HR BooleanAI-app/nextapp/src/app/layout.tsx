import type { Metadata } from 'next';
import { Noto_Sans_KR, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '900'],
  variable: '--font-noto',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HR BooleanAI — 서류 진위확인 AI 솔루션',
  description: 'AI 기반 채용 서류 진위확인 자동화 솔루션. TOEIC, OPIc, 국가자격증, 졸업증명서를 자동으로 검증합니다.',
  keywords: ['HR', 'AI', '서류 진위확인', '채용 자동화', 'RPA'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} ${jetbrainsMono.variable}`}>
      <body className="font-noto bg-bg text-tx0 antialiased">
        {children}
      </body>
    </html>
  );
}
