'use client';

import './globals.css';
import { helveticaNeue } from './fonts';

import { GoogleAnalytics } from '@next/third-parties/google';
import React, { Suspense } from 'react';

import ContextWrapper from '@/context/context-wrapper';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${helveticaNeue.variable}`}>
      <body className="w-full h-full font-helvetica">
        <ContextWrapper>
          <Suspense fallback={<div className="p-4">Loading...</div>}>
            <RootInner>{children}</RootInner>
          </Suspense>
        </ContextWrapper>
        <GoogleAnalytics
          gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ''}
        />
      </body>
    </html>
  );
}

function RootInner({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex w-full h-screen overflow-hidden bg-black">
      {children}
    </main>
  );
}
