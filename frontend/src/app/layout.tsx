import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sprint 0 - Frontend',
  description: 'Aplicação frontend do Sprint 0',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
