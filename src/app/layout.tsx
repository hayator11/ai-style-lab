import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AIスタイルLab',
  description: '自分らしく挑戦できる自信を育てるAIスタイルコンシェルジュ',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
