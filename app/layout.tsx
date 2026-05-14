import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Part Number Scanner',
  description: 'Scan car part numbers and find details in PostgreSQL.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
