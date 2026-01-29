import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const manifest = {
    name: 'inDebt - Personal Budgeting App',
    short_name: 'inDebt',
    description: 'Personal budgeting app for managing debts, bills, and savings goals',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8F9FA',
    theme_color: '#1A1D2E',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  });
}
