import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PurchaseGuard — Track purchases. Never miss a return deadline.',
  description:
    'PurchaseGuard helps you track online purchases, deliveries, return windows, warranties, and receipts in one secure place.',
  manifest: '/manifest.json',
  themeColor: '#4f46e5',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PurchaseGuard',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
